// -*- coding: utf-8 -*-
//signing-tests.js ---
//
// Copyright (C) MIT License
// Tampere University of Technology
//
// Created: Wed Jun 16 14:12:19 2010 (+0300)
// Author: wuher (jedi@cs.tut.fi)
//
//


var o2 = require("oauth2");
var assert = require("test/assert");


exports.testSHA = function () {
    var req, con, tok, sig, exp = "KnTWxZ/dZUvOTrvtjw9cXI3yR6U=";

    assert.isSame("HMAC-SHA1", o2.SignatureMethod_HMAC_SHA1.myname);
    req = new o2.Request("GET", "http://jedi.net/");
    con = new o2.Consumer("jedi", "sith");
    tok = new o2.Token("jedi", "sith");

    sig = new o2.SignatureMethod_HMAC_SHA1();
    assert.isSame("HMAC-SHA1", sig.myname);
    var res = sig.sign(req, con, tok);
    assert.isSame(exp, res);
};


/**
 * this test is ported from Python's oauth2
 */
exports.testSignRequest = function () {
    var exp, method, methods, tok, con, req, params, url;

    url = "http://sp.example.com/";
    params = {
        oauth_version: "1.0",
        oauth_nonce: "4572616e48616d6d65724c61686176",
        oauth_timestamp: "137131200"
    };

    tok = new o2.Token("tok-test-key", "tok-test-secret");
    con = new o2.Consumer("con-test-key", "con-test-secret");

    params["oauth_token"] = tok.key;
    params["oauth_consumer_key"] = con.key;
    req = new o2.Request("GET", url, params);

    methods = {
        "TQ6vGQ5A6IZn8dmeGB4+/Jl3EMI=": new o2.SignatureMethod_HMAC_SHA1(),
        "con-test-secret&tok-test-secret": new o2.SignatureMethod_PLAINTEXT()
    };

    for (exp in methods) if (methods.hasOwnProperty(exp)) {
        method = methods[exp];
        req.signRequest(method, con, tok);
        assert.isSame(method.myname, req.parameters["oauth_signature_method"]);
        assert.isSame(exp, req.parameters["oauth_signature"]);
    }
};


if (require.main == module.id) {
    require("test/runner").run(exports);
}

//
//signing-tests.js ends here
