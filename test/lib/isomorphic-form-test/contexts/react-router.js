var sinon = require('sinon')
var MochaMix = require('mocha-mix')

/**
 * Override ReactRoute stub context of mocha mix
 *
 * @param  {sinon}    sinon   sinon instance to create spy
 * @return {object}           context object with stub router
 */
module.exports = function (sinon, transition, nextRoute, callback) {

    var stubRouter = MochaMix.stubContexts.createReactRouterStub(sinon)

    Object.assign(stubRouter.router, {
        transitionTo: function (to, params, query, data) {
            this._Component.nextRoute = nextRoute
            this._Component.willTransitionTo.call(
                {handler: this._Component},
                transition, params, query, callback, data)
        }
    })

    return {
        router: stubRouter.router
    }
}
