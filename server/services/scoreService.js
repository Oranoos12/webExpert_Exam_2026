const Prediction = require('../models/predictionModel');
const { calculatePoints } = require('../utils/scoring');

// Wordt opgeroepen door de consumer (consumer.js) voor elk event match.result.entered.
async function calculateScores(matchId, homeScore, awayScore) {
    // alle predictions van deze match ophalen
    const predictions = await Prediction.find({ match: matchId });

    // per prediction de punten berekenen en opslaan
    for (const prediction of predictions) {
        prediction.points = calculatePoints(prediction.homeScore, prediction.awayScore, homeScore, awayScore);
        await prediction.save();
    }
    return predictions.length;
}

module.exports = { calculateScores };