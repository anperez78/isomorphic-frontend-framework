'use strict';

var express = require('express')
var router = express.Router()

var {createSession, deleteSession, postSessionForm, getSessionForm, getSessionFormByFormName } = require('./sessionService')

router.post('/session', createSession )
router.delete('/session/:token', deleteSession )
router.post('/session/:token/form/:formName', postSessionForm )
router.get('/session/:token/form', getSessionForm )
router.get('/session/:token/form/:formName', getSessionFormByFormName )

module.exports = router
