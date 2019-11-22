const leaderboardRoute = require('express').Router();

leaderboardRoute.get('/', (req, res) => {
  console.log('Landed on leaderbaord page');

  res.render('pages/leaderboard');
});

module.exports = leaderboardRoute;