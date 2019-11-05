const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const HttpStatus = require('http-status-codes');
const session = require('client-sessions');
const bcrypt = require('bcryptjs');

const indexRoute = require('./routes/index-route');

const PORT = process.env.PORT || 5000;
const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
const saltRounds = 8; // for hashing; the higher the number, the more secure the hash

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  cookieName: 'session',
  secret: 'namingVariablesIsHard',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000
}));

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use('/', indexRoute);

app.get('/db', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM users');
    const results = { 'results': (result) ? result.rows : null };

    res.render('/', results);
    client.release();
  } catch (err) {
    console.error(err);

    res.send("Error " + err);
  }
});

app.get('/login', (req, res) => {
  console.log('Landed on login page');

  res.render('pages/login');
});
app.post('/login', (req, res) => {
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

app.get('/register', (req, res) => {
  console.log('Landed on register page');

  res.render('pages/register');
});
app.post('/register', (req, res) => {
  console.log('User register requested');

  const { username, password, passwordReconfirm } = req.body;
  let registerQuery = `SELECT * FROM Users WHERE username=\'${username}\'`

  pool.query(registerQuery, (error, result) => {
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

            pool.query(registerQuery, (error, result) => {
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
