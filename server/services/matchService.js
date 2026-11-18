const { ValidationError } = require('../errors/error');
const Match = require('../models/matchModel');
const cacheService = require('./cacheService');

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

module.exports = { findMatches };