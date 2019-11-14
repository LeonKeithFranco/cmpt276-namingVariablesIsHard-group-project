const gameModeRoute = require('express').Router();

gameModeRoute.get('/Standard/:difficulty', (req, res) => {
    const difficulty = req.params.difficulty;

    console.log(`${req.session.user} started a Standard game with ${difficulty} difficulty`);

    res.render('pages/standard', { difficulty: difficulty });
});

module.exports = gameModeRoute;