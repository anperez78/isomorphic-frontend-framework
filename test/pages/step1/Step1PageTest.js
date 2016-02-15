"use strict";

var IsomorphicFormTest = require('../../lib/isomorphic-form-test');
var Shared = require('../shared')
var sinon = require('sinon')

var buildPageElements = function (component) {
    return {
        getFirstNameInput() {
            return IsomorphicFormTest.elementQuerySelector(component, '#id_firstName')
        },
        getLastNameInput() {
            return IsomorphicFormTest.elementQuerySelector(component, '#id_lastName')
        },
        getSummaryErrors() {
           return IsomorphicFormTest.elementQuerySelector(component, '#validationSummary')
        },
        getFirstNameErrorMessage() {
           return IsomorphicFormTest.elementQuerySelector(component, '#firstName-error')
        },
        getLastNameErrorMessage() {
            return IsomorphicFormTest.elementQuerySelector(component, '#lastName-error')
        },      
        getDateOfBirthDayInput() {
            return IsomorphicFormTest.elementQuerySelector(component, '#birthDate_0')
        },
        getDateOfBirthMonthInput() {
            return IsomorphicFormTest.elementQuerySelector(component, '#birthDate_1')
        },
        getDateOfBirthYearInput() {
            return IsomorphicFormTest.elementQuerySelector(component, '#birthDate_2')
        },
        getBirthCityInput() {
            return IsomorphicFormTest.elementQuerySelector(component, '#id_birthCity')
        },
        getBirthDateErrorMessage() {
            return IsomorphicFormTest.elementQuerySelector(component, '#birthDate-error')
        },
        getBirthCityErrorMessage() {
            return IsomorphicFormTest.elementQuerySelector(component, '#birthCity-error')
        },
        getSubmitButton() {
            return IsomorphicFormTest.elementQuerySelector(component, 'button')
        }             
    }
}

describe('Step1 page', function () {
    Shared.setup('sandbox')
    Shared.setup('cookies')
    Shared.setup('config')

    describe('submit', function () {
        context('when all form fields are filled out properly', function () {
            var pageElements

            Shared.setup('isomorphic form stubs for module', './src/pages/step1/Step1Page')
            Shared.setup('mock validate service endpoint', {
                validateServiceUrl: "validateBirthDateServiceUrl",
                date: '01012015'
            })

            before(function () {
                pageElements = buildPageElements(this.mix.renderComponent())

                pageElements.getFirstNameInput().value = "Anne"
                pageElements.getLastNameInput().value = "Smith"

                pageElements.getDateOfBirthDayInput().value = "1"
                pageElements.getDateOfBirthMonthInput().value = "1"
                pageElements.getDateOfBirthYearInput().value = "2015"

                pageElements.getBirthCityInput().value = "Madrid"

                IsomorphicFormTest.Simulate.submit(pageElements.getSubmitButton())
            })

            it('should have no validation errors', function () {
                expect(pageElements.getFirstNameErrorMessage()).to.be.null
                expect(pageElements.getLastNameErrorMessage()).to.be.null
                expect(pageElements.getBirthDateErrorMessage()).to.be.null
                expect(pageElements.getBirthCityErrorMessage()).to.be.null
            })

            it('should have no summary for validation errors', function () {
                expect(pageElements.getSummaryErrors()).to.be.null
            })  
            Shared.behaviour('should transition to next route')
            Shared.behaviour('should POST the form data to the server', {
                formName: 'Step1Form',
                body: {
                    firstName: 'Anne',
                    lastName: 'Smith',
                    birthCity: 'Madrid',
                    birthDate_0: '1',
                    birthDate_1: '1',
                    birthDate_2: '2015'
                }
            })
        })
    })

    describe('errors out', function () {
        context('when none of the form fields are filled out', function () {
            var pageElements

            Shared.setup('isomorphic form stubs for module', './src/pages/step1/Step1Page')

            before(function () {
                pageElements = buildPageElements(this.mix.renderComponent())

                IsomorphicFormTest.Simulate.submit(pageElements.getSubmitButton())
            })

            it('should have validation errors', function () {
                expect(pageElements.getFirstNameErrorMessage().innerHTML).to.be.equal('Tell us your first and middle names')
                expect(pageElements.getLastNameErrorMessage().innerHTML).to.be.equal('Tell us your last name')
                expect(pageElements.getBirthDateErrorMessage().innerHTML).to.be.equal('Tell us your date of birth')
                expect(pageElements.getBirthCityErrorMessage().innerHTML).to.be.equal('Tell us the city where you were born')
            })

            it('should have summary for validation errors', function () {
                expect(pageElements.getSummaryErrors()).to.not.be.null
            }) 
            Shared.behaviour('should not POST the form data to the server')
            Shared.behaviour('should not transition to next route')
        })

        context('when only first name field is filled out', function () {
            var pageElements

            Shared.setup('isomorphic form stubs for module', './src/pages/step1/Step1Page')

            before(function () {
                pageElements = buildPageElements(this.mix.renderComponent())

                pageElements.getFirstNameInput().value = "George"

                IsomorphicFormTest.Simulate.submit(pageElements.getSubmitButton())
            })

            it('should have validation errors', function () {
                expect(pageElements.getFirstNameErrorMessage()).to.be.null
                expect(pageElements.getLastNameErrorMessage().innerHTML).to.be.equal('Tell us your last name')
                expect(pageElements.getBirthDateErrorMessage().innerHTML).to.be.equal('Tell us your date of birth')
                expect(pageElements.getBirthCityErrorMessage().innerHTML).to.be.equal('Tell us the city where you were born')
            })
            
            it('should have summary for validation errors', function () {
                expect(pageElements.getSummaryErrors()).to.not.be.null
            }) 
            Shared.behaviour('should not POST the form data to the server')
        })

        context('when only last name field is filled out', function () {
            var pageElements

            Shared.setup('isomorphic form stubs for module', './src/pages/step1/Step1Page')

            before(function () {
                pageElements = buildPageElements(this.mix.renderComponent())

                pageElements.getLastNameInput().value = "Orwell"

                IsomorphicFormTest.Simulate.submit(pageElements.getSubmitButton())
            })

            it('should have validation errors', function () {
                expect(pageElements.getFirstNameErrorMessage().innerHTML).to.be.equal('Tell us your first and middle names')
                expect(pageElements.getLastNameErrorMessage()).to.be.null
                expect(pageElements.getBirthDateErrorMessage().innerHTML).to.be.equal('Tell us your date of birth')
                expect(pageElements.getBirthCityErrorMessage().innerHTML).to.be.equal('Tell us the city where you were born')
            })

            it('should have summary for validation errors', function () {
                expect(pageElements.getSummaryErrors()).to.not.be.null
            }) 
            Shared.behaviour('should not POST the form data to the server')
        })

        context('when fields are entered text more than max length', function () {
            var pageElements

            Shared.setup('isomorphic form stubs for module', './src/pages/step1/Step1Page')
            Shared.setup('mock validate service endpoint', {
                validateServiceUrl: "validateBirthDateServiceUrl",
                date: '01012015'
            })

            before(function () {
                pageElements = buildPageElements(this.mix.renderComponent())

                pageElements.getFirstNameInput().value = Array(123).join("a")
                pageElements.getLastNameInput().value = Array(123).join("a")
                pageElements.getDateOfBirthDayInput().value = "1"
                pageElements.getDateOfBirthMonthInput().value = "1"
                pageElements.getDateOfBirthYearInput().value = "2015"

                pageElements.getBirthCityInput().value = Array(39).join('a')


                IsomorphicFormTest.Simulate.submit(pageElements.getSubmitButton())
            })

            it('should have validation errors', function () {
                expect(pageElements.getFirstNameErrorMessage().outerHTML).to.include("Ensure this value has at most 35 characters")
                expect(pageElements.getLastNameErrorMessage().outerHTML).to.include("Ensure this value has at most 35 characters")
                expect(pageElements.getBirthCityErrorMessage().outerHTML).to.include("Ensure this value has at most 29 characters")
                expect(pageElements.getBirthDateErrorMessage()).to.be.null
            })

            it('should have summary for validation errors', function () {
                expect(pageElements.getSummaryErrors()).to.not.be.null
            }) 
            Shared.behaviour('should not POST the form data to the server')
            Shared.behaviour('should not transition to next route')
        })

        context('when date of birth field is in the future', function () {
            var pageElements

            Shared.setup('isomorphic form stubs for module', './src/pages/step1/Step1Page')

            Shared.setup('mock validate service endpoint', {
                validateServiceUrl: "validateBirthDateServiceUrl",
                date: '01013000',
                error: 'date-is-in-the-future',
                status: 422
            })

            before(function () {
                pageElements = buildPageElements(this.mix.renderComponent())

                pageElements.getFirstNameInput().value = "Thomas"
                pageElements.getLastNameInput().value = "Trump"
                pageElements.getBirthCityInput().value = "Milan"
                pageElements.getDateOfBirthDayInput().value = "1"
                pageElements.getDateOfBirthMonthInput().value = "1"
                pageElements.getDateOfBirthYearInput().value = "3000"

                IsomorphicFormTest.Simulate.submit(pageElements.getSubmitButton())
            })

            it('should have validation errors for DOB field', function () {
                expect(pageElements.getBirthDateErrorMessage().innerHTML).to.be.equal('Enter a valid date in the past')
            })
            it('should have no validation errors for these fields', function () {
                expect(pageElements.getFirstNameErrorMessage()).to.be.null
                expect(pageElements.getLastNameErrorMessage()).to.be.null
                expect(pageElements.getBirthCityErrorMessage()).to.be.null
            })

            it('should have summary for validation errors', function () {
                expect(pageElements.getSummaryErrors()).to.not.be.null
            }) 
            Shared.behaviour('should not POST the form data to the server')
            Shared.behaviour('should not transition to next route')
        })

        context('when date of birth field is today', function () {
            var pageElements

            Shared.setup('isomorphic form stubs for module', './src/pages/step1/Step1Page')
            Shared.setup('mock validate service endpoint', {
                validateServiceUrl: "validateBirthDateServiceUrl",
                date: '01012015',
                error: 'date-is-today',
                status: 422
            })

            before(function () {
                pageElements = buildPageElements(this.mix.renderComponent())

                pageElements.getFirstNameInput().value = "Thomas"
                pageElements.getLastNameInput().value = "Trump"
                pageElements.getBirthCityInput().value = "Milan"
                pageElements.getDateOfBirthDayInput().value = "1"
                pageElements.getDateOfBirthMonthInput().value = "1"
                pageElements.getDateOfBirthYearInput().value = "2015"

                IsomorphicFormTest.Simulate.submit(pageElements.getSubmitButton())
            })

            it('should have validation error for DOB field', function () {
                expect(pageElements.getBirthDateErrorMessage().innerHTML).to.be.equal('Enter a valid date in the past')
            })
            it('should have no validation errors for these fields', function () {
                expect(pageElements.getFirstNameErrorMessage()).to.be.null
                expect(pageElements.getLastNameErrorMessage()).to.be.null
                expect(pageElements.getBirthCityErrorMessage()).to.be.null
            })

            it('should have summary for validation errors', function () {
                expect(pageElements.getSummaryErrors()).to.not.be.null
            }) 
            Shared.behaviour('should not POST the form data to the server')
            Shared.behaviour('should not transition to next route')
        })

        context('when date of birth field is invalid', function () {
            var pageElements

            Shared.setup('isomorphic form stubs for module', './src/pages/step1/Step1Page')
            Shared.setup('mock validate service endpoint', {
                validateServiceUrl: "validateBirthDateServiceUrl",
                date: '34012015',
                error: 'invalid-date',
                status: 422
            })

            before(function () {
                pageElements = buildPageElements(this.mix.renderComponent())

                pageElements.getFirstNameInput().value = "Thomas"
                pageElements.getLastNameInput().value = "Trump"

                pageElements.getBirthCityInput().value = "Milan"
                pageElements.getDateOfBirthDayInput().value = "311"
                pageElements.getDateOfBirthMonthInput().value = "1"
                pageElements.getDateOfBirthYearInput().value = "2015"

                IsomorphicFormTest.Simulate.submit(pageElements.getSubmitButton())
            })

            it('should have validation error for DOB field', function () {
                expect(pageElements.getBirthDateErrorMessage().innerHTML).to.be.equal('Enter a valid date')
            })
            it('should have no validation errors for these fields', function () {
                expect(pageElements.getFirstNameErrorMessage()).to.be.null
                expect(pageElements.getLastNameErrorMessage()).to.be.null
                expect(pageElements.getBirthCityErrorMessage()).to.be.null
            })

            it('should have summary for validation errors', function () {
                expect(pageElements.getSummaryErrors()).to.not.be.null
            }) 
            Shared.behaviour('should not POST the form data to the server')
            Shared.behaviour('should not transition to next route')
        })

    })
})