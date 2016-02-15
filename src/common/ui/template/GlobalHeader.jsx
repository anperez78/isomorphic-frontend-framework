'use strict';

var React = require('react')

var GlobalHeader = React.createClass({

  render() {
    return (
      <header role="banner">
        <div id="logo">
          <img src="/application/img/react-logo.png" width="" height="36" /> 
          <h1>Demo</h1>
        </div>
      </header>
    )
  }
})

module.exports = GlobalHeader


