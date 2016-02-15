"use strict";

var React = require('react/addons')
var TestUtils = React.addons.TestUtils
var proxyquire = require('proxyquire')
require('../../test/setup')

var envStub = {}
var configStub = {common: {'host': '127.0.0.1', 'port': 3000, 'apiBasePath': '/api'}}
var Global = proxyquire('../../src/common/Global', {
        './utils/env': envStub,
        'config': configStub
    }
)

describe('Global component', () => {

    var globalElement

    before('renders components and locates elements', () => {
        var components = TestUtils.renderIntoDocument(
            < Global / >
        )

        var globalComponent = TestUtils.findRenderedDOMComponentWithTag(
            components,
            'span'
        )

        globalElement = globalComponent.getDOMNode()
    })

    it('should render in the document', () => {
        expect(globalElement).to.exist
    })

    context('when run in the client', () => {
        before(() => {
            envStub.CLIENT = true
            envStub.SERVER = false
        })

        context('getConfig method', () => {
            it('should return the config set in the global window', () => {
                global.window.__CONFIG__ = {'test': 'test'}
                expect(Global.getConfig()).to.equal(global.window.__CONFIG__)
            })
            it('should throw an exception when no config is set in the global window', () => {
                global.window.__CONFIG__ = undefined
                expect(Global.getConfig).to.throw(Error)
            })
        })
        context('getBaseUrl method', () => {
            it('should return the base URL to be used in a client environment', () => {
                global.window.__CONFIG__ = {'port': 3000, 'apiBasePath': '/api'}
                expect(Global.getBaseUrl()).to.equal('')
            })
        })
        context('getApiBaseUrl method', () => {
            it('should return the api base URL to be used in a client environment', () => {
                global.window.__CONFIG__ = {'common': {'port': 3000, 'apiBasePath': '/api'}}
                expect(Global.getApiBaseUrl()).to.equal('/api')
            })
        })
        context('getCookie method', () => {
            it('should return the cookie which name has been specified as a parameter', () => {
                global.window.document.cookie = 'accessToken=O1lbi7zyBbrrWDMWmbhgsbuJWIihU9hdfkSNqBEzfcisTtqmGcSwk3cZib0k1xrn;'
                expect(Global.getCookie('accessToken')).to.equal('O1lbi7zyBbrrWDMWmbhgsbuJWIihU9hdfkSNqBEzfcisTtqmGcSwk3cZib0k1xrn')
            })
        })
        context('getSessionApiBaseUrl method', () => {
            it('should return the session api base URL to be used in a client environment', () => {
                global.window.document.cookie = 'accessToken=O1lbi7zyBbrrWDMWmbhgsbuJWIihU9hdfkSNqBEzfcisTtqmGcSwk3cZib0k1xrn;'
                global.window.__CONFIG__ = {'common': {'port': 3000, 'apiBasePath': '/api'}, 'client': {'injectSessionIdInURL': true}}
                expect(Global.getSessionApiBaseUrl()).to.equal('/api/session/O1lbi7zyBbrrWDMWmbhgsbuJWIihU9hdfkSNqBEzfcisTtqmGcSwk3cZib0k1xrn')
            })
        })
        context('getAccessToken method', () => {
            it('should return the cookie accessToken', () => {
                global.window.document.cookie = 'accessToken=O1lbi7zyBbrrWDMWmbhgsbuJWIihU9hdfkSNqBEzfcisTtqmGcSwk3cZib0k1xrn;'
                expect(Global.getAccessToken('O1lbi7zyBbrrWDMWmbhgsbuJWIihU9hdfkSNqBEzfcisTtqmGcSwk3cZib0k1xrn')).to.equal('O1lbi7zyBbrrWDMWmbhgsbuJWIihU9hdfkSNqBEzfcisTtqmGcSwk3cZib0k1xrn')
            })
        })
    })

    context('when run in the server', () => {
        before(() => {
            envStub.CLIENT = false
            envStub.SERVER = true
        })

        context('getConfig method', () => {
            it('should return the config from the server', () => {
                expect(Global.getConfig()).to.equal(configStub)
            })
        })

        context('getBaseUrl method', () => {
            it('should return the base URL to be used in a server environment', () => {
                expect(Global.getBaseUrl()).to.equal("http://127.0.0.1:3000")
            })
        })
        context('getApiBaseUrl method', () => {
            it('should return the api base URL to be used in a server environment', () => {
                expect(Global.getApiBaseUrl()).to.equal("http://127.0.0.1:3000/api")
            })
        })
        context('getCookie method', () => {
            it('should an exception when executed in a server environment', () => {
                expect(Global.getCookie).to.throw(Error)
            })
        })
        context('getSessionApiBaseUrl method', () => {
            it('should return the session api base URL to be used in a server environment', () => {
                expect(Global.getSessionApiBaseUrl('O1lbi7zyBbrrWDMWmbhgsbuJWIihU9hdfkSNqBEzfcisTtqmGcSwk3cZib0k1xrn')).to.equal('http://127.0.0.1:3000/api/session/O1lbi7zyBbrrWDMWmbhgsbuJWIihU9hdfkSNqBEzfcisTtqmGcSwk3cZib0k1xrn')
            })
        })
        context('getAccessToken method', () => {
            it('should return the given accessToken instead of asking for cookie', () => {
                expect(Global.getAccessToken('O1lbi7zyBbrrWDMWmbhgsbuJWIihU9hdfkSNqBEzfcisTtqmGcSwk3cZib0k1xrn')).to.equal('O1lbi7zyBbrrWDMWmbhgsbuJWIihU9hdfkSNqBEzfcisTtqmGcSwk3cZib0k1xrn')
            })
        })
    })
});
