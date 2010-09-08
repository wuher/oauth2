OAuth
=====

This is a port of Python's [oauth2][1] library to narwhal.

There are two examples under the examples directory which demonstrate
how to use the library against the Twitter API.

The first one assumes that your Twitter applicaction has configuration
"Application Type: Client" (set in Twitter's app config page). Then
set your consumer key and secret in oauth_twitter_1.js and
oauth_twitter_2.js files. Now you can run it.

    cd examples
    narwhal oauth_twitter_1.js

Next, copy access token to oauth_twitter_2.js and run:

    narwhal oauth_twitter_2.js

The second example uses [Jack][2] and assumes that your Twitter
application has following configuration:

    Application Type: Browser
    Callback URL: http://127.0.0.1:8080/callback
    Use Twitter for login: Yes

After that you can run the application (assuming Jack starts listening
to port 8080).

    cd examples
    jackup jack_twitter.js

Then point your browser to http://localhost:8080/ and click the link.


License
=======

Copyright (C) MIT License
Tampere University of Technology

Author: wuher (jedi@cs.tut.fi)



[1]:http://github.com/simplegeo/python-oauth2
[2]:http://github.com/280north/jack
