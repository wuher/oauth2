// -*- coding: utf-8 -*-
//oauth_twitter_2.js ---
//
// Copyright (C) MIT License
// Tampere University of Technology
//
// Created: Tue Jul  6 14:46:00 2010 (+0200)
// Author: wuher
//

// this can be run once the authorization tokens have been fetched
// with _1 script


var oauth = require("oauth2");


// TODO: put your consumer credentials here
var CONSUMER_KEY = "";
var CONSUMER_SECRET = "";

// TODO: put token and secret here:
var OAUTH_TOKEN = "";
var OAUTH_TOKEN_SECRET = "";


// get twitter friends
var getfriends = function() {
    var consumer, access_token, client, res, out = [];
    consumer = new oauth.Consumer(CONSUMER_KEY, CONSUMER_SECRET);
    access_token = new oauth.Token(OAUTH_TOKEN, OAUTH_TOKEN_SECRET);
    client = new oauth.Client(consumer, access_token);
    res = client.request("http://api.twitter.com/1/statuses/friends.json");

    if (res.status !== 200) {
        throw new Exception("http returned " + res.statusText);
    } else {
        res.body.forEach(function (data) {
                             out.push(data.decodeToString());
                         });
        return JSON.parse(out.join(""));
    }
};

var i, friends = getfriends();
for (i = 0; i < friends.length; i += 1) {
    print("-------------------------------------------------");
    print(JSON.stringify(friends[i]));
}

//
//oauth_twitter_2.js ends here
