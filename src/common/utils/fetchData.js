'use strict';

var assign = require('react/lib/Object.assign')
var async = require('async')

var env = require('./env')

var fetchData = function (token, routes, params, cb) {
  if (env.CLIENT && typeof window.__PROPS__ != 'undefined') {
    var props = window.__PROPS__
    delete window.__PROPS__
    return cb(null, props)
  }

  var fetchDataRoutes = routes.filter(route => route.handler.fetchData)
  if (fetchDataRoutes.length === 0) {
    return cb(null, {})
  }

  var dataFetchers = fetchDataRoutes.map(route => {
    var fetcher = route.handler.fetchData
    if (fetcher.length == 2) {
      params['token'] = token
      fetcher = fetcher.bind(route, params)
    }
    return fetcher
  })

  async.parallel(dataFetchers, function(err, data) {
    if (data && data[0] === null) {
      cb(err, {data: null})
      return
    }
    cb(err, {data: assign.apply(null, data)})
  })
}

module.exports = fetchData