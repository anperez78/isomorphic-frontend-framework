'use strict';

var _ = require("lodash")

var IsomorphicFormDataHolder = function (data) {
    this.data = data || {}

    this.setSessionData = function (sessionData) {
        this.data.sessionData = sessionData
        return this
    }

    this.getSessionData = function () {
        return this.data.sessionData ? this.data.sessionData : null
    }

    this.setAuxiliaryData = function (auxiliaryData) {
        this.data.auxiliaryData = auxiliaryData
        return this
    }

    this.getAuxiliaryData = function () {
        return this.data.auxiliaryData ? this.data.auxiliaryData : null
    }

    this.setFormName = function (formName) {
        this.data.formName = formName
        return this
    }

    this.setFormData = function (formName, data) {
        var formData = {}
        formData[formName] = data
        return this.setSessionData(_.extend({}, this.data.sessionData, formData))
    }

    this.getFormName = function () {
        return this.data.formName ? this.data.formName : null
    }

    this.getFormData = function () {
        if (!this.getFormName()) {
            return null
        }
        if (!this.data.sessionData) {
            return null
        }
        return this.data.sessionData[this.getFormName()]
    }

    this.getData = function () {
        return this.data
    }

    this.setData = function (data) {
        this.data = data || {}
        return this
    }
}

module.exports = IsomorphicFormDataHolder
