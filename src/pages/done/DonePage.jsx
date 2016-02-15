'use strict';

var React = require('react')
var titleText = "Your application has been processed"
var DonePage = React.createClass({

    statics: {
        title: titleText
    },

    render() {
        return (
            <div>
                <h3>{titleText}</h3>
                <p>Well done!</p>
            </div>
        )
    }
})
module.exports = DonePage


