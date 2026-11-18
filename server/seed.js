const mongoose = require('mongoose');
const User = require('./models/userModel');
const Team = require('./models/teamModel');
const Match = require('./models/matchModel');
const Prediction = require('./models/predictionModel');
const { calculatePoints } = require('./utils/scoring');
const { connectRedis, closeRedis } = require('./loaders/redis');
const { deleteCache, MATCH_CACHE_KEYS } = require('./services/cacheService');

const DATABASE_CONNECTION = process.env.DATABASE_CONNECTION;
const REDIS_URL = process.env.REDIS_URL;

// Datum berekenen vanaf vandaag. Negatief getal = in het verleden.
// Zo blijven "toekomstige" matches altijd in de toekomst.
function daysFromNow(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(20, 0, 0, 0);
    return date;
}

async function createUser(username, password, role) {
    const user = new User({ username: username, password: password, role: role });
    return user.save();
}

async function createTeam(name, city) {
    const team = new Team({ name: name, city: city });
    return team.save();
}

// homeScore en awayScore = null -> er is nog geen uitslag
async function createMatch(homeTeam, awayTeam, days, homeScore, awayScore) {
    let status = 'upcoming';
    if (homeScore !== null) {
        status = 'finished';
    }
    const match = new Match({
        homeTeam: homeTeam._id,
        awayTeam: awayTeam._id,
        kickoffTime: daysFromNow(days),
        status: status,
        homeScore: homeScore,
        awayScore: awayScore
    });
    return match.save();
}

// Als de match al afgelopen is, berekenen we meteen de punten.
async function createPrediction(user, match, homeScore, awayScore) {
    let points = null;
    if (match.status === 'finished') {
        points = calculatePoints(homeScore, awayScore, match.homeScore, match.awayScore);
    }
    const prediction = new Prediction({
        user: user._id,
        match: match._id,
        homeScore: homeScore,
        awayScore: awayScore,
        points: points
    });
    return prediction.save();
}

async function run() {
    try {
        await mongoose.connect(DATABASE_CONNECTION);

        // indexen (unique) aanmaken
        await User.init();
        await Team.init();
        await Match.init();
        await Prediction.init();

        // alles leegmaken
        await Prediction.deleteMany({});
        await Match.deleteMany({});
        await Team.deleteMany({});
        await User.deleteMany({});

        // 1 admin en 2 players
        await createUser('admin', 'admin123', 'admin');
        const player1 = await createUser('player1', 'player123', 'player');
        const player2 = await createUser('player2', 'player456', 'player');

        // teams
        const brugge = await createTeam('Club Brugge', 'Brugge');
        const anderlecht = await createTeam('RSC Anderlecht', 'Brussel');
        const genk = await createTeam('KRC Genk', 'Genk');
        const antwerp = await createTeam('Royal Antwerp FC', 'Antwerpen');
        const gent = await createTeam('KAA Gent', 'Gent');
        const standard = await createTeam('Standard Luik', 'Luik');

        // afgelopen matches met uitslag
        const match1 = await createMatch(brugge, anderlecht, -14, 2, 1);
        const match2 = await createMatch(genk, antwerp, -7, 1, 1);
        const match3 = await createMatch(gent, standard, -3, 0, 2);
        // al gespeeld, maar de admin moet de uitslag nog invoeren
        const match4 = await createMatch(anderlecht, genk, -1, null, null);
        // toekomstige matches
        const match5 = await createMatch(antwerp, brugge, 2, null, null);
        await createMatch(standard, genk, 5, null, null);
        await createMatch(gent, anderlecht, 9, null, null);
        await createMatch(brugge, genk, 14, null, null);

        // voorspellingen van de spelers
        await createPrediction(player1, match1, 2, 1);
        await createPrediction(player1, match2, 2, 0);
        await createPrediction(player1, match3, 1, 2);
        await createPrediction(player1, match4, 1, 0);
        await createPrediction(player1, match5, 1, 1);
        await createPrediction(player2, match1, 1, 0);
        await createPrediction(player2, match2, 0, 0);
        await createPrediction(player2, match3, 0, 2);
        await createPrediction(player2, match4, 2, 2);

        console.log('Database is gevuld:');
        console.log(`- users: ${await User.countDocuments()}`);
        console.log(`- teams: ${await Team.countDocuments()}`);
        console.log(`- matches: ${await Match.countDocuments()}`);
        console.log(`- predictions: ${await Prediction.countDocuments()}`);
        console.log('Login: admin / admin123, player1 / player123, player2 / player456');

        // oude matches uit de Redis-cache verwijderen (anders zie je nog oude id's)
        await connectRedis(REDIS_URL);
        await deleteCache(MATCH_CACHE_KEYS);
        console.log('Redis-cache leeggemaakt');
    } catch (error) {
        console.log(error.message);
    } finally {
        await mongoose.connection.close();
        await closeRedis();
    }
}

run();