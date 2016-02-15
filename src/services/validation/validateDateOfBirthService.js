'use strict';

var moment = require('moment')

var validateDateOfBirthService = function(request, response) {

    var birthDate = request.param('birthdate')

    if (moment(birthDate, "DDMMYYYY").isSame(moment(), 'day')) {
        response.status(422).send({error: 'date-is-today'})
    }
    else if (moment(birthDate, "DDMMYYYY").isAfter(moment(), 'day')) {
        response.status(422).send({error: 'date-is-in-the-future'})
    }
    else {
        response.send('ok')
    }

    return
}

module.exports = validateDateOfBirthService
