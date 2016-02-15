'use strict';

var forms = require('newforms')
var EmailWidget = require('../widget/EmailWidget')

var EmailField = forms.EmailField.extend({
    widget: EmailWidget

    , constructor: function EmailField(kwargs) {
        if (!(this instanceof EmailField)) { return new EmailField(kwargs) }
        forms.EmailField.call(this, kwargs)
    }
})

module.exports = EmailField