const loginRoute = require('express').Router();
const bcrypt = require('bcryptjs');

loginRoute.get('/', (req, res) => {
  console.log('Landed on login page');

  res.render('pages/login');
});
loginRoute.post('/', (req, res) => {
  console.log('Login requested');

  let loginQuery = `SELECT * FROM Users WHERE username=\'${req.body.username}\'`;
  req.pool.query(loginQuery, (error, result) => {
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
      loginResponse(req.httpStatus.CONFLICT, 'Invalid Username');
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
          loginResponse(req.httpStatus.OK, 'Login succesful');
        } else { // invalid password
          loginResponse(req.httpStatus.CONFLICT, 'Invalid password');
        }
      });
    }
  });
});

module.exports = loginRoute;