const mainMenuRoute = require('express').Router();

mainMenuRoute.get('/', (req, res) => {
  const sesh = req.session;
  console.log(`${sesh.user} landed on main menu page`);

  res.render('pages/main-menu', { user: sesh.user });
});

module.exports = mainMenuRoute;