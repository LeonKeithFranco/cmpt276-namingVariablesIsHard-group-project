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

async function schedulePreloadDrawings() {
  try {
    if (loadersInProgress === 0) {
      loadersInProgress = 1;  // Prevents this function from being entered multiple times at once asynchronously

      let result = await serverPool.query(`
        SELECT * 
        FROM Categories 
        WHERE recognized < 6
        ORDER BY RANDOM()
        LIMIT 1
      `);

      if (result.rows.length > 0) {
        loadedRecognizedSent = false;
        const choice = result.rows[0];

        console.log(`preloading recognized images from category: ${choice.category}`);

        preloadDrawings(choice.category, 6 - choice.recognized);
      } else {
        result = await serverPool.query(`
          SELECT * 
          FROM Categories 
          WHERE recognized < 12
          ORDER BY RANDOM()
          LIMIT 1
        `);

        if (result.rows.length > 0) {
          loadedRecognizedSent = false;
          const choice = result.rows[0];

          console.log(`preloading recognized images from category: ${choice.category}`);

          preloadDrawings(choice.category, 12 - choice.recognized);
        } else {

          if (!loadedRecognizedSent) {
            console.log(`all categories have at least 12 recognized drawings preloaded`);

            loadedRecognizedSent = true;
          }

          result = await serverPool.query(`
            SELECT * 
            FROM Categories 
            WHERE unrecognized < 3
            ORDER BY RANDOM()
            LIMIT 1
          `);

          if (result.rows.length > 0) {
            loadedUnrecognizedSent = false;
            const choice = result.rows[0];

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

      }
    }
  }
  catch (err) {
    console.error(err);

    loadersInProgress = 0;
  }
}

async function preloadDrawings(category, count) {
  console.log(`preloading ${count} more recognized drawings from ${category}`);

  loadersInProgress = count;
  loadsRemaining = count;

  const size = await quickdraw.getCategorySizePromise(category);

  for (let i = 0; i < count; i++) {
    loadRandomFromCategory(category, size);
  }
}

async function loadRandomFromCategory(category, size) {
  const id = _.random(size - 1);

  try {
    const { parsedDrawing, rawDrawing } = await quickdraw.getDrawingPromise(category, id);
    if (parsedDrawing.recognized) {
      serverPool.query(`
        INSERT INTO Preloaded_Drawings(category, drawing_id, drawing)
        VALUES ('${category}', ${id}, '${rawDrawing}')
      `);

      if (loadersInProgress > 0) {
        --loadersInProgress;
      }
      if (loadsRemaining > 0) {
        --loadsRemaining;
      }
    } else {
      const result = await serverPool.query(`
        SELECT unrecognized 
        FROM Categories 
        WHERE category = '${category}'
      `);

      if (result.rows[0].unrecognized < 6) {
        console.log(`preloaded drawing from ${category} not recognized, storing and requesting another`);

        serverPool.query(`
          INSERT INTO Preloaded_Drawings(category, drawing_id, drawing, recognized)
          VALUES ('${category}', ${id}, '${rawDrawing}', FALSE)
        `);

        loadRandomFromCategory(category, size);
      } else {
        console.log(`preloaded drawing from ${category} not recognized, discarding and requesting another`);

        loadRandomFromCategory(category, size);
      }
    }
  }
  catch (err) {
    console.error(err);
  }
}

async function preloadUnrecognizedDrawings(category, count) {
  console.log(`preloading ${count} more unrecognized drawings from ${category}`);

  loadersInProgress = 3 * count;
  loadsRemaining = count;

  const size = await quickdraw.getCategorySizePromise(category);

  for (let i = 0; i < 3 * count; i++) {    // Many requests are made because unrecognized drawings are uncommon
    loadUnrecognizedFromCategory(category, size);
  }
}

async function loadUnrecognizedFromCategory(category, size) {
  const id = _.random(size - 1);

  try {
    if (loadsRemaining > 0) {
      const { parsedDrawing, rawDrawing } = await quickdraw.getDrawingPromise(category, id);

      if (!parsedDrawing.recognized) {
        serverPool.query(`
          INSERT INTO Preloaded_Drawings(category, drawing_id, drawing, recognized)
          VALUES ('${category}', ${id}, '${rawDrawing}', FALSE)
        `);

        console.log(`unrecognized drawing from ${category} found, inserting into table`);

        if (loadsRemaining > 0) {
          --loadsRemaining;
        }

        loadUnrecognizedFromCategory(category, size);
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
    } else {
      console.log(`sufficient drawings have been loaded from ${category}`);

      if (loadersInProgress > 0) {
        --loadersInProgress;
      }

      console.log(`loaders remaining: ${loadersInProgress}`);
    }
  }
  catch (err) {
    console.error(err);
  }
}
