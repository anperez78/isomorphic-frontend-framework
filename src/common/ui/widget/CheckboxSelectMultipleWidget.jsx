'use strict';

var forms = require('newforms')
var _ = require('lodash')
var React = require('react')

/**
 * An HTML CheckboxSelectMultiple widget.
 * @constructor
 * @extends {TextInput}
 * @param {Object=} kwargs
 */
var CheckboxSelectMultipleWidget = forms.CheckboxSelectMultiple.extend({
    constructor: function CheckboxWidget(kwargs) {
        if (!(this instanceof CheckboxSelectMultipleWidget)) {
            return new CheckboxSelectMultipleWidget(kwargs)
        }

        // Ensure we have something in attrs
        kwargs = _.extend({attrs: null}, kwargs)
        // Provide default class attribute
        forms.CheckboxSelectMultiple.call(this, kwargs)
    },

    renderer: forms.CheckboxFieldRenderer.extend({
        render: function () {
            var checkboxWidget = this.choiceInputs().map(function (input) {
                var classList = "block-label"
                if(input.choiceValue === input.value){
                    classList = classList + " selected"
                }
                return <label className={classList} htmlFor={input.id}>
                    {input.tag()}
                    {input.choiceLabel}
                </label>
            })
            return <div className="form-group form-group-compound default">
                {checkboxWidget}
            </div>
        }
    })
})

module.exports = CheckboxSelectMultipleWidget