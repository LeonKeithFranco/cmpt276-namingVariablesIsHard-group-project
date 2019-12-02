const express = require('express');
const path = require('path');
const session = require('client-sessions');
const socket = require('socket.io');
const _ = require('lodash');
// const assert = require('chai').assert;
const quickdraw = require('./lib/quickdraw/quickdraw-api');
const preloader = require('./lib/preloader');
const { pool, httpStatusCodes, hash, respond, checkForValidSession } = require('./lib/custom-middleware');

const { Pool } = require('pg');
const serverPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const indexRoute = require('./routes/index-route');
const loginRoute = require('./routes/login-route');
const registerRoute = require('./routes/register-route');
const mainMenuRoute = require('./routes/main-menu-route');
const logoutRoute = require('./routes/logout-route');
const gameModeRoute = require('./routes/game-mode-route');
const leaderboardRoute = require('./routes/leaderboard-route');

const PORT = process.env.PORT || 5050;
const app = express();

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  cookieName: 'session',
  secret: 'namingVariablesIsHard',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000
}));

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use('/', indexRoute);
app.use('/login', pool, httpStatusCodes, hash, respond, loginRoute);
app.use('/register', pool, httpStatusCodes, hash, respond, registerRoute);
app.use('/main-menu', checkForValidSession, mainMenuRoute);
app.use('/logout', logoutRoute);
app.use('/game-mode', checkForValidSession, pool, httpStatusCodes, respond, gameModeRoute);
app.use('/leaderboard', pool, checkForValidSession, leaderboardRoute);

const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));
const io = socket(server);

preloader.start();

io.on('connection', (socket) => {
  console.log("connection made with socket id:", socket.id);

  socket.on('clientRequestRandomDrawing', async () => {
    const drawing = await quickdraw.getRandomDrawingPromise();
    const convertedDrawing = await quickdraw.convertDrawingPromise(drawing);
    socket.emit('serverSendRandomDrawing', convertedDrawing);
  });

  socket.on('clientRequestDrawing', async (data) => {
    const { category, id } = data;

    // assert.isString(category);
    // assert.isNumber(id);

    console.log(`drawing requested for: ${category}`);
    const { parsedDrawing, rawDrawing } = await quickdraw.getDrawingPromise(category, id);
    const convertedDrawing = await quickdraw.convertDrawingPromise(parsedDrawing);
    socket.emit('serverSendDrawing', convertedDrawing);
  });

  socket.on('clientRequestCountFromCategory', async (data) => {
    let { category, count, recognized } = data;

    // assert.isString(category);
    // assert.isNumber(count);

    recognized = (!_.isUndefined(recognized)) ? recognized : true;
    console.log(`${count} drawings requested for: ${category} where recognized: ${recognized}`);
    return await sendCountFromCategory(category, count, recognized);
  });

  socket.on('clientRequestFromCategory', async (data) => {
    const category = data;

    // assert.isString(category);

    console.log(`single drawing requested for: ${category}`);
    sendCountFromCategory(category, 1, true);
  });

  socket.on('clientRequestUnrecognizedFromCategory', async (data) => {
    const category = data;

    // assert.isString(category);

    console.log(`single drawing requested for: ${category}`);
    sendCountFromCategory(category, 1, false);
  });

  async function sendCountFromCategory(category, count, recognized) {
    // assert.isString(category);
    // assert.isBoolean(recognized);

    count = (!_.isUndefined(count)) ? count : 1;

    try {
      const result = await serverPool.query(`
        DELETE FROM Preloaded_drawings
        WHERE id = ANY (ARRAY(
        SELECT id FROM Preloaded_drawings
        WHERE category = '${category}'
        AND recognized = '${recognized}'
        LIMIT ${count}))
        RETURNING *;
      `);

      for (let i = 0; i < result.rows.length; i++) {
        const parsedDrawing = JSON.parse(result.rows[i].drawing);
        const convertedDrawing = await quickdraw.convertDrawingPromise(parsedDrawing);
        socket.emit('serverSendDrawing', convertedDrawing);
      }

      if (result.rows.length < count) {
        console.log(`insufficient preloaded images in category ${category}, falling back to direct API call`);

        const remaining = count - result.rows.length;

        const size = await quickdraw.getCategorySizePromise(category);
        async function getRemaining(category, remaining, size) {
          for (let i = 0; i < remaining; i++) {
            console.log(`making direct request for request for ${category}`);
            sendRandomFromCategory(category, size, recognized);
          }
        }

        return await getRemaining(category, remaining, size);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function sendRandomFromCategory(category, size, recognized) {
    // assert.isString(category);
    // assert.isNumber(size);
    // assert.isBoolean(recognized);

    const id = _.random(size - 1);

    const { parsedDrawing, rawDrawing } = await quickdraw.getDrawingPromise(category, id);
    if (parsedDrawing.recognized === recognized) {
      const convertedDrawing = await quickdraw.convertDrawingPromise(parsedDrawing);
      socket.emit('serverSendDrawing', convertedDrawing);
    } else {
      console.log(`drawing from ${category} not ${recognized ? 'recognized' : 'unrecognized'}, requesting another`);
      sendRandomFromCategory(category, size, recognized);
    }
  }

  socket.on('clientRequestCategoryName', (data) => {
    // assert.isString(data);

    console.log(`${data}`);
    socket.emit('serverSendCategoryName', quickdraw.getCategory(data));
  });

  socket.on('clientRequestRandomCategoryName', async (needed, excluded, recognized) => {
    needed = (!_.isUndefined(needed)) ? needed : 1;
    excluded = (!_.isUndefined(excluded)) ? excluded : '';
    recognized = (!_.isUndefined(recognized)) ? recognized : true;

    console.log(`random category requested with minimum ${needed} available needed, where recognized is ${recognized}`);

    try {
      const result = await serverPool.query(`
        SELECT category FROM categories
        WHERE ${recognized ? 'recognized' : 'unrecognized'} >= ${needed}
        AND category != '${excluded}'
        ORDER BY RANDOM()
        LIMIT 1
      `);

      if (result.rows.length > 0) {
        const category = result.rows[0].category;
        console.log(`category selected: ${category}`);
        socket.emit(`serverSendRandomCategoryName`, category);
      } else {
        console.log(`no categories have enough drawings preloaded, selecting at random from all`);
        const category = quickdraw.getRandomCategory();
        console.log(`category selected: ${category}`);
        socket.emit('serverSendRandomCategoryName', category);
      }
    }
    catch (err) {
      console.error(err);
    }
  });

  socket.on('clientRequestRandomCategoryNames', async (count, excluded) => {
    excluded = (!_.isUndefined(excluded)) ? excluded : '';

    console.log(`${count} random categories requested`);

    try {
      const result = await serverPool.query(`
        SELECT category FROM categories
        WHERE category != '${excluded}'
        ORDER BY RANDOM()
        LIMIT ${count}
      `);

      if (count === result.rows.length) {
        for (let i = 0; i < count; i++) {
          const category = result.rows[i].category;
          console.log(`category selected: ${category}`);
          socket.emit(`serverSendRandomCategoryName`, category);
        }
      } else {
        console.log(`category query failed to return the requested number of categories for unknown reason`);
      }
    }
    catch (err) {
      console.error(err);
    }
  });

  socket.on('clientRequestCategorySize', async (category) => {
    // assert.isString(category);

    console.log('Category size requested');
    console.log(`Category: ${category}`);

    const size = await quickdraw.getCategorySizePromise(category);
    console.log(`size of ${category} category: ${size}`);
    socket.emit('serverSendCategorySize', size);
  });
});
