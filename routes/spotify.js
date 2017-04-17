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
                    songId: items[i].id
                };
            }

            res.json({success: true, results: results});
        }
    });
};

// Creates a playlist if need be, otherwise returns the event's playlist
function verifyPlaylist(eventId, callback) {
    MongoClient.connect(url, function(err, db) {
        var playlists = db.collection('playlists');

        playlists.findOne({'eventId': new ObjectID(eventId)}, function(err, playlist) {
            if (err) {
                callback(err, NULL);
                return;
            }
            if ( typeof playlist !== 'undefined' && playlist ) {
                callback(false, playlist);
            } else {
                var playlistObj = {
                    eventId: new ObjectID(eventId),
                    songs: []
                };

                playlists.insert(playlistObj, function(err, res) {
                    if (err) {
                        callback(err, NULL);
                    } else {
                        callback(false, res.ops[0]);
                    }
                });
            }
        });
    });
}

var addSong = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        verifyPlaylist(req.params.eventId, function(err, playlist) {
            var users = db.collection('users');
            var userId = req.decoded._id;
            users.findOne({'_id': new ObjectID(userId)}, function(err, user) {
                var songObj = {
                    track: req.body.track,
                    artist: req.body.artist,
                    album: req.body.album,
                    songId: req.body.songId,
                    userName: user.firstName + ' ' + user.lastName
                };

                var playlists = db.collection('playlists');
                playlists.update({'eventId': new ObjectID(req.params.eventId)}, {$push: {songs: songObj}}, function(err, result) {
                    if(err) {
                        res.json({success: false, message: "Database error."});
                    }
                    else{
                        res.json({success: true});
                    }
                });
            });
        });
    });
};

var getSongs = function(req, res) {
    verifyPlaylist(req.params.eventId, function(err, playlist) {
        if (err) {
            res.json({success: false, message: err});
        }
        res.json({success: true, songs: playlist.songs});
    });
};

var generateString = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        var playlists = db.collection('playlists');
        var playlist = playlists.findOne({'eventId': new ObjectID(req.params.eventId)}, function(err, playlist) {
            if(err) {
                res.json({success: false, message: "database error"});
            }
            else {
                var returnStr = 'https://open.spotify.com/trackset/playlist/';

                if(playlist.songs.length > 0) {
                    var songs = playlist.songs;

                    returnStr += songs[0].songId;

                    for(var i = 1; i < songs.length; i++) {
                        returnStr = returnStr + ',' + songs[i].songId;
                    }

                    res.json({success: true, url: returnStr});
                }
            }
        });
    });
};

var deleteSong = function (req, res) {
    var eventId = req.params.eventId;
    var songId = req.params.songId;

    MongoClient.connect(url, function(err, db) {
        var playlists = db.collection('playlists');

        playlists.update({'eventId': new ObjectID(eventId)}, { $pull: {songs: {songId: songId}}}, function (err, update) {
            if (err) {
                res.json({success: false});
            } else {
                res.json({success: true});
            }
        });
    });
};

var functions = {
    createPlaylist: createPlaylist,
    search: search,
    addSong: addSong,
    getSongs: getSongs,
    generateString: generateString,
    delete: deleteSong
};


module.exports = functions;
