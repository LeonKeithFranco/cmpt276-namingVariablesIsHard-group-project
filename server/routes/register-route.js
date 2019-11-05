const registerRoute = require('express').Router();

const saltRounds = 8; // for hashing; the higher the number, the more secure the hash

registerRoute.get('/', (req, res) => {
  console.log('Landed on register page');

  res.render('pages/register');
});
registerRoute.post('/', (req, res) => {
  console.log('User register requested');

  const { username, password, passwordReconfirm } = req.body;
  let registerQuery = `SELECT * FROM Users WHERE username=\'${username}\'`

  req.pool.query(registerQuery, (error, result) => {
    if (error) {
      console.error(error);

      res.send(error);
    }

    const registerResponse = (httpResponseCode, msg) => {
      console.log(msg);

      res.statusMessage = msg;
      res.status(httpResponseCode).end();
    }

    switch (result.rows.length) {
      case 0: // no existing user in db
        if (password === passwordReconfirm) { // password match
          req.bcrypt.hash(password, saltRounds, (error, hashedPassword) => {
            if (error) {
              console.error(error);

              res.send(error);
            }

            registerQuery = `INSERT INTO Users(username,password) VALUES (\'${username}\',\'${hashedPassword}\')`;

            req.pool.query(registerQuery, (error, result) => {
              if (error) {
                console.error(error);

                res.send(error);
              }

              registerResponse(req.httpStatus.CREATED, 'New user added to database');
            });
          });
        }
        else { // password mismatch
          registerResponse(req.httpStatus.CONFLICT, 'Passwords do not match');
        }
        break;
      case 1: // existing user in db
        registerResponse(req.httpStatus.CONFLICT, 'User already exists');
        break;
      default:
        throw new Error('Non-unique user in database');
    }
  });
});

module.exports = registerRoute;