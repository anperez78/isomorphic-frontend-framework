'use strict';

var React=require('react')
var forms = require('newforms')
var CharField = require('../../common/ui/field/CharField')
var Render = require('../../common/ui/render/Render')
var SplitDateWidget = require('../../common/ui/widget/SplitDateWidget')
var Global = require('../../common/Global')
var RestClient= require('../../common/utils/RestClient')
var moment = require('moment')

var errorsMappingSwitch = function(error) {
    switch (error) {
        case 'invalid-date': return 'Enter a valid date'
        case 'date-is-in-the-future': return 'Enter a valid date in the past'
        case 'date-is-today': return 'Enter a valid date in the past'
        default: return 'Enter a valid date'
    }
}

var Step1Form = forms.Form.extend({

    firstName: CharField({
        maxLength: 35, 
        label: "First and middle names",
        errorMessages: {required: 'Tell us your first and middle names'}
    }),

    lastName: CharField({
        maxLength: 35, 
        label: "Last name",
        errorMessages: {required: 'Tell us your last name'}
    }),

    birthDate: forms.DateField({
        label: 'Date of birth',
        widget: SplitDateWidget,
        errorMessages: {required: 'Tell us your date of birth', invalid: 'Enter a valid date'}
    }),

    birthCity: CharField({
        label: "City of birth",
        maxLength: 29,
        errorMessages: {required: 'Tell us the city where you were born'}
    }),

    cleanFirstName(callback) {
        callback(null)
    },

    cleanLastName(callback) {
        callback(null)
    },

    cleanBirthDate(callback) {
        var {birthDate} = this.cleanedData
        var formattedDob = moment (birthDate).format('DDMMYYYY')
        var validationServiceUrl = Global.getValidateBirthDateServiceUrl() + '/' + formattedDob

        var promise = RestClient().get(validationServiceUrl).then(
            function (res) {
                callback(null)
            },
            function (err) {
                if (err.status === 422) {
                    var message = errorsMappingSwitch(err.body.error)
                   callback(null, forms.ValidationError(message))
                    return 'ok'
                }
            })
        return promise.done()
    },
    cleanBirthCity(callback) {
        callback(null)
    },

    render() {
        var bfo = this.boundFieldsObj()
        return (<div>
            
            {Render.section({
                body: Render.field(bfo.firstName)
            })}
            
            {Render.section({
                body: Render.field(bfo.lastName)
            })}
            
            {Render.section({
                body: Render.field(bfo.birthDate)
            })}
            
            {Render.section({
                body: Render.field(bfo.birthCity)
            })}
            
        </div>)

    }
})
module.exports = {
    Step1Form
}