'use strict';

var React = require('react')
var {Step2Form} = require('./Step2Form')
var IsomorphicForm = require('../../common/ui/form/IsomorphicForm')
var {IsomorphicFormMixIn} = require('../../common/ui/form/IsomorphicFormMixIn')
var titleText = "Contact information"

var Step2Page = React.createClass({
    mixins: [IsomorphicFormMixIn],

    statics: {
        title: titleText,
        formName: 'Step2Form',
        nextRoute: 'step3'
    },

    render() {
        return (
            <div>
                <h3>{titleText}</h3>
                <IsomorphicForm form={Step2Form}>
                    <button type="submit" className="button">Next</button>
                </IsomorphicForm>
            </div>
        )
    }
})
module.exports = Step2Page


