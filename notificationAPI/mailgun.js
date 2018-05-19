var api_key = 'key-67b86d7ad8fdbd8b29156d4d246a5731';
var domain = 'blush.ph';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}

function send(booking){
  var schedule = booking.schedule.toString();

    var data = {
        from: 'BlushPH <blushphilippines@gmail.com>',
        to: booking.artistInfo.email,
        subject: 'BlushPH - New Booking From ' + booking.customerInfo.firstName + ' ' + booking.customerInfo.lastName,
        text: 'Hi ' + booking.artistInfo.firstName +',\n\nNew Booking From ' + booking.customerInfo.firstName + ' ' + booking.customerInfo.lastName + ' - Schedule: ' + schedule + ', Total Bill: ' + booking.totalBill +'\n\nPlease check your account, to accept/reject the booking. Thank You! [BLUSH-PH]'
    };

    mailgun.messages().send(data, function (error, body) {
        console.log(body);
    });
}

function sendRegistrationRequest(form){
  console.log(form);

  var email = form.emailAddress || form.email;

  var data = {
    from: 'BlushPH <blushphilippines@gmail.com>',
    to: 'zagatekph@gmail.com, phoebejaneelizaga@gmail.com, jhoiee888@gmail.com',
    subject: 'New Registration Request From ' + form.firstName + ' ' + form.lastName,
    text: 'Hi Admin, ',
    html: '<b>New Registration Request: </b> <br><br>First Name: ' + form.firstName + '<br>Last Name: ' + form.lastName + '<br>Primary Address: ' + form.primaryAddress + '<br>Secondary Address: ' + form.secondaryAddress + '<br>Years of Experience: ' + form.yearsOfExperience + '<br>Email Address: ' + email +  '<br>Contact Number: ' + form.contactNumber + '<br>Social Media: ' + form.socialMedia + '<br>Personal Website: ' + form.personalWebsite + '<br>Certification: ' + form.certification + '<br>About Yourself: ' + form.aboutYourself
  };

  mailgun.messages().send(data, function (error, body) {
    console.log(body);
  });
}

function resetPasswordRequest(customerInfo){
  var id = customerInfo.userId;
  var token = new Date();
  token = token.getTime();
  token = Base64.encode(token.toString());

  var data = {
    from: 'BlushPH <blushphilippines@gmail.com>',
    to: customerInfo.email,
    subject: 'BlushPH - Forgot Password',
    text: 'Hi,\n\nClick on the link to reset password: ' + token + ' ' + id,
    html: 'Hi,<br><br>Click<a href="https://muse-rest-api.herokuapp.com/reset-password?id=' + id +'&token=' + token + '"><b> HERE </b></a> to reset your password. This will redirect you to a page where you can view your new generated password.'
  };

  mailgun.messages().send(data, function (error, body) {
    console.log(body);
  });
}

module.exports = {
    send : send,
    resetPasswordRequest : resetPasswordRequest,
    sendRegistrationRequest : sendRegistrationRequest
}
