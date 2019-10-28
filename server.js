const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const PORT = process.env.PORT || 5000
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
    console.log('Landed on home page')
    console.log('Redirecting to login page')

    res.redirect('/login');
});

app.get('/db', async (req, res) => {
  try {
    const client = await pool.connect()
    const result = await client.query('SELECT * FROM users');
    const results = { 'results': (result) ? result.rows : null};
    res.render('/');
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
  console.log(typeof req.body.username);
  var loginQuery = `SELECT * FROM users WHERE username=\'${req.body.username}\'`;
  console.log(loginQuery);
  pool.query(loginQuery, (error, result) => {
    if (error) {
      res.redirect('/login');
    }
    res.render('pages/main-menu');
  })
});

app.get('/register', (req, res) => {
    console.log('Landed on register page');

    res.render('pages/register');
});

app.get('/main-menu', (req, res) => {
    console.log('Landed on main menu page');

    res.render('pages/main-menu');
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
