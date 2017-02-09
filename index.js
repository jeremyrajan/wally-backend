const Hapi = require('hapi');
const config = require('config');
const utils = require('./utils');

let PHOTOS_CACHE = [];

const handler = (request, reply) => {
  const photo = utils.getWallpaper(PHOTOS_CACHE);
  return reply(photo);
};

const server = new Hapi.Server();
server.connection({
  host: 'localhost',
  port: config.get('port')
});

// Add the route
server.route({
  method: 'GET',
  path: '/hello',
  handler: handler
});

utils.init()
  .then((photos) => {
    PHOTOS_CACHE = JSON.parse(photos);
    server.start((err) => {
      if (err) {
        throw err;
      }
      console.log('Server running at:', server.info.uri);
    });
  })
  .catch((err) => {
    return console.error(err);
  });
