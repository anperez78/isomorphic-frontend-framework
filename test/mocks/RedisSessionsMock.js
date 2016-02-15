'use strict';

var redisSessionsMock = {

	create : function (request, callback) {
        // Check request to send different responses !
        callback(null, {token: "r30kKwv3sA6ExrJ9OmLSm4Wo3nt9MQA1yG94wn6ByFbNrVWhcwAyOM7Zhfxqh8fe"})
    },

    kill : function (request, callback) {
        if (request.token === '1234567890') {
            callback(null, {kill: 0}) // if {kill: 0} is returned the session was not found
        }
        else {
            callback(null, {kill: 1}) // if {kill: 1} is returned the session has been deleted
        }
    },

    set : function (request, callback) {
        // Check request to send different responses !

        switch(request.token){
            case '1234567890000':
                callback(null, {
                        app: "appMockValue",
                        token: "1234567890000",
                        d: {
                            OtherInformationForm: '{"otherInformation": "Y"}'
                        }
                    })
                break;
            case '1234567890001':
                callback(null, {
                        app: "appMockValue",

                        token: "1234567890001",
                        d: {}
                    })
                break;
                
            default:
                callback(null, {
                    app: "appMockValue",
                    token: "r30kKwv3sA6ExrJ9OmLSm4Wo3nt9MQA1yG94wn6ByFbNrVWhcwAyOM7Zhfxqh8fe",
                    d: {
                        title: 'Mr'
                    }
                })
                
        }

    },

    get : function (request, callback) {
        // Check request to send different responses !
        callback(null, {
            app: "appMockValue",
            token: "r30kKwv3sA6ExrJ9OmLSm4Wo3nt9MQA1yG94wn6ByFbNrVWhcwAyOM7Zhfxqh8fe",
            d: {
                OtherInformationForm: '{"otherInformation": "other info"}'
            }
        })
    }


}

module.exports = redisSessionsMock
