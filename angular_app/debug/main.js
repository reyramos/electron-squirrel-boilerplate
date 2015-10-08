var path = require('path');
var http = require("http");
var https = require("https");

var path = require('path'),
    fs = require('fs');





function getVersion(callback) {
    http.get("http://dev-eligibility-phoenix.labcorp.com/reyramos/builds/build.json", function(res) {
        var output = '';
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function () {
            var obj = JSON.parse(output);
            callback(res.statusCode, obj);
        });

    }).on('error', function(e) {
        callback(e);
    });


}

getVersion(function(status, obj){
    console.log('statusCode', status)
    console.log('obj', obj)
})