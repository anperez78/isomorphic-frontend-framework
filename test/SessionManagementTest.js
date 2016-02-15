"use strict";

var expect = require('chai').expect
var proxyquire = require('proxyquire')

var configStub = {common: {'host': '127.0.0.1', 'port': 3000, 'apiBasePath': '/api'}}
var envStub = {CLIENT: false, SERVER: true}

var Global = {
    getSessionApiBaseUrl: function(token) { return "/api/session/1234567890" },
    getConfig: function() {
        return {

            client: {
            "travelReasons": [
                  {
                    "value": "For business purposes"
                  },
                  {
                    "value": "Going on holiday"
                  },
                  {
                    "value": "To return home"
                  },
                  {
                    "value": "To visit friends or family"
                  },
                  {
                    "value": "To apply for a new passport"
                  },
                  {
                    "value": "Compassionate reasons"
                  },
                  {
                    "value": "Other"
                  }
            ]
        }}
    },
    getCountryNameList: function(){
        return []
    },
    getCountryNameListInConfigOrder: function(){
        return ['Spain']
    }
}

var mockedLogger = {
    getLogger: function (loggerName) {
        return console
    }
}

var mockedRestClient = function() {
    return {
        get: function (path) {
            return {
              then: function(method1, method2) {
                return {
                    done: function() {
                        method1.call({})
                        return
                    }
                }
              }          
            }
        }
    }
}

var apiMockedService = function() {

  var redisSessionsMock = require('./mocks/RedisSessionsMock')


  var mockedStep1Form =  proxyquire('../src/pages/step1/Step1Form', {
            '../../common/Global': Global,
            '../../common/utils/env': envStub,
            '../../common/utils/RestClient': mockedRestClient
  })

  var mockedStep3Form =  proxyquire('../src/pages/step3/Step3Form', {
            '../../common/Global': Global,
            '../../common/utils/env': envStub
  })  

  return proxyquire('../src/common/services/session/sessionService', {
          './redis-session': redisSessionsMock,
          '../../../pages/step1/Step1Form': mockedStep1Form,
          '../../../pages/step3/Step3Form': mockedStep3Form,
          '../../utils/logs/logger': mockedLogger
      }
  )
}


describe('Creation of a session', function(){

    it('should return a 200 response and a token when data is valid', function(done) {

        var api = apiMockedService()
        var res = require('./mocks/response')()

        res.on('response', function(resp) {
            expect(resp).to.have.property('response')
            expect(resp.response).to.have.property('token')
            expect(resp.response.token).to.equal('r30kKwv3sA6ExrJ9OmLSm4Wo3nt9MQA1yG94wn6ByFbNrVWhcwAyOM7Zhfxqh8fe')
            done()
        })

        var req = {
            query: {
                ip: '127.0.0.1',
                ttl: 1000
            }
        }

        api.createSession (req, res)

    })

    it('should return a 400 response when ttl parameter is undefined', function(done) {

        var api = apiMockedService()
        var res = require('./mocks/response')()

        res.on('response', function(resp) {
            expect(resp).to.have.property('code')
            expect(resp.code).to.equal(400)
            expect(resp).to.have.property('response')
            expect(resp.response).to.have.property('error')
            expect(resp.response.error).to.equal('missing param ttl')
            done()
        })

        var req = {
            query: {
                ip: '127.0.0.1',
                ttl: undefined
            }
        }

        api.createSession (req, res)
    })
    it('should return a 400 response when ip parameter is undefined', function(done) {

        var api = apiMockedService()
        var res = require('./mocks/response')()

        res.on('response', function(resp) {
            expect(resp).to.have.property('code')
            expect(resp.code).to.equal(400)
            expect(resp).to.have.property('response')
            expect(resp.response).to.have.property('error')
            expect(resp.response.error).to.equal('missing param ip')
            done()
        })

        var req = {
            query: {
                ip: undefined,
                ttl: 1000
            }
        }

        api.createSession (req, res)
    })
})

describe('Deletion of a session', function(){

    it('should return a 200 response and "ok" when token is valid', function(done) {

        var api = apiMockedService()
        var res = require('./mocks/response')()

        res.on('response', function(resp) {
            expect(resp).to.have.property('response')
            expect(resp.response).to.equal('ok')
            done()
        })

        var req = {
            params: {
                token: 'r30kKwv3sA6ExrJ9OmLSm4Wo3nt9MQA1yG94wn6ByFbNrVWhcwAyOM7Zhfxqh8fe'
            }
        }

        api.deleteSession (req, res)

    })

    it('should return a 400 response when missing param token', function(done) {

        var api = apiMockedService()
        var res = require('./mocks/response')()

        res.on('response', function(resp) {
            expect(resp).to.have.property('code')
            expect(resp.code).to.equal(400)
            expect(resp).to.have.property('response')
            expect(resp.response).to.have.property('error')
            expect(resp.response.error).to.equal('missing param token')
            done()
        })

        var req = {
            params: {
                token: undefined
            }
        }

        api.deleteSession (req, res)

    })

    it('should return a 404 response when session is missing', function(done) {

        var api = apiMockedService()
        var res = require('./mocks/response')()

        res.on('response', function(resp) {
            expect(resp).to.have.property('code')
            expect(resp.code).to.equal(404)
            expect(resp).to.have.property('response')
            expect(resp.response).to.have.property('error')
            expect(resp.response.error).to.equal('session-not-found')
            done()
        })
        
        var req = {
            params: {
                token: '1234567890'
            }
        }

        api.deleteSession (req, res)

    })

})


describe('POST Session form data', function(){

        
    // Shared.setup('isomorphic form stubs for module', './src/pages/name/NamePage')

    // Shared.setup('mock validate service endpoint', {
    //     validateServiceUrl: "validateBirthDateServiceUrl",
    //     date: '11111977'
    // })

    it('should return a 200 response and "ok" when data is valid', function(done) {

        var api = apiMockedService()
        var res = require('./mocks/response')()

        res.on('response', function(resp) {
            expect(resp).to.have.property('response')
            expect(resp.response).to.equal('ok')
            done()
        })

        var req = {
            params: {
                formName: 'Step1Form',
                token: 'r30kKwv3sA6ExrJ9OmLSm4Wo3nt9MQA1yG94wn6ByFbNrVWhcwAyOM7Zhfxqh8fe'
            },
            body: {
                firstName: 'Manuel',
                lastName: 'Lopez',
                birthDate_0: '11',
                birthDate_1: '11',
                birthDate_2: '1977',                
                birthCity: 'Barcelona'
            }
        }

        api.postSessionForm (req, res)

    })

    it('should return a 400 response when missing param formName', function(done) {

        var api = apiMockedService()
        var res = require('./mocks/response')()

        res.on('response', function(resp) {
            expect(resp).to.have.property('code')
            expect(resp.code).to.equal(400)
            expect(resp).to.have.property('response')
            expect(resp.response).to.have.property('error')
            expect(resp.response.error).to.equal('missing param formName')
            done()
        })

        var req = {
            params: {
                formName: undefined,
                token: 'r30kKwv3sA6ExrJ9OmLSm4Wo3nt9MQA1yG94wn6ByFbNrVWhcwAyOM7Zhfxqh8fe'
            },
            body: {
                title: 'Mr'
            }
        }

        api.postSessionForm (req, res)

    })

    it('should return a 400 response when missing param token', function(done) {

        var api = apiMockedService()
        var res = require('./mocks/response')()

        res.on('response', function(resp) {
            expect(resp).to.have.property('code')
            expect(resp.code).to.equal(400)
            expect(resp).to.have.property('response')
            expect(resp.response).to.have.property('error')
            expect(resp.response.error).to.equal('missing param token')
            done()
        })

        var req = {
            params: {
                formName: 'Step1Form',
                token: undefined
            },
            body: {
                title: 'Mr'
            }
        }

        api.postSessionForm (req, res)

    })

    it('should return a 400 response when formName is not valid', function(done) {

        var api = apiMockedService()
        var res = require('./mocks/response')()

        res.on('response', function(resp) {
            expect(resp).to.have.property('code')
            expect(resp.code).to.equal(400)
            expect(resp).to.have.property('response')
            expect(resp.response).to.have.property('error')
            expect(resp.response.error).to.equal('Invalid form name: MockNotExistingForm')
            done()
        })

        var req = {
            params: {
                formName: 'MockNotExistingForm',
                token: 'r30kKwv3sA6ExrJ9OmLSm4Wo3nt9MQA1yG94wn6ByFbNrVWhcwAyOM7Zhfxqh8fe'
            },
            body: {
                title: 'Mr'
            }
        }

        api.postSessionForm (req, res)

    })

    it('should return a 400 response when form data is not valid', function(done) {

        var api = apiMockedService()
        var res = require('./mocks/response')()

        res.on('response', function(resp) {
            expect(resp).to.have.property('code')
            expect(resp.code).to.equal(400)
            expect(resp).to.have.property('response')
            expect(resp.response).to.have.property('error')
            expect(resp.response.error).to.have.property('errors')
            expect(resp.response.error.errors).to.have.property('firstName')
            done()
        })

        var req = {
            params: {
                formName: 'Step1Form',
                token: 'r30kKwv3sA6ExrJ9OmLSm4Wo3nt9MQA1yG94wn6ByFbNrVWhcwAyOM7Zhfxqh8fe'
            },
            body: {

            }
        }

        api.postSessionForm (req, res)

    })

})

describe('Get Session form data', function(){

    it('should return the form data when request is valid', function(done) {

        var api = apiMockedService()
        var res = require('./mocks/response')()

        res.on('response', function(resp) {
            expect(resp).to.have.property('response')
            expect(resp.response).to.have.property('OtherInformationForm')
            expect(resp.response.OtherInformationForm).to.have.property('otherInformation')
            expect(resp.response.OtherInformationForm.otherInformation).to.equal('other info')
            done()
        })

        var req = {
            params: {
                token: 'r30kKwv3sA6ExrJ9OmLSm4Wo3nt9MQA1yG94wn6ByFbNrVWhcwAyOM7Zhfxqh8fe'
            }
        }

        api.getSessionForm(req, res)

    })

    it('should return a 400 response and "missing param token" when token is undefined', function(done) {

        var api = apiMockedService()
        var res = require('./mocks/response')()

        res.on('response', function(resp) {
            expect(resp).to.have.property('code')
            expect(resp.code).to.equal(400)
            expect(resp).to.have.property('response')
            expect(resp.response).to.have.property('error')
            expect(resp.response.error).to.equal('missing param token')

            done()
        })

        var req = {
            params: {
                token: undefined
            }
        }

        api.getSessionForm(req, res)

    })

})

describe('Get Session form data by form name', function(){

    it('should return the form data when request is valid', function(done) {

        var api = apiMockedService()
        var res = require('./mocks/response')()

        res.on('response', function(resp) {
            expect(resp).to.have.property('response')
            expect(resp.response).to.have.property('otherInformation')
            expect(resp.response.otherInformation).to.equal('other info')
            done()
        })

        var req = {
            params: {
                token: 'r30kKwv3sA6ExrJ9OmLSm4Wo3nt9MQA1yG94wn6ByFbNrVWhcwAyOM7Zhfxqh8fe',
                formName: 'OtherInformationForm'
            }
        }

        api.getSessionFormByFormName(req, res)

    })

    it('should return 404 response when there is no data for the given form name', function(done) {

        var api = apiMockedService()
        var res = require('./mocks/response')()

        res.on('response', function(resp) {
            expect(resp).to.have.property('code')
            expect(resp.code).to.equal(404)
            expect(resp).to.have.property('response')
            expect(resp.response).to.have.property('error')
            expect(resp.response.error).to.equal('no data found for form name: undefinedFormName')
            done()
        })

        var req = {
            params: {
                token: 'r30kKwv3sA6ExrJ9OmLSm4Wo3nt9MQA1yG94wn6ByFbNrVWhcwAyOM7Zhfxqh8fe',
                formName: 'undefinedFormName'
            }
        }

        api.getSessionFormByFormName(req, res)

    })

    it('should return a 400 response and "missing param token" when token is undefined', function(done) {

        var api = apiMockedService()
        var res = require('./mocks/response')()

        res.on('response', function(resp) {
            expect(resp).to.have.property('code')
            expect(resp.code).to.equal(400)
            expect(resp).to.have.property('response')
            expect(resp.response).to.have.property('error')
            expect(resp.response.error).to.equal('missing param token')

            done()
        })

        var req = {
            params: {
                token: undefined
            }
        }

        api.getSessionFormByFormName(req, res)

    })

})
