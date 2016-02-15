var jsdom = require('jsdom')

global.document = jsdom.jsdom('<!doctype html><html><body></body></html>')
global.window = document.parentWindow

global.getComputedStyle = function (node) {
    return {
        marginTop: '10',
        marginBottom: '10',
        marginLeft: '10',
        marginRight: '10'
    }
}

global.navigator = window.navigator

var chai = require('chai')
chai.config.includeStack = true
global.expect = chai.expect
