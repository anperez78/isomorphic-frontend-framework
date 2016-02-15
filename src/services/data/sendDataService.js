'use strict';

var logger = require('../../common/utils/logs/logger').getLogger('sendDataService')

var sendDataService = function(request, response) {

	logger.info ('Any integration with an external services to be done here...')
    response.send ({result: 'success'})
}

module.exports = sendDataService
