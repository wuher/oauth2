/*
 * 4.4.2010 wuher
 *
 * @todo use meaningful exceptions (everything is Error now)
 */


"use strict";


var escape = require("querystring").stringify;
var random_id = require("uuid").uuid;


// @todo how to use these as object property keys?
var HDR_OAUTH_CONSUMER_KEY = "oauth_consumer_key";
var HDR_OAUTH_CONSUMER_SECRET = "oauth_consumer_secret";



/*
 * implementation copied from narwhal/lib/uuid.js
 * this is because narwhal/engines/rhino/lib/uuid.js overrides this
 */
var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
var generate_verifier = function (length, radix) {
    var chars = CHARS, uuid = [], rnd = Math.random;
    length = length || 8;
    radix = radix || chars.length;
    for (var i = 0; i < length; i++) uuid[i] = chars[0 | rnd()*radix];
    return uuid.join('');
};


var Consumer = exports.Consumer = function (key, secret) {

    if (!key || !secret) {
        throw new Error("Key and secret must be set.");
    }

    this.key = key;
    this.secret = secret;
};


Consumer.prototype.toString = function () {
    return escape({
                      "oauth_consumer_key": this.key,
                      "oauth_consumer_secret": this.secret
                  });
};


var Token = exports.Token = function (key, secret) {

    var _callback = null, _callback_confirmed = null, _verifier = null;

    if (!key || !secret) {
        throw new Error("Key and secret must be set.");
    }

    this.key = key;
    this.secret = secret;

    this.__defineGetter__("callback", function () {
                              return _callback;
                          });
    this.__defineSetter__("callback", function (cb) {
                              _callback = cb;
                              _callback_confirmed = "true";
                          });
    this.__defineGetter__("callback_confirmed", function () {
                              return _callback_confirmed;
                          });
    this.__defineSetter__("callback_confirmed", function (c) {
                              _callback_confirmed = c;
                          });
    this.__defineGetter__("verifier", function () {
                              return _verifier;
                          });
    this.__defineSetter__("verifier", function (v) {
                              _verifier = v || generate_verifier();
                          });
};


// Token.prototype.getCallbackUrl = function () {
//     var parts;
//     if (this.callback && this.verifier) {
//         // append
//         parts =
//     }
// };