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
    assert.isSame(consumer.key, "my-consumer-key", "key not set");
    assert.isSame(consumer.secret, "my-consumer-secret", "secret not set");
};


exports.testConsumerToString = function () {
    var consumer = new oauth.Consumer("jedi", "sith");
    assert.isSame(consumer.toString(),
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
    token.callback = "http://www.cs.tut.fi/~jedi/ready";
    assert.isSame(token.getCallbackUrl(),
                  "http://www.cs.tut.fi/~jedi/ready");
    token.setVerifier();
    assert.isSame(token.getCallbackUrl(),
                  "http://www.cs.tut.fi/~jedi/ready?oauth_verifier=" + token.verifier);

};


if (require.main == module.id) {
    require("test/runner").run(exports);
}
