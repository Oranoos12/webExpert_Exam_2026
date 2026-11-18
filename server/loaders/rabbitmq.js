const amqp = require('amqplib');

// De naam van het event = de naam van de queue.
const QUEUE = 'match.result.entered';

// Het kanaal naar RabbitMQ. null = (nog) niet verbonden, bv. tijdens de tests.
let connection = null;
let channel = null;

async function connectRabbit(url) {
    connection = await amqp.connect(url);
    
    //een channel voor stur en ontvang de message
    channel = await connection.createChannel();
    // durable: de queue blijft bestaan als RabbitMQ herstart
    await channel.assertQueue(QUEUE, { durable: true });
    return channel;
}

// Zet een bericht (event) in de queue.
function publishEvent(data) {
    if (!channel) {
        console.log(`No RabbitMQ connection: event not sent (${QUEUE})`);
        return false;
    }
    const message = Buffer.from(JSON.stringify(data));
    // persistent: het bericht blijft bewaard als RabbitMQ herstart
    return channel.sendToQueue(QUEUE, message, { persistent: true });
}

async function closeRabbit() {
    if (connection) {
        await connection.close();
        connection = null;
        channel = null;
    }
}

module.exports = { QUEUE, connectRabbit, publishEvent, closeRabbit };