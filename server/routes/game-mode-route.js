const gameModeRoute = require('express').Router();

gameModeRoute.get('/', (req, res) => {
    console.log(`${req.session.user} redirected to login`);

    res.redirect('/main-menu');
});
gameModeRoute.get('/standard/:difficulty', (req, res) => {
    const difficulty = req.params.difficulty;

    console.log(`${req.session.user} started a Standard game with ${difficulty} difficulty`);

    res.render('pages/standard', { difficulty: difficulty });
});

module.exports = gameModeRoute;