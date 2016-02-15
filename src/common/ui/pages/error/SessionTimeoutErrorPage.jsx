'use strict';

var React = require('react')

var SessionTimeoutErrorPage = React.createClass({
    statics: {
        title: 'Your session has expired'
    },
    render() {
        return (
            <div>
                <h2 className="heading-large">Your application has timed out</h2>

                <p>Your session has timed out and unfortunately any data you entered has been lost. 
                Please, <a href='/'>apply</a> again.</p>
            </div>
        )
    }
})

module.exports = SessionTimeoutErrorPage