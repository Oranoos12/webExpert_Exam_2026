const connectMongoose = require('./loaders/database');
const { connectRabbit, QUEUE } = require('./loaders/rabbitmq');
const scoreService = require('./services/scoreService');

// Aparte consumer: berekent de punten zodra er een uitslag is ingevoerd.
async function startConsumer() {
    try {
        await connectMongoose(process.env.DATABASE_CONNECTION);
        const channel = await connectRabbit(process.env.RABBITMQ_URL);
        // maar één bericht tegelijk verwerken
        channel.prefetch(1);
        console.log(`Consumer is waiting for events in queue ${QUEUE}`);

        channel.consume(QUEUE, async function (message) {
            try {
                const event = JSON.parse(message.content.toString());
                const count = await scoreService.calculateScores(event.matchId, event.homeScore, event.awayScore);
                console.log(`Points calculated for ${count} prediction(s) of match ${event.matchId}`);
                // ack: het bericht is verwerkt en mag uit de queue
                channel.ack(message);
            } catch (err) {
                console.log(`Could not process event: ${err.message}`);
                // nack zonder requeue: een fout bericht blijft niet eindeloos terugkomen
                channel.nack(message, false, false);
            }
        });
    } catch (err) {
        console.log(`Consumer failed to start: ${err.message}`);
        process.exit(1);
    }
}

startConsumer();