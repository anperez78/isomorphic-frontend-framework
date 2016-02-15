'use strict';

require('setimmediate')

var React = require('react')
var assign = require('react/lib/Object.assign')
var Router = require('@insin/react-router')

var fetchData = require('./common/utils/fetchData')
var getTitle = require('./common/utils/getTitle')
var routes = require('./routes')

var Global = require('./common/Global')
var logger = require('./common/utils/logs/logger').getLogger('client')

var appDiv = document.getElementById('app')

window.onerror = function (error, url, lineNumber, column, errorObj) {
    logger.fatalException({
        "msg": "Exception!",
        "errorMsg": error,
        "url": url,
        "line number": lineNumber,
        "column": column
    }, errorObj)
    if (error.indexOf('missing-session') > -1) {
        document.location = '/session-timeout'
    }
    else {
        document.location = '/generic-error'
    }
}

var router = Router.create({
    routes: routes,
    location: Router.HistoryLocation,
    onError(err) {
        logger.error('React.onError', err)
        if (err.hasOwnProperty('error')) {
            switch (err.error) {
                case 'missing-session':
                    Global.deleteCookie('accessToken')
                    document.location = '/session-timeout'
                    break
                default:
                    throw err
            }
        }
    }
})

router.run((Handler, state) => {
    var accessToken = Global.getCookie('accessToken')
    fetchData(accessToken, state.routes, state.params, (err, fetchedData) => {
        var props = assign({}, fetchedData, state.data)
        React.render(<Handler {...props}/>, appDiv)
        document.title = getTitle(state.routes, state.params, props)
    })
})