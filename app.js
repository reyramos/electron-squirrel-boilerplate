var asar = require('asar');

var src = './app';
var dest = './electron/resources/app.asar';

asar.createPackage(src, dest, function() {
    console.log('Package Created');
})