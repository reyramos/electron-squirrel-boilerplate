/**
 * @ngdoc service
 * @name postMessage
 *
 * @description
 * # Window.postMessage() management service
 *
 * The window.postMessage method allows for cross-origin communication. This service will provide a message management using
 * promises.
 *
 * The parent will start listening for any event data.
 * postMessage.send(eventType[optional],data).then(function(data){}),
 * It will attach a $q service,
 * https://docs.angularjs.org/api/ng/service/$q
 *
 * postMessage.send(eventType[optional],data).then(function(data){})
 * EventType are optional, it will add a promise_id for $q functionality
 * Since postMessage can be asynchronous, return messages can return out of order.  The promise_id, will determine
 * the send messages and promise for each.
 *
 */

(function (angular) {
    'use strict';

    angular.module('app').service('postMessage', PostMessage);

    PostMessage.$inject = ['$window', '$q']

    function PostMessage($window, $q) {
        var self = this,
            parent = $window.parent || window.parent,
            currentCallbackId = 0, // Create a unique callback ID to map requests to responses
            service = {
                onmessage: []
            };

        self.intercept = angular.noop;

        // This creates a new callback ID for a request
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
            var msg = data.message || data;
            listening.apply(msg)
        }


        function response(e, msg) {
            e.source.postMessage(JSON.stringify({cmd: 'response', message: msg}), e.origin);
        }

        $window.addEventListener('message', function (e) {

            var data = e.data,
                port = e;
            if (typeof (data) === "undefined" || e.source == this) return;
            try {
                data = JSON.parse(data);
            } catch (e) {
            }

            /**
             * When a message is return, from sender, we would
             * need to change to response
             */
            switch (data.cmd) {
                case 'request':
                    var eventType = data.eventType,
                        msg = angular.copy(data.message);


                    if(msg.func){

                    }

                    try {
                        if (typeof self.intercept === 'function')
                        //This is to add custom code for types of events requested from the sender
                            self.intercept(eventType, msg).then(function (data) {
                                response(port, data)
                            })
                    } catch (e) {
                        response(port, msg)
                    }

                    break;
                case 'response':
                    onMessage(data);
                    break;
                default:
                    break;
            }

        });


        self.send = function (eventType, data, target) {

            var defer = $q.defer(),
                callback_id = getCallbackId(),
                etype = typeof arguments[0],
                dtype = typeof arguments[1];

            data = data || {};


            if (etype === 'object') {
                data = eventType;
                eventType = (typeof(data.promise) === "undefined" ? callback_id : data.promise);
            }

            if (dtype === 'function') {
                data = {func:data.toString()} || null;
            }

            data.promise = callback_id;

            //set the caller
            service.onmessage[callback_id] = {
                time: new Date(),
                cb: defer
            };

            var postMessage = {
                cmd: 'request',
                message: angular.copy(data),
                eventType: typeof(arguments[0]) === 'object' ? false : eventType
            };

            console.log('postMessage', postMessage)
            parent.postMessage(JSON.stringify(postMessage), '*'); //allow all domains
            return defer.promise;
        }
    }


})(window.angular);
