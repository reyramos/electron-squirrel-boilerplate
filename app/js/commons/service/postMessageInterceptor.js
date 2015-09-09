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

    PostMessage.$inject = ['$rootScope','$q', 'postMessage', 'electron']

    function PostMessage($rootScope, $q, postMessage, electron) {
        postMessage.intercept = function (eventType, msg, callback) {
            var defer = $q.defer();
            console.log('INTERCEPTOR => ', eventType)
            switch (eventType) {
                case 'electron':
                    console.log('callback',callback)
                    break;
                default :
                    break;

            }

            defer.resolve(msg)
            return defer.promise;
        }

    }


})(window.angular);
