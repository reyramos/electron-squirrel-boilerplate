/**
 * # Application
 *
 * Core Application controller that includes functions used before we kickStart the Application
 * The functions store within this files live outside of the ngView and are used as global function
 */

(function (angular) {
    'use strict';

    angular.module('app').service('postMessage', PostMessage);

    PostMessage.$inject = ['$window', '$q'];

    function PostMessage($window, $q) {
        var self = this,
            parent = $window.parent || window.parent;

        $window.addEventListener('message', function (e) {

            var data = e.data;

            if (typeof (data) === "undefined") return;

            try {
                data = JSON.parse(data);
            } catch (e) {
            }


            switch (data.cmd) {
                case 'send':
                    var eventType = data.eventType,
                    	msg = data.message;

                    if (eventType) {
                    	//DO SOMETHING FOR EVENT TYPES FROM IFRAME
                    } else {

                    }
                    //port.postMessage(JSON.stringify({type: '_send', data: msg}));
                    break;
                default:
                    //port.postMessage(JSON.stringify(data));
                    break;
            }


            console.log('From Child:  ', e);
        });


        self.send = function (element, data, callback) {

            var etype = typeof arguments[0],
                dtype = typeof arguments[1];

            data = data || {};


            if (etype[0]) {
                //iframe = etype[0].contentWindow
            }

            //if (dtype === 'function') {
            //    callback = data || null;
            //}
            //
            //data.promise = callback_id;
            //
            ////set the caller
            //service.onmessage[callback_id] = {
            //    time: new Date(),
            //    cb: defer,
            //    callback: callback
            //};
            //
            //var postMessage = {
            //    cmd: 'send',
            //    message: angular.copy(data),
            //    eventType: typeof(arguments[0]) === 'object' ? false : eventType,
            //    callback: callback ? callback.toString() : null
            //}
            //
            //console.log('postMessage', postMessage)
            ////TODO://narrow this to a local domain for security
            //parent.postMessage(JSON.stringify(postMessage), '*'); //allow all domains
        }
    }


})(window.angular);
