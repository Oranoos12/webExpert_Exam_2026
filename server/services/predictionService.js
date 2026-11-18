const { ValidationError } = require('../errors/error');
const User = require('../models/userModel');
const Prediction = require('../models/predictionModel');

// Alle voorspellingen van één speler, met de match en de teams erbij.
async function findByPlayer(userId) {
    return Prediction.find({ user: userId }).populate({
        path: 'match',
        populate: [{ path: 'homeTeam' }, { path: 'awayTeam' }]
    });
}



module.exports = { findByPlayer};