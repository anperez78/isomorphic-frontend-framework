'use strict';

var logger = require('../../common/utils/logs/logger').getLogger('transformDataService')

var transformDataService = function(request, response) {

	logger.info ('Any data transformation logic to be applied here...')
    response.send ({result: 'success'})
}

module.exports = transformDataService
