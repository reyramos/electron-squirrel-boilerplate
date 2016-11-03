/**
 * Created by ramor11 on 7/5/2016.
 */
let fs = require('fs'),
    config = require("../electron.config.js"),
    helpers = require("./helpers"),
    shell = require('shelljs');


let command = "\"./node_modules/.bin/electron\"",

//build the command script based on config files
    _c = [
        command
        , "."
        , "--version=\"" + config.electronVersion + "\""

    ].join(" ")


shell.exec(_c);