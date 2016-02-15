'use strict';

var React = require('react')
var changeCase = require('change-case')

function section(args) {
    var title, description, body, helpText
    if (args.title) {
        title = <span className="form-label-bold">{args.title}</span>
    }

    if (args.description) {
        description = args.description
    }

    if(args.helpText) {
        helpText = <span className="form-hint">{args.helpText}</span>
    }

    if (args.body) {
        body = args.body
    }
    
    return (
        <div>
            {title}
            {description}
            {helpText}
            {body}
        </div>
    )
}

function field(bf) {
    var fieldId = "form-group-" + changeCase.paramCase(bf.name)
    var fieldClass = bf.status()
    var fieldStyle = bf.isHidden() ? {'display': 'none'} : {}

    var errorMessageId = bf.name + '-error'
    var errors = bf.errors().messages().map(message => <span id={errorMessageId} className="error-message">{message}</span>)

    var fieldName, helpText, description, composition

    if (bf.helpText) {
        helpText = <span className="form-hint">{bf.helpText}</span>
    }

    if (bf.field.custom && bf.field.custom.description) {
        description =  <p>{bf.field.custom.description}</p>
    }

    if (bf.label) {
        var labelClass = bf.field.cssClass ? bf.field.cssClass :"form-label-bold"
        fieldName = <span className={labelClass}>{bf.label}</span>
    }

    // radio buttons, checkboxes and select all have 'choices' attribute on the field
    if(bf.field.widget.choices){
        composition = <fieldset id={fieldId} className={'form-group ' + fieldClass} style={fieldStyle}>
            <legend htmlFor={bf.autoId()}>
                {fieldName}
                {helpText}
                {errors}
            </legend>
            {description}
            {bf.asWidget()}
        </fieldset>
    } else {
        composition = <div id={fieldId} className={'form-group ' + fieldClass} style={fieldStyle}>
            <label htmlFor={bf.autoId()}>
                {fieldName}
                {helpText}
                {errors}
            </label>
            {description}
            {bf.asWidget()}
        </div>
    }

    return composition
}

module.exports = {field, section}