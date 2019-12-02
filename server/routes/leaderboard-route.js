const leaderboardRoute = require('express').Router();

leaderboardRoute.get('/', async (req, res) => {
  console.log('Landed on leaderboard page');

  try {
    const personalScoreQuery = req.pool.query(`
      SELECT username,standard,odd_one_out,timed
      FROM Users
      WHERE username='${req.session.user}'
    `);

    const maxNumOfScores = 11;

    const topTenStandardScoresQuery = req.pool.query(`
      SELECT username,standard
      FROM Users
      ORDER BY standard DESC
      LIMIT ${maxNumOfScores}
    `);
    const topTenOddOneOutScoresQuery = req.pool.query(`
      SELECT username,odd_one_out
      FROM Users
      ORDER BY odd_one_out DESC
      LIMIT ${maxNumOfScores}
    `);
    const topTenTimedScoresQuery = req.pool.query(`
      SELECT username,timed
      FROM Users
      ORDER BY timed DESC
      LIMIT ${maxNumOfScores}
    `);
    const topTenWordHuntScoresQuery = req.pool.query(`
      SELECT username,word_hunt
      FROM Users
      ORDER BY word_hunt DESC
      LIMIT ${maxNumOfScores}
    `);

    const scores = {
      personalScore: (await personalScoreQuery).rows[0],
      topTenStandardScores: (await topTenStandardScoresQuery).rows,
      topTenOddOneOutScores: (await topTenOddOneOutScoresQuery).rows,
      topTenTimedScores: (await topTenTimedScoresQuery).rows,
      topTenWordHuntScores: (await topTenWordHuntScoresQuery).rows
    }

    res.render('pages/leaderboard', scores);
  } catch (err) {
    console.error(err);
  }
});

module.exports = leaderboardRoute;