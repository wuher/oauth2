/*
 * 4.4.2010 wuher
 */


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
    assert.isEqual(consumer.key, "my-consumer-key", "key not set");
    assert.isEqual(consumer.secret, "my-consumer-secret", "secret not set");
};


exports.testConsumerToString = function () {
    var consumer = new oauth.Consumer("jedi", "sith");
    assert.isEqual(consumer.toString(),
                       "oauth_consumer_key=jedi&oauth_consumer_secret=sith",
                       "not the same");
};


exports.testTokenBasic = function () {
    assert.throwsError(
        function () {
            new oauth.Token()
        }, Error, "should raise error");
    assert.throwsError(
        function () {
            new oauth.Token("my-secret")
        }, Error, "should raise error");
    var token = new oauth.Token("my-key", "my-secret");
    assert.isEqual(token.key, "my-key", "key not set");
    assert.isEqual(token.secret, "my-secret", "secret not set");
    assert.isEqual(token.callback, null);
    assert.isEqual(token.callback_confirmed, null);
    assert.isEqual(token.verifier, null);
};


exports.testCallbackSetter = function () {
    var token = new oauth.Token("jedi", "sith");
    token.callback = "tatooine";
    assert.isEqual(token.callback, "tatooine");
    assert.isEqual(token.callback_confirmed, "true");
};


exports.testVerifierSetter = function () {
    var verifierset = {}, i, token = new oauth.Token("mara", "jade");
    token.verifier = "endor";
    assert.isEqual(token.verifier, "endor");
    token.setVerifier("dantoiine");
    assert.isEqual(token.verifier, "dantoiine");

    // pretty naive, but better than nothing..
    for (i = 0; i < 100; i += 1) {
        token.verifier = null;
        assert.notEqual(token.verifier, null);
        assert.isTrue(!(token.verifier in verifierset));
        assert.isEqual(token.verifier.length, 8);
        verifierset[token.verifier] = true;

        token.setVerifier(null);
        assert.notEqual(token.verifier, null);
        assert.isTrue(!(token.verifier in verifierset));
        assert.isEqual(token.verifier.length, 8);
        verifierset[token.verifier] = true;
    }
};


exports.testCallbackGetter = function () {
    var token = new oauth.Token("yavin", "hoth");
    token.callback = "http://www.cs.tut.fi/~jedi/ready";
    token.setVerifier();
    assert.isEqual(token.getCallbackUrl(),
                   "http://www.cs.tut.fi/~jedi/ready?oauth_verifier=" + token.verifier);
};


if (require.main == module.id) {
    require("test/runner").run(exports);
}
