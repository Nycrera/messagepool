// NETWORK CLIENT FILE

var request = require('request');
const SERVER_URL = 'http://someurl.parade:3000'; // Don't forget to change port
var clientid;
var socket = require('socket.io-client')(SERVER_URL);
socket.on('connect', () => {
    console.log('Connected!');
    if (!clientid) socket.emit('join');
});

// Join ackowledged by server and a new id acquired.
socket.on('joinack', function (data) {
    if (!clientid) clientid = parseInt(data);
    console.log('Have a new id : ' + clientid);
    socket.emit('get', clientid.toString());
});

// alert declared request new data from server
socket.on('alert', function () {
    socket.emit('get', clientid.toString());
});

socket.on('getres', function (data) {
    // Check if data is designated for us
    var len = clientid.toString().length;
    if (data.substr(0, len) == clientid.toString()) {
        data = data.substr(len);
        // Parse data
        var messages = JSON.parse(data);
        refreshData(messages);
    }
});

socket.on('disconnect', () => {
    console.log('Disconnected!')
});

function refreshData(messages) {
    console.log(messages); // DEBUG
}

/*   *API FUNCTIONS*   */

// This function gets today's lunch info using marmara.edu.tr API (Assuming you have access)
function getLunchList(callback) {
    request.post({ url: 'http://sks.marmara.edu.tr/yemek/json' }, function (err, httpResponse, body) {
        if (err) throw err;
        var list = JSON.parse(body);
        callback(list);
    });
}

// This function gets announcements using marmara.edu.tr API (Assuming you have access)
function getAnnouncements(callback) {
    request.post({ url: 'http://www.marmara.edu.tr/ajax/service/?active=1&site=www.marmara.edu.tr&check=0&type=duyuru' }, function (err, httpResponse, body) {
        if (err) throw err;
        var list = JSON.parse(body);
        callback(list);
    });
}

// This function gets events using marmara.edu.tr API (Assuming you have access)
function getEvents(callback) {
    request.post({ url: 'http://www.marmara.edu.tr/ajax/service/?active=1&site=www.marmara.edu.tr&check=0&type=etkinlik' }, function (err, httpResponse, body) {
        if (err) throw err;
        var list = JSON.parse(body);
        callback(list);
    });
}

