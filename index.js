// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');
var randomString = require('./helper/randomString.js');

var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  restAPIKey: process.env.REST_API_KEY || 'myRestAPIKey',
  javascriptKey : process.env.JAVASCRIPT_KEY || 'myJavascriptKey',
  masterKey: process.env.MASTER_KEY || '', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  }
});

var app = express();

var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

app.get('/reset-password', function(req, res) {
  if(req.query.id && req.query.token){
    var dateNow = new Date();
    dateNow = dateNow.getTime();

    var dateCreated = Base64.decode(req.query.token);
    dateCreated = parseInt(dateCreated);

    var timeDiff = dateNow - dateCreated;

    if(timeDiff < 900000){
      Parse.initialize("myAppId", "myAppId", "myMasterKey");
      Parse.serverURL = 'https://muse-rest-api.herokuapp.com/parse';
      Parse.Cloud.useMasterKey();

      var User = Parse.Object.extend("User");
      var user = new Parse.Query(User);

      user.equalTo("objectId", req.query.id);
      user.find({
        success: function(results) {
          var newPassword = randomString.generate();

          results[0].set('password', newPassword);
          results[0].save(null, {
            success: function(result) {
              // Execute any logic that should take place after the object is saved.
              res.status(200).send('Reset Password Successful. This is your new password: <b>' + newPassword + '</b>.');
            },
            error: function(gameScore, error) {
              console.log('error');
              res.json({ message: 'error' });
            }
          });

        },
        error: function(error) {
          console.log(error);
        }
      });
    }else{
      res.json({ message: 'error - token expired' });
    }
  }else{
    res.json({ message: 'error - missing params' });
  }
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
