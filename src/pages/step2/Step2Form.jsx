'use strict';

var React=require('react')
var forms = require('newforms')
var CharField = require('../../common/ui/field/CharField')
var Render = require('../../common/ui/render/Render')
var EmailField = require('../../common/ui/field/EmailField')

var Step2Form = forms.Form.extend({

    contactEmail: EmailField({
        label: "Email",
        maxLength: 55,
        errorMessages: {required: 'Enter your email address', invalid: 'Check you\'ve entered the correct email address'}
    }),

    confirmContactEmail: EmailField({
        label: "Confirm email",
        maxLength: 55,
        errorMessages: {required: 'Enter your email address', invalid: 'Check you\'ve entered the correct email address'}
    }),

    contactPhone: CharField({
        label: "Phone number",
        maxLength: 29,
        errorMessages: {required: 'Enter the phone number to contact you on'}
    }),

    cleanContactEmail(callback) {
        callback(null)
    },

    cleanConfirmContactEmail(callback) {
        if (this.cleanedData.contactEmail &&
            this.cleanedData.confirmContactEmail &&
            this.cleanedData.contactEmail != this.cleanedData.confirmContactEmail) {
            throw forms.ValidationError('Enter a matching email address')
        }
        callback(null)
    },   

    cleanContactPhone(callback) {
        callback(null)
    },

    render() {
        var bfo = this.boundFieldsObj()
        return (<div>
            
            {Render.section({
                body: Render.field(bfo.contactEmail)
            })}
            
            {Render.section({
                body: Render.field(bfo.confirmContactEmail)
            })}
            
            {Render.section({
                body: Render.field(bfo.contactPhone)
            })}
        </div>)

    }
})
module.exports = {
    Step2Form
}