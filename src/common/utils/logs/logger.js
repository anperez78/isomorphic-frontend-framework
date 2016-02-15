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