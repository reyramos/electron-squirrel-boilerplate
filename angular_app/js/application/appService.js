(function (angular) {
    'use strict';

    angular.module('app').service('appService', AppService);

    AppService.$inject = ['electron', '$http', 'postMessage'];

    function AppService(electron, $http, postMessage) {
        //send a message to electron
        electron.send("Hello from the client.");
        var self = this,
            versionUrl = "https://dev-eligibility-phoenix.labcorp.com/reyramos/builds/build.json";


        self.init = function () {
            $http.get(versionUrl).then(function (data) {
                console.log('version', data)
            }, function(error){
                console.error('error', error)

            });

        }

    };

})(window.angular);
