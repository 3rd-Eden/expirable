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

// update the expiree of a key
cache.expire('key', '10 seconds');
cache.expire('kex'); // alias for cache.remove, as it expired directly

// stop the interal setinterval that scan for out of date keys
cache.stop();

// start it again.
cache.start();

// kill everything, nuke that motherfucker.
cache.destroy();
```
