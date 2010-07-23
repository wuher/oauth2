// -*- coding: utf-8 -*-
//oauth_twitter_1.js ---
//
// Copyright (C) MIT License
// Tampere University of Technology
//
// Created: Thu Jul  8 09:04:01 2010 (+0200)
// Author: wuher
//

var printf = require("printf").printf;
var qs = require("querystring");
var uri = require("uri");
var oauth = require("oauth2");


// TODO: put your consumer details here
var consumer_key = "";
var consumer_secret = "";

var request_token_url = "http://twitter.com/oauth/request_token";
var access_token_url = "http://twitter.com/oauth/access_token";
var authorize_url = "http://twitter.com/oauth/authorize";

var consumer = new oauth.Consumer(consumer_key, consumer_secret);
var client = new oauth.Client(consumer);

// Step 1: Get a request token. This is a temporary token that is used for
// having the user authorize an access token and to sign the request to obtain
// said access token.

var resp = client.request(request_token_url, "GET");

if (resp.status != "200") {
    throw new Exception("Illegal response: " + resp.status);
}

var body = [];
resp.body.forEach(function (data) {
                      body.push(data.decodeToString());
                  });
var request_token = qs.parse(body.join(""));

print("Request Token:");
print("    - oauth_token        = " + request_token["oauth_token"]);
print("    - oauth_token_secret = " + request_token["oauth_token_secret"]);
print("");

// Step 2: Redirect to the provider. Since this is a CLI script we do not
// redirect. In a web application you would redirect the user to the URL
// below.

print("Go to the following link in your browser:");
printf("%s?oauth_token=%s", authorize_url, request_token["oauth_token"]);
print("");

// After the user has granted access to you, the consumer, the provider will
// redirect you to whatever URL you have told them to redirect to. You can
// usually define this in the oauth_callback argument as well.
var accepted = "n";
while (accepted.toLowerCase() == "n") {
    print("Have you authorized me? (y/n) ");
    accepted = system.stdin.readLine().trim();
}
print("What is the PIN? ");
var oauth_verifier = system.stdin.readLine().trim();

// Step 3: Once the consumer has redirected the user back to the oauth_callback
// URL you can request the access token the user has approved. You use the
// request token to sign this request. After this is done you throw away the
// request token and use the access token returned. You should store this
// access token somewhere safe, like a database, for future use.
var token = new oauth.Token(request_token["oauth_token"],
                            request_token["oauth_token_secret"]);
token.setVerifier(oauth_verifier);
client = new oauth.Client(consumer, token);

resp = client.request(access_token_url, "POST");
print(">> " + resp.statusText);

body = [];
resp.body.forEach(function (data) {
                      body.push(data.decodeToString());
                  });
var access_token = qs.parse(body.join(""));

print("Access Token:");
print("    - oauth_token        = " + access_token["oauth_token"]);
print("    - oauth_token_secret = " + access_token["oauth_token_secret"]);
print("");
print("You may now access protected resources using the access tokens above.");
print("");

//
//oauth_twitter_1.js ends here
