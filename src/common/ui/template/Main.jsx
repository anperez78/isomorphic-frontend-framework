'use strict';

var React = require('react')
var {RouteHandler} = require('@insin/react-router')

var Global = require('../../Global')

var GlobalHeader = require('./GlobalHeader')
var GlobalFooter = require('./GlobalFooter')
var GlobalError = require('./GlobalError')

var App = React.createClass({
  statics: {
    title: Global.getConfig().title
  },

  getInitialState() {
    return {
      server: true
    }
  },

  componentDidMount() {
    this.setState({server: false})
  },

  render() {
    return <main id="main">
      <GlobalHeader />
      <div  id="content" role="main">
          <div className="mainContent">  
            <RouteHandler {...this.props} />
          </div>
      </div>
      <GlobalFooter />
      <GlobalError />
    </main>
  }
})

module.exports = App