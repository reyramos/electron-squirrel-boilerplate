/**
 * Created by ramor11 on 6/24/2016.
 */
'use strict';

//node js dependencies
let path = require('path'),
    fs = require('fs'),
    uuid = require('uuid'),
    loki = require('lokijs'),
    $q = require('q'),
    utilities = require('../libs/utilities');


var service = {};

service.loki = function (process) {

    this.db = new loki(path.resolve(__dirname, '../..', 'app.db'));
    this.collection = null;
    this.loaded = false;

    this.init = function() {
        // var d = $q.defer();
        //
        // this.reload()
        //     .then(function() {
        //         this.collection = this.db.getCollection('keychain');
        //         // this.loaded = true;
        //
        //         d.resolve(this);
        //     }.bind(this))
        //     .catch(function(e) {
        //         // create collection
        //         this.db.addCollection('keychain');
        //         // save and create file
        //         this.db.saveDatabase();
        //
        //         this.collection = this.db.getCollection('keychain');
        //         // this.loaded = true;
        //
        //         d.resolve(this);
        //     }.bind(this));
        //
        // return d.promise;
    };


};


module.exports = service;