'use strict';

var React = require('react')
var assign = require('react/lib/Object.assign')
var _ = require('lodash')
var SummaryErrors = require('../render/SummaryErrors')

var IsomorphicForm = React.createClass({
  contextTypes: {
      router: React.PropTypes.func.isRequired,
      isomorphic: React.PropTypes.object.isRequired
  },

  propTypes: {
    component: React.PropTypes.any,
    to: React.PropTypes.string,
    params: React.PropTypes.object,
    query: React.PropTypes.object,
    autoComplete: React.PropTypes.string,
    noValidate: React.PropTypes.string,
    onSubmit: React.PropTypes.func
  },

  getDefaultProps() {
    return {
        component: 'form',
        method: 'POST',
        ref: 'form',
        autoComplete: 'off'
    }
  },

  getInitialState() {
    return {
         client: false
    }
  },

  componentWillMount() {
    this.context.isomorphic.instanciateForm(this.props.form)
  },

  getAction() {
      return ""
  },

  getErrorMessages() {
    return _.flatten(
      _.map(this.context.isomorphic.getForm().errors().errors, function (error, key) { 

          return _.map (error.data, function(validationError) {
            var errorMessage
            if (validationError.params !== null) {
              var param = validationError.params.value
              errorMessage = validationError.message.replace("{value}", param)
            }
            else {
              errorMessage = validationError.message
            }
            return {field: key , message: errorMessage }
          })
      })
    )
  },

  handleSubmit(e) {
      this.context.isomorphic.submit(e, this.refs.form)
  },

  render() {
    var props = assign({}, this.props, {
        action: this.getAction(),
        onSubmit: this.handleSubmit,
        noValidate: this.props.noValidate || this.state.client
    })

    var formElement = React.createElement(this.props.component, props,
        this.context.isomorphic.getForm().render(),
        this.props.children)

    return (
      <div>
        <SummaryErrors messages={this.getErrorMessages()} disabled={this.props.disableSummary}/>
        {formElement}
      </div>
    )
  }
})

module.exports = IsomorphicForm
