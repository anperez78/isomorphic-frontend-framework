'use strict';

var forms = require('newforms')
var _ = require('lodash')

/**
 * An HTML <input type="email"> widget.
 * @constructor
 * @extends {EmailInput}
 * @param {Object=} kwargs
 */
var EmailWidget = forms.EmailInput.extend({
    constructor: function EmailWidget(kwargs) {
        if (!(this instanceof EmailWidget)) { return new EmailWidget(kwargs) }

        // Ensure we have something in attrs
        kwargs = _.extend({attrs: null}, kwargs)
        // Provide default class attribute. _off is required though is not a standard value. Otherwise, google chrome ignores.
        kwargs.attrs = _.extend({className: 'form-control', autoComplete:'_off'}, kwargs.attrs)
        forms.EmailInput.call(this, kwargs)
    }
})

module.exports = EmailWidget