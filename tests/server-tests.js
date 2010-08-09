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
var util = require("narwhal/util");


exports.testCtor = function () {
    var s = new oauth.Server();
    assert.isSame({}, s.signatureMethods);
    s = new oauth.Server({"a": 1});
    assert.isSame({"a": 1}, s.signatureMethods);
};


exports.testAddSignatureMethod = function () {
    var s = new oauth.Server({"b": 2}), sig = new oauth.SignatureMethod_HMAC_SHA1();
    s.addSignatureMethod({"myname": "a"});
    assert.isSame({"b": 2, "a": {"myname": "a"}}, s.signatureMethods);

    s.addSignatureMethod(sig);
    assert.isSame({"b": 2, "a": {"myname": "a"}, "HMAC-SHA1": sig},
                  s.signatureMethods);

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
    // s.expect._getVersion().withParameters(req);
    s.expect._checkSignature().withParameters(req, cons, tok);

    ret = s.verifyRequest(req, cons, tok);
    assert.isSame({"a": 1}, ret);

    mok.releaseMocks();
};


exports.testBuildAuthenticateHeader = function () {
    var head, s = new oauth.Server();

    head = s.buildAuthenticateHeader();
    assert.isSame(1, util.object.keys(head).length);
    assert.isSame("WWW-Authenticate", util.object.keys(head)[0]);
    assert.isSame("OAuth realm=\"\"" , head["WWW-Authenticate"]);

    head = s.buildAuthenticateHeader("foo.bar");
    assert.isSame(1, util.object.keys(head).length);
    assert.isSame("WWW-Authenticate", util.object.keys(head)[0]);
    assert.isSame("OAuth realm=\"foo.bar\"" , head["WWW-Authenticate"]);
};


exports.testGetVersion = function () {
    var r = new oauth.Request(), s = new oauth.Server();

    r.parameters.oauth_version = "1.0";
    assert.isSame("1.0", s._getVersion(r));

    r.parameters.oauth_version = "2.0";
    assert.throwsError(function() {
                           s._getVersion(r);
                       });
};


exports.testGetSignatureMethod = function () {
    var sig, s = new oauth.Server(), r = new oauth.Request();

    // no sig mehtods
    assert.throwsError(function () {
                           s._getSignatureMethod(r);
                       });

    // add sig method
    s.addSignatureMethod(new oauth.SignatureMethod_HMAC_SHA1());

    // still no match
    try {
        s._getSignatureMethod(r);
    } catch (e) {
        assert.isTrue(e.toString().match(".* PLAINTEXT .*following: HMAC-SHA1") !== null);
    }

    r.parameters["oauth_signature_method"] = "HMAC-SHA1";
    sig = s._getSignatureMethod(r);
    assert.isSame("HMAC-SHA1", sig.myname);
    assert.isSame("function", typeof sig.signingBase);
};


exports.testCheckSignature = function () {
    var s = new oauth.Server(), r = new oauth.Request(),
        t = new oauth.Token("tok-key", "tok-secret"),
        c = new oauth.Consumer("con-key", "con-secret");

    assert.throwsError(function () {
                           s._checkSignature(r, c, t);
                       }, Error);

    r.parameters['oauth_timestamp'] = new Date().getTime();
    assert.throwsError(function () {
                           s._checkSignature(r, c, t);
                       }, Error);

    r.parameters['oauth_nonce'] = "asdfuiop";
    assert.throwsError(function () {
                           s._checkSignature(r, c, t);
                       }, Error);

    r.parameters['oauth_nonce'] = "asdfuiop";
    assert.throwsError(function () {
                           s._checkSignature(r, c, t);
                       }, Error);

    s.addSignatureMethod(new oauth.SignatureMethod_PLAINTEXT());
    assert.throwsError(function () {
                           s._checkSignature(r, c, t);
                       }, oauth.MissingSignature);

    r.parameters["oauth_signature"] = "con-secret";
    assert.throwsError(function () {
                           s._checkSignature(r, c, t);
                       }, Error);

    r.parameters["oauth_signature"] = "con-secret&tok-secret";
    s._checkSignature(r, c, t);
};


if (require.main == module.id) {
    require("test/runner").run(exports);
}


//
//server-tests.js ends here
