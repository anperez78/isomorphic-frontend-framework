'use strict';

var forms = require('newforms')
var InputTextWidget = require('../widget/InputTextWidget')

var CharField = forms.CharField.extend({
    widget: InputTextWidget

    , constructor: function CharField(kwargs) {
        if (!(this instanceof CharField)) { return new CharField(kwargs) }
        forms.CharField.call(this, kwargs)
    }
})

module.exports = CharField