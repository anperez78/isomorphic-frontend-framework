'use strict'

function setDefaultResponseHeaders(response) {
    response.setHeader('Cache-Control', 'no-store, private, max-age=0');
}

module.exports = setDefaultResponseHeaders