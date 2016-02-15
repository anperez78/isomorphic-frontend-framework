'use strict';

var React=require('react')
var forms = require('newforms')
var _ = require('lodash')
var Global = require('../../common/Global')
var CheckboxSelectMultipleWidget = require('../../common/ui/widget/CheckboxSelectMultipleWidget')
var Render = require('../../common/ui/render/Render')
var CharField = require('../../common/ui/field/CharField')
var env = require('../../common/utils/env')

var Step3Form = forms.Form.extend({

    modesOfTransport: forms.MultipleChoiceField({
        validation: {on: 'change'},
        label: "Choose your favorite modes of transport",
        helpText: "Select all that apply",
        choices: _.map(Global.getConfig().client.transportMode, mode => {return [mode.value, mode.description]}),
        widget: CheckboxSelectMultipleWidget,
        errorMessages: {required: 'Tell us your favorite modes of transport'}
    }),

    otherTransportMode: CharField({
        label: "If other",
        maxLength: 44,
        required: false,
        errorMessages: {required: 'Tell us which other mode of transport you\'ll like'}
    }),

   
    cleanOtherTransportMode(callback) {
        if (_.contains(this.cleanedData.modesOfTransport, 'other') && (this.cleanedData.otherTransportMode ==='') ) {
            throw forms.ValidationError('Tell us which other mode of transport you\'ll use')
        }
        callback(null)
    },

    renderOtherModeOfTransportSection(bfo, isHidden) {
        var sectionStyle = isHidden ? {'display': 'none'} : {}
        return (
            <div id="other-mode-of-transport-section" className="panel-indent" style={sectionStyle}>
                {Render.section({body: Render.field(bfo.otherTransportMode)})}
            </div>
        )
    },

    render() {

        var bfo = this.boundFieldsObj()

        var isOtherModeOfTransportSectionHidden = function() {
            return (env.CLIENT && !(_.contains(bfo.modesOfTransport.value(), 'other')))
        }

        var OtherModeOfTransportSection =
            this.renderOtherModeOfTransportSection.call(this, bfo, isOtherModeOfTransportSectionHidden())

        return <div>
            {Render.section({body: Render.field(bfo.modesOfTransport)})}
            {OtherModeOfTransportSection}
        </div>

    }

})

module.exports = {
    Step3Form
}