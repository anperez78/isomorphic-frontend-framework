'use strict';

var async = require('async')
var _ = require('lodash')
var moment = require('moment')
var rs = require('./redis-session')
var config = require('config')
var logger = require('../../utils/logs/logger').getLogger('sessionService')

var forms = Object.assign({},
    require('../../../pages/step1/Step1Form'),
    require('../../../pages/step2/Step2Form'),
    require('../../../pages/step3/Step3Form')
)

var createSession = function (req, res) {

    var ttl = req.query.ttl
    var ip = req.query.ip

    if (typeof(ttl) === 'undefined') {
        res.send({error: 'missing param ttl'}, 400)
        return
    }

    if (typeof(ip) === 'undefined') {
        res.send({error: 'missing param ip'}, 400)
        return
    }

    var params = {
      app: config.server.redis.app,
      id: new Date().getTime(),
      ttl: ttl,
      ip: ip
    }

    if (_.keys(req.body).length) {
      params = _.extend(params, {
        d: req.body
      });
    }

    rs.create(params,
      _.partial( (res, err, resp) => {

          if (err) {
            res.status(500).send(err)
            return
          }
          if (Object.keys(resp).length === 0) {
            logger.error ('missing-session')
            res.status(404).send({error: 'missing-session'})
            return
          }

          res.send(resp)
      }, res)
    )
}

var deleteSession = function (req, res) {

    var token = req.params.token

    if (typeof(token) === 'undefined') {
        logger.error('missing param token')
        res.send({error: 'missing param token'}, 400)
        return
    }

    var params = {
      app: config.server.redis.app,
      token: token,

    }

    rs.kill(params,
      _.partial( (res, err, resp) => {
          if (err) {
            res.send(err, 500)
            return
          }
          if (resp.kill === 0) {
            res.send({error: 'session-not-found'}, 404)
            return
          }
          res.send('ok')
      }, res)
    )
}

var postSessionForm =  function (req, res) {

    var formName = req.params.formName
    var token = req.params.token

    if (typeof(formName) === 'undefined') {
        logger.error('missing param formName')
        res.send({error: 'missing param formName'}, 400)
        return
    }

    if (typeof(token) === 'undefined') {
        logger.error('missing param token')
        res.send({error: 'missing param token'}, 400)
        return
    }

    if (typeof forms[formName] === 'undefined') {
        logger.error(`Invalid form name: ${formName}`)
        res.send({error: `Invalid form name: ${formName}`}, 400)
        return
    }

    async.waterfall([

        function(callback) {
            var form = new forms[formName]({data: req.body})
            form.validate((err, isValid) => {

                if (err) {
                  logger.error(err)
                  callback({status: 500, message: err}, null)
                }
                if (!isValid) {
                  logger.error('form is not valid -> ' + JSON.stringify (form.errors()))
                  callback({status: 400, json: form.errors()}, null)
                }

                var transformedData = _.mapValues (form.cleanedData, function (value) {
                  if (value instanceof Date) {
                      return moment(value).format('DD-MM-YYYY')
                  }
                  else {
                    return value
                  }
                })

                callback(null, formName, transformedData);
            })
        },
        function (formName, formData, callback) {
            var formDataJSON = {}
            formDataJSON[formName] = JSON.stringify(formData)
            callback(null, formDataJSON)
        }
      ],

      function(err, formDataJSON) {

        if(err) {
          switch(err.status) {
              case 400:
                  res.send({error: err.json}, 400)
                  break
              default:
                  res.send({error: err.json}, 500)
          }
          return
        }

        rs.set({
            app: config.server.redis.app,
            token: token,
            d: formDataJSON
          },
          _.partial( (res, err, resp) => {

              if (err) {
                logger.error ('err', err)
                res.status(500).send(err)
                return
              }

              if (Object.keys(resp).length === 0) {
                logger.error ('missing-session')
                res.status(404).send({error: 'missing-session'})
                return
              }
              res.send('ok')
          }, res)
        )
      })
}

var getSessionForm = function (req, res) {

    var token = req.params.token

    if (typeof(token) === 'undefined') {
        res.send({error: 'missing param token'}, 400)
        return
    }

    rs.get({
      app: config.server.redis.app,
      token: token
    }, _.partial( function(res, err, resp) {
        if (err) {
          logger.error ('err', err)
          res.status(500).send(err)
          return
        }
        if (Object.keys(resp).length === 0) {
          logger.error ('missing-session')
          res.status(404).send({error: 'missing-session'})
          return
        }
        var sessionDataTransformed = _.mapValues( resp.d, function(value, key) {
             return JSON.parse(value)
         })

        res.json(sessionDataTransformed);
    }, res ))

}

var getSessionFormByFormName = function (req, res) {

    var token = req.params.token

    if (typeof(token) === 'undefined') {
        res.send({error: 'missing param token'}, 400)
        return
    }

    rs.get({
        app: config.server.redis.app,
        token: token
    }, _.partial(function (res, err, resp) {
        if (err) {
            res.status(500).send(err)
            return
        }
        if (Object.keys(resp).length === 0) {
            logger.error ('missing-session')
            res.status(404).send({error: 'missing-session'})
            return
        }

        if (!resp.hasOwnProperty('d') ||
            (typeof(resp.d[req.params.formName]) === 'undefined')) {
            res.send({error: 'no data found for form name: ' + req.params.formName}, 404)
            return
        }

        res.json(JSON.parse(resp.d[req.params.formName]));
    }, res))
}

module.exports = {
    createSession,
    deleteSession,
    postSessionForm,
    getSessionForm,
    getSessionFormByFormName
}
