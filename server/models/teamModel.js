const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Team name is required'],
            unique: true,
            trim: true
        },
        city: {
            type: String,
            required: [true, 'City is required'],
            trim: true
        }
    },
    { collection: 'teams' }
);

module.exports = mongoose.model('Team', teamSchema);