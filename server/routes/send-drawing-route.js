const sendDrawingRoute = require('express').Router();
const quickdraw = require('../lib/quickdraw/quickdraw-api');
const qdsr = require('quickdraw-svg-render')

sendDrawingRoute.get('/random', (req, res) => {
    quickdraw.getRandomDrawing((drawing) => {
        const svgArray = qdsr(drawing.drawing, true);
        let svgHTMLElem = '';
    
        svgArray.forEach((val) => {
          svgHTMLElem += val;
        });
    
        res.status(200).send({ word: drawing.word, svg: svgHTMLElem });
      });
});

module.exports = sendDrawingRoute;