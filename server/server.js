const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const HttpStatus = require('http-status-codes');
const session = require('client-sessions');
const bcrypt = require('bcryptjs');

const indexRoute = require('./routes/index-route');
const loginRoute = require('./routes/login-route');
const registerRoute = require('./routes/register-route');
const mainMenuRoute = require('./routes/main-menu-route');

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  cookieName: 'session',
  secret: 'namingVariablesIsHard',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000
}));
app.use((req, res, next) => {
  req.pool = new Pool({ // adds Pool obect onto request object
    connectionString: process.env.DATABASE_URL
  });
  req.httpStatus = HttpStatus; // adds HttpStatus object to request object
  req.bcrypt = bcrypt; // adds bcrypt object to request object

  next();
});

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use('/', indexRoute);
app.use('/login', loginRoute);
app.use('/register', registerRoute);
app.use('/main-menu', mainMenuRoute);

app.get('/logout', (req, res) => {
  const sesh = req.session;

  console.log(`${sesh.user} logged out`)

  sesh.reset();
  res.redirect('/');
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
