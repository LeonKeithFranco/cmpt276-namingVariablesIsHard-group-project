const express = require('express');
const path = require('path');
const HttpStatus = require('http-status-codes');
const session = require('client-sessions');
const bcrypt = require('bcryptjs');
const { pool } = require('./modules/custom-middleware');

const indexRoute = require('./routes/index-route');
const loginRoute = require('./routes/login-route');
const registerRoute = require('./routes/register-route');
const mainMenuRoute = require('./routes/main-menu-route');
const logoutRoute = require('./routes/logout-route');

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
  req.httpStatus = HttpStatus; // adds HttpStatus object to request object
  req.bcrypt = bcrypt; // adds bcrypt object to request object

  next();
});

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use('/', indexRoute);
app.use('/login', pool, loginRoute);
app.use('/register', pool, registerRoute);
app.use('/main-menu', mainMenuRoute);
app.use('/logout', logoutRoute);

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
