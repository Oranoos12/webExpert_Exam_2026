const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
    {
        homeTeam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
            required: [true, 'Home team is required']
        },
        awayTeam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
            required: [true, 'Away team is required']
        },
        kickoffTime: {
            type: Date,
            required: [true, 'Kickoff time is required']
        },
        status: {
            type: String,
            enum: ['upcoming', 'finished'],
            default: 'upcoming'
        },
        // De uitslag: null zolang de uitslag niet ingevoerd is
        homeScore: {
            type: Number,
            min: 0,
            default: null
        },
        awayScore: {
            type: Number,
            min: 0,
            default: null
        }
    },
    { collection: 'matches' }
);

module.exports = mongoose.model('Match', matchSchema);