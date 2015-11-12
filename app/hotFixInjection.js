/**
 * Created by Ramor11 on 11/12/2015.
 *
 * THIS IS A TEMPORARY HOT FIX FOR ELECTRON INJECTION WITHIN THE WEBVIEW WEBAPPLICATION
 * TO BE REMOVE AT A LATER RELEASE
 *
 */
!(function (angular) {
    'use strict';

    angular.module('phxApp').factory('electron', function () {

        var objElec = new angular.noop, electron = {exist: false};

        var init = function () {

            return new Promise(function (resolve, reject) {
                try {
                    objElec = new Electron();
                    electron.exist = true;
                    resolve(true)
                } catch (e) {
                    init().then(function () {
                        init = null;
                    });
                }
            })
        }

        electron.send = function (eventType, msg) {

            if (objElec.hasOwnProperty('send')) {
                return objElec.send(eventType, msg);
            } else {
                return new Promise(function (resolve, reject) {
                    resolve(false);
                    reject(false);
                });
            }
        };

        electron.require = function (module) {
            var eModule = angular.noop;

            if (Object.keys(objElec).length) {
                try {
                    eModule = objElec.require(module);
                } catch (e) {
                    if (objElec.hasOwnProperty(module)) {
                        eModule = objElec[module];
                    }
                }
            }
            return eModule;
        };

        init();
        return angular.extend({}, objElec, electron);

    });

})(window.angular);