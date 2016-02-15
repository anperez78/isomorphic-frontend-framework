(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

require('setimmediate')

var React = require('react')
var assign = require('react/lib/Object.assign')
var Router = require('@insin/react-router')

var fetchData = require('./common/utils/fetchData')
var getTitle = require('./common/utils/getTitle')
var routes = require('./routes')

var Global = require('./common/Global')
var logger = require('./common/utils/logs/logger').getLogger('client')

var appDiv = document.getElementById('app')

window.onerror = function (error, url, lineNumber, column, errorObj) {
    logger.fatalException({
        "msg": "Exception!",
        "errorMsg": error,
        "url": url,
        "line number": lineNumber,
        "column": column
    }, errorObj)
    if (error.indexOf('missing-session') > -1) {
        document.location = '/session-timeout'
    }
    else {
        document.location = '/generic-error'
    }
}

var router = Router.create({
    routes: routes,
    location: Router.HistoryLocation,
    onError:function(err) {
        logger.error('React.onError', err)
        if (err.hasOwnProperty('error')) {
            switch (err.error) {
                case 'missing-session':
                    Global.deleteCookie('accessToken')
                    document.location = '/session-timeout'
                    break
                default:
                    throw err
            }
        }
    }
})

router.run(function(Handler, state)  {
    var accessToken = Global.getCookie('accessToken')
    fetchData(accessToken, state.routes, state.params, function(err, fetchedData)  {
        var props = assign({}, fetchedData, state.data)
        React.render(React.createElement(Handler, React.__spread({},  props)), appDiv)
        document.title = getTitle(state.routes, state.params, props)
    })
})
},{"./common/Global":2,"./common/utils/fetchData":24,"./common/utils/getTitle":25,"./common/utils/logs/logger":27,"./routes":40,"@insin/react-router":"@insin/react-router","react":"react","react/lib/Object.assign":"react/lib/Object.assign","setimmediate":"setimmediate"}],2:[function(require,module,exports){
'use strict';

var React = require('react')
var env = require('./utils/env')

var Global = React.createClass({displayName: "Global",

    statics: {
        getConfig:function() {
            if (env.CLIENT) {
                if (typeof window['__CONFIG__'] === 'undefined') {
                    throw Error('Client configuration not set up properly.')
                }
                return window['__CONFIG__']
            } else {
                return require('config')
            }
        },

        getBaseUrl:function() {
            return env.SERVER ? 'http://'+ this.getConfig().common.host + ':' + this.getConfig().common.port : ''
        },

        getApiBaseUrl:function() {
            return this.getBaseUrl() + this.getConfig().common.apiBasePath
        },

        getValidateBirthDateServiceUrl:function() {
            return env.SERVER ? this.getConfig().server.validateBirthDateServiceUrl : this.getConfig().client.validateBirthDateServiceUrl
        },

        getCookie:function(cname) {
            if (env.SERVER ) {
                throw Error("Cannot retrieve cookie in non-browser environments (i.e. NodeJs environment). " +
                            "No window object exits.")
            }
            var name = cname + "=";
            var ca = document.cookie.split(';');
            for(var i=0; i<ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0)==' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) === 0) {
                    return c.substring(name.length,c.length);
                }
            }
            return "";
        },

        deleteCookie:function(cname) {
            if (env.SERVER ) {
                throw Error("Cannot retrieve cookie in non-browser environments (i.e. NodeJs environment). " +
                            "No window object exits.")
            }
            document.cookie = cname + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        },

        getAccessToken:function(accessToken){
            if(env.SERVER){
                return accessToken
            }
            return this.getCookie('accessToken', document)
        },

        getSessionApiBaseUrl:function(accessToken) {
            var url = (this.getApiBaseUrl() + "/session")
            if(env.SERVER || this.getConfig().client.injectSessionIdInURL) {
                url = (url + "/" + this.getAccessToken(accessToken))
            }
            return url
        },

        scrollToTop:function() {
            if (env.CLIENT) {
                window.scrollTo(0,0)
            }
        },

    },

    shouldComponentUpdate:function() {
        return false;
    },

    render:function() {
        return React.createElement("span", null)
    }
});

module.exports = Global;

},{"./utils/env":23,"config":41,"react":"react"}],3:[function(require,module,exports){
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
},{"../widget/InputTextWidget":19,"newforms":"newforms"}],4:[function(require,module,exports){
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
},{"../widget/EmailWidget":18,"newforms":"newforms"}],5:[function(require,module,exports){
'use strict';

var React = require('react')
var assign = require('react/lib/Object.assign')
var _ = require('lodash')
var SummaryErrors = require('../render/SummaryErrors')

var IsomorphicForm = React.createClass({displayName: "IsomorphicForm",
  contextTypes: {
      router: React.PropTypes.func.isRequired,
      isomorphic: React.PropTypes.object.isRequired
  },

  propTypes: {
    component: React.PropTypes.any,
    to: React.PropTypes.string,
    params: React.PropTypes.object,
    query: React.PropTypes.object,
    autoComplete: React.PropTypes.string,
    noValidate: React.PropTypes.string,
    onSubmit: React.PropTypes.func
  },

  getDefaultProps:function() {
    return {
        component: 'form',
        method: 'POST',
        ref: 'form',
        autoComplete: 'off'
    }
  },

  getInitialState:function() {
    return {
         client: false
    }
  },

  componentWillMount:function() {
    this.context.isomorphic.instanciateForm(this.props.form)
  },

  getAction:function() {
      return ""
  },

  getErrorMessages:function() {
    return _.flatten(
      _.map(this.context.isomorphic.getForm().errors().errors, function (error, key) { 

          return _.map (error.data, function(validationError) {
            var errorMessage
            if (validationError.params !== null) {
              var param = validationError.params.value
              errorMessage = validationError.message.replace("{value}", param)
            }
            else {
              errorMessage = validationError.message
            }
            return {field: key , message: errorMessage }
          })
      })
    )
  },

  handleSubmit:function(e) {
      this.context.isomorphic.submit(e, this.refs.form)
  },

  render:function() {
    var props = assign({}, this.props, {
        action: this.getAction(),
        onSubmit: this.handleSubmit,
        noValidate: this.props.noValidate || this.state.client
    })

    var formElement = React.createElement(this.props.component, props,
        this.context.isomorphic.getForm().render(),
        this.props.children)

    return (
      React.createElement("div", null, 
        React.createElement(SummaryErrors, {messages: this.getErrorMessages(), disabled: this.props.disableSummary}), 
        formElement
      )
    )
  }
})

module.exports = IsomorphicForm

},{"../render/SummaryErrors":12,"lodash":"lodash","react":"react","react/lib/Object.assign":"react/lib/Object.assign"}],6:[function(require,module,exports){
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

},{"lodash":"lodash"}],7:[function(require,module,exports){
'use strict';

var React = require('react')
var RestClient = require('../../utils/RestClient')
var $__0=  require('newforms'),ErrorObject=$__0.ErrorObject
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
        fetchData:function(params, cb) {

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

        willTransitionTo:function(transition, params, query, cb, req) {

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

    getInitialState:function() {
        return {
            client: false
        }
    },

    componentDidMount:function() {
        this.setState({client: true})
    },

    componentWillReceiveProps:function(nextProps) {
        if (nextProps.errors) {
            var errorObject = getErrorObject.call(this, nextProps.errors)
            this.state.form.setErrors(errorObject)
        }
    },

    getErrorMessagesFromForm:function (formName) {
        var form = this.refs[formName]
        var errorMessagesArray = []
        if (typeof(form) !== 'undefined') {
            errorMessagesArray = form.getErrorMessages()
        }
        return errorMessagesArray
    },

    getChildContext:function() {
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
            this.state.form.validate(form, function(err, isValid)  {

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
                    
            }.bind(this))
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
    IsomorphicFormMixIn:IsomorphicFormMixIn
}

},{"../../Global":2,"../../utils/RestClient":21,"../../utils/env":23,"../../utils/logs/logger":27,"../../utils/modernizr":28,"./IsomorphicFormDataHolder":6,"async":"async","newforms":"newforms","react":"react"}],8:[function(require,module,exports){
'use strict';

var React = require('react')
var titleText = "An error has occurred"
var GenericErrorPage = React.createClass({displayName: "GenericErrorPage",
    statics: {
        title: titleText
    },
    render:function() {
        return (
          React.createElement("div", null, 
            React.createElement("h1", null, 
                titleText
            ), 
            React.createElement("p", null, 
              "We are experiencing technical problems and are unable to process your application."
            ), 
            React.createElement("p", null, 
              "Please try again shortly." 
            )
          )
        )
    }
})

module.exports = GenericErrorPage
},{"react":"react"}],9:[function(require,module,exports){
'use strict';

var React = require('react')

var NotFound = React.createClass({displayName: "NotFound",
  statics: {
    title: '404 Not Found'
  },

  render:function() {
    return React.createElement("div", {className: "not-found"}, 
      React.createElement("h2", null, "404 Not Found")
    )
  }
})

module.exports = NotFound
},{"react":"react"}],10:[function(require,module,exports){
'use strict';

var React = require('react')

var SessionTimeoutErrorPage = React.createClass({displayName: "SessionTimeoutErrorPage",
    statics: {
        title: 'Your session has expired'
    },
    render:function() {
        return (
            React.createElement("div", null, 
                React.createElement("h2", {className: "heading-large"}, "Your application has timed out"), 

                React.createElement("p", null, "Your session has timed out and unfortunately any data you entered has been lost." + ' ' + 
                "Please, ", React.createElement("a", {href: "/"}, "apply"), " again.")
            )
        )
    }
})

module.exports = SessionTimeoutErrorPage
},{"react":"react"}],11:[function(require,module,exports){
'use strict';

var React = require('react')
var changeCase = require('change-case')

function section(args) {
    var title, description, body, helpText
    if (args.title) {
        title = React.createElement("span", {className: "form-label-bold"}, args.title)
    }

    if (args.description) {
        description = args.description
    }

    if(args.helpText) {
        helpText = React.createElement("span", {className: "form-hint"}, args.helpText)
    }

    if (args.body) {
        body = args.body
    }
    
    return (
        React.createElement("div", null, 
            title, 
            description, 
            helpText, 
            body
        )
    )
}

function field(bf) {
    var fieldId = "form-group-" + changeCase.paramCase(bf.name)
    var fieldClass = bf.status()
    var fieldStyle = bf.isHidden() ? {'display': 'none'} : {}

    var errorMessageId = bf.name + '-error'
    var errors = bf.errors().messages().map(function(message)  {return React.createElement("span", {id: errorMessageId, className: "error-message"}, message);})

    var fieldName, helpText, description, composition

    if (bf.helpText) {
        helpText = React.createElement("span", {className: "form-hint"}, bf.helpText)
    }

    if (bf.field.custom && bf.field.custom.description) {
        description =  React.createElement("p", null, bf.field.custom.description)
    }

    if (bf.label) {
        var labelClass = bf.field.cssClass ? bf.field.cssClass :"form-label-bold"
        fieldName = React.createElement("span", {className: labelClass}, bf.label)
    }

    // radio buttons, checkboxes and select all have 'choices' attribute on the field
    if(bf.field.widget.choices){
        composition = React.createElement("fieldset", {id: fieldId, className: 'form-group ' + fieldClass, style: fieldStyle}, 
            React.createElement("legend", {htmlFor: bf.autoId()}, 
                fieldName, 
                helpText, 
                errors
            ), 
            description, 
            bf.asWidget()
        )
    } else {
        composition = React.createElement("div", {id: fieldId, className: 'form-group ' + fieldClass, style: fieldStyle}, 
            React.createElement("label", {htmlFor: bf.autoId()}, 
                fieldName, 
                helpText, 
                errors
            ), 
            description, 
            bf.asWidget()
        )
    }

    return composition
}

module.exports = {field:field, section:section}
},{"change-case":"change-case","react":"react"}],12:[function(require,module,exports){
'use strict';

var React = require('react')
var _ = require('lodash')

var SummaryErrors = React.createClass({displayName: "SummaryErrors",

    printErrorMessages: function() {

        var someMessages = (this.props.messages.length > 0)
        var notDisabled = (typeof(this.props.disabled) === 'undefined' || this.props.disabled === 'false')

        if (someMessages && notDisabled) {
            return (
                React.createElement("div", {id: "validationSummary"}, 
                    React.createElement("h2", null, "Please check the form"), 
                    React.createElement("ul", null, 
                        _.map (this.props.messages, function(errorMessage) {
                            var errorMessageId = '#' + errorMessage.field + '-error'
                            return (
                                React.createElement("li", null, React.createElement("a", {href: errorMessageId}, errorMessage.message))
                            )
                        })
                    
                    )
                 )
            )  
        }  
    },

    render:function() {
        return (
            React.createElement("div", null, 
                this.printErrorMessages()
            )
        )
    }
})

module.exports = SummaryErrors



},{"lodash":"lodash","react":"react"}],13:[function(require,module,exports){
'use strict';

var React = require('react')

var GlobalError = React.createClass({displayName: "GlobalError",
  render:function() {
    return React.createElement("div", {id: "global-app-error", className: "app-error hidden"})
  }
})

module.exports = GlobalError



},{"react":"react"}],14:[function(require,module,exports){
'use strict';

var React = require('react')

var GlobalFooter = React.createClass({displayName: "GlobalFooter",
  render:function() {
    return (
        React.createElement("footer", {id: "footer", role: "contentinfo"}, 
            React.createElement("div", null, 
                React.createElement("p", null, "All content is available under the ", React.createElement("a", {target: "_blank", href: "https://en.wikipedia.org/wiki/MIT_License", rel: "license"}, "MIT Licence"), ", except where otherwise stated")
            )
        )
    )   
  }
})

module.exports = GlobalFooter



},{"react":"react"}],15:[function(require,module,exports){
'use strict';

var React = require('react')

var GlobalHeader = React.createClass({displayName: "GlobalHeader",

  render:function() {
    return (
      React.createElement("header", {role: "banner"}, 
        React.createElement("div", {id: "logo"}, 
          React.createElement("img", {src: "/application/img/react-logo.png", width: "", height: "36"}), 
          React.createElement("h1", null, "Demo")
        )
      )
    )
  }
})

module.exports = GlobalHeader



},{"react":"react"}],16:[function(require,module,exports){
'use strict';

var React = require('react')
var $__0=  require('@insin/react-router'),RouteHandler=$__0.RouteHandler

var Global = require('../../Global')

var GlobalHeader = require('./GlobalHeader')
var GlobalFooter = require('./GlobalFooter')
var GlobalError = require('./GlobalError')

var App = React.createClass({displayName: "App",
  statics: {
    title: Global.getConfig().title
  },

  getInitialState:function() {
    return {
      server: true
    }
  },

  componentDidMount:function() {
    this.setState({server: false})
  },

  render:function() {
    return React.createElement("main", {id: "main"}, 
      React.createElement(GlobalHeader, null), 
      React.createElement("div", {id: "content", role: "main"}, 
          React.createElement("div", {className: "mainContent"}, 
            React.createElement(RouteHandler, React.__spread({},  this.props))
          )
      ), 
      React.createElement(GlobalFooter, null), 
      React.createElement(GlobalError, null)
    )
  }
})

module.exports = App
},{"../../Global":2,"./GlobalError":13,"./GlobalFooter":14,"./GlobalHeader":15,"@insin/react-router":"@insin/react-router","react":"react"}],17:[function(require,module,exports){
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
                return React.createElement("label", {className: classList, htmlFor: input.id}, 
                    input.tag(), 
                    input.choiceLabel
                )
            })
            return React.createElement("div", {className: "form-group form-group-compound default"}, 
                checkboxWidget
            )
        }
    })
})

module.exports = CheckboxSelectMultipleWidget
},{"lodash":"lodash","newforms":"newforms","react":"react"}],18:[function(require,module,exports){
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
},{"lodash":"lodash","newforms":"newforms"}],19:[function(require,module,exports){

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
},{"lodash":"lodash","newforms":"newforms"}],20:[function(require,module,exports){
'use strict';

var React = require('react')
var forms = require('newforms')
var moment = require('moment')
var _ = require('lodash')

var DateField = React.createClass({displayName: "DateField",

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

    render:function() {
        var field = this.props.field.props
        var fieldClass = "group" + " date-field-" + field.label.toLowerCase()

        return (
            React.createElement("div", {className: fieldClass}, 
                React.createElement("label", {htmlFor: field.name}, 
                    field.label
                ), 
                React.createElement("input", {type: field.type, name: field.name, id: field.name, defaultValue: field.defaultValue, className: "form-control", maxLength: field.maxLength, onChange: this.handleChange})
            )
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
        return React.createElement("fieldset", {className: "inline"}, 
            renderedWidgets.map(function(dateBox)  {return React.createElement(DateField, {field: dateBox});})
        )
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

},{"lodash":"lodash","moment":"moment","newforms":"newforms","react":"react"}],21:[function(require,module,exports){
'use strict';

var superagent = require('superagent-bluebird-promise')
require('./SuperagentPlugin')(superagent)

var RestClient = function () {

    superagent.on(
        function (success) {
        },
        function (err) {
            if (err && Object.prototype.toString.call(err) === '[object Error]') {
                throw err
            }
            else if (err.message && Object.prototype.toString.call(err.message) === '[object Error]') {
                throw err.message
            }
            else if (err.status && err.status >= 500) {
                if (err.body && err.body.hasOwnProperty('error')) {
                    throw new Error(err.body.error)
                }
                else {
                    throw new Error(err.body)
                }
            }
            else if (err.status && err.status === 404) {
                if (err.body && err.body.hasOwnProperty('error')) {
                    throw new Error(err.body.error)
                }
                else {
                    throw new Error('404')
                }
            }
        })
    return superagent

}
module.exports = RestClient
},{"./SuperagentPlugin":22,"superagent-bluebird-promise":"superagent-bluebird-promise"}],22:[function(require,module,exports){
'use strict';

var _ = require('lodash')

var SuperagentPlugin = function(superagent){

    var onFulfilled = function() {}
    var onRejected = function() {}

    var Request = superagent.Request

    _.extend(superagent, {
        on: function (onFulfilledCb, onRejectedCb) {
                onFulfilled = onFulfilledCb
                onRejected = onRejectedCb
            }
    })

    Request.prototype.then = function(successCb, failureCb) {

        var promise = this.promise();

        var customSuccessCallBack = function(success) {
            var ret = successCb(success)
            onFulfilled(success)
            return ret
        }

        var customFailureCallBack = function(error) {
            var ret = failureCb(error)
            if (ret !== 'ok') {
                onRejected(error)
            }
            return ret
        }

        return promise.then.call(promise, customSuccessCallBack, customFailureCallBack)
    }
}


module.exports = SuperagentPlugin
},{"lodash":"lodash"}],23:[function(require,module,exports){
'use strict';

module.exports = {
  CLIENT: typeof window != 'undefined',
  SERVER: typeof window == 'undefined'
}
},{}],24:[function(require,module,exports){
'use strict';

var assign = require('react/lib/Object.assign')
var async = require('async')

var env = require('./env')

var fetchData = function (token, routes, params, cb) {
  if (env.CLIENT && typeof window.__PROPS__ != 'undefined') {
    var props = window.__PROPS__
    delete window.__PROPS__
    return cb(null, props)
  }

  var fetchDataRoutes = routes.filter(function(route)  {return route.handler.fetchData;})
  if (fetchDataRoutes.length === 0) {
    return cb(null, {})
  }

  var dataFetchers = fetchDataRoutes.map(function(route)  {
    var fetcher = route.handler.fetchData
    if (fetcher.length == 2) {
      params['token'] = token
      fetcher = fetcher.bind(route, params)
    }
    return fetcher
  })

  async.parallel(dataFetchers, function(err, data) {
    if (data && data[0] === null) {
      cb(err, {data: null})
      return
    }
    cb(err, {data: assign.apply(null, data)})
  })
}

module.exports = fetchData
},{"./env":23,"async":"async","react/lib/Object.assign":"react/lib/Object.assign"}],25:[function(require,module,exports){
'use strict';

var assign = require('react/lib/Object.assign')

function getTitle(routes, params, props, options) {
  options = assign({reverse: true, join: ' · ', defaultTitle: '(untitled)'}, options)
  var titleParts = []
  routes.forEach(function(route)  {
    var handler = route.handler
    if (handler.title) {
      titleParts.push(handler.title)
    }
    else if (handler.getTitle) {
      titleParts.push(handler.getTitle(props, params))
    }
  })

  if (options.reverse) {
    titleParts.reverse()
  }
  return (titleParts.join(options.join) || options.defaultTitle) + " - emergency travel documents - GOV.UK"
}

module.exports = getTitle
},{"react/lib/Object.assign":"react/lib/Object.assign"}],26:[function(require,module,exports){
"use strict";
var log4js = require('log4js')

function categoryFilter (excludeCategories, appender) {
  return function(logEvent) {
    if (excludeCategories.every(function(x){return (x!=logEvent.category);})) {
      appender(logEvent)
    }
  }
}

function configure(config) {
  log4js.loadAppender(config.appender.type)
  var appender = log4js.appenderMakers[config.appender.type](config.appender)
  return categoryFilter(config.exclude, appender)
}

exports.appender = categoryFilter
exports.configure = configure
},{"log4js":41}],27:[function(require,module,exports){
'use strict';

var env = require('../env')
var Global = require('../../Global')

/**
 * Initialise server logger
 */
var ServerLogger = (function () {
    var logger

    function createInstance() {
        var cls = require('continuation-local-storage')
        var config = require('config')
        var log4js = require('log4js')

        var logContext = cls.getNamespace('app-log-ctx')

        var commonPattern = config.server.logs.applicationLogs.pattern
        var commonPatternTokens = {
            "pid": function () {
                return process.pid
            },
            "sessionId": function () {
                if (logContext) {
                    return logContext.get('sessionId')
                } else {
                    return 'undefined'
                }
            },
            "requestId": function () {
                if (logContext) {
                    return logContext.get('requestId')
                } else {
                    return 'undefined'
                }
            },
            "clientIP": function () {
                if (logContext) {
                    return logContext.get('clientIP')
                } else {
                    return 'undefined'
                }
            }
        }

        var cfg = {
            "levels": {
                "[all]": config.server.logs.level
            },
            "appenders": [
                {
                    "type": "console",
                    "layout": {
                        "type": "pattern",
                        "pattern": commonPattern,
                        "tokens": commonPatternTokens
                    }
                },
                {
                    "type": "dateFile",
                    "filename": config.server.logs.accessLogs.filename,
                    "pattern": "-yyyy-MM-dd",
                    "layout": {"type": "messagePassThrough"},
                    "category": "http"
                },
                {
                    "type": "categoryFilter",
                    "exclude": ["http"],
                    "appender": {
                        "type": "dateFile",
                        "filename": config.server.logs.applicationLogs.filename,
                        "pattern": "-yyyy-MM-dd",
                        "layout": {
                            "type": "pattern",
                            "pattern": commonPattern,
                            "tokens": commonPatternTokens
                        }
                    }
                }

            ]
        }

        log4js.loadAppender('categoryFilter', require('./categoryFilter'))
        log4js.configure(cfg, {})
        return log4js
    }

    return {
        getInstance: function () {
            if (!logger) {
                logger = createInstance()
            }
            return logger
        }
    }
}())

/**
 * Initialise client logger
 */
var ClientLogger = (function () {
    var logger

    /**
     * Create an Ajax Appender pre-configured
     */
    function createAjaxAppender(JL) {
        var ajaxAppender = JL.createAjaxAppender("ajaxAppender")

        ajaxAppender.setOptions({
            "url": Global.getConfig().client.logger.ajaxUrl
        })

        return ajaxAppender
    }

    function createInstance() {
        var JL = require('jsnlog').JL

        var appenders = [];

        if (Global.getConfig().client.logger.enableConsoleAppender) {
            appenders.push(JL.createConsoleAppender("consoleAppender"))
        }

        if (Global.getConfig().client.logger.enableAjaxAppender) {
            appenders.push(createAjaxAppender(JL));
        }

        JL().setOptions({"appenders": appenders});
        return JL
    }

    return {
        getInstance: function () {
            if (!logger) {
                logger = createInstance()
            }
            return logger
        }
    }
}())

function getLogger(name) {
    if (env.SERVER) {
        return ServerLogger.getInstance().getLogger(name)
    }
    else {
        return ClientLogger.getInstance()(name)
    }
}

module.exports.getLogger = getLogger
},{"../../Global":2,"../env":23,"./categoryFilter":26,"config":41,"continuation-local-storage":41,"jsnlog":42,"log4js":41}],28:[function(require,module,exports){
'use strict';

/**
 * @see http://modernizr.com/
 * https://github.com/Modernizr/Modernizr/blob/master/LICENSE
 *
 * Modernizr is a small JavaScript library that detects the availability of native implementations for next-generation
 * web technologies, i.e. features that stem from the HTML5 and CSS3 specifications. A few feature detection
 * functions from that library are useful although don't justify pulling the entire library into the project just
 * for those.
 */

/**
 *  Indicates if the browser supports history management
 */
function supportsHistory() {
    var ua = navigator.userAgent;
    if ((ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) && ua.indexOf('Mobile Safari') !== -1 && ua.indexOf('Chrome') === -1 && ua.indexOf('Windows Phone') === -1) {
        return false;
    }
    return window.history && 'pushState' in window.history;
}

module.exports = {
    supportsHistory:supportsHistory
}
},{}],29:[function(require,module,exports){
'use strict';

var React = require('react')
var titleText = "Your application has been processed"
var DonePage = React.createClass({displayName: "DonePage",

    statics: {
        title: titleText
    },

    render:function() {
        return (
            React.createElement("div", null, 
                React.createElement("h3", null, titleText), 
                React.createElement("p", null, "Well done!")
            )
        )
    }
})
module.exports = DonePage



},{"react":"react"}],30:[function(require,module,exports){
'use strict';

var React=require('react')
var forms = require('newforms')
var CharField = require('../../common/ui/field/CharField')
var Render = require('../../common/ui/render/Render')
var SplitDateWidget = require('../../common/ui/widget/SplitDateWidget')
var Global = require('../../common/Global')
var RestClient= require('../../common/utils/RestClient')
var moment = require('moment')

var errorsMappingSwitch = function(error) {
    switch (error) {
        case 'invalid-date': return 'Enter a valid date'
        case 'date-is-in-the-future': return 'Enter a valid date in the past'
        case 'date-is-today': return 'Enter a valid date in the past'
        default: return 'Enter a valid date'
    }
}

var Step1Form = forms.Form.extend({

    firstName: CharField({
        maxLength: 35, 
        label: "First and middle names",
        errorMessages: {required: 'Tell us your first and middle names'}
    }),

    lastName: CharField({
        maxLength: 35, 
        label: "Last name",
        errorMessages: {required: 'Tell us your last name'}
    }),

    birthDate: forms.DateField({
        label: 'Date of birth',
        widget: SplitDateWidget,
        helpText: "For example, 20 3 1976",
        errorMessages: {required: 'Tell us your date of birth', invalid: 'Enter a valid date'}
    }),

    birthCity: CharField({
        label: "City of birth",
        maxLength: 29,
        errorMessages: {required: 'Tell us the city where you were born'}
    }),

    cleanFirstName:function(callback) {
        callback(null)
    },

    cleanLastName:function(callback) {
        callback(null)
    },

    cleanBirthDate:function(callback) {
        var $__0=  this.cleanedData,birthDate=$__0.birthDate
        var formattedDob = moment (birthDate).format('DDMMYYYY')
        var validationServiceUrl = Global.getValidateBirthDateServiceUrl() + '/' + formattedDob

        var promise = RestClient().get(validationServiceUrl).then(
            function (res) {
                callback(null)
            },
            function (err) {
                if (err.status === 422) {
                    var message = errorsMappingSwitch(err.body.error)
                   callback(null, forms.ValidationError(message))
                    return 'ok'
                }
            })
        return promise.done()
    },
    cleanBirthCity:function(callback) {
        callback(null)
    },

    render:function() {
        var bfo = this.boundFieldsObj()
        return (React.createElement("div", null, 
            
            Render.section({
                body: Render.field(bfo.firstName)
            }), 
            
            Render.section({
                body: Render.field(bfo.lastName)
            }), 
            
            Render.section({
                body: Render.field(bfo.birthDate)
            }), 
            
            Render.section({
                body: Render.field(bfo.birthCity)
            })
            
        ))

    }
})
module.exports = {
    Step1Form:Step1Form
}
},{"../../common/Global":2,"../../common/ui/field/CharField":3,"../../common/ui/render/Render":11,"../../common/ui/widget/SplitDateWidget":20,"../../common/utils/RestClient":21,"moment":"moment","newforms":"newforms","react":"react"}],31:[function(require,module,exports){
'use strict';

var React = require('react')
var $__0=  require('./Step1Form'),Step1Form=$__0.Step1Form
var IsomorphicForm = require('../../common/ui/form/IsomorphicForm')
var $__1=  require('../../common/ui/form/IsomorphicFormMixIn'),IsomorphicFormMixIn=$__1.IsomorphicFormMixIn
var titleText = "Personal information"

var Step1Page = React.createClass({displayName: "Step1Page",
    mixins: [IsomorphicFormMixIn],

    statics: {
        title: titleText,
        formName: 'Step1Form',
        nextRoute: 'step2'
    },

    render:function() {
        return (
            React.createElement("div", null, 
                React.createElement("h3", null, titleText), 
                React.createElement(IsomorphicForm, {form: Step1Form}, 
                    React.createElement("button", {type: "submit", className: "button"}, "Next")
                )
            )
        )
    }
})
module.exports = Step1Page



},{"../../common/ui/form/IsomorphicForm":5,"../../common/ui/form/IsomorphicFormMixIn":7,"./Step1Form":30,"react":"react"}],32:[function(require,module,exports){
'use strict';

var React=require('react')
var forms = require('newforms')
var CharField = require('../../common/ui/field/CharField')
var Render = require('../../common/ui/render/Render')
var EmailField = require('../../common/ui/field/EmailField')

var Step2Form = forms.Form.extend({

    contactEmail: EmailField({
        label: "Email",
        maxLength: 55,
        errorMessages: {required: 'Enter your email address', invalid: 'Check you\'ve entered the correct email address'}
    }),

    confirmContactEmail: EmailField({
        label: "Confirm email",
        maxLength: 55,
        errorMessages: {required: 'Enter your email address', invalid: 'Check you\'ve entered the correct email address'}
    }),

    contactPhone: CharField({
        label: "Phone number",
        maxLength: 29,
        errorMessages: {required: 'Enter the phone number to contact you on'}
    }),

    cleanContactEmail:function(callback) {
        callback(null)
    },

    cleanConfirmContactEmail:function(callback) {
        if (this.cleanedData.contactEmail &&
            this.cleanedData.confirmContactEmail &&
            this.cleanedData.contactEmail != this.cleanedData.confirmContactEmail) {
            throw forms.ValidationError('Enter a matching email address')
        }
        callback(null)
    },   

    cleanContactPhone:function(callback) {
        callback(null)
    },

    render:function() {
        var bfo = this.boundFieldsObj()
        return (React.createElement("div", null, 
            
            Render.section({
                body: Render.field(bfo.contactEmail)
            }), 
            
            Render.section({
                body: Render.field(bfo.confirmContactEmail)
            }), 
            
            Render.section({
                body: Render.field(bfo.contactPhone)
            })
        ))

    }
})
module.exports = {
    Step2Form:Step2Form
}
},{"../../common/ui/field/CharField":3,"../../common/ui/field/EmailField":4,"../../common/ui/render/Render":11,"newforms":"newforms","react":"react"}],33:[function(require,module,exports){
'use strict';

var React = require('react')
var $__0=  require('./Step2Form'),Step2Form=$__0.Step2Form
var IsomorphicForm = require('../../common/ui/form/IsomorphicForm')
var $__1=  require('../../common/ui/form/IsomorphicFormMixIn'),IsomorphicFormMixIn=$__1.IsomorphicFormMixIn
var titleText = "Contact information"

var Step2Page = React.createClass({displayName: "Step2Page",
    mixins: [IsomorphicFormMixIn],

    statics: {
        title: titleText,
        formName: 'Step2Form',
        nextRoute: 'step3'
    },

    render:function() {
        return (
            React.createElement("div", null, 
                React.createElement("h3", null, titleText), 
                React.createElement(IsomorphicForm, {form: Step2Form}, 
                    React.createElement("button", {type: "submit", className: "button"}, "Next")
                )
            )
        )
    }
})
module.exports = Step2Page



},{"../../common/ui/form/IsomorphicForm":5,"../../common/ui/form/IsomorphicFormMixIn":7,"./Step2Form":32,"react":"react"}],34:[function(require,module,exports){
'use strict';

var React=require('react')
var forms = require('newforms')
var _ = require('lodash')
var Global = require('../../common/Global')
var CheckboxSelectMultipleWidget = require('../../common/ui/widget/CheckboxSelectMultipleWidget')
var Render = require('../../common/ui/render/Render')
var CharField = require('../../common/ui/field/CharField')
var env = require('../../common/utils/env')

var Step3Form = forms.Form.extend({

    modesOfTransport: forms.MultipleChoiceField({
        validation: {on: 'change'},
        label: "Choose your favorite modes of transport",
        helpText: "Select all that apply",
        choices: _.map(Global.getConfig().client.transportMode, function(mode)  {return [mode.value, mode.description]}),
        widget: CheckboxSelectMultipleWidget,
        errorMessages: {required: 'Tell us your favorite modes of transport'}
    }),

    otherTransportMode: CharField({
        label: "If other",
        maxLength: 44,
        required: false,
        errorMessages: {required: 'Tell us which other mode of transport you\'ll like'}
    }),

   
    cleanOtherTransportMode:function(callback) {
        if (_.contains(this.cleanedData.modesOfTransport, 'other') && (this.cleanedData.otherTransportMode ==='') ) {
            throw forms.ValidationError('Tell us which other mode of transport you\'ll use')
        }
        callback(null)
    },

    renderOtherModeOfTransportSection:function(bfo, isHidden) {
        var sectionStyle = isHidden ? {'display': 'none'} : {}
        return (
            React.createElement("div", {id: "other-mode-of-transport-section", className: "panel-indent", style: sectionStyle}, 
                Render.section({body: Render.field(bfo.otherTransportMode)})
            )
        )
    },

    render:function() {

        var bfo = this.boundFieldsObj()

        var isOtherModeOfTransportSectionHidden = function() {
            return (env.CLIENT && !(_.contains(bfo.modesOfTransport.value(), 'other')))
        }

        var OtherModeOfTransportSection =
            this.renderOtherModeOfTransportSection.call(this, bfo, isOtherModeOfTransportSectionHidden())

        return React.createElement("div", null, 
            Render.section({body: Render.field(bfo.modesOfTransport)}), 
            OtherModeOfTransportSection
        )

    }

})

module.exports = {
    Step3Form:Step3Form
}
},{"../../common/Global":2,"../../common/ui/field/CharField":3,"../../common/ui/render/Render":11,"../../common/ui/widget/CheckboxSelectMultipleWidget":17,"../../common/utils/env":23,"lodash":"lodash","newforms":"newforms","react":"react"}],35:[function(require,module,exports){
'use strict';

var React = require('react')
var $__0=  require('./Step3Form'),Step3Form=$__0.Step3Form
var IsomorphicForm = require('../../common/ui/form/IsomorphicForm')
var $__1=  require('../../common/ui/form/IsomorphicFormMixIn'),IsomorphicFormMixIn=$__1.IsomorphicFormMixIn
var titleText = "Extra details"

var Step3Page = React.createClass({displayName: "Step3Page",
    mixins: [IsomorphicFormMixIn],

    statics: {
        title: titleText,
        formName: 'Step3Form',
        nextRoute: 'summary'
    },

    render:function() {
        return (
            React.createElement("div", null, 
                React.createElement("h3", null, titleText), 
                React.createElement(IsomorphicForm, {form: Step3Form}, 
                    React.createElement("button", {type: "submit", className: "button"}, "Next")
                )
            )
        )
    }
})

module.exports = Step3Page
},{"../../common/ui/form/IsomorphicForm":5,"../../common/ui/form/IsomorphicFormMixIn":7,"./Step3Form":34,"react":"react"}],36:[function(require,module,exports){
'use strict';

var React = require('react')
var $__0=  require('@insin/react-router'),Navigation=$__0.Navigation
var RestClientPromise = require('superagent-bluebird-promise')
var Global = require('../../common/Global')
var Step1Details = require('./section/Step1Details')
var Step2Details = require('./section/Step2Details')
var Step3Details = require('./section/Step3Details')
var logger = require('../../common/utils/logs/logger').getLogger('SummaryPage')

var SummaryPage = React.createClass({displayName: "SummaryPage",
    mixins: [Navigation],
    forceRedirect: true,

    propTypes: {
        data: React.PropTypes.object,
        errors: React.PropTypes.object
    },

    statics: {
      getTitle:function(props, params) {
          return 'Summary'
      },

      fetchData:function(params, cb) {

        var token = params['token']
        RestClientPromise.get(Global.getSessionApiBaseUrl(token) + '/form').then(
            function(res) {
              cb(null, {formData: res.body})
            },
            function(err) {
              logger.error(err)
              cb(err, null)
            }
        )

      }
    },

    getDefaultProps:function() {
        return {
            data: {}
        }
    },


    render:function() {
        var $__0=  this.props.data,formData=$__0.formData
        
        return React.createElement("div", {className: "summaryPage"}, 
            React.createElement("h3", null, "Confirm the information that you''ve provided is correct"), 

            React.createElement(Step1Details, {step1Form: formData.Step1Form}), React.createElement("br", null), 

            React.createElement(Step2Details, {step2Form: formData.Step2Form}), React.createElement("br", null), 

            React.createElement(Step3Details, {step3Form: formData.Step3Form}), 

            React.createElement("a", {className: "button", href: "/data/confirm"}, "Confirm")
        )
    }
})

module.exports = SummaryPage
},{"../../common/Global":2,"../../common/utils/logs/logger":27,"./section/Step1Details":37,"./section/Step2Details":38,"./section/Step3Details":39,"@insin/react-router":"@insin/react-router","react":"react","superagent-bluebird-promise":"superagent-bluebird-promise"}],37:[function(require,module,exports){
'use strict';

var React = require('react'),
    $__0=  require('@insin/react-router'),Navigation=$__0.Navigation


var Step1Details = React.createClass({displayName: "Step1Details",
  mixins: [Navigation],

  getDefaultProps:function() {
    return {
      step1Form: {}
    }
  },

  render:function() {
    var data = this.props

    console.log ('data', data)
    
    var fallbackText = 'Not provided'
    var firstName = data.step1Form.firstName || fallbackText
    var lastName = data.step1Form.lastName || fallbackText
    var birthCity = data.step1Form.birthCity || fallbackText
    var birthDate = data.step1Form.birthDate || fallbackText

    return (React.createElement("table", null, 
        React.createElement("thead", null, 
          React.createElement("tr", null, 
              React.createElement("td", null, React.createElement("h3", null, "Your details")), 
              React.createElement("td", null, React.createElement("a", {href: this.makeHref('step1')}, "Edit your details"))
          )
        ), 
        React.createElement("tbody", null, 
          React.createElement("tr", null, 
            React.createElement("td", {className: "header"}, "First and middle names:"), 
            React.createElement("td", null, firstName)
          ), 
          React.createElement("tr", null, 
            React.createElement("td", null, "Last name:"), 
            React.createElement("td", null, lastName)
          ), 
          React.createElement("tr", null, 
              React.createElement("td", null, "Birth date:"), 
              React.createElement("td", null, birthDate)
          ), 
          React.createElement("tr", null, 
              React.createElement("td", null, "Birth city or town:"), 
              React.createElement("td", null, birthCity)
          )
        )
    )
  )}

})

module.exports = Step1Details



},{"@insin/react-router":"@insin/react-router","react":"react"}],38:[function(require,module,exports){
'use strict';

var React = require('react'),
    $__0=  require('@insin/react-router'),Navigation=$__0.Navigation

var Step2Details = React.createClass({displayName: "Step2Details",
  mixins: [Navigation],

  getDefaultProps:function() {
    return {
      step2Form: {}
    }
  },

  render:function() {
    var data = this.props
    var fallbackText = 'Not provided'
    var email = data.step2Form.contactEmail || fallbackText
    var contactPhone = data.step2Form.contactPhone || fallbackText

    return (React.createElement("table", null, 
        React.createElement("thead", null, 
          React.createElement("tr", null, 
              React.createElement("td", null, React.createElement("h3", null, "Contact details")), 
              React.createElement("td", null, React.createElement("a", {href: this.makeHref('step2')}, "Edit your details"))
          )
        ), 
        React.createElement("tbody", null, 
          React.createElement("tr", null, 
            React.createElement("td", null, "Email:"), 
            React.createElement("td", null, email)
          ), 
          React.createElement("tr", null, 
            React.createElement("td", null, "Contact phone:"), 
            React.createElement("td", null, contactPhone)
          )

        )
    )
  )}

})

module.exports = Step2Details



},{"@insin/react-router":"@insin/react-router","react":"react"}],39:[function(require,module,exports){
'use strict';
var _ = require('lodash')
var React = require('react'),
    $__0=  require('@insin/react-router'),Navigation=$__0.Navigation

var Step3Details = React.createClass({displayName: "Step3Details",
  mixins: [Navigation],

  getDefaultProps:function() {
    return {
      step3Form: {}
    }
  },

  render:function() {
    var data = this.props
    var fallbackText = 'Not provided'
    var modesOfTransport
    var otherTransportMode = data.step3Form.otherTransportMode

 
    if(data.step3Form.modesOfTransport){
      modesOfTransport = _.map(data.step3Form.modesOfTransport, function(mode){
          return mode.charAt(0).toUpperCase() + mode.slice(1);
      }).join(', ')
    } else {
      modesOfTransport = fallbackText
    }

  
    var otherTransportModeSection
    if(data.step3Form.modesOfTransport.indexOf("other")>-1){
        otherTransportModeSection = React.createElement("tr", null, 
            React.createElement("td", null, "Other mode of travel:"), 
            React.createElement("td", null, otherTransportMode)
        )

    }


    return (React.createElement("table", null, 
        React.createElement("thead", null, 
          React.createElement("tr", null, 
              React.createElement("td", null, React.createElement("h3", null, "Extra details")), 
              React.createElement("td", null, React.createElement("a", {href: this.makeHref('step3'), id: "id_editJourneyDetails"}, "Edit your extra details"))
          )
        ), 
        React.createElement("tbody", null, 
          React.createElement("tr", null, 
            React.createElement("td", null, "Mode of travel:"), 
            React.createElement("td", null, modesOfTransport)
          ), 
          otherTransportModeSection
        )
    )
  )}

})

module.exports = Step3Details
},{"@insin/react-router":"@insin/react-router","lodash":"lodash","react":"react"}],40:[function(require,module,exports){
'use strict';

var React = require('react')
var $__0=    require('@insin/react-router'),DefaultRoute=$__0.DefaultRoute,NotFoundRoute=$__0.NotFoundRoute,Route=$__0.Route

module.exports = [
    React.createElement(Route, {path: "/", handler: require('./common/ui/template/Main')}, 
        React.createElement(DefaultRoute, {name: "step1", handler: require('./pages/step1/Step1Page')}), 
        React.createElement(Route, {name: "step2", handler: require('./pages/step2/Step2Page')}), 
        React.createElement(Route, {name: "step3", handler: require('./pages/step3/Step3Page')}), 
        React.createElement(Route, {name: "summary", handler: require('./pages/summary/SummaryPage')}), 
        React.createElement(Route, {name: "done", handler: require('./pages/done/DonePage')}), 
        React.createElement(Route, {name: "session-timeout", handler: require('./common/ui/pages/error/SessionTimeoutErrorPage')}), 
        React.createElement(Route, {name: "generic-error", handler: require('./common/ui/pages/error/GenericErrorPage')}), 
        React.createElement(NotFoundRoute, {name: "notFound", handler: require('./common/ui/pages/error/NotFound')})
    )
];
},{"./common/ui/pages/error/GenericErrorPage":8,"./common/ui/pages/error/NotFound":9,"./common/ui/pages/error/SessionTimeoutErrorPage":10,"./common/ui/template/Main":16,"./pages/done/DonePage":29,"./pages/step1/Step1Page":31,"./pages/step2/Step2Page":33,"./pages/step3/Step3Page":35,"./pages/summary/SummaryPage":36,"@insin/react-router":"@insin/react-router","react":"react"}],41:[function(require,module,exports){

},{}],42:[function(require,module,exports){
/// <reference path="jsnlog_interfaces.d.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
function JL(loggerName) {
    // If name is empty, return the root logger
    if (!loggerName) {
        return JL.__;
    }
    // Implements Array.reduce. JSNLog supports IE8+ and reduce is not supported in that browser.
    // Same interface as the standard reduce, except that 
    if (!Array.prototype.reduce) {
        Array.prototype.reduce = function (callback, initialValue) {
            var previousValue = initialValue;
            for (var i = 0; i < this.length; i++) {
                previousValue = callback(previousValue, this[i], i, this);
            }
            return previousValue;
        };
    }
    var accumulatedLoggerName = '';
    var logger = ('.' + loggerName).split('.').reduce(function (prev, curr, idx, arr) {
        // if loggername is a.b.c, than currentLogger will be set to the loggers
        // root   (prev: JL, curr: '')
        // a      (prev: JL.__, curr: 'a')
        // a.b    (prev: JL.__.__a, curr: 'b')
        // a.b.c  (prev: JL.__.__a.__a.b, curr: 'c')
        // Note that when a new logger name is encountered (such as 'a.b.c'),
        // a new logger object is created and added as a property to the parent ('a.b').
        // The root logger is added as a property of the JL object itself.
        // It is essential that the name of the property containing the child logger
        // contains the full 'path' name of the child logger ('a.b.c') instead of
        // just the bit after the last period ('c').
        // This is because the parent inherits properties from its ancestors.
        // So if the root has a child logger 'c' (stored in a property 'c' of the root logger),
        // then logger 'a.b' has that same property 'c' through inheritance.
        // The names of the logger properties start with __, so the root logger 
        // (which has name ''), has a nice property name '__'.              
        // accumulatedLoggerName evaluates false ('' is falsy) in first iteration when prev is the root logger.
        // accumulatedLoggerName will be the logger name corresponding with the logger in currentLogger.
        // Keep in mind that the currentLogger may not be defined yet, so can't get the name from
        // the currentLogger object itself. 
        if (accumulatedLoggerName) {
            accumulatedLoggerName += '.' + curr;
        }
        else {
            accumulatedLoggerName = curr;
        }
        var currentLogger = prev['__' + accumulatedLoggerName];
        // If the currentLogger (or the actual logger being sought) does not yet exist, 
        // create it now.
        if (currentLogger === undefined) {
            // Set the prototype of the Logger constructor function to the parent of the logger
            // to be created. This way, __proto of the new logger object will point at the parent.
            // When logger.level is evaluated and is not present, the JavaScript runtime will 
            // walk down the prototype chain to find the first ancestor with a level property.
            //
            // Note that prev at this point refers to the parent logger.
            JL.Logger.prototype = prev;
            currentLogger = new JL.Logger(accumulatedLoggerName);
            prev['__' + accumulatedLoggerName] = currentLogger;
        }
        return currentLogger;
    }, JL.__);
    return logger;
}
var JL;
(function (JL) {
    JL.enabled;
    JL.maxMessages;
    JL.defaultAjaxUrl;
    JL.clientIP;
    JL.defaultBeforeSend;
    // Initialise requestId to empty string. If you don't do this and the user
    // does not set it via setOptions, then the JSNLog-RequestId header will
    // have value "undefined", which doesn't look good in a log.
    //
    // Note that you always want to send a requestId as part of log requests,
    // otherwise the server side component doesn't know this is a log request
    // and may create a new request id for the log request, causing confusion
    // in the log.
    JL.requestId = '';
    /**
    Copies the value of a property from one object to the other.
    This is used to copy property values as part of setOption for loggers and appenders.

    Because loggers inherit property values from their parents, it is important never to
    create a property on a logger if the intent is to inherit from the parent.

    Copying rules:
    1) if the from property is undefined (for example, not mentioned in a JSON object), the
       to property is not affected at all.
    2) if the from property is null, the to property is deleted (so the logger will inherit from
       its parent).
    3) Otherwise, the from property is copied to the to property.
    */
    function copyProperty(propertyName, from, to) {
        if (from[propertyName] === undefined) {
            return;
        }
        if (from[propertyName] === null) {
            delete to[propertyName];
            return;
        }
        to[propertyName] = from[propertyName];
    }
    /**
    Returns true if a log should go ahead.
    Does not check level.

    @param filters
        Filters that determine whether a log can go ahead.
    */
    function allow(filters) {
        // If enabled is not null or undefined, then if it is false, then return false
        // Note that undefined==null (!)
        if (!(JL.enabled == null)) {
            if (!JL.enabled) {
                return false;
            }
        }
        // If maxMessages is not null or undefined, then if it is 0, then return false.
        // Note that maxMessages contains number of messages that are still allowed to send.
        // It is decremented each time messages are sent. It can be negative when batch size > 1.
        // Note that undefined==null (!)
        if (!(JL.maxMessages == null)) {
            if (JL.maxMessages < 1) {
                return false;
            }
        }
        try {
            if (filters.userAgentRegex) {
                if (!new RegExp(filters.userAgentRegex).test(navigator.userAgent)) {
                    return false;
                }
            }
        }
        catch (e) {
        }
        try {
            if (filters.ipRegex && JL.clientIP) {
                if (!new RegExp(filters.ipRegex).test(JL.clientIP)) {
                    return false;
                }
            }
        }
        catch (e) {
        }
        return true;
    }
    /**
    Returns true if a log should go ahead, based on the message.

    @param filters
        Filters that determine whether a log can go ahead.

    @param message
        Message to be logged.
    */
    function allowMessage(filters, message) {
        // If the regex contains a bug, that will throw an exception.
        // Ignore this, and pass the log item (better too much than too little).
        try {
            if (filters.disallow) {
                if (new RegExp(filters.disallow).test(message)) {
                    return false;
                }
            }
        }
        catch (e) {
        }
        return true;
    }
    // If logObject is a function, the function is evaluated (without parameters)
    // and the result returned.
    // Otherwise, logObject itself is returned.
    function stringifyLogObjectFunction(logObject) {
        if (typeof logObject == "function") {
            if (logObject instanceof RegExp) {
                return logObject.toString();
            }
            else {
                return logObject();
            }
        }
        return logObject;
    }
    var StringifiedLogObject = (function () {
        // * msg - 
        //      if the logObject is a scalar (after possible function evaluation), this is set to
        //      string representing the scalar. Otherwise it is left undefined.
        // * meta -
        //      if the logObject is an object (after possible function evaluation), this is set to
        //      that object. Otherwise it is left undefined.
        // * finalString -
        //      This is set to the string representation of logObject (after possible function evaluation),
        //      regardless of whether it is an scalar or an object. An object is stringified to a JSON string.
        //      Note that you can't call this field "final", because as some point this was a reserved
        //      JavaScript keyword and using final trips up some minifiers.
        function StringifiedLogObject(msg, meta, finalString) {
            this.msg = msg;
            this.meta = meta;
            this.finalString = finalString;
        }
        return StringifiedLogObject;
    })();
    // Takes a logObject, which can be 
    // * a scalar
    // * an object
    // * a parameterless function, which returns the scalar or object to log.
    // Returns a stringifiedLogObject
    function stringifyLogObject(logObject) {
        // Note that this works if logObject is null.
        // typeof null is object.
        // JSON.stringify(null) returns "null".
        var actualLogObject = stringifyLogObjectFunction(logObject);
        var finalString;
        switch (typeof actualLogObject) {
            case "string":
                return new StringifiedLogObject(actualLogObject, null, actualLogObject);
            case "number":
                finalString = actualLogObject.toString();
                return new StringifiedLogObject(finalString, null, finalString);
            case "boolean":
                finalString = actualLogObject.toString();
                return new StringifiedLogObject(finalString, null, finalString);
            case "undefined":
                return new StringifiedLogObject("undefined", null, "undefined");
            case "object":
                if ((actualLogObject instanceof RegExp) || (actualLogObject instanceof String) || (actualLogObject instanceof Number) || (actualLogObject instanceof Boolean)) {
                    finalString = actualLogObject.toString();
                    return new StringifiedLogObject(finalString, null, finalString);
                }
                else {
                    return new StringifiedLogObject(null, actualLogObject, JSON.stringify(actualLogObject));
                }
            default:
                return new StringifiedLogObject("unknown", null, "unknown");
        }
    }
    function setOptions(options) {
        copyProperty("enabled", options, this);
        copyProperty("maxMessages", options, this);
        copyProperty("defaultAjaxUrl", options, this);
        copyProperty("clientIP", options, this);
        copyProperty("requestId", options, this);
        copyProperty("defaultBeforeSend", options, this);
        return this;
    }
    JL.setOptions = setOptions;
    function getAllLevel() {
        return -2147483648;
    }
    JL.getAllLevel = getAllLevel;
    function getTraceLevel() {
        return 1000;
    }
    JL.getTraceLevel = getTraceLevel;
    function getDebugLevel() {
        return 2000;
    }
    JL.getDebugLevel = getDebugLevel;
    function getInfoLevel() {
        return 3000;
    }
    JL.getInfoLevel = getInfoLevel;
    function getWarnLevel() {
        return 4000;
    }
    JL.getWarnLevel = getWarnLevel;
    function getErrorLevel() {
        return 5000;
    }
    JL.getErrorLevel = getErrorLevel;
    function getFatalLevel() {
        return 6000;
    }
    JL.getFatalLevel = getFatalLevel;
    function getOffLevel() {
        return 2147483647;
    }
    JL.getOffLevel = getOffLevel;
    function levelToString(level) {
        if (level <= 1000) {
            return "trace";
        }
        if (level <= 2000) {
            return "debug";
        }
        if (level <= 3000) {
            return "info";
        }
        if (level <= 4000) {
            return "warn";
        }
        if (level <= 5000) {
            return "error";
        }
        return "fatal";
    }
    // ---------------------
    var Exception = (function () {
        // data replaces message. It takes not just strings, but also objects and functions, just like the log function.
        // internally, the string representation is stored in the message property (inherited from Error)
        //
        // inner: inner exception. Can be null or undefined. 
        function Exception(data, inner) {
            this.inner = inner;
            this.name = "JL.Exception";
            this.message = stringifyLogObject(data).finalString;
        }
        return Exception;
    })();
    JL.Exception = Exception;
    // Derive Exception from Error (a Host object), so browsers
    // are more likely to produce a stack trace for it in their console.
    //
    // Note that instanceof against an object created with this constructor
    // will return true in these cases:
    // <object> instanceof JL.Exception);
    // <object> instanceof Error);
    Exception.prototype = new Error();
    // ---------------------
    var LogItem = (function () {
        // l: level
        // m: message
        // n: logger name
        // t (timeStamp) is number of milliseconds since 1 January 1970 00:00:00 UTC
        //
        // Keeping the property names really short, because they will be sent in the
        // JSON payload to the server.
        function LogItem(l, m, n, t) {
            this.l = l;
            this.m = m;
            this.n = n;
            this.t = t;
        }
        return LogItem;
    })();
    JL.LogItem = LogItem;
    // ---------------------
    var Appender = (function () {
        // sendLogItems takes an array of log items. It will be called when
        // the appender has items to process (such as, send to the server).
        // Note that after sendLogItems returns, the appender may truncate
        // the LogItem array, so the function has to copy the content of the array
        // in some fashion (eg. serialize) before returning.
        function Appender(appenderName, sendLogItems) {
            this.appenderName = appenderName;
            this.sendLogItems = sendLogItems;
            this.level = JL.getTraceLevel();
            // set to super high level, so if user increases level, level is unlikely to get 
            // above sendWithBufferLevel
            this.sendWithBufferLevel = 2147483647;
            this.storeInBufferLevel = -2147483648;
            this.bufferSize = 0; // buffering switch off by default
            this.batchSize = 1;
            // Holds all log items with levels higher than storeInBufferLevel 
            // but lower than level. These items may never be sent.
            this.buffer = [];
            // Holds all items that we do want to send, until we have a full
            // batch (as determined by batchSize).
            this.batchBuffer = [];
        }
        Appender.prototype.setOptions = function (options) {
            copyProperty("level", options, this);
            copyProperty("ipRegex", options, this);
            copyProperty("userAgentRegex", options, this);
            copyProperty("disallow", options, this);
            copyProperty("sendWithBufferLevel", options, this);
            copyProperty("storeInBufferLevel", options, this);
            copyProperty("bufferSize", options, this);
            copyProperty("batchSize", options, this);
            if (this.bufferSize < this.buffer.length) {
                this.buffer.length = this.bufferSize;
            }
            return this;
        };
        /**
        Called by a logger to log a log item.
        If in response to this call one or more log items need to be processed
        (eg., sent to the server), this method calls this.sendLogItems
        with an array with all items to be processed.

        Note that the name and parameters of this function must match those of the log function of
        a Winston transport object, so that users can use these transports as appenders.
        That is why there are many parameters that are not actually used by this function.

        level - string with the level ("trace", "debug", etc.) Only used by Winston transports.
        msg - human readable message. Undefined if the log item is an object. Only used by Winston transports.
        meta - log object. Always defined, because at least it contains the logger name. Only used by Winston transports.
        callback - function that is called when the log item has been logged. Only used by Winston transports.
        levelNbr - level as a number. Not used by Winston transports.
        message - log item. If the user logged an object, this is the JSON string.  Not used by Winston transports.
        loggerName: name of the logger.  Not used by Winston transports.
        */
        Appender.prototype.log = function (level, msg, meta, callback, levelNbr, message, loggerName) {
            var logItem;
            if (!allow(this)) {
                return;
            }
            if (!allowMessage(this, message)) {
                return;
            }
            if (levelNbr < this.storeInBufferLevel) {
                // Ignore the log item completely
                return;
            }
            logItem = new LogItem(levelNbr, message, loggerName, (new Date).getTime());
            if (levelNbr < this.level) {
                // Store in the hold buffer. Do not send.
                if (this.bufferSize > 0) {
                    this.buffer.push(logItem);
                    // If we exceeded max buffer size, remove oldest item
                    if (this.buffer.length > this.bufferSize) {
                        this.buffer.shift();
                    }
                }
                return;
            }
            if (levelNbr < this.sendWithBufferLevel) {
                // Want to send the item, but not the contents of the buffer
                this.batchBuffer.push(logItem);
            }
            else {
                // Want to send both the item and the contents of the buffer.
                // Send contents of buffer first, because logically they happened first.
                if (this.buffer.length) {
                    this.batchBuffer = this.batchBuffer.concat(this.buffer);
                    this.buffer.length = 0;
                }
                this.batchBuffer.push(logItem);
            }
            if (this.batchBuffer.length >= this.batchSize) {
                this.sendBatch();
                return;
            }
        };
        // Processes the batch buffer
        Appender.prototype.sendBatch = function () {
            if (this.batchBuffer.length == 0) {
                return;
            }
            if (!(JL.maxMessages == null)) {
                if (JL.maxMessages < 1) {
                    return;
                }
            }
            // If maxMessages is not null or undefined, then decrease it by the batch size.
            // This can result in a negative maxMessages.
            // Note that undefined==null (!)
            if (!(JL.maxMessages == null)) {
                JL.maxMessages -= this.batchBuffer.length;
            }
            this.sendLogItems(this.batchBuffer);
            this.batchBuffer.length = 0;
        };
        return Appender;
    })();
    JL.Appender = Appender;
    // ---------------------
    var AjaxAppender = (function (_super) {
        __extends(AjaxAppender, _super);
        function AjaxAppender(appenderName) {
            _super.call(this, appenderName, AjaxAppender.prototype.sendLogItemsAjax);
        }
        AjaxAppender.prototype.setOptions = function (options) {
            copyProperty("url", options, this);
            copyProperty("beforeSend", options, this);
            _super.prototype.setOptions.call(this, options);
            return this;
        };
        AjaxAppender.prototype.sendLogItemsAjax = function (logItems) {
            try {
                // Only determine the url right before you send a log request.
                // Do not set the url when constructing the appender.
                //
                // This is because the server side component sets defaultAjaxUrl
                // in a call to setOptions, AFTER the JL object and the default appender
                // have been created. 
                var ajaxUrl = "/jsnlog.logger";
                // This evaluates to true if defaultAjaxUrl is null or undefined
                if (!(JL.defaultAjaxUrl == null)) {
                    ajaxUrl = JL.defaultAjaxUrl;
                }
                if (this.url) {
                    ajaxUrl = this.url;
                }
                var json = JSON.stringify({
                    r: JL.requestId,
                    lg: logItems
                });
                // Send the json to the server. 
                // Note that there is no event handling here. If the send is not
                // successful, nothing can be done about it.
                var xhr = this.getXhr(ajaxUrl);
                // call beforeSend callback
                // first try the callback on the appender
                // then the global defaultBeforeSend callback
                if (typeof this.beforeSend === 'function') {
                    this.beforeSend(xhr);
                }
                else if (typeof JL.defaultBeforeSend === 'function') {
                    JL.defaultBeforeSend(xhr);
                }
                xhr.send(json);
            }
            catch (e) {
            }
        };
        // Creates the Xhr object to use to send the log request.
        // Sets out to create an Xhr object that can be used for CORS.
        // However, if there seems to be no CORS support on the browser,
        // returns a non-CORS capable Xhr.
        AjaxAppender.prototype.getXhr = function (ajaxUrl) {
            var xhr = new XMLHttpRequest();
            // Check whether this xhr is CORS capable by checking whether it has
            // withCredentials. 
            // "withCredentials" only exists on XMLHTTPRequest2 objects.
            if (!("withCredentials" in xhr)) {
                // Just found that no XMLHttpRequest2 available.
                // Check if XDomainRequest is available.
                // This only exists in IE, and is IE's way of making CORS requests.
                if (typeof XDomainRequest != "undefined") {
                    // Note that here we're not setting request headers on the XDomainRequest
                    // object. This is because this object doesn't let you do that:
                    // http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
                    // This means that for IE8 and IE9, CORS logging requests do not carry request ids.
                    var xdr = new XDomainRequest();
                    xdr.open('POST', ajaxUrl);
                    return xdr;
                }
            }
            // At this point, we're going with XMLHttpRequest, whether it is CORS capable or not.
            // If it is not CORS capable, at least will handle the non-CORS requests.
            xhr.open('POST', ajaxUrl);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('JSNLog-RequestId', JL.requestId);
            return xhr;
        };
        return AjaxAppender;
    })(Appender);
    JL.AjaxAppender = AjaxAppender;
    // ---------------------
    var ConsoleAppender = (function (_super) {
        __extends(ConsoleAppender, _super);
        function ConsoleAppender(appenderName) {
            _super.call(this, appenderName, ConsoleAppender.prototype.sendLogItemsConsole);
        }
        ConsoleAppender.prototype.clog = function (logEntry) {
            console.log(logEntry);
        };
        ConsoleAppender.prototype.cerror = function (logEntry) {
            if (console.error) {
                console.error(logEntry);
            }
            else {
                this.clog(logEntry);
            }
        };
        ConsoleAppender.prototype.cwarn = function (logEntry) {
            if (console.warn) {
                console.warn(logEntry);
            }
            else {
                this.clog(logEntry);
            }
        };
        ConsoleAppender.prototype.cinfo = function (logEntry) {
            if (console.info) {
                console.info(logEntry);
            }
            else {
                this.clog(logEntry);
            }
        };
        // IE11 has a console.debug function. But its console doesn't have 
        // the option to show/hide debug messages (the same way Chrome and FF do),
        // even though it does have such buttons for Error, Warn, Info.
        //
        // For now, this means that debug messages can not be hidden on IE.
        // Live with this, seeing that it works fine on FF and Chrome, which
        // will be much more popular with developers.
        ConsoleAppender.prototype.cdebug = function (logEntry) {
            if (console.debug) {
                console.debug(logEntry);
            }
            else {
                this.cinfo(logEntry);
            }
        };
        ConsoleAppender.prototype.sendLogItemsConsole = function (logItems) {
            try {
                if (!console) {
                    return;
                }
                var i;
                for (i = 0; i < logItems.length; ++i) {
                    var li = logItems[i];
                    var msg = li.n + ": " + li.m;
                    // Only log the timestamp if we're on the server
                    // (window is undefined). On the browser, the user
                    // sees the log entry probably immediately, so in that case
                    // the timestamp is clutter.
                    if (typeof window === 'undefined') {
                        msg = new Date(li.t) + " | " + msg;
                    }
                    if (li.l <= JL.getDebugLevel()) {
                        this.cdebug(msg);
                    }
                    else if (li.l <= JL.getInfoLevel()) {
                        this.cinfo(msg);
                    }
                    else if (li.l <= JL.getWarnLevel()) {
                        this.cwarn(msg);
                    }
                    else {
                        this.cerror(msg);
                    }
                }
            }
            catch (e) {
            }
        };
        return ConsoleAppender;
    })(Appender);
    JL.ConsoleAppender = ConsoleAppender;
    // --------------------
    var Logger = (function () {
        function Logger(loggerName) {
            this.loggerName = loggerName;
            // Create seenRexes, otherwise this logger will use the seenRexes
            // of its parent via the prototype chain.
            this.seenRegexes = [];
        }
        Logger.prototype.setOptions = function (options) {
            copyProperty("level", options, this);
            copyProperty("userAgentRegex", options, this);
            copyProperty("disallow", options, this);
            copyProperty("ipRegex", options, this);
            copyProperty("appenders", options, this);
            copyProperty("onceOnly", options, this);
            // Reset seenRegexes, in case onceOnly has been changed.
            this.seenRegexes = [];
            return this;
        };
        // Turns an exception into an object that can be sent to the server.
        Logger.prototype.buildExceptionObject = function (e) {
            var excObject = {};
            if (e.stack) {
                excObject.stack = e.stack;
            }
            else {
                excObject.e = e;
            }
            if (e.message) {
                excObject.message = e.message;
            }
            if (e.name) {
                excObject.name = e.name;
            }
            if (e.data) {
                excObject.data = e.data;
            }
            if (e.inner) {
                excObject.inner = this.buildExceptionObject(e.inner);
            }
            return excObject;
        };
        // Logs a log item.
        // Parameter e contains an exception (or null or undefined).
        //
        // Reason that processing exceptions is done at this low level is that
        // 1) no need to spend the cpu cycles if the logger is switched off
        // 2) fatalException takes both a logObject and an exception, and the logObject
        //    may be a function that should only be executed if the logger is switched on.
        //
        // If an exception is passed in, the contents of logObject is attached to the exception
        // object in a new property logData.
        // The resulting exception object is than worked into a message to the server.
        //
        // If there is no exception, logObject itself is worked into the message to the server.
        Logger.prototype.log = function (level, logObject, e) {
            var i = 0;
            var compositeMessage;
            var excObject;
            // If we can't find any appenders, do nothing
            if (!this.appenders) {
                return this;
            }
            if (((level >= this.level)) && allow(this)) {
                if (e) {
                    excObject = this.buildExceptionObject(e);
                    excObject.logData = stringifyLogObjectFunction(logObject);
                }
                else {
                    excObject = logObject;
                }
                compositeMessage = stringifyLogObject(excObject);
                if (allowMessage(this, compositeMessage.finalString)) {
                    // See whether message is a duplicate
                    if (this.onceOnly) {
                        i = this.onceOnly.length - 1;
                        while (i >= 0) {
                            if (new RegExp(this.onceOnly[i]).test(compositeMessage.finalString)) {
                                if (this.seenRegexes[i]) {
                                    return this;
                                }
                                this.seenRegexes[i] = true;
                            }
                            i--;
                        }
                    }
                    // Pass message to all appenders
                    // Note that these appenders could be Winston transports
                    // https://github.com/flatiron/winston
                    //
                    // These transports do not take the logger name as a parameter.
                    // So add it to the meta information, so even Winston transports will
                    // store this info.
                    compositeMessage.meta = compositeMessage.meta || {};
                    compositeMessage.meta.loggerName = this.loggerName;
                    i = this.appenders.length - 1;
                    while (i >= 0) {
                        this.appenders[i].log(levelToString(level), compositeMessage.msg, compositeMessage.meta, function () {
                        }, level, compositeMessage.finalString, this.loggerName);
                        i--;
                    }
                }
            }
            return this;
        };
        Logger.prototype.trace = function (logObject) {
            return this.log(getTraceLevel(), logObject);
        };
        Logger.prototype.debug = function (logObject) {
            return this.log(getDebugLevel(), logObject);
        };
        Logger.prototype.info = function (logObject) {
            return this.log(getInfoLevel(), logObject);
        };
        Logger.prototype.warn = function (logObject) {
            return this.log(getWarnLevel(), logObject);
        };
        Logger.prototype.error = function (logObject) {
            return this.log(getErrorLevel(), logObject);
        };
        Logger.prototype.fatal = function (logObject) {
            return this.log(getFatalLevel(), logObject);
        };
        Logger.prototype.fatalException = function (logObject, e) {
            return this.log(getFatalLevel(), logObject, e);
        };
        return Logger;
    })();
    JL.Logger = Logger;
    function createAjaxAppender(appenderName) {
        return new AjaxAppender(appenderName);
    }
    JL.createAjaxAppender = createAjaxAppender;
    function createConsoleAppender(appenderName) {
        return new ConsoleAppender(appenderName);
    }
    JL.createConsoleAppender = createConsoleAppender;
    // -----------------------
    // In the browser, the default appender is the AjaxAppender.
    // Under nodejs (where there is no "window"), use the ConsoleAppender instead.
    var defaultAppender = new AjaxAppender("");
    if (typeof window === 'undefined') {
        defaultAppender = new ConsoleAppender("");
    }
    // Create root logger
    //
    // Note that this is the parent of all other loggers.
    // Logger "x" will be stored at
    // JL.__.x
    // Logger "x.y" at
    // JL.__.x.y
    JL.__ = new JL.Logger("");
    JL.__.setOptions({
        level: JL.getDebugLevel(),
        appenders: [defaultAppender]
    });
})(JL || (JL = {}));
// Support CommonJS module format 
var exports;
if (typeof exports !== 'undefined') {
    exports.JL = JL;
}
// Support AMD module format
var define;
if (typeof define == 'function' && define.amd) {
    define('jsnlog', [], function () {
        return JL;
    });
}
// If the __jsnlog_configure global function has been
// created, call it now. This allows you to create a global function
// setting logger options etc. inline in the page before jsnlog.js
// has been loaded.
if (typeof __jsnlog_configure == 'function') {
    __jsnlog_configure(JL);
}

},{}]},{},[1]);
