const redis = require('redis');
const config = require('config');

const redisOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  password: process.env.REDIS_PASSWORD,
  port: config.get('redis.port')
};

const client = redis.createClient(redisOptions);

client.on("error", (err) => {
  console.log(err);
});

module.exports = {
  setValue(key, value) {
    client.set(key, JSON.stringify(value));
  },
  getValue(key) {
    return new Promise((resolve, reject) => {
      client.get(key, (err, value) => {
        if (err) { return reject(err); }
        resolve(value);
      });  
    });
  },
  flushRedis() {
    client.flushdb((err, succeeded) => {
      console.log(succeeded); // will be true if successfull
    });
  }
}
