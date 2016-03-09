module.exports = {
  "common": {
    "host": "0.0.0.0",
    "port": 3000,
    "apiBasePath": "/api"
  },
  "server": {
    "redis": {
      "app": "demo",
      "host": "localhost",
      "port": 6379,
      "ttl": 1800
    },
    "logs": {
      "level": "INFO",
      "accessLogs": {
        "pattern": ":remote-addr [:date] \":method :url HTTP/:http-version\" :status :response-time",
        "filename": "./access.log"
      },
      "applicationLogs": {
        "pattern": "%d{ISO8601} [%p] {%x{clientIP}, %x{requestId}, %x{sessionId}} %x{pid}#%c: %m",
        "filename": "./application.log"
      }
    },
    "validateBirthDateServiceUrl": "http://isomorphic.local:3000/validate/birth-date",
    "transformServiceUrl": "http://isomorphic.local:3000/data/transform",
    "externalSystemServiceUrl": "http://isomorphic.local:3000/data/send"
  },
  "client": {
    "title": "Demo",
    "logger": {
      "enableConsoleAppender": true,
      "enableAjaxAppender": true,
      "ajaxUrl": "/client-logger/log"
    },
    "validateBirthDateServiceUrl": "http://localhost:3000/validate/birth-date",
    "transportMode": [
      {
        "value": "plane",
        "description" : "Plane"
      },
      {
        "value": "train",
        "description" : "Train"
      },
      {
        "value": "boat",
        "description" : "Boat"
      },
      {
        "value": "car",
        "description" : "Car"
      },
      {
        "value": "coach",
        "description" : "Coach"
      },
      {
        "value": "other",
        "description" : "Other"
      }
    ],
    "injectSessionIdInURL": true
  },
  "cookie": {
    "secure": false,
    "httpOnly": false
  }
}
