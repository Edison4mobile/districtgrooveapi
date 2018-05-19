Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});

Parse.Cloud.define('request-reset', function(req, res) {
  Parse.initialize("myAppId", "myAppId", "myMasterKey");
  Parse.serverURL = 'https://muse-rest-api.herokuapp.com/parse';
  Parse.Cloud.useMasterKey();

  var mailgun = require('../notificationAPI/mailgun.js');
  var User = Parse.Object.extend("User");
  var user = new Parse.Query(User);

  user.equalTo("username", req.params.email);
  user.find({
    success: function(results) {
      console.log(results[0].id);
      if(results.length){
        res.success({result: 'success'});
        mailgun.resetPasswordRequest({
          userId : results[0].id,
          email: req.params.email
        });
      }else{
        res.success({result: "failed"});
      }
    },
    error: function(error) {
      res.error({result: "something went wrong"});
      console.log(error);
    }
  });

});

Parse.Cloud.define('request-register', function(req, res) {
  var mailgun = require('../notificationAPI/mailgun.js');

  mailgun.sendRegistrationRequest(req.params);
  res.success({result: 'success'});
});

Parse.Cloud.define('quick-booking', function(req, res) {
  Parse.initialize("myAppId", "myAppId", "myMasterKey");
  Parse.serverURL = 'https://muse-rest-api.herokuapp.com/parse';
  Parse.Cloud.useMasterKey();

  var ArtistObject = Parse.Object.extend("Artist");
  var query = new Parse.Query(ArtistObject);

  query.equalTo("coordinates", req.params.coordinates);
  res.success(query);
/*  query.limit(5);

  query.find({
    success: function(results) {
      console.log(results[0].id);
      res.success({result: results[0]});
    },
    error: function(error) {
      res.error({result: "something went wrong"});
    }
  }); */
});

Parse.Cloud.afterSave("Booking", function(request) {
  console.log('existed: ', request.object.existed());

  var booking = request.object.attributes;
  var nexmo = require('../notificationAPI/nexmo.js');
  var mailgun = require('../notificationAPI/mailgun.js');
  var pubnub = require('../notificationAPI/pubnub.js');

  if(!request.object.existed()){
    if(booking.artistInfo.contactNumber){
      nexmo.send(booking);
    }

    if(booking.artistInfo.email){
      mailgun.send(booking);
    }

    if(booking.artistInfo.id){
      var channel = 'book/' + booking.artistInfo.id;
      var payload = {
        content: request.object,
        sender: {
          name: booking.customerInfo.firstName + ' ' + booking.customerInfo.lastName,
          avatar : booking.customerInfo.avatar
        },
        date: new Date()
      }
      pubnub.publish(channel, payload);
    }
  }
});

Parse.Cloud.afterSave("Thread", function(request) {
  var thread = request.object.attributes;
  var pubnub = require('../notificationAPI/pubnub.js');

  if(thread.messageFrom === 'customer'){
    if(thread.artistInfo){
      var channel = 'message/' + thread.artistInfo.id;
      var payload = {
        content: {
          threadId : request.object.id,
          message : thread.lastMessage,
          userId : thread.customerInfo.id,
          createdDate : ''
        },
        sender: {
          name: thread.customerInfo.firstName + ' ' + thread.customerInfo.lastName,
          avatar : thread.customerInfo.avatar
        },
        date: new Date()
      }
      pubnub.publish(channel, payload);
    }
  } else {
    if(thread.customerInfo){
      var channel = 'message/' + thread.customerInfo.id;
      var payload = {
        content: {
          threadId : request.object.id,
          message : thread.lastMessage,
          userId : thread.artistInfo.id,
          createdDate : ''
        },
        sender: {
          name: thread.artistInfo.firstName + ' ' + thread.artistInfo.lastName,
          avatar : thread.artistInfo.avatar
        },
        date: new Date()
      }
      pubnub.publish(channel, payload);
    }
  }


});
