'use strict';

var {app} = require('../../server')
var express = require('express')
var router = express.Router()

app.use(router)

router.get('/birth-date/:birthdate', require('./validateDateOfBirthService'))

module.exports = router