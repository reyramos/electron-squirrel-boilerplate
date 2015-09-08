/**
 * # Application
 *
 * Core Application controller that includes functions used before we kickStart the Application
 * The functions store within this files live outside of the ngView and are used as global function
 */

(function (angular) {
    'use strict';

    angular.module('app').service('postMessage', PostMessage);

    PostMessage.$inject = ['$window'];

    function PostMessage($window) {
        var self = this;

        $window.addEventListener('message', function (e) {
            console.log('from child:  ', e.data);
        });


    };

})(window.angular);
