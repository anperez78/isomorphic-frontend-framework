'use strict';

var React = require('react')
var {Step3Form} = require('./Step3Form')
var IsomorphicForm = require('../../common/ui/form/IsomorphicForm')
var {IsomorphicFormMixIn} = require('../../common/ui/form/IsomorphicFormMixIn')
var titleText = "Extra details"

var Step3Page = React.createClass({
    mixins: [IsomorphicFormMixIn],

    statics: {
        title: titleText,
        formName: 'Step3Form',
        nextRoute: 'summary'
    },

    render() {
        return (
            <div>
                <h3>{titleText}</h3>
                <IsomorphicForm form={Step3Form}>
                    <button type="submit" className="button">Next</button>
                </IsomorphicForm>
            </div>
        )
    }
})

module.exports = Step3Page