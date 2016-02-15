'use strict';

var React = require('react')
var _ = require('lodash')

var SummaryErrors = React.createClass({

    printErrorMessages: function() {

        var someMessages = (this.props.messages.length > 0)
        var notDisabled = (typeof(this.props.disabled) === 'undefined' || this.props.disabled === 'false')

        if (someMessages && notDisabled) {
            return (
                <div id="validationSummary">
                    <h2>Please check the form</h2>
                    <ul>{
                        _.map (this.props.messages, function(errorMessage) {
                            var errorMessageId = '#' + errorMessage.field + '-error'
                            return (
                                <li><a href={errorMessageId}>{errorMessage.message}</a></li>
                            )
                        })
                    }
                    </ul>
                 </div>
            )  
        }  
    },

    render() {
        return (
            <div>
                {this.printErrorMessages()}
            </div>
        )
    }
})

module.exports = SummaryErrors


