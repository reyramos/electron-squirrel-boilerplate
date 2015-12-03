!(function (window) {

    'use strict';

    //////////////
    // Constants
    /////////////

    var ELECTRON_BRIDGE_HOST = 'ELECTRON_BRIDGE_HOST',
        ELECTRON_BRIDGE_CLIENT = 'ELECTRON_BRIDGE_CLIENT',
        ELECTRON_HOST_ID = 'electron-host',
        db_silo = 'client/data',
        ipc = null,
        diskdb = null,
        currentCallbackId = 0, // Create a unique callback ID to map requests to responses
        service = {
            onmessage: []
        };


    try {
        ipc = require('electron').ipcRenderer;

    } catch (e) {
        console.error('modules not loaded:ipc => ', e)
    }
    //
    //try {
    //    diskdb = require('diskdb');
    //
    //} catch (e) {
    //    console.error('modules not loaded:diskdb => ', e)
    //}


    /**
     * This creates a new callback ID for a request
     */
    function getCallbackId() {
        currentCallbackId += 1;
        //reset callback id
        if (currentCallbackId > 10000) {
            currentCallbackId = 0;
        }
        return currentCallbackId;
    }

    /**
     * Will check if promise has been sent to return back to
     * defer.promise() message
     */
    function listening() {
        if (service.onmessage.hasOwnProperty(this.promise)) {
            service.onmessage[this.promise].cb.resolve(this)
            delete service.onmessage[this.promise];
            delete this.promise;
        }
    }

    function onMessage(data) {
        listening.apply(data)
    }

    /////////////////
    // Constructor
    ////////////////

    var Electron = function () {
        var o = new Object(), $rootScope = window.angular || angular ? angular.injector(["ng"]).get("$rootScope") : null;


        //ipc -> host (main process)
        o.send = function (eventType, data) {

            if (!ipc)return;

            var data = typeof (data) === "object" ? data : {},
                defer = new Promise(function (resolve, reject) {
                    // do a thing, possibly async, then…

                    var callback_id = getCallbackId(),
                        etype = typeof arguments[0],
                        dtype = typeof arguments[1];

                    if (etype === 'object') {
                        data = eventType;
                        eventType = (typeof(data.promise) === "undefined" ? callback_id : data.promise);
                    }


                    //set the caller
                    service.onmessage[callback_id] = {
                        time: new Date(),
                        cb: {
                            resolve: resolve,
                            reject: reject
                        }
                    };


                    ipc.send(ELECTRON_BRIDGE_HOST, {
                        eventType: eventType,
                        promise: callback_id,
                        msg: data
                    });
                });


            return defer;
        };


        ////diskdb
        //o.db = function (collection) {
        //    if (diskdb) {
        //        var collection_arr = [];
        //        if (typeof collection == 'object') {
        //            collection_arr = collection;
        //        } else if (typeof collection == 'string') {
        //            collection_arr.push(collection);
        //        }
        //
        //        return diskdb.connect(db_silo, collection_arr);
        //    }
        //
        //    return 'diskdb is not installed and/or configured.'
        //};


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
            console.error('electron modules not loaded => ', e)
        }


        //Start listening for host messages
        if (ipc) {
            console.log('ngElectron has joined the room.');
            ipc.on(ELECTRON_BRIDGE_CLIENT, function (evnt, data) {

                if ($rootScope)
                    $rootScope.$broadcast(ELECTRON_HOST_ID, data);

                onMessage(data)
            });
            /*
             Add $electron as a special root property.
             Though generally not a good practice,
             it helps protect the electron instance
             and we are in a more closed enviroment
             as it is.
             */
            if ($rootScope)
                $rootScope.$electron = o;

        }

        return o;

    };

    window.Electron = Electron;

})(typeof window === 'object' ? window : this);
