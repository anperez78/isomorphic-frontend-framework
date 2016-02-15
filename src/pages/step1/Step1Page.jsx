'use strict';

var React = require('react')
var {Step1Form} = require('./Step1Form')
var IsomorphicForm = require('../../common/ui/form/IsomorphicForm')
var {IsomorphicFormMixIn} = require('../../common/ui/form/IsomorphicFormMixIn')
var titleText = "Personal information"

var Step1Page = React.createClass({
    mixins: [IsomorphicFormMixIn],

    statics: {
        title: titleText,
        formName: 'Step1Form',
        nextRoute: 'step2'
    },

    render() {
        return (
            <div>
                <h3>{titleText}</h3>
                <IsomorphicForm form={Step1Form}>
                    <button type="submit" className="button">Next</button>
                </IsomorphicForm>
            </div>
        )
    }
})
module.exports = Step1Page


