const express = require('express');
const path = require('path');
const session = require('client-sessions');
const { pool, httpStatusCodes, hash, respond } = require('./lib/custom-middleware');

const indexRoute = require('./routes/index-route');
const loginRoute = require('./routes/login-route');
const registerRoute = require('./routes/register-route');
const mainMenuRoute = require('./routes/main-menu-route');
const logoutRoute = require('./routes/logout-route');
const sendDrawingRoute = require('./routes/send-drawing-route');

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

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use('/', indexRoute);
app.use('/login', pool, httpStatusCodes, hash, respond, loginRoute);
app.use('/register', pool, httpStatusCodes, hash, respond, registerRoute);
app.use('/main-menu', mainMenuRoute);
app.use('/logout', logoutRoute);
app.use('/send-drawing', httpStatusCodes, sendDrawingRoute);

app.get('/test-draw', (req, res) => {
  res.render('pages/test-draw');
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
