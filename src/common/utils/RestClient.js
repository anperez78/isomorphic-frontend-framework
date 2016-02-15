'use strict';

var superagent = require('superagent-bluebird-promise')
require('./SuperagentPlugin')(superagent)

var RestClient = function () {

    superagent.on(
        function (success) {
        },
        function (err) {
            if (err && Object.prototype.toString.call(err) === '[object Error]') {
                throw err
            }
            else if (err.message && Object.prototype.toString.call(err.message) === '[object Error]') {
                throw err.message
            }
            else if (err.status && err.status >= 500) {
                if (err.body && err.body.hasOwnProperty('error')) {
                    throw new Error(err.body.error)
                }
                else {
                    throw new Error(err.body)
                }
            }
            else if (err.status && err.status === 404) {
                if (err.body && err.body.hasOwnProperty('error')) {
                    throw new Error(err.body.error)
                }
                else {
                    throw new Error('404')
                }
            }
        })
    return superagent

}
module.exports = RestClient