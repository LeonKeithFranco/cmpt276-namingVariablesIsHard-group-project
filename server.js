const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const PORT = process.env.PORT || 5000;
var app = express();
var pool;
pool = new Pool({
  connectionString: process.env.DATABASE_URL
});


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  console.log('Landed on home page');
  console.log('Redirecting to login page');

  res.redirect('/login');
});

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

  var loginQuery = `SELECT * FROM Users WHERE username=\'${req.body.username}\'`;
  pool.query(loginQuery, (error, result) => {
    if (error) {
      console.log(error);

      res.send(error);
    }
    if (result.rows.length == 0) {
      console.log('Invalid username');

      res.redirect('/login');
    } else {
      if (req.body.password == result.rows[0].password) {
        console.log('Login successful');

        res.redirect('/main-menu');
      } else {
        console.log('Invalid password');

        res.redirect('/login');
      }
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
        if (password === passwordReconfirm) {
          registerQuery = `INSERT INTO Users(username,password) VALUES (\'${username}\',\'${password}\')`;

          pool.query(registerQuery, (error, result) => {
            if (error) {
              console.error(error);

              res.send(error);
            }

            registerResponse(201, 'New user added to database');
          });
        }
        else {
          registerResponse(406, 'Passwords do not match');
        }
        break;
      case 1: // existing user in db
        registerResponse(406, 'User already exists');
        break;
      default:
        throw new Error('Non-unique user in database');
    }
  });
});

app.get('/main-menu', (req, res) => {
  console.log('Landed on main menu page');

  res.render('pages/main-menu');
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
