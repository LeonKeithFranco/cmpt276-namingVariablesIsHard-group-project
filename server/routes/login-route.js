const loginRoute = require('express').Router();
const { Pool } = require('pg');
const HttpStatus = require('http-status-codes');
const session = require('client-sessions');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

loginRoute.use(session({
  cookieName: 'session',
  secret: 'namingVariablesIsHard',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000
}));

loginRoute.get('/', (req, res) => {
  console.log('Landed on login page');

  res.render('pages/login');
});
loginRoute.post('/', (req, res) => {
  console.log('Login requested');

  let loginQuery = `SELECT * FROM Users WHERE username=\'${req.body.username}\'`;
  pool.query(loginQuery, (error, result) => {
    if (error) {
      console.error(error);

      res.send(error);
    }

    const loginResponse = (httpResponseCode, msg) => {
      console.log(msg);

      res.statusMessage = msg;
      res.status(httpResponseCode).end();
    }

    if (result.rows.length == 0) { // invalid username
      loginResponse(HttpStatus.CONFLICT, 'Invalid Username');
    } else { // valid username
      bcrypt.compare(req.body.password, result.rows[0].password, function (error, validPassword) {
        if (error) {
          console.error(error);

          res.send(error);
        }

        if (validPassword) { // valid password
          const sesh = req.session;
          const user = result.rows[0];

          sesh.user = user.username;
          sesh.highscore = user.highscore || 0;

          console.log(`${sesh.user} logged in`);
          loginResponse(HttpStatus.OK, 'Login succesful');
        } else { // invalid password
          loginResponse(HttpStatus.CONFLICT, 'Invalid password');
        }
      });
    }
  });
});

module.exports = loginRoute;