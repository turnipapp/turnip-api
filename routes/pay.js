var config      = require('../config');

var unirest     = require('unirest');
var base_url    = "https://connect.squareup.com/v2/";

var pay = function (req, res) {
    
    var token = require('crypto').randomBytes(64).toString('hex');

    var request_body = {
/*        card_nonce: req.body.nonce,
        amount_money: {
            amount: 1,
            currency: 'USD'
        },
        idempotency_key: token
  */
        "given_name": "Kevin",
        "family_name": "Cardona",
        "email_address": "kevincardona1@gmail.com"
    }
    
    unirest.post(base_url + '/customers')
    .headers({
        'Authorization': 'Bearer ' + config.squareAccessToken,
        'Accept': 'application/json'
    }).send(request_body)
    .end(function(response) {
        if (response.body.errors) {
            res.json({success:false, errors: response.body.errors});
            return;
        } else {
            res.json({success:true, message: response});
        }
    })
};

var functions = {
    pay: pay
}

module.exports = functions;
