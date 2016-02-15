'use strict';

var async = require('async')
var RestClient= require('../../common/utils/RestClient')
var Global = require('../../common/Global')
var SuperagentHeadersPlugin = require('../../common/utils/logs/SuperagentHeadersPlugin')
var logger = require('../../common/utils/logs/logger').getLogger('confirmDataService')
var getErrorMessage = require('../../common/utils/genericUtils')

//
// Confirmation service acts as a integrator in order to perform some 
// extra functionality before sending data to a third party:
//
// 1.- Getting application data from session
// 2.- Transforming session data to another format (specific to a third party service)
// 3.- Sending transformed data into the external third party service
// 4.- Check results and delete the session + cookie
// 5.- Return a response back to the client
//

var confirmDataService = function(request, response) {

    var token = request.cookies['accessToken']

    async.waterfall([

        // Gets the session data
        function(callback) {

            if (typeof (token) === 'undefined') {
                callback('session cookie not found', null)  
            }
            else {
                RestClient()
                .get(Global.getSessionApiBaseUrl(token) + '/form')
                .use(SuperagentHeadersPlugin)
                .end((err, res) => {
                    if (err || res.serverError || res.clientError) {
                        callback(err || res.body, null)  
                    }
                    else {
                        callback(null, res.body)   
                    }
                })
            }
        },

        // Transforms session data into proper format 
        // for external system 
        function(sessionDataJSON, callback) {

 	        var url =  Global.getConfig().server.transformServiceUrl
            RestClient()
                .post(url)
                .use(SuperagentHeadersPlugin)
                .send(sessionDataJSON)
                .end(function(err, res){
                    if (err || res.status != 200) {
                        var error = getErrorMessage(err, res)
                        callback(error, null)
                    }
                    else {
                        callback(null, res.body)
                    }
                });
        },

        // Send to external system
        function(transformedData, callback) {

            var url = Global.getConfig().server.externalSystemServiceUrl
            RestClient()
                .post(url)
                .use(SuperagentHeadersPlugin)
                .send(transformedData)
                .end((err, res) => {
                    if (err || res.serverError || res.clientError) {
                        logger.error ("error when submitting data: " + (err || res.body))
                        callback(null, undefined)
                    }
                    else {
                        logger.info ("data sent successfully -> " + JSON.stringify(res.body))
                        callback(null, res.body)
                    }
                })
        },

        // Deletes the session
        function(result, callback) {

            if (typeof (token) === 'undefined') {
                callback('session cookie not found', null)
            }
            else {

                RestClient()
                    .del(Global.getSessionApiBaseUrl(token))
                    .use(SuperagentHeadersPlugin)
                    .end((err, res) => {
                        if (err || res.serverError || res.clientError) {
                            callback(err || res.body, null)
                        }
                        else {
                            // Delete the cookie
                            var exdate = new Date()
                            response.cookie('accessToken', '', { path: '/', expires: exdate})
                            callback(null, null)
                        }
                    })
            }
        }
      ],
      
      function(err) {
        if(err) { 
            logger.error(err)
            response.redirect('/generic-error')
            return
        }
        response.redirect('/done')
      }
  )
}

module.exports = confirmDataService
