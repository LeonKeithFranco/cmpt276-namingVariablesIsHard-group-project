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
gameModeRoute.get('/odd-one-out/:difficulty', (req, res) => {
  const difficulty = req.params.difficulty;

  console.log(`${req.session.user} started an Odd One Out game with ${difficulty} difficulty`);

  res.render('pages/odd-one-out', { difficulty: difficulty });
});
gameModeRoute.get('/timed/:difficulty', (req, res) => {
  const difficulty = req.params.difficulty;

  console.log(`${req.session.user} started a Timed game with ${difficulty} difficulty`);

  res.render('pages/timed', { difficulty: difficulty });
});

module.exports = gameModeRoute;