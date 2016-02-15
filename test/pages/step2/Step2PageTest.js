"use strict";

var IsomorphicFormTest = require('../../lib/isomorphic-form-test');
var Shared = require('../shared')
var sinon = require('sinon')

var buildPageElements = function (component) {
    return {
        
        getSummaryErrors() {
           return IsomorphicFormTest.elementQuerySelector(component, '#validationSummary')
        },
        getSubmitButton() {
            return IsomorphicFormTest.elementQuerySelector(component, 'button')
        },
        getContactEmailInput() {
            return IsomorphicFormTest.elementQuerySelector(component, '#id_contactEmail')
        },
        getConfirmContactEmailInput() {
            return IsomorphicFormTest.elementQuerySelector(component, '#id_confirmContactEmail')
        },
        getContactPhoneInput() {
            return IsomorphicFormTest.elementQuerySelector(component, '#id_contactPhone')
        },

        getContactEmailErrorMessage() {
            return IsomorphicFormTest.elementQuerySelector(component, '#contactEmail-error')
        },
        getConfirmContactEmailErrorMessage() {
            return IsomorphicFormTest.elementQuerySelector(component, '#confirmContactEmail-error')
        },
        getContactPhoneErrorMessage() {
            return IsomorphicFormTest.elementQuerySelector(component, '#contactPhone-error')
        }              
    }
}

describe('Step2 page', function () {
    Shared.setup('sandbox')
    Shared.setup('cookies')
    Shared.setup('config')

    describe('submit', function () {
        context('when all form fields are filled out properly', function () {
            var pageElements

            Shared.setup('isomorphic form stubs for module', './src/pages/step2/Step2Page')

            before(function () {
                pageElements = buildPageElements(this.mix.renderComponent())

                pageElements.getContactEmailInput().value = 'a@a.com'
                pageElements.getConfirmContactEmailInput().value = 'a@a.com'
                pageElements.getContactPhoneInput().value = '1234567890'

                IsomorphicFormTest.Simulate.submit(pageElements.getSubmitButton())
            })

            it('should have no validation errors', function () {
                expect(pageElements.getContactEmailErrorMessage()).to.be.null
                expect(pageElements.getConfirmContactEmailErrorMessage()).to.be.null
               expect(pageElements.getContactPhoneErrorMessage()).to.be.null
            })

            it('should have no summary for validation errors', function () {
                expect(pageElements.getSummaryErrors()).to.be.null
            })  
            Shared.behaviour('should transition to next route')
            Shared.behaviour('should POST the form data to the server', {
                formName: 'Step2Form',
                body: {
                    contactEmail: 'a@a.com',
                    confirmContactEmail: 'a@a.com',
                    contactPhone: '1234567890'
                }
            })
        })
    })

    describe('errors out', function () {
        context('when none of the form fields are filled out', function () {
            var pageElements

            Shared.setup('isomorphic form stubs for module', './src/pages/step2/Step2Page')

            before(function () {
                pageElements = buildPageElements(this.mix.renderComponent())

                IsomorphicFormTest.Simulate.submit(pageElements.getSubmitButton())
            })

            it('should have validation errors', function () {
                expect(pageElements.getContactEmailErrorMessage().innerHTML).to.be.equal('Enter your email address')
                expect(pageElements.getConfirmContactEmailErrorMessage().innerHTML).to.be.equal('Enter your email address')
                expect(pageElements.getContactPhoneErrorMessage().innerHTML).to.be.equal('Enter the phone number to contact you on')
            })

            it('should have summary for validation errors', function () {
                expect(pageElements.getSummaryErrors()).to.not.be.null
            }) 
            Shared.behaviour('should not POST the form data to the server')
            Shared.behaviour('should not transition to next route')
        })

        context('when only first email address field is filled out', function () {
            var pageElements

            Shared.setup('isomorphic form stubs for module', './src/pages/step2/Step2Page')

            before(function () {
                pageElements = buildPageElements(this.mix.renderComponent())

                pageElements.getContactEmailInput().value = "a@a.com"

                IsomorphicFormTest.Simulate.submit(pageElements.getSubmitButton())
            })

            it('should have validation errors', function () {
                expect(pageElements.getContactEmailErrorMessage()).to.be.null
                expect(pageElements.getConfirmContactEmailErrorMessage().innerHTML).to.be.equal('Enter your email address')
                expect(pageElements.getContactPhoneErrorMessage().innerHTML).to.be.equal('Enter the phone number to contact you on')
            })
            
            it('should have summary for validation errors', function () {
                expect(pageElements.getSummaryErrors()).to.not.be.null
            }) 
            Shared.behaviour('should not POST the form data to the server')
        })

        context('when email fields are different', function () {
            var pageElements

            Shared.setup('isomorphic form stubs for module', './src/pages/step2/Step2Page')

            before(function () {
                pageElements = buildPageElements(this.mix.renderComponent())

                pageElements.getContactEmailInput().value = "a@a.com"
                pageElements.getConfirmContactEmailInput().value = "b@b.com"

                IsomorphicFormTest.Simulate.submit(pageElements.getSubmitButton())
            })

            it('should have validation errors', function () {
                expect(pageElements.getContactEmailErrorMessage()).to.be.null
                expect(pageElements.getConfirmContactEmailErrorMessage().innerHTML).to.be.equal('Enter a matching email address')
                expect(pageElements.getContactPhoneErrorMessage().innerHTML).to.be.equal('Enter the phone number to contact you on')
            })

            it('should have summary for validation errors', function () {
                expect(pageElements.getSummaryErrors()).to.not.be.null
            }) 
            Shared.behaviour('should not POST the form data to the server')
        })

        context('when email field is invalid', function () {
            var pageElements

            Shared.setup('isomorphic form stubs for module', './src/pages/step2/Step2Page')

            before(function () {
                pageElements = buildPageElements(this.mix.renderComponent())

                pageElements.getContactEmailInput().value = "aaaaa"
                pageElements.getConfirmContactEmailInput().value = "aaaaa"
                pageElements.getContactPhoneInput().value = "1111"

                IsomorphicFormTest.Simulate.submit(pageElements.getSubmitButton())
            })

            it('should have validation errors', function () {
                expect(pageElements.getContactEmailErrorMessage().innerHTML).to.be.equal('Check you\'ve entered the correct email address')
                expect(pageElements.getConfirmContactEmailErrorMessage().innerHTML).to.be.equal('Check you\'ve entered the correct email address')
                expect(pageElements.getContactPhoneErrorMessage()).to.be.null
            })

            it('should have summary for validation errors', function () {
                expect(pageElements.getSummaryErrors()).to.not.be.null
            }) 
            Shared.behaviour('should not POST the form data to the server')
            Shared.behaviour('should not transition to next route')
        })


    })
})