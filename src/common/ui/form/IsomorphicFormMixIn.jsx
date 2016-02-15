'use strict';

var React = require('react')
var RestClient = require('../../utils/RestClient')
var {ErrorObject} = require('newforms')
var Global = require('../../Global')
var logger = require('../../utils/logs/logger').getLogger('IsomorphicFormMixin')
var IsomorphicFormDataHolder = require('./IsomorphicFormDataHolder')
var async = require('async')
var env = require('../../utils/env')
var modernizr = require('../../utils/modernizr')

var getErrorObject = function (errors) {
    if (!errors) {
        errors = this.props.errors
    }
    return errors ? ErrorObject.fromJSON(errors) : null
}

var getRouteName = function (nextRoute, transition, params, query, req) {
    if (typeof nextRoute === 'function') {
        return nextRoute(transition, params, query, req)
    }
    return nextRoute
}

var IsomorphicFormMixIn = {
    propTypes: {
        data: React.PropTypes.object,
        errors: React.PropTypes.object
    },

    contextTypes: {
        router: React.PropTypes.func.isRequired
    },

    childContextTypes: {
        isomorphic: React.PropTypes.object.isRequired
    },

    statics: {
        fetchData(params, cb) {

            var fetchSessionData = function (params, callback) {
                var promise = RestClient().get(Global.getSessionApiBaseUrl(params.token) + '/form').then(
                    function (res) {
                        callback(null, new IsomorphicFormDataHolder()
                            .setSessionData(res.body)
                            .setFormName(formName)
                            .getData())
                    },
                    function (err) {
                        if (err.res && err.res.serverError) {
                            logger.error('fetchData - serverError - ' + err.res.body)
                            callback(err.res.body, null)
                            return 'ok'
                        }
                        else if (err.res && err.res.notFound) {
                            logger.error('fetchData - notFound')
                            callback(err.res.body, null)
                            return 'ok'
                        }
                        else {
                            logger.error('fetchData - error occurred', err)
                            callback(err, null)
                            return 'ok'
                        }
                    })

                return promise.done()
            }

            var fetchAuxiliaryData = this.handler.fetchAuxiliaryData
            var formName = this.handler.formName

            var tasks = [
                function (callback) {
                    fetchSessionData(params, callback)
                }]

            if (typeof fetchAuxiliaryData === 'function') {
                tasks.push(function (data, callback) {
                    fetchAuxiliaryData(params, data, callback)
                })
            }

            async.waterfall(tasks,
                function (err, data) {
                    cb(err, data)
                });
        },

        willTransitionTo(transition, params, query, cb, req) {

            if (req.method != 'POST') {
                return cb()
            }

            var redirectTo = function(route, redirect) {
                if(redirect && env.CLIENT) {
                    window.location.replace(route)
                } else {
                    transition.redirect(route)
                }
            }

            if (typeof this.handler.beforeNextRoute == 'function') {
                this.handler.beforeNextRoute(transition, params, query, req)
            }

            if (typeof this.handler.formName === 'undefined') {
                throw Error('Undefined form: form must be specified in the React component as statics')
            }

            var formName = this.handler.formName
            var forceRedirect = this.handler.forceRedirect

            var promise = RestClient().post(Global.getSessionApiBaseUrl(req.token) + '/form/' + formName)
                .send(req.body)
                .then(
                function (res) {

                    if (typeof this.handler.nextRoute === 'undefined') {
                        throw Error('Undefined nextRoute: nextRoute must be specified in the React component as statics')
                    }

                    var route = getRouteName(this.handler.nextRoute, transition, params, query, req)

                    if ( typeof(route) === 'string' ) {
                        redirectTo(route, forceRedirect)
                        cb()
                    }
                    else {
                        route.then(function (route) {
                            redirectTo(route, forceRedirect)
                            cb()
                        })
                    }

                }.bind(this),
                function (err) {

                    if (err.res && err.res.clientError) {
                        var errors;
                        var formErrors = err.res.body.error
                        if (typeof formErrors !== 'undefined') {
                            errors = formErrors
                        }
                        else {
                            errors = err.res.body
                        }

                        if (errors === 'missing-session') {
                            return
                        }

                        logger.error('willTransitionTo - session post - ' + errors)

                        transition.redirect(transition.path.split('?')[0], {}, {}, {
                            data: new IsomorphicFormDataHolder()
                                .setFormData(formName, req.body)
                                .setFormName(formName)
                                .getData(),
                            errors: errors
                        })
                        cb()
                        return 'ok'
                    }
                })
            return promise.done()
        }
    },

    getInitialState() {
        return {
            client: false
        }
    },

    componentDidMount() {
        this.setState({client: true})
    },

    componentWillReceiveProps(nextProps) {
        if (nextProps.errors) {
            var errorObject = getErrorObject.call(this, nextProps.errors)
            this.state.form.setErrors(errorObject)
        }
    },

    getErrorMessagesFromForm (formName) {
        var form = this.refs[formName]
        var errorMessagesArray = []
        if (typeof(form) !== 'undefined') {
            errorMessagesArray = form.getErrorMessages()
        }
        return errorMessagesArray
    },

    getChildContext() {
        var instanciateForm = function (form) {
            var data = new IsomorphicFormDataHolder(this.props.data)
            this.state.form = new form({
                validation: 'manual',
                onChange: this.forceUpdate.bind(this),
                initial: data.getFormData(),
                errors: getErrorObject.call(this),
                sessionData: data.getSessionData(),
                auxiliaryData: data.getAuxiliaryData()
            })
        }

        var getForm = function () {
            return this.state.form
        }

        var submit = function (e, form) {

            // If the browser doesn't support history management (ex. <IE9), routing needs to be done server side
            // hence we submit the form normally with an old fashion HTTP POST.
            if (!modernizr.supportsHistory()) {
                return
            }

            e.preventDefault()
            this.state.form.validate(form, (err, isValid) => {

                if (isValid) {
                    this.context.router.transitionTo(this.context.router.getCurrentPathname(), {}, {}, {
                        method: 'POST',
                        body: this.state.form.data
                    })
                }
                else {
                    Global.scrollToTop()
                    if (err && Object.prototype.toString.call(err) === '[object Error]') {
                        throw err
                    }
                    else if (err) {
                        throw new Error(err)
                    }
                }
                    
            })
        }

        return {
            isomorphic: {
                instanciateForm: instanciateForm.bind(this),
                getForm: getForm.bind(this),
                submit: submit.bind(this)
            }
        }
    }
}

module.exports = {
    IsomorphicFormMixIn
}
