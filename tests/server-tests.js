// -*- coding: utf-8 -*-
//server-tests.js ---
//
// Copyright (C) MIT License
// Tampere University of Technology
//
// Created: Fri Jul  9 21:36:08 2010 (+0300)
// Author: wuher
//


var assert = require("test/assert");
var oauth = require("oauth2");
var mok = require("mok");


exports.testCtor = function () {
    var s = new oauth.Server();
    assert.isSame({}, s.signatureMethods);
    s = new oauth.Server({"a": 1});
    assert.isSame({"a": 1}, s.signatureMethods);
};


exports.testAddSignatureMethod = function () {
    var s = new oauth.Server({"b": 2});
    s.addSignatureMethod({"name": "a"});
    assert.isSame({"b": 2, "a": {"name": "a"}}, s.signatureMethods);

    // test undefined
    assert.throwsError(function () {
                           s.addSignatureMethods();
                       });
    // test empty
    assert.throwsError(function () {
                           s.addSignatureMethods({});
                       });
};


exports.testVerifyRequest = function () {
    var ret, tok, req, cons, s = new oauth.Server();
    req = new oauth.Request("GET",
                            "http://jedi.net/",
                            {"a": 1, "oauth_token": "otoken"});
    cons = new oauth.Consumer("cons-key", "cons-secret");
    tok = new oauth.Token("mykey", "mysecret");

    mok.createStubFunction("_getVersion", s);
    mok.createStubFunction("_checkSignature", s);
    s.expect._getVersion().withParameters(req);
    s.expect._checkSignature().withParameters(req, cons, tok);

    ret = s.verifyRequest(req, cons, tok);
    assert.isSame({"a": 1}, ret);

    mok.releaseMocks();
};


if (require.main == module.id) {
    require("test/runner").run(exports);
}


//
//server-tests.js ends here
