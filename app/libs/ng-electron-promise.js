!(function (window) {

    'use strict';

    //////////////
    // Constants
    /////////////

    var ELECTRON_BRIDGE_HOST = 'ELECTRON_BRIDGE_HOST',
        ELECTRON_BRIDGE_CLIENT = 'ELECTRON_BRIDGE_CLIENT',
        ELECTRON_HOST_ID = 'electron-host',
        electron = false,
        ipc = null,
        currentCallbackId = 0, // Create a unique callback ID to map requests to responses
        service = {
            onmessage: []
        };

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
            service.onmessage[this.promise].cb.resolve(this.msg)
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

        try {
            electron = require('electron')
        } catch (e) {
            console.error('modules not loaded:ipc => ', e)
        }

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

        try {
            ipc = electron.ipcRenderer;

            o.require = require;

            //remote require

            o.remote = electron.remote;

            //Node 11 (abridged) api
            o.buffer = require('buffer');
            o.childProcess = require('child_process');
            o.crypto = require('crypto');
            o.dns = require('dns');
            o.emitter = require('events').EventEmitter;
            o.fs = require('fs');
            o.http = require('http');
            o.https = require('https');
            o.net = require('net');
            o.os = require('os');
            o.path = require('path');
            o.querystring = require('querystring');
            o.url = require('url');
            o.zlib = require('zlib');

            o = extend({}, o, electron);

        } catch (e) {
            console.error('electron modules not loaded => ', e)
        }


        //Start listening for host messages
        if (ipc) {
            console.log('<====================================================> ')
            console.log('ngElectron has joined the room => ', o);
            console.log('<====================================================> ')

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


    /**************************************************
     * jQuery Functionality
     *************************************************/
    var class2type = {};
    var hasOwn = class2type.hasOwnProperty;

    function isFunction(obj) {
        return typeObj(obj) === "function";
    }

    function typeObj(obj) {
        if (obj == null) {
            return obj + "";
        }
        // Support: Android<4.0, iOS<6 (functionish RegExp)
        return typeof obj === "object" || typeof obj === "function" ?
        class2type[toString.call(obj)] || "object" :
            typeof obj;
    }

    function isPlainObject(obj) {
        // Not plain objects:
        // - Any object or value whose internal [[Class]] property is not "[object Object]"
        // - DOM nodes
        // - window
        if (typeObj(obj) !== "object" || obj.nodeType) {
            return false;
        }

        if (obj.constructor && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
            return false;
        }

        // If the function hasn't returned already, we're confident that
        // |obj| is a plain object, created by {} or constructed with new Object
        return true;
    }

    function extend() {
        var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        // Handle a deep copy situation
        if (typeof target === "boolean") {
            deep = target;

            // Skip the boolean and the target
            target = arguments[i] || {};
            i++;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if (typeof target !== "object" && !isFunction(target)) {
            target = {};
        }

        // Extend jQuery itself if only one argument is passed
        if (i === length) {
            target = this;
            i--;
        }

        for (; i < length; i++) {
            // Only deal with non-null/undefined values
            if ((options = arguments[i]) != null) {
                // Extend the base object
                for (name in options) {
                    src = target[name];
                    copy = options[name];

                    // Prevent never-ending loop
                    if (target === copy) {
                        continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    if (deep && copy && ( isPlainObject(copy) || (copyIsArray = Array.isArray(copy)) )) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && Array.isArray(src) ? src : [];

                        } else {
                            clone = src && isPlainObject(src) ? src : {};
                        }

                        // Never move original objects, clone them
                        target[name] = extend(deep, clone, copy);

                        // Don't bring in undefined values
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }

        // Return the modified object
        return target;
    };

})(typeof window === 'object' ? window : this);
