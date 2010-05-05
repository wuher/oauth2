/*
 * 4.4.2010 wuher
 */


var assert = require("assert");
var oauth = require("oauth2");


exports.testConsumerBasic = function () {
    assert["throws"](
        function () {
            new oauth.Consumer()
        }, Error, "should raise error");
    assert["throws"](
        function () {
            new oauth.Consumer("my-secret")
        }, Error, "should raise error");
    //     assert["throws"](
    //         function () {
    //             oauth.Consumer("yy", "xx");
    //         }, Error, "without new should raise error");
    var consumer = new oauth.Consumer("my-consumer-key", "my-consumer-secret");
    assert.strictEqual(consumer.key, "my-consumer-key", "key not set");
    assert.strictEqual(consumer.secret, "my-consumer-secret", "secret not set");
};


exports.testConsumerToString = function () {
    var consumer = new oauth.Consumer("jedi", "sith");
    assert.strictEqual(consumer.toString(),
                       "oauth_consumer_key=jedi&oauth_consumer_secret=sith",
                       "not the same");
};


exports.testTokenBasic = function () {
    assert["throws"](
        function () {
            new oauth.Token()
        }, Error, "should raise error");
    assert["throws"](
        function () {
            new oauth.Token("my-secret")
        }, Error, "should raise error");
    var token = new oauth.Token("my-key", "my-secret");
    assert.strictEqual(token.key, "my-key", "key not set");
    assert.strictEqual(token.secret, "my-secret", "secret not set");
    assert.strictEqual(token.callback, null);
    assert.strictEqual(token.callback_confirmed, null);
    assert.strictEqual(token.verifier, null);
};


exports.testCallbackSetter = function () {
    var token = new oauth.Token("jedi", "sith");
    token.callback = "tatooine";
    assert.strictEqual(token.callback, "tatooine");
    assert.strictEqual(token.callback_confirmed, "true");
};


exports.testVerifierSetter = function () {
    var verifierset = {}, i, token = new oauth.Token("mara", "jade");
    token.verifier = "endor";
    assert.strictEqual(token.verifier, "endor");

    // pretty naive, but better than nothing..
    for (i = 0; i < 100; i += 1) {
        token.verifier = null;
        assert.notStrictEqual(token.verifier, null);
        assert.ok(!(token.verifier in verifierset));
        assert.strictEqual(token.verifier.length, 8);
        verifierset[token.verifier] = true;
    }
};

if (require.main == module.id) {
    require("test/runner").run(exports);
}
