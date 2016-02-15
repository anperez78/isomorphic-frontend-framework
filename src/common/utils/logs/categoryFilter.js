"use strict";
var log4js = require('log4js')

function categoryFilter (excludeCategories, appender) {
  return function(logEvent) {
    if (excludeCategories.every(function(x){return (x!=logEvent.category);})) {
      appender(logEvent)
    }
  }
}

function configure(config) {
  log4js.loadAppender(config.appender.type)
  var appender = log4js.appenderMakers[config.appender.type](config.appender)
  return categoryFilter(config.exclude, appender)
}

exports.appender = categoryFilter
exports.configure = configure