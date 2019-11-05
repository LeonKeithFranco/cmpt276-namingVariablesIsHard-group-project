const logoutRoute = require('express').Router();

logoutRoute.get('/', (req, res) => {
  const sesh = req.session;

  console.log(`${sesh.user} logged out`)

  sesh.reset();
  res.redirect('/');
});

module.exports = logoutRoute;