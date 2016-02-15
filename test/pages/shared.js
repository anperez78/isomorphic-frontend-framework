var IsomorphicFormTest = require('../lib/isomorphic-form-test/index');
var shared = require('mocha-shared')
var sinon = require('sinon')
var _ = require('lodash')
var IsomorphicFormDataHolder = require('../../src/common/ui/form/IsomorphicFormDataHolder')


var validateServiceUrls = {
    "validateBirthDateServiceUrl": "http://localhost:8080/validate/birth-date",
}

shared.setup('sandbox', function () {
    before(function () {
        this.sandbox = IsomorphicFormTest.sandbox
    })

    after(function () {
        this.sandbox.reset()
    })
})

shared.setup('cookies', function () {
    before(function () {
        IsomorphicFormTest.fakeAccessToken('xyz')
    })
})

shared.withAsyncTransition = function (inFct) {
    return function (callback) {
        this.callback = callback
        inFct.call(this)
    }
}

shared.setup('config', function () {
    before(function () {
        IsomorphicFormTest.fakeConfig({
            'common': {
                'apiBasePath': '/api'
            },
            'client': _.extend({}, validateServiceUrls, {

                "logger": {
                  "enableConsoleAppender": true,
                  "enableAjaxAppender": true,
                  "ajaxUrl": "/client-logger/log"
                },

                "transportMode": [
                      {
                        "value": "plane",
                        "description" : "Plane"
                      },
                      {
                        "value": "train",
                        "description" : "Train"
                      },
                      {
                        "value": "boat",
                        "description" : "Boat"
                      },
                      {
                        "value": "car",
                        "description" : "Car"
                      },
                      {
                        "value": "coach",
                        "description" : "Coach"
                      },
                      {
                        "value": "other",
                        "description" : "Other"
                      }
                    ]
                
            }),
            'server': {
                validateServiceUrls
            },
        })
    })
})

shared.setup('isomorphic form stubs for module', function (moduleName) {
    before(function () {
        var that = this

        that.callback = sinon.spy()

        this.transitionCallback = function () {
            that.callback()
        }

        function Request() {
            this.send = request.sendStub
        }

        function request() {
            return new Request();
        }

        request.Request = Request
        request.sendStub = sinon.stub()
        request.endStub = sinon.stub()

        request.get = sinon.stub()
        request.post = sinon.stub()

        request.post.returns(
            function () {
                return request()
            }()
        )

        request.sendStub.returns(
            function () {
                return request()

            }()
        )

        Request.prototype.end = sinon.stub().yields(undefined, {})

        this.transitionStub = IsomorphicFormTest.createTransitionStub()

        this.nextRouteStub = sinon.stub()
        this.nextRouteStub.returns("next")

        global.window.location.replace('/')

        that.isomorphicFormData = {}
        this.isomorphicFormDataHolderStub = function () {
            this.decorated = new IsomorphicFormDataHolder(that.isomorphicFormData)

            this.getSessionData = this.decorated.getSessionData.bind(this.decorated)
            this.getAuxiliaryData = this.decorated.getAuxiliaryData.bind(this.decorated)
            this.setFormName = this.decorated.setFormName.bind(this.decorated)
            this.getFormName = this.decorated.getFormName.bind(this.decorated)
            this.getFormData = this.decorated.getFormData.bind(this.decorated)
            this.getData = this.decorated.getData.bind(this.decorated)
        }

        this.mix = IsomorphicFormTest.isomorphicMix({
            require: moduleName,
            context: IsomorphicFormTest
                .isomorphicStubContexts
                .createReactRouterStub(this.sandbox, this.transitionStub, this.nextRouteStub, this.transitionCallback),
            mocks: {
                superagent: {
                    require: 'superagent',
                    react: false,
                    mock: request
                },
                IsomorphicFormDataHolder: {
                    require: './IsomorphicFormDataHolder',
                    react: false,
                    mock: this.isomorphicFormDataHolderStub
                }
            }
        })

        this.mix.before()
    })

    after(function () {
        this.mix.after()
    })
})

/**
 * Replace CheckboxSelectMultiple with SelectMultiple at runtime due to a bug occurring in unit tests.
 *
 * Using CheckboxSelectMultiple widget, any attempt to programmatically select a check box other
 * than the first one fails to persist its state. This problem seems to be confined to the widget itself and only
 * shows in unit tests.
 *
 * SelectMultiple on the other hand, even though it renders slightly differently, has the advantage to work
 * with no issue. Since it behaves in the exact same manner as CheckboxSelectMultiple it can be used as a direct
 * replacement in unit tests without affecting the logic in any way.
 *
 * NOTE: Same applies to RadioSelect
 */
shared.setup('monkey-patch', function (useSelectFieldInstead) {
    before(function () {
        var forms = require('newforms')

        var fieldType = forms.SelectMultiple
        if(useSelectFieldInstead) {
            fieldType = forms.Select
        }
        forms.CheckboxSelectMultiple = fieldType
        forms.RadioSelect = fieldType
    })
})

shared.setup('build page elements', function (args) {
    before(function () {
        var component
        if (args.componentProps) {
            component = this.mix.renderComponent(args.componentProps)
        } else {
            component = this.mix.renderComponent()
        }

        this.pageElements = args.buildPageElements(component)
    })
})

shared.setup('isomorphic fetched data', function (args) {
    before(function () {
        this.isomorphicFormData = {
            "sessionData": args.sessionData,
            "formName": args.formName
        }
    })
})

shared.setup('mock validate service endpoint', function (arg) {
    before(function () {
        var superagentMock = this.mix.mocks.superagent

        superagentMock.get.withArgs(`${validateServiceUrls[arg.validateServiceUrl]}/${arg.date}`).returns(
            function () {
                superagentMock.Request.prototype.end = sinon.stub().yields(undefined, {
                    status: arg.status,
                    clientError: (typeof arg.error !== 'undefined'),
                    body: {
                        error: arg.error
                    }
                })
                return superagentMock()
            }()
        )
    })
})

shared.behaviour('should transition to next route', function (forceRedirect) {
    it('should transition to next route', function () {
        if (forceRedirect){
            expect(global.window.location.toString()).to.be.equal("file:///next")
        } else {
            expect(this.transitionStub.redirect.calledOnce).to.be.true
            expect(this.transitionStub.redirect.getCall(0).args[0]).to.be.equal("next")
        }

    })
})

shared.behaviour('should not transition to next route', function () {
    it('should transition to next route', function () {
        expect(this.transitionStub.redirect.calledOnce).to.be.false
    })
})

shared.behaviour('should POST the form data to the server', function (postData) {
    it('should POST the form data to the server', function () {
        expect(this.mix.mocks.superagent.post.calledOnce).to.be.true
        expect(this.mix.mocks.superagent.post.getCall(0).args[0]).to.be.equal(`/api/session/form/${postData.formName}`)
        expect(this.mix.mocks.superagent.sendStub.calledOnce).to.be.true
        expect(this.mix.mocks.superagent.sendStub.getCall(0).args[0]).to.be.eql(postData.body)
    })
})

shared.behaviour('should not POST the form data to the server', function () {
    it('should not POST the form data to the server', function () {
        expect(this.mix.mocks.superagent.post.called).to.be.false
    })
})

module.exports = shared
