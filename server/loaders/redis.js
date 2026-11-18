const { createClient } = require('redis');

// De verbinding met Redis. null = (nog) niet verbonden, bv. tijdens de tests.
// Elke file die getRedis() oproept, krijgt dezelfde verbinding.
let client = null;

async function connectRedis(url) {
    client = createClient({ url: url });
    client.on('error', function (err) {
        console.log(`Redis error: ${err.message}`);
    });
    await client.connect();
    return client;
}

function getRedis() {
    return client;
}

async function closeRedis() {
    if (client) {
        await client.quit();
        client = null;
    }
}

module.exports = { connectRedis, getRedis, closeRedis };