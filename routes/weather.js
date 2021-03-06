var MongoClient = require('mongodb').MongoClient;
var ObjectID    = require('mongodb').ObjectID;
var config      = require('../config'); // get our config file
var url         = process.env.MONGO_URL || config.database;
var geocoder    = require('geocoder');

var unirest   = require('unirest');
var darkskyKey = "f824dd4702cdab0485cef17bb972076a";
var base_url    = "https://api.darksky.net/forecast/";

var lat;
var lon;

var get = function (req,res) {
  MongoClient.connect(url, function(err, db) {
    var events = db.collection('events');
    events.findOne({_id: new ObjectID(req.params.eventId)}, function (err, event) {
      if (err || !event) {
        res.json({succes: false, message: "Couldn't find event"});
        return;
      } else {
          var lat = event.location.geometry.location.lat;
          var lon = event.location.geometry.location.lng;
          var date = new Date(event.dateStart);
          var request = unirest.get(base_url + darkskyKey + '/' + lat + ',' + lon + date.getTime()).end(function (response) {
            res.json({success:true, weather: response, location: event.location.formatted_address});
          });
      }
    });
  });
};



var functions = {
  get: get
};

module.exports = functions;
