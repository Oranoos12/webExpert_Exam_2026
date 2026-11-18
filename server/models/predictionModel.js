const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User is required']
        },
        match: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Match',
            required: [true, 'Match is required']
        },
        homeScore: {
            type: Number,
            min: 0,
            required: [true, 'Home score is required']
        },
        awayScore: {
            type: Number,
            min: 0,
            required: [true, 'Away score is required']
        },
        // null zolang de uitslag van de match niet bekend is
        points: {
            type: Number,
            default: null
        }
    },
    { collection: 'predictions' }
);

// Een speler mag maar één voorspelling per match hebben.
predictionSchema.index({ user: 1, match: 1 }, { unique: true });

module.exports = mongoose.model('Prediction', predictionSchema);