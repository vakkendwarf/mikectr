// CONSTANTS / MODULES

var total = 0;
const chalk = require ("chalk");

// SYSTEM MESSAGES

function sysLog(text) {
	console.log(chalk.red("SYS")+chalk.bold(" >> ")+chalk.gray(text)+chalk.gray("... ")+chalk.green.bold("OK"));
}

function sysErr(text) {
	console.log(chalk.red("SYS")+chalk.bold(" >> ")+chalk.gray(text)+chalk.gray("... ")+chalk.red.bold("ERROR"));
}

// SOME OTHER SHIT

function sendEmMsgCt(something){
		var pagetext = something;
		io.emit('change_text_main', {
			pagetext: pagetext
		});
}

// END sysLog

const fs = require ("fs");
const express = require ("express");

// SERVER & PAGE

var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname));

// ASSIGN PORT

if(process.env.PORT != undefined){
	server.listen(process.env.PORT);
	sysLog("Listening on port " + process.env.PORT);
}
else{
	sysErr("Getting assigned port");
	server.listen(6969);
	sysLog("Listening on port 6969");
}

var dir = __dirname;

// UPLOAD SITE

app.get('/', function(req, res) {
    res.sendFile(dir + '/index.html');
});

// BASE FCTS

function writeFile(savPath, data) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(savPath, data, function (err) {
            if (err) {
                reject(err)
            } else {
                resolve();
            }
        });
    })
}

var Q = require('q');

function readFirstLine (path) {
  return Q.promise(function (resolve, reject) {
    var rs = fs.createReadStream(path, {encoding: 'utf8'});
    var acc = '';
    var pos = 0;
    var index;
    rs
      .on('data', function (chunk) {
		sysLog("Retrieved file.")
        index = chunk.indexOf('\n');
        acc += chunk;
		sysLog(acc);
		total = acc;
		sendEmMsgCt(acc);
        index !== -1 ? rs.close() : pos += chunk.length;
      })
      .on('close', function () {
        resolve(acc.slice(0, pos + index));

      })
      .on('error', function (err) {
        reject(err);
		sysErr(err);
      })
  });
}

io.on('connection', function(client) {  
    sysLog('Client connected');
	sysLog("Sending");
	readFirstLine("saved.txt");
	
	client.on('plus', function(data) {
		total -= -1;
		writeFile("saved.txt", total);
		sysLog("File updated");
		sendEmMsgCt(total);
	});

	client.on('minus', function(data) {
		total -= 1;
		writeFile("saved.txt", total);
		sysLog("File updated");
		sendEmMsgCt(total);
	});
});



