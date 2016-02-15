'use strict';

var {app} = require('../../server')
var express = require('express')
var router = express.Router()

app.use(router)

router.get('/transform', require('./transformDataService'))
router.get('/send', require('./sendDataService'))
router.get('/confirm', require('./confirmDataService'))


module.exports = router