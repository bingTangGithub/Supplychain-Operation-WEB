import 'babel-polyfill'
import Prom from 'promise-polyfill'
import 'eventsource-polyfill'
/*
* change moment to string, format YYYY-MM-DD (HH:mm:SS)
* toJSON, use the toISOString, overwrite it
* */
(function () {
  function pad (number) {
    if (number < 10) {
      return '0' + number
    }
    return number
  }

  Date.prototype.toISOString = function () {
    return this.getUTCFullYear() +
      '-' + pad(this.getUTCMonth() + 1) +
      '-' + pad(this.getUTCDate()) +
      ' ' + pad(this.getUTCHours()) +
      ':' + pad(this.getUTCMinutes()) +
      ':' + pad(this.getUTCSeconds())
  }
}());

// fixed for IE
if (!window.Promise) {
  window.Promise = Prom
}
