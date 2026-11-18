const mongoose = require('mongoose');
const { ValidationError } = require('../errors/error');
const Match = require('../models/matchModel');
const cacheService = require('./cacheService');
const rabbitmq = require('../loaders/rabbitmq');
const { isValidScore } = require('../utils/scoring');

const ObjectId = mongoose.Types.ObjectId
const VALID_STATUSES = ['upcoming', 'finished'];

// Alle matches, of alleen de matches met een bepaalde status.
// Cache-aside: eerst in Redis kijken, anders de database en het resultaat in Redis zetten.
async function findMatches(status) {
    const filter = {};
    if (status !== undefined) {
        if (!VALID_STATUSES.includes(status)) {
            throw new ValidationError(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
        }
        filter.status = status;
    }

    const cacheKey = `matches:${status || 'all'}`;
    //Cache hit: de database wordt niet gevraagd.
    //eerst check Redis als de redis heeft de info niet gaat naar de mongodb
    const cached = await cacheService.getCache(cacheKey);
    if (cached) {
        console.log(`Cache HIT ${cacheKey}`);
        return cached;
    }
    console.log(`Cache MISS ${cacheKey}`);

    const matches = await Match.find(filter)
        .populate('homeTeam')
        .populate('awayTeam')
        .sort({ kickoffTime: 1 });
    await cacheService.setCache(cacheKey, matches);
    return matches;
}

// Actie 6b: de admin voert de uitslag in.
// De punten worden NIET hier berekend, maar door de consumer (RabbitMQ).
async function enterResult(matchId, homeScore, awayScore) {
    if (!isValidScore(homeScore) || !isValidScore(awayScore)) {
        throw new ValidationError('homeScore and awayScore must be whole numbers of 0 or more');
    }
    if (!ObjectId.isValid(matchId)) {
        throw new ValidationError('Match does not exist');
    }
    const match = await Match.findById(matchId);
    if (!match) {
        throw new ValidationError('Match does not exist');
    }
    if (match.status === 'finished') {
        throw new ValidationError('A result has already been entered for this match');
    }

    // de uitslag opslaan en de match op 'finished' zetten
    match.homeScore = homeScore;
    match.awayScore = awayScore;
    match.status = 'finished';
    await match.save();

    // de matches zijn veranderd -> cache van GET /matches ongeldig maken
    await cacheService.deleteCache(cacheService.MATCH_CACHE_KEYS);

    // het event publiceren; de consumer berekent de punten
    rabbitmq.publishEvent({
        event: rabbitmq.QUEUE,
        matchId: match._id.toString(),
        homeScore: homeScore,
        awayScore: awayScore
    });

    return match;
}

module.exports = { findMatches, enterResult };