const _ = require('lodash');
const quickdraw = require('./quickdraw/quickdraw-api');
const { Pool } = require('pg');
const serverPool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

module.exports = {
    start: function () {
        setInterval(schedulePreloadDrawings, 1000);
    }
}

let loadersInProgress = 0;
let loadsRemaining = 0;
let loadedRecognizedSent = false;
let loadedUnrecognizedSent = false;

function schedulePreloadDrawings() {

  if (loadersInProgress === 0) {
    loadersInProgress = 1;  // Prevents this function from being entered multiple times at once asynchronously
    let categoryQuery = `SELECT * FROM Categories WHERE recognized < 6;`;
    serverPool.query(categoryQuery, (error, result) => {
      if (error) {
        console.error(error);
        loadersInProgress = 0;
      } else {
        if (result.rows.length > 0) {
          loadedRecognizedSent = false;
          const choice = result.rows[_.random(result.rows.length - 1)];
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

                if (!loadedRecognizedSent) {
                  console.log(`all categories have at least 12 recognized drawings preloaded`);
                  loadedRecognizedSent = true;
                }

                categoryQuery = `SELECT * FROM Categories WHERE unrecognized < 3;`;
                serverPool.query(categoryQuery, (error, result) => {
                  if (error) {
                    console.error(error);
                    loadersInProgress = 0;
                  } else {
                    if (result.rows.length > 0) {
                      loadedUnrecognizedSent = false;
                      const choice = result.rows[_.random(result.rows.length - 1)];
                      console.log(`preloading unrecognized images from category: ${choice.category}`);
                      preloadUnrecognizedDrawings(choice.category, 3 - choice.unrecognized);
                    } else {

                      if (!loadedUnrecognizedSent) {
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
    for (let i = 0; i < count; i++) {
      loadRandomFromCategory(category, size);
    }
  });
}

function loadRandomFromCategory(category, size) {
  const id = _.random(size - 1);

  quickdraw.getDrawing(category, id, (drawing, rawDrawing) => {
    if (drawing.recognized) {
      const preloadQuery = `INSERT INTO Preloaded_Drawings(category, drawing_id, drawing)
                      VALUES('${category}', ${id}, '${rawDrawing}')`;
      serverPool.query(preloadQuery, (error, result) => {
        if (error) {
          console.error(error);
        }

        if (loadersInProgress > 0) {
          --loadersInProgress;
        }
        if (loadsRemaining > 0) {
          --loadsRemaining;
        }
      });
    } else {

      const categoryQuery = `SELECT unrecognized FROM Categories WHERE category = '${category}'`;
      serverPool.query(categoryQuery, (error, result) => {
        if (error) {
          console.error(error);
        } else {

          if (result.rows[0].unrecognized < 6) {
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
    for (let i = 0; i < 3 * count; i++) {    // Many requests are made because unrecognized drawings are uncommon
      loadUnrecognizedFromCategory(category, size);
    }
  });
}

function loadUnrecognizedFromCategory(category, size) {
  const id = _.random(size - 1);

  if (loadsRemaining > 0) {
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
          if (loadersInProgress > 0) {
            --loadersInProgress;
          }
          console.log(`loaders remaining: ${loadersInProgress}`);
        }
      }
    });
  } else {
    console.log(`sufficient drawings have been loaded from ${category}`);
    if (loadersInProgress > 0) {
      --loadersInProgress;
    }
    console.log(`loaders remaining: ${loadersInProgress}`);
  }
}