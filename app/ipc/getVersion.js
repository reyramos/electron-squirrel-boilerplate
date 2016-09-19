/**
 * Created by ramor11 on 6/24/2016.
 */
'use strict';

//node js dependencies
let path = require('path'),
    ELECTRON_REPO = path.dirname(__dirname).replace(/app\.asar/g, ''),
    fs = require('fs'),
    version = function () {
        let readJson = function (path) {
            return JSON.parse(fs.readFileSync(path, 'utf8'))
        };
        //If the local machine contains a config app, lets load the environment specified, used for developers
        let userConfig = path.join(ELECTRON_REPO, 'config.json'),
            buildConfig = path.join(path.dirname(__dirname), 'config.json'),
            devConfig = fs.existsSync(buildConfig) ? readJson(buildConfig) : require('../../electron.config.js');

        let version = fs.existsSync(userConfig) ? Object.assign({}, readJson(buildConfig), readJson(userConfig)) : (fs.existsSync(buildConfig) ? readJson(buildConfig) : devConfig);

        return Object.assign({}, require('../libs/config'), version);

    }();


var service = {};

service.getVersion = function (process) {

    return Object.assign({}, version, process.versions, {resourcesPath: process.resourcesPath}, {msg: version});
};


module.exports = service;