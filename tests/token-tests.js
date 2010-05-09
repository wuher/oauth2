// -*- coding: utf-8 -*-
//token.js ---
//
// Copyright (C) MIT License
// Tampere University of Technology
//
// Created: Fri May  7 10:43:24 2010 (+0300)
// Author: wuher
//


var assert = require("test/assert");
var oauth = require("oauth2");
var util = require("util");


exports.testTokenBasic = function () {
    assert.throwsError(function () {
                           new oauth.Token();
                       }, Error, "should raise error");
    assert.throwsError(function () {
                           new oauth.Token("my-secret");
                       }, Error, "should raise error");
    var token = new oauth.Token("my-key", "my-secret");
    assert.isSame(token.key, "my-key", "key not set");
    assert.isSame(token.secret, "my-secret", "secret not set");
    assert.isSame(token.callback, null);
    assert.isSame(token.callback_confirmed, null);
    assert.isSame(token.verifier, null);
};


exports.testCallbackSetter = function () {
    var token = new oauth.Token("jedi", "sith");
    token.callback = "tatooine";
    assert.isSame(token.callback, "tatooine");
    assert.isSame(token.callback_confirmed, "true");
};


exports.testVerifierSetter = function () {
    var verifierset = {}, i, token = new oauth.Token("mara", "jade");
    token.verifier = "endor";
    assert.isSame(token.verifier, "endor");
    token.setVerifier("dantoiine");
    assert.isSame(token.verifier, "dantoiine");

    // pretty naive, but better than nothing..
    for (i = 0; i < 100; i += 1) {
        token.verifier = null;
        assert.isDiff(token.verifier, null);
        assert.isTrue(!(token.verifier in verifierset));
        assert.isSame(token.verifier.length, 8);
        verifierset[token.verifier] = true;

        token.setVerifier(null);
        assert.isDiff(token.verifier, null);
        assert.isTrue(!(token.verifier in verifierset));
        assert.isSame(token.verifier.length, 8);
        verifierset[token.verifier] = true;
    }
};


exports.testCallbackGetter = function () {
    var token = new oauth.Token("yavin", "hoth");
    assert.isSame(token.getCallbackUrl(), null);
    token.setVerifier();
    assert.isSame(token.getCallbackUrl(), null);
    token = new oauth.Token("yavin", "hoth");
    token.callback = "http://www.cs.tut.fi/~jedi/ready";
    assert.isSame(token.getCallbackUrl(),
                  "http://www.cs.tut.fi/~jedi/ready");
    token.setVerifier();
    assert.isSame(token.getCallbackUrl(),
                  "http://www.cs.tut.fi/~jedi/ready?oauth_verifier=" + token.verifier);
    token.callback = "http://www.cs.tut.fi/~jedi/ready?my_param=true";
    assert.isSame(token.getCallbackUrl(),
                  "http://www.cs.tut.fi/~jedi/ready?my_param=true&oauth_verifier=" + token.verifier);
};


exports.testToString = function () {
    var token = new oauth.Token("luke", "leia");
    assert.isSame(token.toString(),
                  "oauth_token=luke&oauth_token_secret=leia");
    token = new oauth.Token("luke=jedi", "leia is princess");
    assert.isSame(token.toString(),
                  "oauth_token=luke%3Djedi&oauth_token_secret=leia%20is%20princess");
    token.callback = "http://www.cs.tut.fi/~jedi/ready";
    assert.isSame(token.toString(),
                  "oauth_token=luke%3Djedi&oauth_token_secret=leia%20is%20princess&oauth_callback_confirmed=true");
};


exports.testFromString = function () {

    // fail tests

    [
        null
        , undefined
        , ""
        , "hiihoo"
        , "oauth_token"
        , "oauth_token="
        , "oauth_token=token&oauth_token_secret"
        , "oauth_token=token&oauth_token_secret="
        , "oauth_token=&oauth_token_secret="
        , "oauth_token=&oauth_token_secret=secret"
        , "oauth_token=token&oauth_token_secret=secret&oauth_callback_confirmed="
    ].forEach(
        function (item) {
            assert.throwsError(function () {
                                   oauth.Token.fromString(item);
                               }, Error);
        });

    // success tests

    [
        ["oauth_token=token&oauth_token_secret=secret", "token", "secret"]
        , ["oauth_callback_confirmed=cbc&oauth_token=token&oauth_token_secret=secret", "token", "secret", "cbc"]
        , ["hiihoo=heehaw&oauth_token=token&oauth_token_secret=secret", "token", "secret"]
        , ["oauth_token=token%20secret&oauth_token_secret=secret%3Dpublic", "token secret", "secret=public"]
    ].forEach(
        function (item) {
            var tok = oauth.Token.fromString(item[0]);
            assert.isSame(tok.key, item[1]);
            assert.isSame(tok.secret, item[2]);

            if (item.length === 4) {
                assert.isSame(tok.callback_confirmed, item[3]);
            }
        });
};


if (require.main == module.id) {
    require("test/runner").run(exports);
}


//
//token.js ends here
