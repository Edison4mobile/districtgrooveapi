var Nexmo = require('../node_modules/nexmo/lib/Nexmo');

function send(booking){    
    var nexmo = new Nexmo({
        apiKey: '2c909569', 
        apiSecret: '80c3b6a1fed15b33'
    });
    
    // var nexmo = require('../node_modules/nexmo/lib/Nexmo')({apiKey: '2c909569', apiSecret: '80c3b6a1fed15b33'});    
    
    var schedule = booking.schedule.toString();
    
    nexmo.message.sendSms('639272326087', booking.artistInfo.contactNumber, 'Hi ' + booking.artistInfo.firstName +',\n\nNew Booking From ' + booking.customerInfo.firstName + ' ' + booking.customerInfo.lastName + ' - Schedule: ' + schedule + ', Total Bill: ' + booking.totalBill +'\n\nPlease check your account, to accept/reject the booking. Thank You! [BLUSH-PH]', function(){
        console.log('sent')
    });    
}

module.exports = {
    send : send
} 