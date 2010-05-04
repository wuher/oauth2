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
    assert["throws"](
        function () {
            oauth.Consumer("my-secret")
        }, Error, "without new <should raise error");
    var consumer = new oauth.Consumer("my-consumer-key", "my-consumer-secret");
    assert.equal(consumer.key, "my-consumer-key", "key not set");
    assert.equal(consumer.secret, "my-consumer-secret", "secret not set");
};


exports.testConsumerToString = function () {
    var consumer = new oauth.Consumer("jedi", "sith");
    assert.equal(consumer.toString(),
                 "oauth_consumer_key=jedi&oauth_consumer_secret=sith",
                 "not the same");
};


if (require.main == module.id) {
    require("test/runner").run(exports);
}
