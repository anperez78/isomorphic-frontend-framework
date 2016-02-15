'use strict';

var React = require('react')
var forms = require('newforms')
var moment = require('moment')
var _ = require('lodash')

var DateField = React.createClass({

    /**
     * Workaround for Chrome where maxlength is ignored on <input type="number"> by design
     *
     * In Chrome if the value of the type attribute is text, email, search, password, tel, or url, the attribute
     * maxlength specifies the maximum number of characters (in Unicode code points) that the user can enter;
     * for other control types it is ignored.
     */
    handleChange: function (event) {
        var field = this.props.field.props
        event.target.value = event.target.value.substr(0, field.maxLength)
    },

    render() {
        var field = this.props.field.props
        var fieldClass = "group" + " date-field-" + field.label.toLowerCase()

        return (
            <div className={fieldClass}>
                <label htmlFor={field.name}>
                    {field.label}
                </label>
                <input type={field.type} name={field.name} id={field.name} defaultValue={field.defaultValue} className="form-control" maxLength={field.maxLength} onChange={this.handleChange} />
            </div>
        )
    }
})

var SplitDateWidget = forms.MultiWidget.extend({
    constructor: function SplitDateWidget(kwargs) {
        if (!(this instanceof SplitDateWidget)) {
            return new SplitDateWidget(kwargs)
        }

        kwargs = _.extend({}, kwargs)

        var widgets
        if (kwargs.widgets) {
            widgets = kwargs.widgets
        } else {
            widgets = [

                forms.NumberInput({attrs: {label: "Day", maxLength: 2}}),
                forms.NumberInput({attrs: {label: "Month", maxLength: 2}}),
                forms.NumberInput({attrs: {label: "Year", maxLength: 4}})]
        }

        forms.MultiWidget.apply(this, [widgets, kwargs.attrs])
    },

    decompress: function (value) {

        var momentDate = moment(value, 'DD-MM-YYYY')

        if (momentDate.isValid()) {
            return [
                momentDate.date(),
                momentDate.month() + 1, // Make month 1-based for display
                momentDate.year()
            ]
        }
        else {
            return ['', '', '']
        }

    },

    formatOutput: function (renderedWidgets) {
        return <fieldset className="inline">
            {renderedWidgets.map(dateBox => <DateField field={dateBox}/>)}
        </fieldset>
    },

    valueFromData: function (data, files, name) {
        var parts = this.widgets.map(function (widget, i) {
            var value = widget.valueFromData(data, files, name + '_' + i)
            return value
        })

        if (_.all(parts, function (part) {
                return !part
            })) {
            // All parts are either undefined, empty string or null
            return null
        }

        parts.reverse() // [d, m, y] => [y, m, d]
        var dateStamp = parts.join('-')
        return dateStamp
    }
})

module.exports = SplitDateWidget
