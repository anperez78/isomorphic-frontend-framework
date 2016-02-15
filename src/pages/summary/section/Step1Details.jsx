'use strict';

var React = require('react'),
    {Navigation} = require('@insin/react-router')


var Step1Details = React.createClass({
  mixins: [Navigation],

  getDefaultProps() {
    return {
      step1Form: {}
    }
  },

  render() {
    var data = this.props

    console.log ('data', data)
    
    var fallbackText = 'Not provided'
    var firstName = data.step1Form.firstName || fallbackText
    var lastName = data.step1Form.lastName || fallbackText
    var birthCity = data.step1Form.birthCity || fallbackText
    var birthDate = data.step1Form.birthDate || fallbackText

    return (<table>
        <thead>
          <tr>
              <td><h3>Your details</h3></td>
              <td><a href={this.makeHref('step1')}>Edit your details</a></td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="header">First and middle names:</td>
            <td>{firstName}</td>
          </tr>
          <tr>
            <td>Last name:</td>
            <td>{lastName}</td>
          </tr>
          <tr>
              <td>Birth date:</td>
              <td>{birthDate}</td>
          </tr>
          <tr>
              <td>Birth city or town:</td>
              <td>{birthCity}</td>
          </tr>
        </tbody>
    </table>
  )}

})

module.exports = Step1Details


