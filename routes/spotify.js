var MongoClient = require('mongodb').MongoClient;
var ObjectID    = require('mongodb').ObjectID;
var config      = require('../config'); // get our config file
var url         = process.env.MONGO_URL || config.database;
var SpotifyWebApi = require('spotify-web-api-node');
var Async       = require('async');

var spotifyApi = new SpotifyWebApi();


var createPlaylist = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var playlists = db.collection('playlists');

        var playlistObj = {
            eventId: req.params.eventId,
            songs: []
        };

        playlists.insert(playlistObj, function(err, result) {
            if(err) {
                res.json({success: false, message: "Database error."});
            }
            else {
                res.json({success: true, message: "Successfully created playlist."});
            }
        });
    }); 
};

var search = function(req, res) {
    spotifyApi.searchTracks(req.params.searchQuery, {limit: 5}, function(err, data) {
        if(err) {
            res.json({success: false, message: "Spotify search error."});
        }
        else {            

            var items = data.body.tracks.items;
            var results = [];

            for(var i = 0; i < items.length; i++){
                results [i] = {
                    track: items[i].name,
                    artist: items[i].artists[0].name,
                    album: items[i].album.name,
                    id: items[i].id
                }
            }

            res.json({success: true, results: results});
        }
    });
};

var functions = {
    createPlaylist,
    search
};


module.exports = functions;