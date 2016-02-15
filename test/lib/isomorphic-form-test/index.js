var MochaMix = require('mocha-mix')
var sinon = require('sinon')

/**
 * bind transitionTo function to the mix
 *
 * @param  {object}     spec   layout for testing Component.
 * @return {MochaMix}          MochaMix instance with helper methods
 */
function mix(spec) {
    var mix = MochaMix.mix(spec)

    if ((typeof spec !== 'undefined') && (spec.hasOwnProperty('context'))) {
        spec.context.router.transitionTo = spec.context.router.transitionTo.bind(mix)
    }
    return mix;
}

module.exports = Object.assign(MochaMix, {
    isomorphicStubContexts: require('./contexts'),
    isomorphicMix: mix,
    createTransitionStub: function () {
        return {
            redirect: sinon.spy(),
            abort: sinon.spy()
        }
    },
    fakeAccessToken: function (cookie) {
        global.window.document.cookie = `accessToken=${cookie};`
    },
    fakeConfig: function (config) {
        global.window.__CONFIG__ = config
    },
    getFakeConfig: function () {
        return global.window.__CONFIG__
    }
})
