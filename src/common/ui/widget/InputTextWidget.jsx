
'use strict';

var forms = require('newforms')
var _ = require('lodash')

/**
 * An HTML <input type="text"> widget.
 * @constructor
 * @extends {TextInput}
 * @param {Object=} kwargs
 */
var InputTextWidget = forms.TextInput.extend({
    constructor: function InputTextWidget(kwargs) {
        if (!(this instanceof InputTextWidget)) { return new InputTextWidget(kwargs) }

        // Ensure we have something in attrs
        kwargs = _.extend({attrs: null}, kwargs)
        // Provide default class attribute.  _off is required though is not a standard value. Otherwise, google chrome ignores.
        kwargs.attrs = _.extend({className: 'form-control', autoComplete: '_off'}, kwargs.attrs)
        forms.TextInput.call(this, kwargs)
    }
})

module.exports = InputTextWidget