'use strict';

var cls = require('continuation-local-storage')

var logContext = cls.createNamespace('app-log-ctx')

module.exports = function (req, res, next) {
  logContext.bindEmitter(req)
  logContext.bindEmitter(res)
  logContext.run(function () {
    logContext.set('requestId', req.headers['x-unique-id'])
    logContext.set('sessionId', req.cookies['accessToken'])
    logContext.set('clientIP', req.ip)
    next()
  })
}
