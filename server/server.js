const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const HttpStatus = require('http-status-codes');
const session = require('client-sessions');
const bcrypt = require('bcryptjs');

const indexRoute = require('./routes/index-route');
const loginRoute = require('./routes/login-route')

const PORT = process.env.PORT || 5000;
const app = express();
const pool = (req, res, next) => {
  req.pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  next();
}
const saltRounds = 8; // for hashing; the higher the number, the more secure the hash

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(pool);
app.use(session({
  cookieName: 'session',
  secret: 'namingVariablesIsHard',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000
}));

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use('/', indexRoute);
app.use('/login', loginRoute);

app.get('/register', (req, res) => {
  console.log('Landed on register page');

  res.render('pages/register');
});
app.post('/register', (req, res) => {
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
          bcrypt.hash(password, saltRounds, (error, hashedPassword) => {
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

              registerResponse(HttpStatus.CREATED, 'New user added to database');
            });
          });
        }
        else { // password mismatch
          registerResponse(HttpStatus.CONFLICT, 'Passwords do not match');
        }
        break;
      case 1: // existing user in db
        registerResponse(HttpStatus.CONFLICT, 'User already exists');
        break;
      default:
        throw new Error('Non-unique user in database');
    }
  });
});

app.get('/main-menu', (req, res) => {
  const sesh = req.session;

  if (sesh && sesh.user) {
    console.log(`${sesh.user} landed on main menu page`);

    res.render('pages/main-menu', { user: sesh.user });
  }
  else {
    console.log('Client redirected from main page to login');

    res.redirect('/login');
  }
});

app.get('/logout', (req, res) => {
  const sesh = req.session;

  console.log(`${sesh.user} logged out`)

  sesh.reset();
  res.redirect('/');
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
