// -*- coding: utf-8 -*-
//consumer-tests.js ---
//
// Copyright (C) MIT License
// Tampere University of Technology
//
// Created: Fri May  7 10:46:01 2010 (+0300)
// Author: wuher
//


var assert = require("test/assert");
var oauth = require("oauth2");


exports.testConsumerBasic = function () {
    assert.throwsError(
        function () {
            new oauth.Consumer()
        }, Error, "should raise error");
    assert.throwsError(
        function () {
            new oauth.Consumer("my-secret")
        }, Error, "should raise error");
    //     assert["throws"](
    //         function () {
    //             oauth.Consumer("yy", "xx");
    //         }, Error, "without new should raise error");
    var consumer = new oauth.Consumer("my-consumer-key", "my-consumer-secret");
    assert.isSame(consumer.key, "my-consumer-key", "key not set");
    assert.isSame(consumer.secret, "my-consumer-secret", "secret not set");
};


exports.testConsumerToString = function () {
    var consumer = new oauth.Consumer("jedi", "sith");
    assert.isSame(consumer.toString(),
                       "oauth_consumer_key=jedi&oauth_consumer_secret=sith",
                       "not the same");
};


if (require.main == module.id) {
    require("test/runner").run(exports);
}

//
//consumer-tests.js ends here
