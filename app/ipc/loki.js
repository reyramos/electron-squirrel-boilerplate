/**
 * Created by ramor11 on 6/24/2016.
 */
'use strict';

//node js dependencies
let path = require('path'),
    fs = require('fs'),
    uuid = require('uuid'),
    loki = require('lokijs'),
    utilities = require('../libs/utilities');


var Storage = function () {

    this.db = new loki(path.resolve(__dirname, '../..', 'app.db'));
    this.collection = null;
    this.loaded = false;


};


Storage.prototype.init = function () {
    var _this = this;

    console.log('==========init==============')

    return new Promise(function (resolve, reject) {
        _this.reload().then(function () {
            console.log('RELOADED app.db')
            _this.getCollection();
            resolve(_this.db);
        }.bind(_this)).catch(function (e) {
            console.log('NEW DATABASE')
            // create collection
            _this.db.addCollection('keychain');
            // save and create file
            _this.db.saveDatabase();

            _this.getCollection();
            resolve(_this);
        }.bind(_this));
    });

};


Storage.prototype.reload = function () {
    var _this = this;
    this.loaded = false;

    return new Promise(function (resolve, reject) {
        _this.db.loadDatabase({}, function (e) {
            if (e) {
                reject(e);
            } else {
                _this.loaded = true;
                resolve(_this);
            }
        }.bind(_this));
    });

};


Storage.prototype.getCollection = function (collection) {
    var _this = this;
    _this.collection = _this.db.getCollection(collection || 'keychain');
    return _this.collection;
};


Storage.prototype.isLoaded = function () {
    return this.loaded;
};

// Storage.prototype.addDoc = function (data) {
//     var _this = this;
//
//     return new Promise(function (resolve, reject) {
//         if (_this.isLoaded() && _this.getCollection()) {
//             _this.getCollection().insert(data);
//             _this.db.saveDatabase();
//
//             resolve(_this.getCollection());
//         } else {
//             reject(new Error('DB NOT READY'));
//         }
//
//     });
//
//
// };
//
// Storage.prototype.removeDoc = function (doc) {
//     var _this = this;
//
//     return function () {
//         return new Promise(function (resolve, reject) {
//             if (_this.isLoaded() && _this.getCollection()) {
//                 _this.getCollection().remove(doc);
//                 _this.db.saveDatabase();
//
//                 // we need to inform the insert view that the db content has changed
//                 // ipc.send('reload-insert-view');
//                 console.log('we need to inform the insert view that the db content has changed')
//                 resolve(true);
//             } else {
//                 reject(new Error('DB NOT READY'));
//             }
//         });
//
//     }.bind(_this);
// };
//
// Storage.prototype.getDocs = function () {
//     return (this.getCollection()) ? this.getCollection().data : null;
// };

module.exports = {
    LokiJs: function () {

        return new Promise(function (resolve, reject) {
            var myLoki = new Storage();
            myLoki.init(function(db){resolve(db)});
        });

    }
};