const express = require('express');
const path = require('path');
const session = require('client-sessions');
const { pool, httpStatusCodes, hash, respond } = require('./lib/custom-middleware');
const quickdraw = require('./lib/quickdraw/quickdraw-api');
const qdsr = require('quickdraw-svg-render')

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

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use('/', indexRoute);
app.use('/login', pool, httpStatusCodes, hash, respond, loginRoute);
app.use('/register', pool, httpStatusCodes, hash, respond, registerRoute);
app.use('/main-menu', mainMenuRoute);
app.use('/logout', logoutRoute);

app.get('/test-draw', (req, res) => {
  quickdraw.getDrawing((drawing) => {
    // res.send(qdsr(drawing.drawing, true));
    console.log(qdsr(drawing.drawing, true));
    res.render('pages/test-draw', { draw: qdsr(drawing.drawing, true), word: drawing.word });
  });
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
