/*
 * 4.4.2010 wuher
 *
 * OAuth implementation for the narwhal platform. Based on Joe Stump's
 * python-oauth2 library.
 */


"use strict";


var parseqs = require("querystring").parseQuery;
var escape = require("querystring").stringify;
var random_id = require("uuid").uuid;
var uri = require("uri");


// @todo how to use these as object property keys?
var HDR_OAUTH_CONSUMER_KEY = "oauth_consumer_key";
var HDR_OAUTH_CONSUMER_SECRET = "oauth_consumer_secret";
var HDR_OAUTH_VERIFIER = "oauth_verifier";


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


/**
 * The consumer (or client) in the OAuth authentication protocol.
 */
var Consumer = exports.Consumer = function (key, secret) {

    if (!key || !secret) {
        throw new Error("Key and secret must be set.");
    }

    this.key = key;
    this.secret = secret;
};



/**
 * @return the consumer in the form of a query string.
 */
Consumer.prototype.toString = function () {
    return escape({
                      "oauth_consumer_key": this.key,
                      "oauth_consumer_secret": this.secret
                  });
};



/**
 * Generic OAuth credentials.
 */
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


/**
 * This is equivalent of assigning to verifier property directrly.
 */
Token.prototype.setVerifier = function (v) {
    this.verifier = v;
};


/**
 * @todo should this be part of the callback getter?
 */
Token.prototype.getCallbackUrl = function () {
    var url;

    // append verifier if we have one
    if (this.callback && this.verifier) {
        url = uri.parse(this.callback);
        if (url.query) {
            // append to existing query string
            url.query += "&";
        }
        url.query += HDR_OAUTH_VERIFIER + "=" + this.verifier;
        return uri.format(url);
    }

    return this.callback;
};


