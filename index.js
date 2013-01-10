'use strict';

/**
 * Simple automatic expiring cache.
 *
 * Options:
 *
 * - expire {String} how long should the objects stay alive
 * - interval {String} when should the cleaning operation start.
 *
 * @constructor
 * @param {Number} expire amount of miliseconds we should cache the data
 * @param {Object} options options
 * @api public
 */
function Expire(options) {
  // Legacy formatting
  if (typeof options === 'string') {
    options = { expire: options };
  }

  options = options || {};

  this.cache = {};
  this.length = 0;
  this.expiree = Expire.parse(options.expire || '5 minutes');
  this.interval = Expire.parse(options.interval || '2 minutes');
  this.lru = options.lru || 0;

  // Start watching for expired items.
  if (!options.manually) this.start();
}

/**
 * Get an item from the cache based on the given key.
 *
 * @param {String} key
 * @param {Boolean} dontUpdate don't update the expiree value
 * @returns {Mixed} undefined if there isn't a match, otherwise the result
 * @api public
 */
Expire.prototype.get = function get(key, dontUpdate) {
  var result = this.cache[key];
  if (!result) return undefined;

  var now = Date.now();

  // We are still streaming in data, so return nothing.
  if (result.streaming) return undefined;

  // We found a match, make sure that it's not expired.
  if (now - result.last >= result.expires) {
    this.length--;
    delete this.cache[key];
    return undefined;
  }

  // Update the last used time stamp.
  if (!dontUpdate) result.last = now;

  return result.value;
};

/**
 * Stores a new item in the cache, if the key already exists it will override
 * it with the new value.
 *
 * @param {String} key guess what, the key
 * @param {Mixed} value value of the key
 * @param {String} expires custom expire date
 * @returns {Mixed} the value you gave it
 * @api public
 */
Expire.prototype.set = function set(key, value, expires) {
  if (!(key in this.cache)) this.length++;

  this.cache[key] = {
      value: value
    , expires: expires ? Expire.parse(expires) : this.expiree
    , last: Date.now()
  };

  return value;
};

/**
 * Stores the complete output of a stream in memory.
 *
 * @param {String} key the key
 * @param {Stream} stream the stream that we need to read the data off
 * @param {String} expires option custom expire
 * @returns {Stream} the stream you passed it
 */
Expire.prototype.stream = function streamer(key, stream, expires) {
  var chunks = []
    , self = this;

  this.cache[key] = { streaming: true };

  stream.on('data', function data(buffer) {
    chunks.push(buffer);
  });

  stream.on('error', function error() {
    chunks.length = 0;
  });

  stream.on('end', function end(buffer) {
    if (buffer) chunks.push(buffer);

    if (chunks.length) self.set(key, Buffer.concat(chunks), expires);
    chunks.length = 0;
  });

  return stream;
};

/**
 * Checks if the item exists in the cache.
 *
 * @param {String} key
 * @returns {Boolean}
 * @api public
 */
Expire.prototype.has = function has(key) {
  var now = Date.now();

  return key in this.cache && (now - this.cache[key].last) <= this.cache[key].expires;
};

/**
 * Expire a key or update it's expiree.
 *
 * @param {String} key
 * @param {Mixed} expire
 */
Expire.prototype.expire = function expires(key, expire) {
  if (!expire) return this.remove(key);

  // we have the key, bump it's expire time.
  if (this.has(key)) {
    this.cache[key].expires = Expire.parse(expire);
    this.cache[key].last = Date.now();
  }
};

/**
 * Remove an item from the cache.
 *
 * @param {String} key
 * @api public
 */
Expire.prototype.remove = function remove(key) {
  if (key in this.cache) this.length--;

  delete this.cache[key];
};

/**
 * Scans the cache for potential items that should expire.
 *
 * @api private
 */
Expire.prototype.scan = function scan() {
  var now = Date.now()
    , result
    , key;

  for (key in this.cache) {
    result = this.cache[key];

    if (result.streaming) continue;
    if (now - result.last >= result.expires) {
      this.length--;
      delete this.cache[key];
    }
  }
};

/**
 * Stops the expire check timer.
 *
 * @api public
 */
Expire.prototype.stop = function stop() {
  if (this.timer) clearInterval(this.timer);
};

/**
 * Starts the expire check timer.
 *
 * @api public
 */
Expire.prototype.start = function start() {
  // Top old timers before starting a new one
  this.stop();

  this.timer = setInterval(this.scan.bind(this), this.expire);
};

/**
 * Destroy the whole cache.
 *
 * @api public
 */
Expire.prototype.destroy = function destroy() {
  this.stop();
  this.cache = {};
  this.length = 0;
};

/**
 * Parse durations to miliseconds. Bluntly copy and pasted from `ms.js` so all
 * copyright belongs to them. Except the parts that I fixed because it did some
 * stupid things like not always returning numbers or only accepting strings..
 *
 * @param {String} str
 * @return {Number}
 */
Expire.parse = function parse(str) {
  if (+str) return +str;

  var m = /^((?:\d+)?\.?\d+) *(ms|seconds?|s|minutes?|m|hours?|h|days?|d|years?|y)?$/i.exec(str);
  if (!m) return 0;

  var n = parseFloat(m[1])
    , type = (m[2] || 'ms').toLowerCase();

  switch (type) {
    case 'years':
    case 'year':
    case 'y':
      return n * 31557600000;

    case 'days':
    case 'day':
    case 'd':
      return n * 86400000;

    case 'hours':
    case 'hour':
    case 'h':
      return n * 3600000;

    case 'minutes':
    case 'minute':
    case 'm':
      return n * 60000;

    case 'seconds':
    case 'second':
    case 's':
      return n * 1000;

    case 'ms':
      return n;
  }
};

// Expose the Expire helper so we can do some unit testing against it.
module.exports = Expire;
