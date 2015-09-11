/**
 * Created by ramor11 on 9/11/2015.
 */
(function (angular) {
    "use strict";


    angular.module('app').provider('messenger', PostMessage);


    function PostMessage() {
        var debug = location.search.split('debug=')[1] || location.hash.split('debug=')[1];
        this.$get = [
            '$q',
            'postMessage',
            'electron',
            function ($q, postMessage, electron) {

                return {
                    send: function (postMessage) {

                    }
                };
            }
        ];
    }


})(window.angular);