'use strict';

var React = require('react')

var GlobalFooter = React.createClass({
  render() {
    return (
        <footer id="footer" role="contentinfo">
            <div>
                <p>All content is available under the <a target="_blank" href="https://en.wikipedia.org/wiki/MIT_License" rel="license">MIT Licence</a>, except where otherwise stated</p>
            </div>
        </footer>
    )   
  }
})

module.exports = GlobalFooter


