const matchService = require('../services/matchService');

// GET /matches en GET /matches?status=upcoming|finished
async function getMatches(req, res, next) {
    try {
        const matches = await matchService.findMatches(req.query.status);
        res.status(200).json(matches);
    } catch (err) {
        next(err);
    }
}

module.exports = { getMatches };