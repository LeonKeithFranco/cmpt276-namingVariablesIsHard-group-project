const { Pool } = require('pg');
const HttpStatus = require('http-status-codes');
const bcrypt = require('bcryptjs');

module.exports = {
  pool: function (req, res, next) {
    req.pool = new Pool({ // adds Pool obect onto request object
      connectionString: process.env.DATABASE_URL
    })

    next();
  },
  httpStatusCodes: function(req, res, next) {
    req.httpStatus = HttpStatus; // adds HttpStatus object to request object

    next();
  },
  hash: function(req, res, next) {
    req.bcrypt = bcrypt; // adds bcrypt object to request object

    next();
  },
  respond: function(req, res, next) {
    res.respond = (httpResponseCode, msg) => {
      console.log(msg);

      res.statusMessage = msg;
      res.status(httpResponseCode).end();
    }

    next();
  },
  checkForValidSession: function(req, res, next) {
    const sesh = req.session;

    if (!sesh || !sesh.user) {
      console.log('Client redirected from main page to login');
  
      res.redirect('/login');
    }

    next();
  }
};