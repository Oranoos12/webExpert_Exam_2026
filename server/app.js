const loadExpress = require('./loaders/express');
const connectMongoose = require('./loaders/database');
const { connectRedis } = require('./loaders/redis');
const { connectRabbit } = require('./loaders/rabbitmq');

// Alle instellingen komen uit het bestand .env .
const PORT = process.env.PORT;
const DATABASE_CONNECTION = process.env.DATABASE_CONNECTION;
const REDIS_URL = process.env.REDIS_URL;
const RABBITMQ_URL = process.env.RABBITMQ_URL;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;

async function startServer() {
    try {
        await connectMongoose(DATABASE_CONNECTION);
        console.log('Connected to MongoDB');
        await connectRedis(REDIS_URL);
        console.log('Connected to Redis');
        await connectRabbit(RABBITMQ_URL);
        console.log('Connected to RabbitMQ');

        const app = loadExpress({ origin: CLIENT_ORIGIN, credentials: true });
        app.listen(PORT, function () {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (err) {
        console.log(`Server failed to start: ${err.message}`);
        process.exit(1);
    }
}

startServer();