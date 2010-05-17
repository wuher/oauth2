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
    assert.isNot(r.parameters);
    assert.isNot(r.url);

    r = new Request("post", "http://kuuskeri.com:8080/jedi", {"mara": "jade"});
    assert.isSame("POST", r.method);
    assert.isSame({"mara": "jade"}, r.parameters);
    assert.isSame("http://kuuskeri.com:8080/jedi", r.url);
    assert.isSame("http://kuuskeri.com:8080/jedi", r.normalized_url);
};


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

if (require.main == module.id) {
    require("test/runner").run(exports);
}


//
//request-tests.js ends here
