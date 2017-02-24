const Hapi = require('hapi');
const config = require('config');
const utils = require('./utils');

let PHOTOS_CACHE = [];

const handler = (request, reply) => {
  const photo = utils.getWallpaper(PHOTOS_CACHE.hits || PHOTOS_CACHE);
  return reply(photo);
};

const server = new Hapi.Server();
server.connection({
  host: '0.0.0.0',
  port: process.env.PORT || 8080
});

// Add the route
server.route({
  method: 'GET',
  path: '/hello',
  handler: handler
});

// commond route to get the all the images (redis first and then api)
server.route({
  method: 'GET',
  path: '/images',
  handler: (request, reply) => {
      const limit = request.query.limit || 50 ;
      const photos = PHOTOS_CACHE.hits || PHOTOS_CACHE
      if (!photos) {
      return reply('');
    }

    reply(photos.slice(0, Number(limit)));
    }
});

server.register(require('hapi-pino'), (err) => {
  const logger = server.app.logger;

  if (err) {
    logger.error(err);
    process.exit(1)
  }

  // the logger is available in server.app
  logger.info('Pino is registered')

  utils.init()
  .then((photos) => {
    PHOTOS_CACHE = photos;
    server.start((err) => {
      if (err) {
        logger.error(err);
        process.exit(1);
      }
      logger.info('Server running at:', server.info.uri);
    });
  })
  .catch((err) => {
    logger.error(err);
  });
});
