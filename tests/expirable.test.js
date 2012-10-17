'use strict';

// set up chai, our assertation library
var chai = require('chai')
  , expect = chai.expect;

chai.Assertion.includeStack = true;

describe('Expirable', function () {
  var Expirable = require('../');

  it('should just work without arguments', function () {
    var cache = new Expirable();

    cache.destroy();
  });

  it('should set the expiree as first argument', function () {
    var cache = new Expirable('5 seconds');

    cache.destroy();
  });

  it('should get and get the value', function () {
    var cache = new Expirable('5 minutes');

    cache.set('foo', 'bar');
    expect(cache.get('foo')).to.equal('bar');

    cache.destroy();
  });

  it('should have the key after setting', function () {
    var cache = new Expirable('1 second');

    cache.set('foo', 'bar');
    expect(cache.has('foo')).to.equal(true);

    cache.destroy();
  });

  it('should expire the cache', function (done) {
    var cache = new Expirable('5ms');

    cache.set('foo', 'bar');

    setTimeout(function () {
      expect(cache.has('foo')).to.equal(false);
      expect(cache.get('foo')).to.equal(undefined);

      cache.destroy();
      done();
    }, 10);
  });

  it('should remove keys', function () {
    var cache = new Expirable('10000 ms');

    cache.set('foo', 'bar');
    cache.remove('foo');
    expect(cache.get('foo')).to.equal(undefined);

    cache.destroy();
  });

  it('should override default expire time during set', function (done) {
    var cache = new Expirable('5 ms');

    cache.set('foo', 'bar', '10 minutes');

    setTimeout(function () {
      expect(cache.get('foo')).to.equal('bar');

      cache.destroy();
      done();
    }, 20);
  });

  it('should stop the scan, but still.. kill item when we get it', function (done) {
    var cache = new Expirable('15 ms');

    cache.set('foo', 'trololol');
    cache.stop();

    setTimeout(function () {
      expect(cache.cache.foo.value).to.equal('trololol');
      expect(cache.get('foo')).to.equal(undefined);

      cache.destroy();
      done();
    }, 50);
  });

  it('should store the data from a stream as a buffer', function (done) {
    var cache = new Expirable('10 minutes')
      , fs = require('fs');

    var stream = cache.stream('foo', fs.createReadStream(__filename));

    expect(stream).to.instanceof(require('stream'));
    expect(cache.get('foo')).to.equal(undefined);

    stream.on('end', function () {
      var buff = cache.get('foo');

      expect(Buffer.isBuffer(buff)).to.equal(true);
      expect(buff.toString()).to.contain('fs.createReadStream(__filename));');

      cache.destroy();
      done();
    });
  });
});
