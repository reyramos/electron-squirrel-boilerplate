///**
// * ngElectron service for AngularJS
// * (c)2015 C. Byerley @develephant
// * http://develephant.github.io/ngElectron
// * See also: https://develephant.gitgub.io/amy
// * Version 0.4.0
// */

(function (angular) {
    'use strict';

    angular.module('ngElectron', []).factory("electron", Electronfunc).run(ElectronRunFunc);

    ElectronRunFunc.$inject = ['$rootScope', 'electron'];

    var electron_host = 'ELECTRON_BRIDGE_HOST',
        electron_client = 'ELECTRON_BRIDGE_CLIENT',
        electron_host_id = 'electron-host',
        db_silo = 'client/data',
        ipc = null,
        diskdb = null;


    try {
        ipc = require('ipc');
        diskdb = require('diskdb');
    } catch (e) {
        console.error('modules not loaded :', e)
    }


    function Electronfunc() {
        var o = new Object();

        //ipc -> host (main process)
        o.send = function (data) {
            if (ipc)
                ipc.send(electron_host, data);
        };

        //diskdb
        o.db = function (collection) {
            if (diskdb) {
                var collection_arr = [];
                if (typeof collection == 'object') {
                    collection_arr = collection;
                } else if (typeof collection == 'string') {
                    collection_arr.push(collection);
                }

                return diskdb.connect(db_silo, collection_arr);
            }

            return 'diskdb is not installed and/or configured.'
        };

        try {
            //remote require
            o.require = require('remote').require;
            o.remote = require('remote');

            //Electron api
            o.app = o.require('app');
            o.browserWindow = o.require('browser-window');
            o.clipboard = o.require('clipboard');
            o.dialog = o.require('dialog');
            o.menu = o.require('menu');
            o.menuItem = o.require('menu-item');
            o.nativeImage = o.require('native-image');
            o.powerMonitor = o.require('power-monitor');
            o.protocol = o.require('protocol');
            o.screen = o.require('screen');
            o.shell = o.require('shell');
            o.tray = o.require('tray');

            //Node 11 (abridged) api
            o.buffer = o.require('buffer');
            o.childProcess = o.require('child_process');
            o.crypto = o.require('crypto');
            o.dns = o.require('dns');
            o.emitter = o.require('events').EventEmitter;
            o.fs = o.require('fs');
            o.http = o.require('http');
            o.https = o.require('https');
            o.net = o.require('net');
            o.os = o.require('os');
            o.path = o.require('path');
            o.querystring = o.require('querystring');
            o.url = o.require('url');
            o.zlib = o.require('zlib');
        } catch (e) {
            console.error('electron modules not loaded')
        }


        return o;
    }


    function ElectronRunFunc($rootScope, electron) {
        //Start listening for host messages
        if (ipc) {
            console.log('ngElectron has joined the room.');
            ipc.on(electron_client, function (data) {
                //Event type: 'electron-host'
                $rootScope.$broadcast(electron_host_id, data);
            });
            /*
             Add $electron as a special root property.
             Though generally not a good practice,
             it helps protect the electron instance
             and we are in a more closed enviroment
             as it is.
             */
            $rootScope.$electron = electron;
        }

    }

})(window.angular);
