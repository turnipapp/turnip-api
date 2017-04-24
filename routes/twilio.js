var twilio = require('twilio');

var sid = "ACd9e67a4017bb86a46225f1fe3ee98d07";
var secret = "2f67cfd069e5b32548ee58bae955a2ba";

var client = new twilio.RestClient(sid, secret);


var sendMessage = function(number, message) {
    client.messages.create({
        to: '+1' + number,
        from: '+12036978413',
        body: message
    }, function (err, data) {
        if (err)
            console.log(err);
        console.log(data);   
    //res.json({success:true, message: err});
    });

};


var functions = {
    sendMessage: sendMessage
};

module.exports = functions;

