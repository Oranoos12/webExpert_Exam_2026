const { getRedis } = require('../loaders/redis');

// Alle cache-keys van GET /matches (één per filter)
const MATCH_CACHE_KEYS = ['matches:all', 'matches:upcoming', 'matches:finished'];

// Haalt een waarde uit de cache. null = niet gevonden (cache miss).
async function getCache(key) {
    const redis = getRedis();   //object
    if (!redis) {
        return null;
    }
    const value = await redis.get(key);
    if (value === null) {
        return null;
    }
    return JSON.parse(value);
    //Redis bewaart alleen tekst. We maken van de data tekst bij het opslaan, en terug een object bij het lezen.
}

// Zet een waarde in de cache met een TTL (levensduur in seconden).
async function setCache(key, data) {
    const redis = getRedis();
    if (!redis) {
        return;
    }

    //TTL ==> time to live in .env 300 
    const ttl = Number(process.env.CACHE_TTL_SECONDS);
    await redis.set(key, JSON.stringify(data), { EX: ttl });
}

// Verwijdert één of meer keys (invalidatie).
async function deleteCache(keys) {
    const redis = getRedis();
    if (!redis) {
        return;
    }
    await redis.del(keys);
}

module.exports = { getCache, setCache, deleteCache, MATCH_CACHE_KEYS };