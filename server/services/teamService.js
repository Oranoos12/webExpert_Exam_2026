const Team = require('../models/teamModel');

// Alle teams, gesorteerd op naam (A -> Z)
async function findAll() {
    return Team.find({}).sort({ name: 1 });
}

module.exports = { findAll };

