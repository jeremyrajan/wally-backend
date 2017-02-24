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
        return this.checkExpired(JSON.parse(photos));
      })
      .then(photos => photos)
      .catch((err) => {
        console.log(err);
      });
  },

  getRequest(url) {
    return new Promise((resolve, reject) => {
      request(url, (error, response, body) => {
        if (error) {
          return reject(error);
        }
        if (response.statusCode !== 200) {
          return reject(response.statusCode);
        }
        resolve(body);
      });
    });
  },

  getViaAPI() {
    const requestUrl = `${API_URL}/?key=${API_KEY}&response_group=high_resolution&q=wallpaper&min_width=1024&min_height=768&safesearch=true&category=nature,backgrounds,science,people,places,animals,computer,sports,music&per_page=200`;
    return this.getRequest(requestUrl)
      .then((body) => {
        redisCache.setValue('photos', JSON.parse(body).hits);
        return JSON.parse(body);
      })
      .catch((err) => err);
  },

  /**
   * Here we check, if the link is expired.
   * If yes, then get from API.
   */
  checkExpired(photos) {
    return this.getRequest(photos[0].fullHDURL)
      .then(() => photos)
      .catch(() => this.getViaAPI()); // if its expired then get again.
  },

  getWallpaper(photos) {
    return photos[this.getRandomIndex(photos)];
  },

  getRandomIndex(array) {
    return Math.floor(Math.random()*array.length);
  },

  currentDate() {
    const date = new Date();
    return(date.toJSON().slice(0,10).replace(new RegExp("-", 'g'),"/" ).split("/").reverse().join("/"));
  },

  /**
   * A single endpoint to get all images.
   */
  getAllImages() {

  }
};
