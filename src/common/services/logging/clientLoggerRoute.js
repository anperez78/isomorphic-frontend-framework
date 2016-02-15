'use strict';

var express = require('express')
var router = express.Router()

router.post('/log', require('./clientLogger'))

module.exports = router