// -*- coding: utf-8 -*-
//oauth.js ---
//
// Copyright (C) MIT License
// Tampere University of Technology
//
// Created: Sat Jul 10 10:00:45 2010 (+0300)
// Author: wuher (jedi@cs.tut.fi)
//


// oauth client (consumer) sample using jack.
//
// run with jackup jack_twitter.js and point your browser 
// to http://localhost:8080/


var qs = require("querystring");
var uri = require("uri");
var jack = require("jack");
var oauth = require("oauth2");
var sprintf = require("printf").sprintf;


var consumer_key = 'yEqC6mSxSSlsLGRk4Kg';
var consumer_secret = 'KP1NB5vkie3JbCXMmQiTYoeUZVytmZX7LeFaoIrK1B4';
var request_token_url = 'http://twitter.com/oauth/request_token';
var access_token_url = 'http://twitter.com/oauth/access_token';
var authorize_url = 'http://twitter.com/oauth/authorize';



/**
 * index page
 */
var index = function (env) {
    return {
        status : 200,
        headers : {"Content-Type": "text/html"},
        body : [
            "<html><body>",
            "my twitter friends:",
            "<div id=\"friends\">",
            "</div>",
            '<a href="/get_friends">list friends</a>',
            "</body></html>"
        ]
    };
};



/**
 * composes an error response
 */
var unauthorized_response = function () {
    return {
        status: 200,
        headers: {"Content-Type": "text/plain"},
        body: ["Unauthorized"]
    };
};



/**
 * initiate the oauth dance
 */
var get_friends = function (env) {
    var auth_url, consumer, client, resp, body = [], request_token;

    // request temporary credentials
    consumer = new oauth.Consumer(consumer_key, consumer_secret);
    client = new oauth.Client(consumer);
    resp = client.request(request_token_url, "GET");
    
    if (resp.status != "200") {
        // alas, no temprary token for me..
        return unauthorized_response();
    }
    
    // got request token, parse it
    resp.body.forEach(function (data) {body.push(data.decodeToString());});
    request_token = qs.parse(body.join(""));

    // redirect browser to twitter for authentication
    auth_url = sprintf("%s?oauth_token=%s", 
                       authorize_url, 
                       request_token["oauth_token"]);

    return {
        status : 301,
        headers : {"Content-Type": "text/plain", "Location": auth_url},
        body: []
    };
};


/**
 * coming back from twitter after the request token has been authorized
 */
var callback = function (req) {
    var consumer, request_token, access_token, client, res, out = [];

    // parse the request token from the requested url
    req = new jack.Request(req),
    consumer = new oauth.Consumer(consumer_key, consumer_secret);
    request_token = qs.parse(req.queryString())['oauth_token'];

    // exchange the request token for access token
    client = new oauth.Client(consumer);
    res = client.request(access_token_url + "?oauth_token=" + request_token);

    if (res.status != "200") {
        return unauthorized_response();
    }

    // now we have access token, let's parse it
    res.body.forEach(function (data) {out.push(data.decodeToString());});
    access_token = oauth.Token.fromString(out.join(""));
    
    // finally get the friends list
    client = new oauth.Client(consumer, access_token);
    res = client.request("http://api.twitter.com/1/statuses/friends.json");

    // return the result as is for the browser
    out = [];
    res.body.forEach(function (data) {out.push(data.decodeToString());});
    return {
        status: 200,
        headers: {"Content-Type": "application/json"},
        body: out
    };
};


/**
 * map urls
 */
var map = {};
map["/"] = index;
map["/get_friends"] = get_friends;
map["/callback"] = callback;


exports.app = jack.ContentLength(jack.URLMap(map));


//
//oauth.js ends here
