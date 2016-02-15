'use strict';

var util = require('util')
var events = require('events').EventEmitter

var res = function () {
    this.headers = {}
}

util.inherits(res, events)

res.prototype.send = function(payload, code) {
  this.emit('response', {
    code: code,
    response: payload
  })
}

res.prototype.redirect = function(url) {
  this.emit('response', {
    redirection: url
  })
}

res.prototype.header = function(key, value) {
}

res.prototype.cookie = function(cookieName, cookieValue, options) {
}

res.prototype.json = function(sessionDataTransformed) {
    this.emit('response', {
        response: sessionDataTransformed
    })
}

res.prototype.set = function(key, value) {
    this.headers[key] = value
}

module.exports = function() {
  return new res()
}