'use strict';

var qs = require('qs');

/**
 * Module exports.
 */
module.exports = mock;

/**
 * Installs the `mock` extension to superagent.
 */
function mock (superagent, config) {
  var Request = superagent.Request;
  var parsers = [];

  /**
   * Keep the default methods
   */
  var oldGet = superagent.get;
  var oldPost = superagent.post;
  var oldSend = Request.prototype.send;
  var oldEnd = Request.prototype.end;
  var oldPipe = Request.prototype.pipe;
  var oldDel = superagent.del;

  /**
   * Attempt to match url against the patterns in fixtures.
   */
  function testUrlForPatterns(url) {
    if (parsers[url]) { return; }

    var match = config.filter(function (parser) {
      return new RegExp(parser.pattern, 'g').test(url);
    })[0] || null;

    if (match) {
      parsers[url] = match;
    }
  }

  /**
   * Override get function
   */
  superagent.get = function (url, data, fn) {
    testUrlForPatterns(url);
    return parsers[url] ? superagent('GET', url, data, fn) : oldGet.call(this, url, data, fn);
  };

  /**
   * Override post function
   */
   superagent.post = function (url, data, fn) {
     testUrlForPatterns(url);
     return parsers[url] ? superagent('POST', url, data, fn) : oldPost.call(this, url, data, fn);
   };

  /**
   * Override del function
   */
   superagent.del = function (url, data, fn) {
     testUrlForPatterns(url);
     return parsers[url] ? superagent('DELETE', url, data, fn) : oldDel.call(this, url, data, fn);
   };


  Request.prototype.use = function(fn) {
    return this
  };

  Request.prototype.pipe = function(stream, options) {

    var path = this.url;
    testUrlForPatterns(path);
    var parser = parsers[this.url];

    if (parser) {

      var match = new RegExp(parser.pattern, 'g').exec(path);
      try {
        var response = parsers[this.url].callback(match, null)
        stream.send(response)

      } catch(err) {
        return;
      }
    } else {
      oldPipe.call(stream, options);
    }
  };

  /**
   * Override send function
   */
  Request.prototype.send = function (data) {

    var parser = parsers[this.url];
    if (parser) {
      this.params = data;

      return this;
    } else {
      return oldSend.call(this, data);
    }

  };

  /**
   * Override end function
   */
  Request.prototype.end = function (fn) {

    var path = this.url;
    var querystring = '';

    if (this._query) {
      querystring += this._query.join('&');
    } else {
      if (this.qs) {
        querystring += qs.stringify(this.qs);
      }
      if (this.qsRaw) {
        querystring += this.qsRaw.join('&');
      }
    }


    if (querystring.length) {
      path += (~path.indexOf('?') ? '&' : '?') + querystring;
    }

    var parser = parsers[this.url];

    if (parser) {
      var match = new RegExp(parser.pattern, 'g').exec(path);

      try {
        var fixtures = parser.fixtures(match, this.params);
        fn(null, parsers[this.url].callback(match, fixtures));
      } catch(err) {
        fn(err, undefined);
      }
    } else {
      oldEnd.call(this, fn);
    }
  };
}