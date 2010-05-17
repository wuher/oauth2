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
var util = require("util");


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
        [{"ba": 1, "ab": 2}, {"ab": 2}, {"ba": 1}]
        , [{"a": 1, "a": 2}, {"a": 2}, {}]
        , [{"b": 2, "b": 1}, {}, {"b": 1}]
        , [{}, {}, {}]
    ],
    function (obj, expected_bykey, expected_byval) {
        exports["testUtilObjectFilter: " + util.repr(obj)] = function () {
            var copy = util.object.copy(obj);
            var filtered = util.object.filter(
                obj, function (key, val) {
                    return (key.indexOf("a") === 0);
                });
            assert.isSame(expected_bykey, filtered);
            filtered = util.object.filter(
                obj, function (key, val) {
                    return (val === 1);
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


if (require.main == module.id) {
    require("test/runner").run(exports);
}


//
//request-tests.js ends here
