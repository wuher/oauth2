"use strict";


/*
 * 4.4.2010 wuher
 *
 * @todo use meaningful exceptions (everything is Error now)
 */


var escape = require('querystring').stringify;


// @todo how to use these as object property keys?
var HDR_OAUTH_CONSUMER_KEY = "oauth_consumer_key";
var HDR_OAUTH_CONSUMER_SECRET = "oauth_consumer_secret";


var Consumer = exports.Consumer = function (key, secret) {

    // guard for not forgetting the 'new' keyword when constructing
    // @todo is this really "strict" mode..?
    if (!(this instanceof arguments.callee)) {
        throw Error("Constructor called as a function");
    }

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
