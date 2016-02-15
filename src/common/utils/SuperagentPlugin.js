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