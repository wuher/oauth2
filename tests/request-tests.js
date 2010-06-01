// -*- coding: utf-8 -*-
//request-tests.js ---
//
// Copyright (C) MIT License
// Tampere University of Technology
//
// Created: Fri May 14 23:20:54 2010 (+0300)
// Author: wuher
//


var assert = require("test/assert");
var assert2 = require("assert");
var Request = require("oauth2").Request;
var Consumer = require("oauth2").Consumer;
var Token = require("oauth2").Token;
var util = require("util");
var sprintf = require("printf").sprintf;
var mock = require('./mock');


exports.testRequestBasic = function () {
    var r = new Request();
    assert.isSame("GET", r.method);
    assert.isSame({}, r.parameters);
    assert.isSame(null, r.url);

    r = new Request("post", "http://kuuskeri.com:8080/jedi", {"mara": "jade"});
    assert.isSame("POST", r.method);
    assert.isSame({"mara": "jade"}, r.parameters);
    assert.isSame("http://kuuskeri.com:8080/jedi", r.url);
    assert.isSame("http://kuuskeri.com:8080/jedi", r.normalized_url);
};


//
// url setter
//
util.forEachApply(
    [
        ["http://www.kuuskeri.com:80/jedi/?hello", "http://www.kuuskeri.com:80/jedi/?hello", "http://www.kuuskeri.com/jedi/"]
        , ["https://www.kuuskeri.com:443/jedi?hello", "https://www.kuuskeri.com:443/jedi?hello", "https://www.kuuskeri.com/jedi", false]
        , ["http://www.kuuskeri.com:8800/jedi/?hello", "http://www.kuuskeri.com:8800/jedi/?hello", "http://www.kuuskeri.com:8800/jedi/"]
        , ["http://www.kuuskeri.com:8800/jedi/", "http://www.kuuskeri.com:8800/jedi/", "http://www.kuuskeri.com:8800/jedi/"]
        , ["https://www.kuuskeri.com:80/jedi/", "https://www.kuuskeri.com:80/jedi/", "https://www.kuuskeri.com:80/jedi/"]
        , ["http://www.kuuskeri.com:443/jedi/", "http://www.kuuskeri.com:443/jedi/", "http://www.kuuskeri.com:443/jedi/"]
        , ["", null, null, false]
        , [null, null, null, false]
        , ["gttp://www.kuuskeri.com:8800/jedi/", null, null, true]
    ],
    function (url, expected, normalized, err) {
        exports["testUrl: " + util.repr(url)] = function () {
            var r = new Request();
            try {
                r.url = url;
            } catch (e) {
                if (!err) {
                    throw e;
                }
                return;
            }
            if (err) {
                assert2.fail("should throw error");
            }
            assert.isSame(expected, r.url);
            assert.isSame(normalized, r.normalized_url);
        };
    });


//
// getNonOAuthParameters
//
util.forEachApply(
    [
        [{"oauth_secret": "top secret", "jedi": "hush hush"}, {"jedi": "hush hush"}]
        , [{"oauth_secret": "top secret"}, {}]
        , [{"my secret": "top secret"}, {"my secret": "top secret"}]
        , [null, {}]
        , [{}, {}]
        , [{"null": null}, {"null": null}]
        , [{"": ""}, {"": ""}]
    ],
    function (params, expected) {
        exports["testNonOAuthParameters: " + util.repr(params)] = function () {
            var r = new Request();
            r.parameters = params;
            assert.isSame(expected, r.getNonOAuthParameters());
        };
    });


//
// util.object.filter
//
util.forEachApply(
    [
        [{"ba": 1, "a": 2}, {"a": 2}, {"ba": 1}]
        , [{"a": 1, "a": 2}, {"a": 2}, {}]
        , [{"b": 2, "b": 1}, {}, {"b": 1}]
        , [{}, {}, {}]
    ],
    function (obj, expected_bykey, expected_byval) {
        var KEY_FILTER = "a", VAL_FILTER = 1;
        exports["testUtilObjectFilter: " + util.repr(obj)] = function () {
            var copy = util.object.copy(obj);
            var filtered = util.object.filter(
                obj, function (key, val) {
                    return (key === KEY_FILTER);
                });
            assert.isSame(expected_bykey, filtered);
            filtered = util.object.filter(
                obj, function (key, val) {
                    return (val === VAL_FILTER);
                });
            assert.isSame(expected_byval, filtered);
            // make sure that the original didn't change
            assert.isSame(copy, obj);
        };
    });


//
// util.object.toArray
//
util.forEachApply(
    [
        [{"mace": "windu", "boba": "fett"}, [["mace", "windu"],["boba", "fett"]]]
        , [{"a": 1}, [["a", 1]]]
        , [{}, []]
    ],
    function (obj, expected) {
        exports["testUtilObjectToArray: " + util.repr(obj)] = function () {
            assert.isSame(expected, util.object.toArray(obj));
        };
    });


//
// toHeader
//
exports.testToHeader = function () {
    var r = new Request();
    assert.isSame(
        {"Authorization": 'OAuth realm=""'},
        r.toHeader()
    );
    r.parameters = {
        "count": "dooku",
        "darth": "maul",
        "oauth_hdr": "oauth_val",
        "oauth_hdr2": "oauth_val2"
    };
    assert.isSame(
        {"Authorization": 'OAuth realm="", oauth_hdr=oauth_val, oauth_hdr2=oauth_val2'},
        r.toHeader()
    );
    r.parameters.oauth_hdr2 = "http://jedi.net/~luke/";
    assert.isSame(
        {"Authorization": 'OAuth realm="", oauth_hdr=oauth_val, oauth_hdr2=http%3A%2F%2Fjedi.net%2F~luke%2F'},
        r.toHeader()
    );
    delete r.parameters.oauth_hdr2;
    assert.isSame(
        {"Authorization": 'OAuth realm="hiihoo", oauth_hdr=oauth_val'},
        r.toHeader("hiihoo")
    );
    delete r.parameters.oauth_hdr;
    assert.isSame(
        {"Authorization": 'OAuth realm="a-wing"'},
        r.toHeader("a-wing")
    );
    assert.isSame(
        {"Authorization": 'OAuth realm=""'},
        r.toHeader("")
    );
};


//
// toPostData
//
exports.testToPostData = function () {
    var r = new Request();

    r.parameters = {
        "master": "yoda",
        "oauth_hdr": "oauth_val"
    };
    assert.isSame(
        "master=yoda&oauth_hdr=oauth_val",
        r.toPostData()
    );
    r.parameters["master"] = "[yoda]?&";
    assert.isSame(
        "master=%5Byoda%5D%3F%26&oauth_hdr=oauth_val",
        r.toPostData()
    );
    r.parameters = {};
    assert.isSame("", r.toPostData());
};


//
// toUrl
//
[
    {
        url: "http://jedi.net/",
        params: {},
        expected: "http://jedi.net/"
    },
    {
        url: "http://jedi.net",
        params: {'oauth_version': "1.0",
                 'oauth_timestamp': "137131200"},
        expected: "http://jedi.net?oauth_version=1.0&oauth_timestamp=137131200"
    },
    {
        url: "http://jedi.net/?oauth_secret=mysecret",
        params: {'oauth_version': "1.0",
                 'oauth_timestamp': "137131200"},
        expected: "http://jedi.net/?oauth_secret=mysecret&oauth_version=1.0&oauth_timestamp=137131200"
    },
    {
        url: "http://jedi.net/hiihoo/..",
        params: {"foo": "bar"},
        expected: "http://jedi.net/hiihoo/..?foo=bar"
    },
    {
        url: "http://jedi.net/hiihoo/../net",
        params: {"foo": "bar"},
        expected: "http://jedi.net/net?foo=bar"
    },
    {
        url: "",
        params: {},
        expected: ""
    }
].forEach(function (item) {
              exports["testToUrl: " + item.expected] = function () {
                  var r = new Request("GET", item.url, item.params);
                  assert.isSame(item.expected, r.toUrl());
              };
          });


//
// getParameter
//
exports.testGetParameter = function () {
    var r = new Request();
    assert.isSame(undefined, r.getParameter("jedi"));
    r.url = "http://jedi.net/luke?lightsaber=green";
    r.parameters = {"oauth_consumer" : "asdf"};
    assert.isSame("asdf", r.getParameter("oauth_consumer"));
    assert.isSame(undefined, r.getParameter("foo"));

    // /// @todo python version does this (but i'm not sure if we need to..
    // assert.throwsError(
    //     function () {
    //         r.getParameter("lightsaber");
    //     }, Error, "should raise error");
};


util.forEachApply(
    [
        [{}, []]
        , [{"a": 1}, [["a", "1"]]]
        , [{"a": [1, 3]}, [["a", "1"], ["a", "3"]]]
        , [{"a": ["mara+jade", "3"]}, [["a", "mara jade"], ["a", "3"]]]
        , [{"a": ["mara+jade", "3"]}, [["a", "mara jade"], ["a", "3"]], true]
        , [{"a": ["mara+jade", "3"]}, [["a", "mara+jade"], ["a", "3"]], false]
        , [{"a": [1, [2, 3]]}, [["a", "1"], ["a", "2,3"]]]
    ], function (obj, arr, unescape) {
        exports[sprintf(
                    "testParamsToFlatArray: %s to %s (%s)",
                    util.object.repr(obj), arr, unescape)
               ] = function () {
                   assert.isSame(arr, Request._qsToFlatArray(obj, unescape));
               };
    });


util.forEachApply(
    [
        // empty
        ["", {}, ""]
        // parameters
        , ["http://jedi.net", {"a": 1}, "a=1"]
        // parameters and query string
        , ["http://jedi.net?b=2", {"a": 1}, "a=1&b=2"]
        // parameters and query string with sorting
        , ["http://jedi.net?a=1", {"b": 2}, "a=1&b=2"]
        , ["http://jedi.net?a=1", {"a": [3,2]}, "a=1&a=2&a=3"]
        , ["http://jedi.net?a=1&a=0", {"a": [3,2]}, "a=0&a=1&a=2&a=3"]
        , ["http://jedi.net?a=1&a=boba", {"a": ["jango",2]}, "a=1&a=2&a=boba&a=jango"]
        // escaping
        , ["http://jedi.net", {"c": "hee haw"}, "c=hee%20haw"]
        , ["http://jedi.net?b=har%20har", {}, "b=har%20har"]
        , ["http://jedi.net?b=har har", {"a": 1}, "a=1&b=har%20har"]
        , ["http://jedi.net?b=har+har", {"a": 1}, "a=1&b=har%20har"]
        // oauth_signature must be excluded
        , ["http://jedi.net", {"oauth_signature": 1}, ""]
        , ["http://jedi.net?a=1", {"oauth_signature": 1}, "a=1"]
    ], function (url, params, exp) {
        exports[sprintf(
                    "testGetNormalizedParameters: %s with %s to %s",
                    url, util.object.repr(params), exp)
               ] = function () {
                   var r = new Request();
                   r.url = url;
                   r.parameters = params;
                   assert.isSame(exp, r.getNormalizedParameters(r));
               };
    });



exports.testSignRequest = function () {
    var c1, t1, signmethodmock, r;

    // create required objects and mocks
    c1 = new Consumer("consumer_key", "consumer_secret");
    t1 = new Token("token_key", "token_secret");
    signmethodmock = mock.mock({ name : "HSA", sign : function () {} });

    // test without params set in the request
    r = new Request();
    signmethodmock.expect.sign().withParameters(r, c1, t1).returns("XYZ");
    r.signRequest(signmethodmock, c1, t1);
    assert.isSame("XYZ", r.getParameter("oauth_signature"));
    assert.isSame("HSA", r.getParameter("oauth_signature_method"));
    assert.isSame("consumer_key", r.getParameter("oauth_consumer_key"));
    assert.isSame("token_key", r.getParameter("oauth_token"));

    // oauth_consumer_key set in request's parameters
    r = new Request();
    r.parameters["oauth_consumer_key"] = "request_key";
    signmethodmock.expect.sign().withParameters(r, c1, t1).returns("ZYX");
    r.signRequest(signmethodmock, c1, t1);
    assert.isSame("ZYX", r.getParameter("oauth_signature"));
    assert.isSame("request_key", r.getParameter("oauth_consumer_key"));
    assert.isSame("token_key", r.getParameter("oauth_token"));

    // oauth_token set in request's parameters
    r = new Request();
    r.parameters["oauth_token"] = "request_key";
    signmethodmock.expect.sign().withParameters(r, c1, t1).returns("ZXY");
    r.signRequest(signmethodmock, c1, t1);
    assert.isSame("ZXY", r.getParameter("oauth_signature"));
    assert.isSame("consumer_key", r.getParameter("oauth_consumer_key"));
    assert.isSame("request_key", r.getParameter("oauth_token"));

    // verify contract
    mock.releaseMocks();
};


exports.teardown = function () {
};


if (require.main == module.id) {
    require("test/runner").run(exports);
}


//
//request-tests.js ends here
