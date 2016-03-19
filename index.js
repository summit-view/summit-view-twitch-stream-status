var Q = require('q');
var request = require('request');

var id = 'summit-view-twitch';
var streamsUrl = 'https://api.twitch.tv/kraken/streams', // ?channel=
    channelsUrl = 'https://api.twitch.tv/kraken/channels/';

var config, summit, channels = [], profiles = {};


// refresh data
var update = function() {
    Q.resolve()
        .then(function() {
            var updatedProfiles = channels.map(function(channel) {
                var deferred = Q.defer();

                request.get({url: channelsUrl + channel, json: true}, function(err, res) {
                    if( !err ) {
                        deferred.resolve(res.body);
                    }
                    else {
                        deferred.resolve(false);
                    }
                });

                return deferred.promise;
            });

            return Q.all(updatedProfiles);
        })
        .then(function(updatedProfiles) {
            updatedProfiles.forEach(function(profile) {
                if( profile ) {
                    profile.is_streaming = false;
                    profile.is_playlist = null;
                    profiles[profile.name] = profile;
                }
            });

            var deferred = Q.defer();

            request.get({url: streamsUrl, qs: {channel: channels.join(','), stream_type: 'all'}, json:true}, function(err, res) {
                if(!err) {
                    deferred.resolve(res.body);
                }
            });

            return deferred.promise;
        })
        .then(function(streamsRes) {
            streamsRes.streams.forEach(function(stream) {
                profiles[stream.channel.name].is_streaming = true;
                profiles[stream.channel.name].is_playlist = stream.is_playlist;
            });

            summit.io.emit('profiles', profiles);
            summit.io.emit('loaded');
        });
};


var track = function(channel) {
    // track new keywords
    var chnls = channel.split(',');

    for (var i = 0; i < chnls.length; i++) {
        channels.push(chnls[i].trim());
    }

    if( !channels.length ) {
        summit.io.emit('loading', 'No channels to track...');
    }
    else {
        update();
    }
};

module.exports = function(s) {
    summit = s;

    // emit the profiles on new connection
    summit.io.on('connection', function(socket) {
        socket.emit('profiles', profiles);

        if( channels.length ) {
            socket.emit('loaded');
        }
        else {
            socket.emit('loading', 'No channels to track...');
        }
    });

    return summit.settings()
        .then(function(settings) {

            settings = settings || {};

            summit.registerSetting({
                name: 'channel',
                label: 'Channel',
                type: 'text',
                instructions: 'Enter channel to track. Separate multiple channels with a comma.',
                value: settings.channel || '',
            });

            if( settings.channel ) {
                track(settings.channel)
            }

            setInterval(update, 60*1000);

            return {
                id: id,
                branding: {
                    icon: {
                        fa: 'twitch',
                    },
                    color: {
                        background: 'twitch-tv',
                        text: 'clouds',
                        icon: 'clouds',
                    }
                },
            };
        });
};

module.exports.id = id;

module.exports.client = __dirname + '/lib/client.js';

module.exports.style = __dirname + '/public/style.css';

module.exports.onSettings = function(settings) {
    track(settings.channel);
};
