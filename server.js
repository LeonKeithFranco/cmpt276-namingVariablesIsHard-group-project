const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const PORT = process.env.PORT || 5000
var app = express();
var pool;
pool = new Pool({
    connectionString: process.env.DATABASE_URL
});


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    console.log('Landed on home page')
    console.log('Redirecting to login page')

    res.redirect('/login');
});

app.get('/login', (req, res) => {
    console.log('Landed on login page');

    res.render('pages/login');
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
