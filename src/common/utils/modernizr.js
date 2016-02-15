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
    supportsHistory
}