// -*- coding: utf-8 -*-
//oauth2.js ---
//
// Copyright (C) MIT License
// Tampere University of Technology
//
// Created: Fri May  7 11:34:51 2010 (+0300)
// Author: wuher
//


// OAuth implementation for the narwhal platform. Based on Joe Stump's
// python-oauth2 library.


"use strict";


var random_id = require("uuid").uuid;
var qs = require("querystring");
var uri = require("uri");
var util = require("util");
var sprintf = require("printf").sprintf;


var VERSION = '1.0';
var HTTP_METHOD = 'GET';
var SIGNATURE_METHOD = 'PLAINTEXT';

// @todo how to use these as object property keys?
var HDR_AUTHORIZATION = "Authorization";
var HDR_OAUTH_CONSUMER_KEY = "oauth_consumer_key";
var HDR_OAUTH_CONSUMER_SECRET = "oauth_consumer_secret";
var HDR_OAUTH_VERIFIER = "oauth_verifier";
var HDR_OAUTH_CALLBACK_CONFIRMED = "oauth_callback_confirmed";
var HDR_OAUTH_TOKEN = "oauth_token";
var HDR_OAUTH_TOKEN_SECRET = "oauth_token_secret";
var HDR_OAUTH_SIGNATURE = "oauth_signature";
var HDR_OAUTH_SIGNATURE_METHOD = "oauth_signature_method";


/**
 * Add filter method to object utils.
 *
 * @todo either move to narwhal/lib/util.js or remove from util.object
 */
util.object.filter = function (obj, func) {
    var key, result = {};
    for (key in obj) {
        if (util.object.has(obj, key)) {
            if (func.apply(null, [key, obj[key]])) {
                result[key] = obj[key];
            }
        }
    }
    return result;
};


/**
 * Convert dictionary to array
 *
 * @todo either move to narwhal/lib/util.js or remove from util.object
 */
util.object.toArray = function (obj) {
    var key, result = [];
    for (key in obj) {
        if (util.object.has(obj, key)) {
            result.push([key, obj[key]]);
        }
    }
    return result;
};


/*
 * implementation copied from narwhal/lib/uuid.js
 * this is because narwhal/engines/rhino/lib/uuid.js overrides this
 */
var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
var i, generate_verifier = function (length, radix) {
    var chars = CHARS, uuid = [], rnd = Math.random;
    length = length || 8;
    radix = radix || chars.length;
    for (i = 0; i < length; i++) uuid[i] = chars[0 | rnd()*radix];
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

    ret = new Token(key, secret);
    if (HDR_OAUTH_CALLBACK_CONFIRMED in params) {
        cbc = params[HDR_OAUTH_CALLBACK_CONFIRMED];
        if (!cbc) {
            throw Error(HDR_OAUTH_CALLBACK_CONFIRMED + " is empty");
        }
        ret.callback_confirmed = cbc;
    }
    return ret;
};


/**
 * The request object
 */
var Request = exports.Request = function (methd, url, parameters) {
    var _url, _method, _normalized_url = null;

    this.__defineGetter__(
        "method", function () {
            return _method;
        });

    /// @todo check if 'method' appears in the global namespace. this is
    /// how we know if the caller forgot the new keyword

    this.__defineSetter__(
        "method", function (value) {
            if (value) {
                value = value.toUpperCase();
            }
            _method = value;
        });

    this.__defineGetter__(
        "normalized_url", function () {
            return _normalized_url;
        });

    this.__defineGetter__(
        "url", function () {
            return _url;
        });

    this.__defineSetter__(
        "url", function (value) {
            var parsed_url, maybe_rip_port;

            // handle null-like and exit
            if (!value) {
                _url = null;
                _normalized_url = null;
                return;
            }

            // parse the url
            parsed_url = uri.parse(value);
            if (['http', 'https'].indexOf(parsed_url.scheme) === -1) {
                throw Error("Unsupported URL scheme: " + parsed_url.scheme);
            }

            // rip unnecessary port information from normalized_url
            util.forEachApply([["http", "80"], ["https", "443"]],
                              function (scheme, port) {
                                  if (parsed_url.scheme === scheme && parsed_url.port === port) {
                                      parsed_url.port = "";
                                  }
                              }
                             );
            // no query string for normalized_url
            parsed_url.query = '';

            _normalized_url = uri.format(parsed_url);
            _url = value;
        });

    // these now use our setters
    this.method = methd || HTTP_METHOD;
    this.parameters = parameters || {};
    this.url = url;
};


/**
 * Returns all non-OAuth parameters.
 */
Request.prototype.getNonOAuthParameters = function () {
    return util.object.filter(
        this.parameters,
        function (key, val) {
            return (key.indexOf("oauth_") !== 0);
        });
};


/**
 * Compose HTTP Authorization header.
 */
Request.prototype.toHeader = function (realm) {
    var oauth_headers, hdr_sz="", auth_hdr;

    realm = realm || '';

    // filter oauth headers (@todo also creates a copy..)
    oauth_headers = util.object.filter(
        this.parameters,
        function (key, val) {
            return (key.indexOf("oauth_") === 0);
        });

    // convert to array
    oauth_headers = util.object.toArray(oauth_headers);
    // escape and add '='
    oauth_headers = oauth_headers.map(
        function (item) {
            return item[0] + "=" + qs.escape(item[1]);
        });

    // to string
    hdr_sz = oauth_headers.join(", ");
    auth_hdr = sprintf('OAuth realm="%s"', realm);
    if (hdr_sz) {
        auth_hdr = sprintf("%s, %s", auth_hdr, hdr_sz);
    }

    return {
        "Authorization": auth_hdr
    };
};


/**
 * Convert to POSTable data
 */
Request.prototype.toPostData = function () {
    return qs.stringify(this.parameters);
};


/**
 * @todo this only concatenates parameters at the end of the (possible)
 * original query string. maybe possible duplicate keys should be
 * grouped but i'm not sure if the querystring.stringify does it the right
 * way (e.g. compared to python's urllib.urlencode(qs, True))
 */
Request.prototype.toUrl = function () {
    var k, sz = "", query, parsedurl = uri.parse(this.url);

    for (k in this.parameters) {
        if (util.object.has(this.parameters, k)) {
            if (sz.length !== 0) {
                sz += "&";
            }
            sz += k + "=" + qs.escape(this.parameters[k]);
        }
    }
    if (sz.length !== 0) {
        if (parsedurl.query.length !== 0) {
            parsedurl.query += "&";
        }
        parsedurl.query += sz;
    }
    return uri.format(parsedurl);
};



/**
 * Getter for parameters.
 *
 * @todo should this be defined as a getter function in the ctor instead?
 */
Request.prototype.getParameter = function (parameter) {
    if (util.object.has(this.parameters, parameter)) {
        return this.parameters[parameter];
    } else {
        return undefined;
    }

    // /// @todo python version does this (but i'm not sure if we need to..
    // var ret;
    // if (util.object.has(this.parameters, parameter)) {
    //     ret = this.parameters[parameter];
    // }

    // if (ret === undefined || ret === null) {
    //     throw Error(sprintf("parameter %s not found", repr(parameter)));
    // }
};



/**
 * Return parameters as a query string to be signed.
 */
Request.prototype.getNormalizedParameters = function () {
    var ret = [], query;

    // convert parameters to two dimensional array
    ret = Request._qsToFlatArray(this.parameters, false);
    // exclude oauth_signature
    ret = ret.filter(function (kv) {return kv[0] !== HDR_OAUTH_SIGNATURE;});
    // include query string params
    query = this.url ? qs.parse(uri.parse(this.url).query) : {};
    // concatenate member parameters and the ones in the url
    ret = ret.concat(Request._qsToFlatArray(query));
    // sort (this is why we have both sets of parameters in one array)
    util.sort(ret);
    // convert the sorted map into query string
    ret = ret.map(function (item) {
                      item[0] = qs.escape(item[0]);
                      item[1] = qs.escape(item[1]);
                      return item.join("=");
                  });
    // join into one string and make sure all spaces are encoded as %20
    return ret.join("&").replace("+", "%20");
};


/**
 * Signs the request with the given signmethod.
 */
Request.prototype.signRequest = function (signmethod, consumer, token) {
    if (!util.object.has(this.parameters, HDR_OAUTH_CONSUMER_KEY)) {
        this.parameters[HDR_OAUTH_CONSUMER_KEY] = consumer.key;
    }
    if (!util.object.has(this.parameters, HDR_OAUTH_TOKEN)) {
        this.parameters[HDR_OAUTH_TOKEN] = token.key;
    }

    this.parameters[HDR_OAUTH_SIGNATURE_METHOD] = signmethod.name;
    this.parameters[HDR_OAUTH_SIGNATURE] =
        signmethod.sign(this, consumer, token);
};


/**
 * @return timestamp
 */
Request.makeTimestamp = function () {
    return util.string(new Date().getTime());
};


/**
 * @return random generated nonce
 */
Request.makeNonce = function () {
    return sprintf("%08d", Math.round(Math.random() * 100000000));
};


/**
 * Creates a request object from given arguments.
 *
 * @param method request method
 * @param url the url (may contain query string)
 * @param headers [optional] http headers (dict)
 * @param parameters [optional] http headers (dict)
 * @param querystring [optional] querystring
 */
Request.fromRequest = function (method, url, headers, parameters, querystring) {
    var auth_header, header_params, query_params, split_qs;
    parameters = parameters || {};

    // split and unescape querystring into dict
    split_qs = function (sz) {
        var key, ret = qs.parse(sz);
        for (key in ret) {
            if (ret.hasOwnProperty(key)) {
                ret[key] = uri.unescape(ret[key]);
            }
        }
        return ret;
    };

    // if Authorization header present, split into dict and update parameters
    if (headers && HDR_AUTHORIZATION in headers) {
        auth_header = headers[HDR_AUTHORIZATION];
        if (auth_header.substring(0, 6) === "OAuth ") {
            auth_header = auth_header.substring(6);
            header_params = Request._splitHeader(auth_header);
            util.object.update(parameters, header_params);
        }
    }

    // update parameters as per given querystring
    if (querystring) {
        util.object.update(parameters, split_qs(querystring));
    }

    // update parameters as per given uri
    util.object.update(parameters, split_qs(uri.parse(url).query));

    // create new request
    return (util.object.len(parameters) !== 0) ?
        new Request(method, url, parameters) : null;
};


/**
 * Turn "Authorization" header into dictionary.
 */
Request._splitHeader = function (header) {
    var i, p, unquote, kvp, p_parts, ret = {}, parts = header.split(",");

    kvp = function (sz) {
        var i = sz.indexOf("=");
        if (i === -1) {
            throw new Error("illegal Authorization header");
        }
        return [util.trim(sz.substring(0, i)), util.trim(sz.substring(i+1))];
    };

    unquote = function (sz) {
        var trim_start = /^\"\"*/, trim_end = /\"\"*$/;;
        return sz.replace(trim_start, "").replace(trim_end, "");
    };

    for (i = 0; i < parts.length; i += 1) {
        p = util.trim(parts[i]);

        // ignore empty and realm
        if (p.length === 0 || p.indexOf('realm') > -1) {
            continue;
        }

        p_parts = kvp(p);
        ret[p_parts[0]] = uri.unescape(unquote(p_parts[1]));
    }
    return ret;
};


/**
 * convert query string object (possibly from query string) to a flat array
 * and also unescape values by default.
 *
 *   {a: [1, "b%20c"]}  becomes  [["a", "1"], ["a", "b c"]]
 */
Request._qsToFlatArray = function (obj, unescape) {
    var ret = [], key, i, value, stringifyvalue;

    stringifyvalue = function (val) {
        return unescape === undefined || unescape ?
            uri.unescape(val) : "" + val;
    };
    for (key in obj) if (obj.hasOwnProperty(key)) {
        value = obj[key];
        if (util.isArrayLike(value)) {
            for (i = 0; i < value.length; i += 1) {
                ret.push([key, stringifyvalue(value[i])]);
            }
        } else {
            ret.push([key, stringifyvalue(value)]);
        }
    }
    return ret;
};


//
//oauth2.js ends here
