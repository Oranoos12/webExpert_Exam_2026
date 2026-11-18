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

// Klassement: totaal aantal punten per speler, hoogste eerst.
async function getRanking(userId) {
    const players = await User.find({ role: 'player' });
    const predictions = await Prediction.find({});

    const ranking = [];
    for (const player of players) {
        let total = 0;
        for (const prediction of predictions) {
            if (prediction.user.toString() === player._id.toString() && prediction.points !== null) {
                total = total + prediction.points;
            }
        }
        ranking.push({ userId: player._id.toString(), username: player.username, points: total });
    }

    // sorteren: meeste punten eerst
    ranking.sort(function (a, b) {
        return b.points - a.points;
    });

    // positie geven; evenveel punten = zelfde positie
    for (let i = 0; i < ranking.length; i++) {
        if (i > 0 && ranking[i].points === ranking[i - 1].points) {
            ranking[i].position = ranking[i - 1].position;
        } else {
            ranking[i].position = i + 1;
        }
    }

    // de speler zelf zoeken
    let me = null;
    for (const row of ranking) {
        if (row.userId === userId.toString()) {
            me = row;
        }
    }
    if (!me) {
        throw new ValidationError('Player not found in ranking');
    }

    return {
        username: me.username,
        points: me.points,
        position: me.position,
        totalPlayers: ranking.length,
        ranking: ranking
    };
}

module.exports = { findByPlayer, getRanking };