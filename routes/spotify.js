var MongoClient = require('mongodb').MongoClient;
var ObjectID    = require('mongodb').ObjectID;
var config      = require('../config'); // get our config file
var url         = process.env.MONGO_URL || config.database;
var SpotifyWebApi = require('spotify-web-api-node');

var spotifyApi = new SpotifyWebApi();
// API found here: https://github.com/thelinmichael/spotify-web-api-node


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
}

var addSong = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var playlists = db.collection('playlists');

        var songs = playlists.findOne({'eventId': req.body.eventId}).songs;

        songs.push({
            track: req.body.track,
            artist: req.body.artist,
            album: req.body.album,
            id: req.body.songId
        });

        playlists.update({'eventId': req.body.eventId}, {$set: {songs: songs}}, function(err, result) {
            if(err) {
                res.json({success: false, message: "Database error."});
            }
            else{
                res.json(getSongs());
            }
        });


    });
};

function getSongs(){
    
}

var functions = {
    createPlaylist,
    search,
    addSong
};


module.exports = functions;