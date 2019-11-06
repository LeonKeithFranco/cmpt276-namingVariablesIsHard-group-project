const loginRoute = require('express').Router();

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

    if (result.rows.length == 0) { // invalid username
      res.respond(req.httpStatus.CONFLICT, 'Invalid Username');
    } else { // valid username
      req.bcrypt.compare(req.body.password, result.rows[0].password, function (error, validPassword) {
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
          res.respond(req.httpStatus.OK, 'Login succesful');
        } else { // invalid password
          res.respond(req.httpStatus.CONFLICT, 'Invalid password');
        }
      });
    }
  });
});

module.exports = loginRoute;