'use strict';
var _ = require('lodash')
var React = require('react'),
    {Navigation} = require('@insin/react-router')

var Step3Details = React.createClass({
  mixins: [Navigation],

  getDefaultProps() {
    return {
      step3Form: {}
    }
  },

  render() {
    var data = this.props
    var fallbackText = 'Not provided'
    var modesOfTransport
    var otherTransportMode = data.step3Form.otherTransportMode

 
    if(data.step3Form.modesOfTransport){
      modesOfTransport = _.map(data.step3Form.modesOfTransport, function(mode){
          return mode.charAt(0).toUpperCase() + mode.slice(1);
      }).join(', ')
    } else {
      modesOfTransport = fallbackText
    }

  
    var otherTransportModeSection
    if(data.step3Form.modesOfTransport.indexOf("other")>-1){
        otherTransportModeSection = <tr>
            <td>Other mode of travel:</td>
            <td>{otherTransportMode}</td>
        </tr>

    }


    return (<table>
        <thead>
          <tr>
              <td><h3>Extra details</h3></td>
              <td><a href={this.makeHref('step3')} id="id_editJourneyDetails">Edit your extra details</a></td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Mode of travel:</td>
            <td>{modesOfTransport}</td>
          </tr>
          {otherTransportModeSection}
        </tbody>
    </table>
  )}

})

module.exports = Step3Details