const predictionService = require('../services/predictionService');

// GET /player/predictions
async function getPredictions(req, res, next) {
    try {
        const predictions = await predictionService.findByPlayer(req.requestingUser._id);
        res.status(200).json(predictions);
    } catch (err) {
        next(err);
    }
}

// GET /player/ranking
async function getRanking(req, res, next) {
    try {
        const ranking = await predictionService.getRanking(req.requestingUser._id);
        res.status(200).json(ranking);
    } catch (err) {
        next(err);
    }
}

module.exports = { getPredictions, getRanking };