const teamService = require('../services/teamService');

// GET /teams
async function getTeams(req, res, next) {
    try {
        const teams = await teamService.findAll();
        res.status(200).json(teams);
    } catch (err) {
        next(err);
    }
}

module.exports = { getTeams };