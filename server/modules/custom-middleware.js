const { Pool } = require('pg');

module.exports = {
  pool: function (req, res, next) {
    req.pool = new Pool({ // adds Pool obect onto request object
      connectionString: process.env.DATABASE_URL
    })

    next();
  }
};