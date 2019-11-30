const express = require('express');
const path = require('path');
const session = require('client-sessions');
const socket = require('socket.io');
const _ = require('lodash');
const assert = require('chai').assert;
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
app.use('/leaderboard', pool, checkForValidSession, leaderboardRoute);

const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));
const io = socket(server);

let loadersInProgress = 0;
let loadsRemaining = 0;
let loadedRecognizedSent = false;
let loadedUnrecognizedSent = false;

setInterval(schedulePreloadDrawings, 1000);

function schedulePreloadDrawings() {

  if(loadersInProgress === 0) {
    loadersInProgress = 1;  // Prevents this function from being entered multiple times at once asynchronously
    let categoryQuery = `SELECT * FROM Categories WHERE recognized < 6;`;
    serverPool.query(categoryQuery, (error, result) => {
      if(error) {
        console.error(error);
        loadersInProgress = 0;
      } else {
        if(result.rows.length > 0) {
          loadedRecognizedSent = false;
          const choice = result.rows[_.random(result.rows.length-1)];
          console.log(`preloading recognized images from category: ${choice.category}`);
          preloadDrawings(choice.category, 6 - choice.recognized);
        } else {
          categoryQuery = `SELECT * FROM Categories WHERE recognized < 12;`;
          serverPool.query(categoryQuery, (error, result) => {
            if (error) {
              console.error(error);
              loadersInProgress = 0;
            } else {
              if (result.rows.length > 0) {
                loadedRecognizedSent = false;
                const choice = result.rows[_.random(result.rows.length - 1)];
                console.log(`preloading recognized images from category: ${choice.category}`);
                preloadDrawings(choice.category, 12 - choice.recognized);
              } else {

                if(!loadedRecognizedSent) {
                  console.log(`all categories have at least 12 recognized drawings preloaded`);
                  loadedRecognizedSent = true;
                }

                categoryQuery = `SELECT * FROM Categories WHERE unrecognized < 3;`;
                serverPool.query(categoryQuery, (error, result) => {
                  if (error) {
                    console.error(error);
                    loadersInProgress = 0;
                  } else {
                    if(result.rows.length > 0) {
                      loadedUnrecognizedSent = false;
                      const choice = result.rows[_.random(result.rows.length-1)];
                      console.log(`preloading unrecognized images from category: ${choice.category}`);
                      preloadUnrecognizedDrawings(choice.category, 3 - choice.unrecognized);
                    } else {

                      if(!loadedUnrecognizedSent) {
                        console.log(`all categories have at least 3 unrecognized drawings preloaded`);
                        loadedUnrecognizedSent = true;
                      }

                      loadersInProgress = 0;
                    }
                  }
                });
              }
            }
          });
        }
      }
    });
  }
}

function preloadDrawings(category, count) {
  console.log(`preloading ${count} more recognized drawings from ${category}`);
  loadersInProgress = count;
  loadsRemaining = count;
  quickdraw.getCategorySize(category, (size) => {
    for(let i = 0; i < count; i++) {
      loadRandomFromCategory(category, size);
    }
  });
}

function loadRandomFromCategory(category, size) {
  const id = _.random(size - 1);

  quickdraw.getDrawing(category, id, (drawing, rawDrawing) => {
    if(drawing.recognized) {
      const preloadQuery = `INSERT INTO Preloaded_Drawings(category, drawing_id, drawing)
                      VALUES('${category}', ${id}, '${rawDrawing}')`;
      serverPool.query(preloadQuery, (error, result) => {
        if(error) {
          console.error(error);
        }

        if(loadersInProgress > 0) {
          --loadersInProgress;
        }
        if(loadsRemaining > 0) {
          --loadsRemaining;
        }
      });
    } else {

      const categoryQuery = `SELECT unrecognized FROM Categories WHERE category = '${category}'`;
      serverPool.query(categoryQuery, (error, result) => {
        if (error) {
          console.error(error);
        } else {

          if(result.rows[0].unrecognized < 6) {
            console.log(`preloaded drawing from ${category} not recognized, storing and requesting another`);
            const preloadQuery = `INSERT INTO Preloaded_Drawings(category, drawing_id, drawing, recognized)
                      VALUES('${category}', ${id}, '${rawDrawing}', FALSE)`;
            serverPool.query(preloadQuery, (error, result) => {
              if (error) {
                console.error(error);
              }
            });
            loadRandomFromCategory(category, size);
          } else {

            console.log(`preloaded drawing from ${category} not recognized, discarding and requesting another`);
            loadRandomFromCategory(category, size);
          }
        }
      });
    }
  });
}

function preloadUnrecognizedDrawings(category, count) {
  console.log(`preloading ${count} more unrecognized drawings from ${category}`);
  loadersInProgress = 3 * count;
  loadsRemaining = count;
  quickdraw.getCategorySize(category, (size) => {
    for(let i = 0; i < 3 * count; i++) {    // Many requests are made because unrecognized drawings are uncommon
      loadUnrecognizedFromCategory(category, size);
    }
  });
}

function loadUnrecognizedFromCategory(category, size) {
  const id = _.random(size - 1);

  if(loadsRemaining > 0) {
    quickdraw.getDrawing(category, id, (drawing, rawDrawing) => {
      if (!drawing.recognized) {
        const preloadQuery = `INSERT INTO Preloaded_Drawings(category, drawing_id, drawing, recognized)
                      VALUES('${category}', ${id}, '${rawDrawing}', FALSE)`;
        serverPool.query(preloadQuery, (error, result) => {
          if (error) {
            console.error(error);
          }

          console.log(`unrecognized drawing from ${category} found, inserting into table`);

          if (loadsRemaining > 0) {
            --loadsRemaining;
          }

          loadUnrecognizedFromCategory(category, size);
        });
      } else {

        console.log(`preloaded drawing from ${category} with id ${id} is recognized, but only unrecognized is wanted`);
        if (loadsRemaining > 0) {
          console.log(`discarding drawing and trying again from ${category}`);
          loadUnrecognizedFromCategory(category, size);
        } else {
          console.log(`sufficient drawings have been loaded from ${category}`);
          if(loadersInProgress > 0) {
            --loadersInProgress;
          }
          console.log(`loaders remaining: ${loadersInProgress}`);
        }
      }
    });
  } else {
    console.log(`sufficient drawings have been loaded from ${category}`);
    if(loadersInProgress > 0) {
      --loadersInProgress;
    }
    console.log(`loaders remaining: ${loadersInProgress}`);
  }
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

    // assert.isString(category);
    // assert.isNumber(id);

    console.log(`drawing requested for: ${category}`);
    quickdraw.getDrawing(category, id, (drawing) => {
      quickdraw.convertDrawing(drawing, (convertedDrawing) => {
        socket.emit('serverSendDrawing', convertedDrawing);
      });
    });
  });

  socket.on('clientRequestCountFromCategory', (data) => {
    let { category, count, recognized } = data;

    // assert.isString(category);
    // assert.isNumber(count);

    recognized = (typeof recognized !== 'undefined') ? recognized : true;
    console.log(`${count} drawings requested for: ${category} where recognized: ${recognized}`);
    return sendCountFromCategory(category, count, recognized);
  });

  socket.on('clientRequestFromCategory', (data) => {
    const category = data;

    // assert.isString(category);

    console.log(`single drawing requested for: ${category}`);
    sendCountFromCategory(category, 1, true);
  });

  socket.on('clientRequestUnrecognizedFromCategory', (data) => {
    const category = data;

    // assert.isString(category);

    console.log(`single drawing requested for: ${category}`);
    sendCountFromCategory(category, 1, false);
  });

  function sendCountFromCategory(category, count, recognized) {
    // assert.isString(category);
    // assert.isBoolean(recognized);

    count = (typeof count !== 'undefined') ? count : 1;
    const drawingQuery = `
        DELETE FROM Preloaded_drawings
        WHERE id = ANY (ARRAY(
          SELECT id FROM Preloaded_drawings
          WHERE category = '${category}'
          AND recognized = '${recognized}'
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
                sendRandomFromCategory(category, size, recognized);
              }
            }
            return getRemaining(category, remaining, size);
          });
        }
      }
    });
  }

  function sendRandomFromCategory(category, size, recognized) {
    // assert.isString(category);
    // assert.isNumber(size);
    // assert.isBoolean(recognized);

    const id = _.random(size - 1);

    quickdraw.getDrawing(category, id, (drawing) => {
      if(drawing.recognized === recognized) {
        quickdraw.convertDrawing(drawing, (convertedDrawing) => {
          socket.emit('serverSendDrawing', convertedDrawing);
        });
      } else {
        console.log(`drawing from ${category} not ${recognized ? 'recognized' : 'unrecognized'}, requesting another`);
        sendRandomFromCategory(category, size, recognized);
      }
    });
  }

  socket.on('clientRequestCategoryName', (data) => {
    // assert.isString(data);

    console.log(`${data}`);
    socket.emit('serverSendCategoryName', quickdraw.getCategory(data));
  });

  socket.on('clientRequestRandomCategoryName', (needed, excluded, recognized) => {
    needed = (typeof needed !== 'undefined') ? needed : 1;
    excluded = (typeof excluded !== 'undefined') ? excluded : '';
    recognized = (typeof recognized !== 'undefined') ? recognized : true;

    console.log(`random category requested with minimum ${needed} available needed, where recognized is ${recognized}`);

    const categoryQuery = `SELECT category FROM categories
        WHERE ${recognized ? 'recognized' : 'unrecognized'} >= ${needed}
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
          console.log(`no categories have enough drawings preloaded, selecting at random from all`);
          const category = quickdraw.getRandomCategory();
          console.log(`category selected: ${category}`);
          socket.emit('serverSendRandomCategoryName', category);
        }
      }
    });
  });

  socket.on('clientRequestCategorySize', (category) => {
    // assert.isString(category);

    console.log('Category size requested');
    console.log(`Category: ${category}`);

    quickdraw.getCategorySize(category, (size) => {
      console.log(`size of ${category} category: ${size}`);
      socket.emit('serverSendCategorySize', size);
    });
  });
});
