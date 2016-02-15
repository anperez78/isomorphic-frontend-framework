'use strict';

var React = require('react')
var titleText = "An error has occurred"
var GenericErrorPage = React.createClass({
    statics: {
        title: titleText
    },
    render() {
        return (
          <div>
            <h1>
                {titleText}
            </h1>
            <p>
              We are experiencing technical problems and are unable to process your application.
            </p>
            <p>
              Please try again shortly. 
            </p>
          </div>
        )
    }
})

module.exports = GenericErrorPage