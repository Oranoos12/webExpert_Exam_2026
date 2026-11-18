const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

// Maakt verbinding met MongoDB. De connection string komt uit .env.
async function connectMongoose(databaseConnection) {
    return mongoose.connect(databaseConnection);
}

module.exports = connectMongoose;