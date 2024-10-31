const redis = require('redis');

const client = redis.createClient();

client.on('error', (err) => {
    console.error('Error:', err);
});

client.connect();

module.exports = client;
