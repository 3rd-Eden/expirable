# Expirable

Automatic expiring "cache" for Node.js. There must be tons of modules like
these, but I couldn't find anyone that suites my needs. Just something simple
but useful enought to transformed in to a module. Oh and the syntax is pretty as
well <3

## API

```js
var Expirable = require('expirable');

// all the keys you stuff in to the cache are saved for 5 minutes.
var cache = new Expirable('5 minutes');

// add a new item to the cache, expires in 5 minutes, as that is what we
configured above
cache.set('key', value);

// add item to the cache, but for 10 minutes.
cache.set('key', value, '10 minutes');

// get item from the cache, this will automatically update the internal last
// used value, so it will be expired after 5 minutes, without any interaction
value = cache.get('key');

// same as above, except it will not touch the internal last used value and it
// will expire 5 minutes after you have set it
value = cache.get('key', true);

// check if a value exists
cache.has('key') ? 'yes' : 'no';

// remove a key from the cache.
cache.remove('key');

// chen a key is removed from the cache it will emit an event for it. This is
// useful when you want to re-cache an item again when it expires.
cache.on('key::removed', function (expired) {
  // The expired boolean tells you if the key was removed because it was expired
  // or if it was a manual removal
});

// update the expiree of a key
cache.expire('key', '10 seconds');
cache.expire('kex'); // alias for cache.remove, as it expired directly

// stop the interal setinterval that scan for out of date keys
cache.stop();

// start it again.
cache.start();

// kill everything, nuke that motherfucker.
cache.destroy();

// OH so you want to store the output of a Stream? sure!
var stream = cache.stream('key', fs.createReadStream(..), '10 seconds');

// stream is the result of fs.createReadStream
// once the stream fires it's `done` event, we will store the data.

// iterate over the cache
cache.forEach(function (key, value) {
  console.log(key, value);
});
```

## License

MIT
