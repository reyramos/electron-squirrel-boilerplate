/**
 * Created by ramor11 on 6/24/2016.
 */
'use strict';

//node js dependencies
let path = require('path'),
    fs = require('fs'),
    version = function () {
        //If the local machine contains a config app, lets load the environment specified, used for developers
        let localFilePath = path.join(path.dirname(__dirname).replace(/app\.asar/g, ''), 'config.json'),
        //Allows for local path config file
            localConfig = fs.existsSync(localFilePath) ? localFilePath : path.join(path.dirname(__dirname), 'config.json'),
            version = fs.existsSync(localConfig) ? JSON.parse(fs.readFileSync(localConfig, 'utf8')) : require('../../electron.config.js');
        return version;
    }(),
    utilities = require('../libs/utilities');


var service = {};

service.getVersion = function (process) {
    return utilities.extend({}, version, process.versions, {resourcesPath: process.resourcesPath}, {msg: version} );
};


module.exports = service;