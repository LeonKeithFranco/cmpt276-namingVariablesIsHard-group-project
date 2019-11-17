const express = require('express');
const path = require('path');
const session = require('client-sessions');
const socket = require('socket.io');
const quickdraw = require('./lib/quickdraw/quickdraw-api');
const qdsr = require('quickdraw-svg-render');
const { pool, httpStatusCodes, hash, respond, checkForValidSession } = require('./lib/custom-middleware');

const indexRoute = require('./routes/index-route');
const loginRoute = require('./routes/login-route');
const registerRoute = require('./routes/register-route');
const mainMenuRoute = require('./routes/main-menu-route');
const logoutRoute = require('./routes/logout-route');
const gameModeRoute = require('./routes/game-mode-route');

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
app.use('/main-menu', checkForValidSession, mainMenuRoute);
app.use('/logout', logoutRoute);
app.use('/game-mode', checkForValidSession, gameModeRoute);

const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));
const io = socket(server);

io.on('connection', (socket) => {
  console.log("connection made with socket id:", socket.id);
  socket.on('clientRequestRandomDrawing', () => {
    quickdraw.getRandomDrawing((drawing) => {
      quickdraw.convertDrawing(drawing, (convertedDrawing) => {
        socket.emit('serverSendRandomDrawing', convertedDrawing);
      });
    });
  });

  socket.on('clientRequestDrawing', (data) => {
    const { category, id } = data;

    quickdraw.getDrawing(category, id, (drawing) => {
      quickdraw.convertDrawing(drawing, (convertedDrawing) => {
        socket.emit('serverSendDrawing', convertedDrawing);
      });
    });
  });

  socket.on('clientRequestCategoryName', (data) => {
    console.log(`${data}`);
    socket.emit('serverSendCategoryName', quickdraw.getCategory(data));
  });

  socket.on('clientRequestRandomCategoryName', () => {
    console.log('Random category requested');

    let category = quickdraw.getRandomCategory();
    console.log(category)

    socket.emit('serverSendRandomCategoryName', category);
  });

  socket.on('clientRequestCategorySize', (category) => {
    console.log('Category size requested');
    console.log(`Category: ${category}`);

    quickdraw.getCategorySize(category, (size) => {
      console.log(`size of ${category} category: ${size}`);
      console.log('Size of ' + category + ' category: ' + size);
      socket.emit('serverSendCategorySize', size);  
    });
  });
});
