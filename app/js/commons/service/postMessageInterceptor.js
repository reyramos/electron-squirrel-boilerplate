/**
 * @ngdoc service
 * @name postMessageInterceptor
 *
 * @description
 * # Window.postMessage() management service
 *
 * postMessageInterceptor extends postMessageService to intercept any eventType[optional]
 *
 *
 * The window.postMessage method allows for cross-origin communication. This service will provide a message management using
 * promises.
 *
 * Customize the SWITCH case to listen for different eventTypes, and customize the message to return to promise
 *
 */

(function (angular) {
    'use strict';

    angular.module('app').service('postMessageInterceptor', PostMessage);

    PostMessage.$inject = ['$q', 'postMessage', 'electron']

    function PostMessage($q, postMessage, electron) {
        postMessage.intercept = function (eventType, msg) {
            var defer = $q.defer();
            console.log('INTERCEPTOR => ', eventType)
            switch (eventType) {
                case 'electron':
                    if (msg.hasOwnProperty('func')) {
                        var funcString = msg.func;

                        var args = (funcString.replace(/^function\s{0,10}\w{0,}\s{0,10}\((.*?)\)\s{0,10}\{([^\n]*\n+\s){0,}\s{0,}\}/, '$1')).split(','),
                            func = ((funcString.replace(/^function\s{0,10}\w{0,}\s{0,10}\((.*?)\)\s{0,10}\{/, '')).replace(/\s{0,}\}$/, '')).trim(),
                            awesome = new Function(args, func);

                        //execute the function provided
                        awesome(electron);
                    }

                    if (msg.hasOwnProperty('string')) {
                        console.log('sg.postMessageInterceptor', msg.string)
                    }

                    break;
                default :
                    break;

            }

            defer.resolve(msg)
            return defer.promise;
        }

    }


})(window.angular);
