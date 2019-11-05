const mainMenuRoute = require('express').Router();

mainMenuRoute.get('/', (req, res) => {
    const sesh = req.session;
  
    if (sesh && sesh.user) {
      console.log(`${sesh.user} landed on main menu page`);
  
      res.render('pages/main-menu', { user: sesh.user });
    }
    else {
      console.log('Client redirected from main page to login');
  
      res.redirect('/login');
    }
  });

module.exports = mainMenuRoute;