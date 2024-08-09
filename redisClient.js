const redis = require('redis');

let redisClient;

async function ensureRedisConnection() {
    if (!redisClient) {
        redisClient = redis.createClient({
            url: 'redis://localhost:6379'
        });
        redisClient.on('error', (err) => {
            console.error('Redis client error:', err);
        });
        await redisClient.connect();
    }
    return redisClient;
}

module.exports = { ensureRedisConnection };
