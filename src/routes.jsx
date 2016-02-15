'use strict';

var React = require('react')
var {DefaultRoute, NotFoundRoute, Route} = require('@insin/react-router')

module.exports = [
    <Route path="/" handler={require('./common/ui/template/Main')}>
        <DefaultRoute name="step1" handler={require('./pages/step1/Step1Page')}/>
        <Route name="step2" handler={require('./pages/step2/Step2Page')}/>
        <Route name="step3" handler={require('./pages/step3/Step3Page')}/>
        <Route name="summary" handler={require('./pages/summary/SummaryPage')}/>
        <Route name="done" handler={require('./pages/done/DonePage')}/>
        <Route name="session-timeout" handler={require('./common/ui/pages/error/SessionTimeoutErrorPage')}/>
        <Route name="generic-error" handler={require('./common/ui/pages/error/GenericErrorPage')}/>
        <NotFoundRoute name="notFound" handler={require('./common/ui/pages/error/NotFound')}/>
    </Route>
];