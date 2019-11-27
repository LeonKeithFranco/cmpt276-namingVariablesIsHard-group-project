const express = require('express');
const path = require('path');
const session = require('client-sessions');
const socket = require('socket.io');
const _ = require('lodash');
const quickdraw = require('./lib/quickdraw/quickdraw-api');
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

const PORT = process.env.PORT || 5000;
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
app.use('/leaderboard', checkForValidSession, leaderboardRoute);

const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));
const io = socket(server);

let loadsInProgress = 0;

setInterval(schedulePreloadDrawings, 1000);

function schedulePreloadDrawings() {
  if(loadsInProgress === 0) {
    let categoryQuery = `Select * FROM Categories where recognized < 6;`;
    serverPool.query(categoryQuery, (error, result) => {
      if(error) {
        console.error(error);
      } else {
        if(result.rows.length > 0) {
          let choice = result.rows[_.random(result.rows.length-1)];
          console.log(`preloading images from category: ${choice.category}`);
          preloadDrawings(choice.category, 6 - choice.recognized);
        } else {
          let categoryQuery = `Select * FROM Categories where recognized < 12;`;
          serverPool.query(categoryQuery, (error, result) => {
            if (error) {
              console.error(error);
            } else {
              if (result.rows.length > 0) {
                let choice = result.rows[_.random(result.rows.length - 1)];
                console.log(`preloading images from category: ${choice.category}`);
                preloadDrawings(choice.category, 12 - choice.recognized);
              }
            }
          });
        }
      }
    });
  }
}

function preloadDrawings(category, count) {
  console.log(`preloading ${count} more drawings from ${category}`);
  loadsInProgress = count;
  quickdraw.getCategorySize(category, (size) => {
    for(let i = 0; i < count; i++) {
      loadRandomFromCategory(category, size);
    }
  });
}

function loadRandomFromCategory(category, size) {
  let id = _.random(size - 1);

  quickdraw.getDrawing(category, id, (drawing, rawDrawing) => {
    if(drawing.recognized) {
      let preloadQuery = `INSERT INTO Preloaded_Drawings(category, drawing_id, drawing)
                      VALUES('${category}', ${id}, '${rawDrawing}')`;
      serverPool.query(preloadQuery, (error, result) => {
        if(error) {
          console.error(error);
        }

        --loadsInProgress;
      });
    } else {
      console.log(`preloaded drawing with id ${id} not recognized, requesting another`);
      loadRandomFromCategory(category, size);
    }
  });
}

io.on('connection', (socket) => {
  console.log("connection made with socket id:", socket.id);

  socket.on('clientRequestRandomDrawing', () => {
    quickdraw.getRandomDrawing((drawing) => {
      quickdraw.convertDrawing(drawing, (convertedDrawing) => {
        socket.emit('serverSendRandomDrawing', convertedDrawing);
      });
    });
  });

  socket.on('clientRequestDrawing', (data) => {
    const { category, id } = data;
    console.log(`drawing requested for: ${category}`);
    quickdraw.getDrawing(category, id, (drawing) => {
      quickdraw.convertDrawing(drawing, (convertedDrawing) => {
        socket.emit('serverSendDrawing', convertedDrawing);
      });
    });
  });

  socket.on('clientRequestCountFromCategory', (data) =>{
    const { category, count } = data;
    console.log(`${count} drawings requested for: ${category}`);
    return sendCountFromCategory(category, count);
  });

  socket.on('clientRequestFromCategory', (data) =>{
    const category = data;
    console.log(`single drawing requested for: ${category}`);
    sendCountFromCategory(category, 1);
  });

  function sendCountFromCategory(category, count) {
    let drawingQuery = `
        DELETE FROM Preloaded_drawings
        WHERE id = ANY (ARRAY(
          SELECT id FROM Preloaded_drawings
          WHERE category = '${category}'
          AND recognized = TRUE
          LIMIT ${count}))
        RETURNING *;`;
    serverPool.query(drawingQuery, (error, result) => {
      if (error) {
        console.error(error);
      } else {

        for(let i = 0; i < result.rows.length; i++) {
          const parsedDrawing = JSON.parse(result.rows[i].drawing);
          quickdraw.convertDrawing(parsedDrawing, (convertedDrawing) => {
            socket.emit('serverSendDrawing', convertedDrawing);
          });
        }

        if(result.rows.length < count) {
          console.log(`insufficient preloaded images in category ${category}, falling back to direct API call`);

          const remaining = count - result.rows.length;

          quickdraw.getCategorySize(category, (size) => {
            function getRemaining (category, remaining, size) {
              for(let i = 0; i < remaining; i++) {
                console.log(`making direct request for request for ${category}`);
                sendRandomFromCategory(category, size);
              }
            }
            return getRemaining(category, remaining, size);
          });
        }
      }
    });
  }

  function sendRandomFromCategory(category, size) {
    let id = _.random(size - 1);

    quickdraw.getDrawing(category, id, (drawing) => {
      if(drawing.recognized) {
        quickdraw.convertDrawing(drawing, (convertedDrawing) => {
          socket.emit('serverSendDrawing', convertedDrawing);
        });
      } else {
        console.log(`drawing with id ${id} not recognized, requesting another`);
        sendRandomFromCategory(category, size);
      }
    });
  }

  socket.on('clientRequestCategoryName', (data) => {
    console.log(`${data}`);
    socket.emit('serverSendCategoryName', quickdraw.getCategory(data));
  });

  socket.on('clientRequestRandomCategoryName', (needed, excluded) => {
    needed = (typeof needed !== 'undefined') ? needed : 1;
    excluded = (typeof excluded !== 'undefined') ? excluded : '';

    console.log(`random category requested with minimum ${needed} available needed`);

    let categoryQuery = `SELECT category FROM categories
        WHERE recognized >= ${needed}
        AND category != '${excluded}'`;

    serverPool.query(categoryQuery, (error, result) => {
      if (error) {
        console.error(error);
      } else {
        if(result.rows.length > 0) {
          const rowIndex = _.random(result.rows.length - 1);
          const category = result.rows[rowIndex].category;
          console.log(`category selected: ${category}`);
          socket.emit(`serverSendRandomCategoryName`, category);
        } else {
          console.log(`no categories have enough drawings pre-loaded, selecting at random from all`);
          const category = quickdraw.getRandomCategory();
          console.log(`category selected: ${category}`);
          socket.emit('serverSendRandomCategoryName', category);
        }
      }
    });
  });

  socket.on('clientRequestCategorySize', (category) => {
    console.log('Category size requested');
    console.log(`Category: ${category}`);

    quickdraw.getCategorySize(category, (size) => {
      console.log(`size of ${category} category: ${size}`);
      socket.emit('serverSendCategorySize', size);
    });
  });
});
