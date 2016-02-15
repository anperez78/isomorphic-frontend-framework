"use strict";

var React = require('react/addons')
var IsomorphicFormDataHolder = require('../../src/common/ui/form/IsomorphicFormDataHolder')

describe('IsomorphicFormMixIn component', () => {

    describe('DataHolder component', () => {

        context('when constructed with a full data', () => {

            var data = {
                sessionData: {
                    form1: {field1: "data"}
                },
                auxiliaryData: {
                    auxiliaryData1: "auxiliaryData"
                },
                formName: "formName"
            }

            var DataHolder = new IsomorphicFormDataHolder(data)

            context('getSessionData method', () => {

                it('should return the session data', () => {
                    expect(DataHolder.getSessionData()).to.equal(data.sessionData)
                })
            })

            context('getAuxiliaryData method', () => {

                it('should return the auxiliary data', () => {
                    expect(DataHolder.getAuxiliaryData()).to.equal(data.auxiliaryData)
                })
            })

            context('getFormName method', () => {

                it('should return the form name', () => {
                    expect(DataHolder.getFormName()).to.equal(data.formName)
                })
            })

            context('getFormData method', () => {

                it('should return the form data', () => {
                    expect(DataHolder.getFormData()).to.equal(data.sessionData[data.formName])
                })
            })

            context('getData method', () => {

                it('should return the full data', () => {
                    expect(DataHolder.getData()).to.eql(data)
                })
            })

        })

        context('when constructed with no data', () => {

            var DataHolder = new IsomorphicFormDataHolder()

            context('getSessionData method', () => {

                it('should return null', () => {
                    expect(DataHolder.getSessionData()).to.be.null
                })
            })

            context('getAuxiliaryData method', () => {

                it('should return null', () => {
                    expect(DataHolder.getAuxiliaryData()).to.be.null
                })
            })

            context('getFormName method', () => {

                it('should return null', () => {
                    expect(DataHolder.getFormName()).to.be.null
                })
            })

            context('getFormData method', () => {

                it('should return null', () => {
                    expect(DataHolder.getFormData()).to.be.null
                })
            })

            context('getData method', () => {

                it('should return null', () => {
                    expect(DataHolder.getData()).to.be.eql({})
                })
            })

        })

        context('when constructed manually with the setters', () => {

            var data = {
                sessionData: {
                    form1: {field1: "data"}
                },
                auxiliaryData: {
                    auxiliaryData1: "auxiliaryData"
                },
                formName: "formName"
            }

            var DataHolder = new IsomorphicFormDataHolder()
                .setSessionData(data.sessionData)
                .setAuxiliaryData(data.auxiliaryData)
                .setFormName(data.formName)

            context('getSessionData method', () => {

                it('should return the session data', () => {
                    expect(DataHolder.getSessionData()).to.equal(data.sessionData)
                })
            })

            context('getAuxiliaryData method', () => {

                it('should return the auxiliary data', () => {
                    expect(DataHolder.getAuxiliaryData()).to.equal(data.auxiliaryData)
                })
            })

            context('getFormName method', () => {

                it('should return the form name', () => {
                    expect(DataHolder.getFormName()).to.equal(data.formName)
                })
            })

            context('getFormData method', () => {

                it('should return the form data', () => {
                    expect(DataHolder.getFormData()).to.equal(data.sessionData[data.formName])
                })
            })

            context('getData method', () => {

                it('should return the full data', () => {
                    expect(DataHolder.getData()).to.eql(data)
                })
            })

        })

        context('when constructed manually with the setters without form name', () => {

            var data = {
                sessionData: {
                    form1: {field1: "data"}
                }
            }

            var DataHolder = new IsomorphicFormDataHolder()
                .setSessionData(data.sessionData)

            context('getFormData method', () => {

                it('should return null', () => {
                    expect(DataHolder.getFormData()).to.be.null
                })
            })

        })

        context('when constructed manually with setFormData ', () => {

            var data = {
                sessionData: {
                    form1: {field1: "data"}
                }
            }

            var DataHolder = new IsomorphicFormDataHolder()
                .setFormData('form1', data.sessionData.form1)

            context('getFormData method', () => {

                it('should return the full data', () => {
                    expect(DataHolder.getData()).to.eql(data)
                })
            })

        })

    })


})
