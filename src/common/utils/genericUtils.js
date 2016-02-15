'use strict';


var getErrorMessage = function (err, res) {
  return (err == null? (Object.keys(res.body).length === 0 ? { error: res.text} : res.body) : err) 
}

module.exports = getErrorMessage