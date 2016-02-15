'use strict';

var RedisSessions = require('redis-sessions')
var config = require('config')

var rs = new RedisSessions({
    host: config.server.redis.host,
    port: config.server.redis.port
})

module.exports = rs