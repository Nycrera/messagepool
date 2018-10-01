// NETWORK SERVER FILE

/* Here is the object literal for the message object 

{message: givenmessage, begin: self explanory, end: same shit, done: iftrue then dont show}
*/

const MYSQL_USER = 'usernamegoeshere';
const MYSQL_PASS = 'passgoeshere';
const MYSQL_HOST = '127.0.0.1';
const MYSQL_DB = 'somedb';
const SERVER_PORT = 3000; // Port of the socket.io server

var mysql = require('mysql');
var clientlist = []; // clientlist of the connected clients. Note that when clients disconnect their id's preserved. if they reconnect new id given.
// Main Event Server
var server = require('http').createServer();
var io = require('socket.io')(server);

io.on('connection', function (client) {
    console.log('Got a new connection!');
    client.on('new', function (data) {
        if (data.substr(0, 3) == "new") {
            data = data.substr(3);
            var message = JSON.parse(data);
            newMessage();
        }
    });
    client.on('join', function (data) {
        io.emit('joinack', newClientId().toString());
    });
    client.on('get', function (id) {
        getMessages(function (results) {
            io.emit('getres', id + JSON.stringify(results));
        });
    });
    //client.on('disconnect', function(){});
});
server.listen(SERVER_PORT);

class message {
    constructor(msg, bdate, edate) {
        this.message = msg;
        if (typeof bdate == 'string' && isNaN(bdate)) { // isNan checks for bdate not being a timestamp since timestamp is all number and must return false.
            this.begin = toTimestamp(bdate);
        }
        else if (typeof bdate == 'number') {
            this.begin = bdate;
        }
        if (typeof edate == 'string' && isNaN(edate)) { // isNan checks for edate not being a timestamp since timestamp is all number and must return false.
            this.end = toTimestamp(edate);
        }
        else if (typeof edate == 'number') {
            this.end = edate;
        }
        this.done = false;
    }
}


// Created a new mysql connection to db then return the connection
function connectMysql() {
    var connection = mysql.createConnection({
        host: MYSQL_HOST,
        user: MYSQL_USER,
        password: MYSQL_PASS,
        database: MYSQL_DB
    });
    connection.connect();
    return connection;
}

// Creates new message then inserts to db also alerts the network about new data.
function newMessage(message, bdate, edate) {
    var connection = connectMysql();
    var message = new message(message, bdate, edate);
    connection.query('INSERT INTO `messages` (messagejson,begin,end) VALUES(?,?,?)', [JSON.stringify(message), message.begin, message.end], function (error) {
        if (error) throw error;
        alertNetwork();
    });

}

// Gets current data
function getMessages(callback) {
    var connection = connectMysql();
    var now = + new Date() / 1000;
    connection.query('SELECT * FROM `messages` WHERE (begin < '+ now +' && '+ now +' < end)', [], function (error, results, fields) {
        if (error) throw error;
        callback(results);
    });
}

// Returns timestamp from given input which is a string date literal
function toTimestamp(strDate) {
    var datum = Date.parse(strDate);
    return datum / 1000;
}

// Alert network about new data is exist so they should refresh their data.
function alertNetwork() {
    io.emit('alert');
}

function newClientId() {
    var maxid = 0;
    var count = clientlist.length;
    for (i = 0; i < count; ++i) {
        if (clientlist[i] > maxid) maxid = clientlist[i];
    }
    var newid = maxid + 1
    clientlist.push(newid);
    return newid;
}