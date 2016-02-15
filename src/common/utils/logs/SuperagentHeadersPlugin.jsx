'use strict';

var cls = require('continuation-local-storage')
var logContext = cls.getNamespace('app-log-ctx')

var getRequestId = function() { 
	if (!logContext) {
		return 'undefined' 
	}
	var requestId = logContext.get('requestId')
	if (typeof(requestId) === 'undefined') {
		return 'undefined'
	}
	return requestId
}

var getClientIP = function() { 
	if (!logContext) {
		return 'undefined' 
	}
	var clientIP = logContext.get('clientIP')
	if (typeof(clientIP) === 'undefined') {
		return 'undefined'
	}
	return clientIP
}

module.exports = function _superagentHeaders (request) {
  request.set('x-unique-id', getRequestId())
  request.set('X-Forwarded-For', getClientIP())
  return request
}