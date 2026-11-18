const matchService = require('../services/matchService');
const predictionService = require('../services/predictionService');

// GET /matches en GET /matches?status=upcoming|finished
async function getMatches(req, res, next) {
    try {
        const matches = await matchService.findMatches(req.query.status);
        res.status(200).json(matches);
    } catch (err) {
        next(err);
    }
}

// POST /matches/:id/predictions (player)
async function placePrediction(req, res, next) {
    try {
        const body = req.body || {};
        const userId = req.requestingUser._id;   // id komt uit het JWT-token
        const prediction = await predictionService.placePrediction(
            req.params.id, userId, body.homeScore, body.awayScore
        );
        res.status(201).json(prediction);
    } catch (err) {
        next(err);
    }
}

module.exports = { getMatches, placePrediction};