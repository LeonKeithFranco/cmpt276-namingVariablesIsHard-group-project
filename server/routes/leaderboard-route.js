const leaderboardRoute = require('express').Router();

leaderboardRoute.get('/', async (req, res) => {
  console.log('Landed on leaderboard page');

  try {
    const personalScoreQuery = await req.pool.query(`
      SELECT username,standard,odd_one_out,timed
      FROM Users
      WHERE username='${req.session.user}'
    `);

    const maxNumOfScores = 10;

    const topTenStandardScoresQuery = await req.pool.query(`
      SELECT username,standard
      FROM Users
      ORDER BY standard DESC
      LIMIT ${maxNumOfScores}
    `);
    const topTenOddOneOutScoresQuery = await req.pool.query(`
      SELECT username,odd_one_out
      FROM Users
      ORDER BY odd_one_out DESC
      LIMIT ${maxNumOfScores}
    `);
    const topTenTimedScoresQuery = await req.pool.query(`
      SELECT username,timed
      FROM Users
      ORDER BY timed DESC
      LIMIT ${maxNumOfScores}
    `);

    const scores = {
      personalScore: personalScoreQuery.rows[0],
      topTenStandardScores: topTenStandardScoresQuery.rows,
      topTenOddOneOutScores: topTenOddOneOutScoresQuery.rows,
      topTenTimedScores: topTenTimedScoresQuery.rows
    }

    res.render('pages/leaderboard', scores);
  } catch (err) {
    console.error(err);
  }
});

module.exports = leaderboardRoute;