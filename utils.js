const config = require('config');
const request = require('request');
const redisCache = require('./redis_cache');

const API_URL = config.get('url');
const API_KEY = process.env.API_KEY;

module.exports = {
  init() {
    return redisCache.getValue('photos')
      .then(photos => {
        if (!photos) {
          return this.getViaAPI();
        }
        return photos;
      })
      .then(photos => photos.hits || photos)
      .catch((err) => {
        console.log(err);
      });
  },

  getViaAPI() {
    const requestUrl = `${API_URL}/?key=${API_KEY}&response_group=high_resolution&q=wallpaper&min_width=1024&min_height=768&safesearch=true&category=nature,backgrounds,science,people,places,animals,computer,sports,music&per_page=200`;
    return new Promise((resolve, reject) => {
      request(requestUrl, (error, response, body) => {
        if (error) {
          return reject(error);
        }
        if (response.statusCode == 200) {
          redisCache.setValue('photos', JSON.parse(body).hits);
          resolve(body);
        }
      });
    });
  },

  getWallpaper(photos) {
    return photos[this.getRandomIndex(photos)];
  },

  getRandomIndex(array) {
    return Math.floor(Math.random()*array.length);
  }
};
