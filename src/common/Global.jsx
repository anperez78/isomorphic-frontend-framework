'use strict';

var React = require('react')
var env = require('./utils/env')

var Global = React.createClass({

    statics: {
        getConfig() {
            if (env.CLIENT) {
                if (typeof window['__CONFIG__'] === 'undefined') {
                    throw Error('Client configuration not set up properly.')
                }
                return window['__CONFIG__']
            } else {
                return require('config')
            }
        },

        getBaseUrl() {
            return env.SERVER ? 'http://'+ this.getConfig().common.host + ':' + this.getConfig().common.port : ''
        },

        getApiBaseUrl() {
            return this.getBaseUrl() + this.getConfig().common.apiBasePath
        },

        getValidateBirthDateServiceUrl() {
            return env.SERVER ? this.getConfig().server.validateBirthDateServiceUrl : this.getConfig().client.validateBirthDateServiceUrl
        },

        getCookie(cname) {
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

        deleteCookie(cname) {
            if (env.SERVER ) {
                throw Error("Cannot retrieve cookie in non-browser environments (i.e. NodeJs environment). " +
                            "No window object exits.")
            }
            document.cookie = cname + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        },

        getAccessToken(accessToken){
            if(env.SERVER){
                return accessToken
            }
            return this.getCookie('accessToken', document)
        },

        getSessionApiBaseUrl(accessToken) {
            var url = `${this.getApiBaseUrl()}/session`
            if(env.SERVER || this.getConfig().client.injectSessionIdInURL) {
                url = `${url}/${this.getAccessToken(accessToken)}`
            }
            return url
        },

        scrollToTop() {
            if (env.CLIENT) {
                window.scrollTo(0,0)
            }
        },

    },

    shouldComponentUpdate() {
        return false;
    },

    render() {
        return <span></span>
    }
});

module.exports = Global;
