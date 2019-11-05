const route = require('express').Router();

route.get('/', (req, res) => {
  console.log('Landed on home page');
  console.log('Redirecting to login page');

  res.redirect('/login');
});

module.exports = route;