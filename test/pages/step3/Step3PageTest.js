"use strict";

var IsomorphicFormTest = require('../../lib/isomorphic-form-test')
var Shared = require('../shared')
var sinon = require('sinon')


var buildPageElements = function (component) {

    return {
        
        getModesOfTransportPlaneInput() {
            return IsomorphicFormTest.elementQuerySelectorAll(component, '#id_modesOfTransport option')[0]
        },
        getModesOfTransportTrainInput() {
            return IsomorphicFormTest.elementQuerySelectorAll(component, '#id_modesOfTransport option')[1]
        },
        getModesOfTransportBoatInput() {
            return IsomorphicFormTest.elementQuerySelectorAll(component, '#id_modesOfTransport option')[2]
        },
        getModesOfTransportCarInput() {
            return IsomorphicFormTest.elementQuerySelectorAll(component, '#id_modesOfTransport option')[3]
        },
        getModesOfTransportCoachInput() {
            return IsomorphicFormTest.elementQuerySelectorAll(component, '#id_modesOfTransport option')[4]
        },
        getModesOfTransportOtherInput() {
            return IsomorphicFormTest.elementQuerySelectorAll(component, '#id_modesOfTransport option')[5]
        },
        getOtherTransportModeInput() {
            return IsomorphicFormTest.elementQuerySelector(component, '#id_otherTransportMode')
        },
        
        getSummaryErrors() {
           return IsomorphicFormTest.elementQuerySelector(component, '#validationSummary')
        }, 
        getSubmitButton() {
            return IsomorphicFormTest.elementQuerySelector(component, 'button')
        },
        
        getModesOfTransportErrorMessage() {
            return IsomorphicFormTest.elementQuerySelector(component, '#form-group-modes-of-transport .error-message')
        },
        getOtherTransportModeErrorMessage() {
            return IsomorphicFormTest.elementQuerySelector(component, '#form-group-other-transport-mode .error-message')
        }
        
    }
}

describe('Step3 page', function () {
    Shared.setup('sandbox')
    Shared.setup('cookies')
    Shared.setup('config')

    describe('submits', function () {
        context('when all form fields are filled out properly', function () {

            var pageElements

            Shared.setup('isomorphic form stubs for module', './src/pages/step3/Step3Page')
            Shared.setup('monkey-patch')

            before(function () {
                pageElements = buildPageElements(this.mix.renderComponent())

                pageElements.getModesOfTransportPlaneInput().selected = true;
                pageElements.getModesOfTransportPlaneInput().value = "plane";

                pageElements.getModesOfTransportTrainInput().selected = true;
                pageElements.getModesOfTransportTrainInput().value = "train";

                pageElements.getModesOfTransportBoatInput().value = "boat";
                pageElements.getModesOfTransportBoatInput().selected = true;

                pageElements.getModesOfTransportCarInput().value = "car";
                pageElements.getModesOfTransportCarInput().selected = true;

                pageElements.getModesOfTransportCoachInput().value = "coach";
                pageElements.getModesOfTransportCoachInput().selected = true;

                pageElements.getModesOfTransportOtherInput().value = "other";
                pageElements.getModesOfTransportOtherInput().selected = true;

                pageElements.getOtherTransportModeInput().value = "jogging all the way"
                
                IsomorphicFormTest.Simulate.submit(pageElements.getSubmitButton())
            })

            it('should have no validation errors', function () {
                expect(pageElements.getModesOfTransportErrorMessage()).to.be.null
                expect(pageElements.getOtherTransportModeErrorMessage()).to.be.null
            })

            it('should have no summary for validation errors', function () {
                expect(pageElements.getSummaryErrors()).to.be.null
            })  
            Shared.behaviour('should transition to next route')

            Shared.behaviour('should POST the form data to the server', {
                formName: 'Step3Form',
                body: {
                    modesOfTransport: ['plane', 'train', 'boat', 'car', 'coach', 'other'],
                    otherTransportMode: 'jogging all the way'
                }
            })

        })
        
    })


    describe('errors out', function () {

        context('when none of the form fields are filled', function () {

            var pageElements

            Shared.setup('isomorphic form stubs for module', './src/pages/step3/Step3Page')
            Shared.setup('monkey-patch')

            before(function () {
                pageElements = buildPageElements(this.mix.renderComponent())
                IsomorphicFormTest.Simulate.submit(pageElements.getSubmitButton())
            })


            it('should have validation errors on mandatory fields', function () {
                expect(pageElements.getModesOfTransportErrorMessage().innerHTML).to.be.equal('Tell us your favorite modes of transport')
                expect(pageElements.getOtherTransportModeErrorMessage()).to.be.null
            })

            it('should have summary for validation errors', function () {
                expect(pageElements.getSummaryErrors()).to.not.be.null
            }) 

            Shared.behaviour('should not POST the form data to the server')
            Shared.behaviour('should not transition to next route')
        })

    })

})
