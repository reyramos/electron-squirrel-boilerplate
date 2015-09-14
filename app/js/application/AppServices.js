
(function (angular) {
    'use strict';

    angular.module('app').service('appService', AppService);

    AppService.$inject = [ 'electron', '$sce', 'postMessage'];

    function AppService( electron, $sce, postMessage) {
        //send a message to electron
        electron.send("Hello from the client.");
        var self = this;



    };

})(window.angular);
