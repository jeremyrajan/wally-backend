const redis = require('redis');

const client = redis.createClient();
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
