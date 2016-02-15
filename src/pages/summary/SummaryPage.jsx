'use strict';

var React = require('react')
var {Navigation} = require('@insin/react-router')
var RestClientPromise = require('superagent-bluebird-promise')
var Global = require('../../common/Global')
var Step1Details = require('./section/Step1Details')
var Step2Details = require('./section/Step2Details')
var Step3Details = require('./section/Step3Details')
var logger = require('../../common/utils/logs/logger').getLogger('SummaryPage')

var SummaryPage = React.createClass({
    mixins: [Navigation],
    forceRedirect: true,

    propTypes: {
        data: React.PropTypes.object,
        errors: React.PropTypes.object
    },

    statics: {
      getTitle(props, params) {
          return 'Summary'
      },

      fetchData(params, cb) {

        var token = params['token']
        RestClientPromise.get(Global.getSessionApiBaseUrl(token) + '/form').then(
            function(res) {
              cb(null, {formData: res.body})
            },
            function(err) {
              logger.error(err)
              cb(err, null)
            }
        )

      }
    },

    getDefaultProps() {
        return {
            data: {}
        }
    },


    render() {
        var {formData} = this.props.data
        
        return <div className="summaryPage">
            <h3>Confirm the information that you''ve provided is correct</h3>

            <Step1Details step1Form={formData.Step1Form} /><br />

            <Step2Details step2Form={formData.Step2Form} /><br />

            <Step3Details step3Form={formData.Step3Form} />

            <a className="button" href="/data/confirm">Confirm</a>
        </div>
    }
})

module.exports = SummaryPage