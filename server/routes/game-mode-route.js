const gameModeRoute = require('express').Router();

gameModeRoute.get('/', (req, res) => {
  console.log(`${req.session.user} redirected to main menu`);

  res.redirect('/main-menu');
});

gameModeRoute.get('/standard/:difficulty', (req, res) => {
  const difficulty = req.params.difficulty;

  console.log(`${req.session.user} started a Standard game with ${difficulty} difficulty`);

  res.render('pages/standard', { difficulty: difficulty });
});
gameModeRoute.put('/standard/:difficulty/:score', (req, res) => {
  console.log(`Update ${req.session.user}'s standard mode high score`)

  if (req.params.difficulty == 'hard') {
    const query = `UPDATE Users SET standard=${req.params.score} WHERE username=\'${req.session.user}\'`;
    req.pool.query(query, (error, result) => {
      if (error) {
        console.error(error);
  
        res.send(error);
      }

      if (result.rowCount != 0) {
        res.respond(req.httpStatus.OK, 'Standard score was successfully updated');
      }
      else {
        res.respond(req.httpStatus.CONFLICT, 'Unable to update score');
      }
    });
  } else {
    res.respond(req.httpStatus.FORBIDDEN, 'Can only update score when playing hard mode');
  }
});

gameModeRoute.get('/odd-one-out/:difficulty', (req, res) => {
  const difficulty = req.params.difficulty;

  console.log(`${req.session.user} started an Odd One Out game with ${difficulty} difficulty`);

  res.render('pages/odd-one-out', { difficulty: difficulty });
});
gameModeRoute.put('/odd-one-out/:difficulty/:score', (req, res) => {
  console.log(`Update ${req.session.user}'s Odd One Out mode high score`)

  if (req.params.difficulty == 'hard') {
    const query = `UPDATE Users SET odd_one_out=${req.params.score} WHERE username=\'${req.session.user}\'`;
    req.pool.query(query, (error, result) => {
      if (error) {
        console.error(error);
  
        res.send(error);
      }

      if (result.rowCount != 0) {
        res.respond(req.httpStatus.OK, 'Odd One Out score was successfully updated');
      }
      else {
        res.respond(req.httpStatus.CONFLICT, 'Unable to update score');
      }
    });
  } else {
    res.respond(req.httpStatus.FORBIDDEN, 'Can only update score when playing hard mode');
  }
});

gameModeRoute.get('/timed/:difficulty', (req, res) => {
  const difficulty = req.params.difficulty;

  console.log(`${req.session.user} started a Timed game with ${difficulty} difficulty`);

  res.render('pages/timed', { difficulty: difficulty });
});
gameModeRoute.put('/timed/:difficulty/:score', (req, res) => {
  console.log(`Update ${req.session.user}'s Timed mode high score`);

  if (req.params.difficulty == 'hard') {
    const query = `UPDATE Users SET timed=${req.params.score} WHERE username=\'${req.session.user}\'`;
    req.pool.query(query, (error, result) => {
      if (error) {
        console.error(error);
  
        res.send(error);
      }

      if (result.rowCount != 0) {
        res.respond(req.httpStatus.OK, 'Timed score was successfully updated');
      }
      else {
        res.respond(req.httpStatus.CONFLICT, 'Unable to update score');
      }
    });
  } else {
    res.respond(req.httpStatus.FORBIDDEN, 'Can only update score when playing hard mode');
  }
});

gameModeRoute.get('/pass-or-fail', (req, res) => {
  console.log(`${req.session.user} started a Pass Or Fail game`);

  res.render('pages/pass-or-fail');
});

module.exports = gameModeRoute;