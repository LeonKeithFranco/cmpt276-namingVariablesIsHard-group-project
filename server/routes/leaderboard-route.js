const leaderboardRoute = require('express').Router();

leaderboardRoute.get('/', async (req, res) => {
  console.log('Landed on leaderboard page');

  try {
    const personalScoreQuery = await req.pool.query(`
      SELECT username,standard,odd_one_out,timed
      FROM Users
      WHERE username='${req.session.user}'
    `);

    const scores = {
      personalScore: personalScoreQuery.rows[0]
    }

    res.render('pages/leaderboard', scores);
    // res.send(scores);
  } catch (err) {
    console.error(err);
  }
});

module.exports = leaderboardRoute;