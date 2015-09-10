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
        postMessage.intercept = function (eventType, msg, cbString) {
            var defer = $q.defer();
            console.log('INTERCEPTOR => ', eventType)
            switch (eventType) {
                case 'electron':
                    var args = cbString,
                        func = ((cbString.replace(/function\s{0,10}\w?\s{0,10}\(.*\)\s{0,10}\{[^\n]*\n+\s{0,10}/g, "")).replace(/}$/g, "")).trim();
                    args = (args.replace(/function\w*?\s+\((.*?)\)\s{0,10}\{[^\n]*\n+\s{0,10}.*[^\n]*\n+\s{0,10}}/, '$1')).split(',');
                    var awesome = new Function(args, func);
                    //execute the callback
                    awesome(electron);
                    break;
                default :
                    break;

            }

            defer.resolve(msg)
            return defer.promise;
        }

    }


})(window.angular);
