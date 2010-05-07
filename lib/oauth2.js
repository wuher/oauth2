// -*- coding: utf-8 -*-
//oauth2.js ---
//
// Copyright (C) MIT License
// Tampere University of Technology
//Created: Fri May  7 10:35:22 2010 (+0300)
//
//Author: jedi
//Last-Updated:
//

// OAuth implementation for the narwhal platform. Based on Joe Stump's
// python-oauth2 library.


"use strict";


var random_id = require("uuid").uuid;
var qs = require("querystring");
var uri = require("uri");
var util = require("util");


// @todo how to use these as object property keys?
var HDR_OAUTH_CONSUMER_KEY = "oauth_consumer_key";
var HDR_OAUTH_CONSUMER_SECRET = "oauth_consumer_secret";
var HDR_OAUTH_VERIFIER = "oauth_verifier";
var HDR_OAUTH_CALLBACK_CONFIRMED = "oauth_callback_confirmed";
var HDR_OAUTH_TOKEN = "oauth_token";
var HDR_OAUTH_TOKEN_SECRET = "oauth_token_secret";


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
    return qs.stringify({
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


/**
 * String representation of the token. Good for query string.
 */
Token.prototype.toString = function () {
    var data = {
        "oauth_token": this.key,
        "oauth_token_secret": this.secret
    };

    if (this.callback_confirmed !== null) {
        data[HDR_OAUTH_CALLBACK_CONFIRMED] = this.callback_confirmed;
    }

    return qs.stringify(data);
};


/**
 * Deserialize from query string. this is the opposite of toString().
 */
Token.fromString = function (s) {
    var params, key, secret, cbc, ret;

    if (!s) {
        throw Error("unable to construct token from empty string");
    }

    params = qs.parse(s);
    if (util.object.len(params) === 0) {
        throw Error("unable to construct token from '" + s + "'");
    }

    key = params[HDR_OAUTH_TOKEN];
    if (!key) {
        throw Error(HDR_OAUTH_TOKEN + " not found or empty");
    }

    secret = params[HDR_OAUTH_TOKEN_SECRET];
    if (!secret) {
        throw Error(HDR_OAUTH_TOKEN_SECRET + " not found or empty");
    }

    ret = Token(key, secret);
    if (HDR_OAUTH_CALLBACK_CONFIRMED in params) {
        cbc = params[HDR_OAUTH_CALLBACK_CONFIRMED];
        if (!cbc) {
            throw Error(HDR_OAUTH_CALLBACK_CONFIRMED + " is empty");
        }
        ret.callback_confirmed = cbc;
    }
    return ret;
};

//
//oauth2.js ends here
