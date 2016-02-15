'use strict';

var React = require('react'),
    {Navigation} = require('@insin/react-router')

var Step2Details = React.createClass({
  mixins: [Navigation],

  getDefaultProps() {
    return {
      step2Form: {}
    }
  },

  render() {
    var data = this.props
    var fallbackText = 'Not provided'
    var email = data.step2Form.contactEmail || fallbackText
    var contactPhone = data.step2Form.contactPhone || fallbackText

    return (<table>
        <thead>
          <tr>
              <td><h3>Contact details</h3></td>
              <td><a href={this.makeHref('step2')}>Edit your details</a></td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Email:</td>
            <td>{email}</td>
          </tr>
          <tr>
            <td>Contact phone:</td>
            <td>{contactPhone}</td>
          </tr>

        </tbody>
    </table>
  )}

})

module.exports = Step2Details


