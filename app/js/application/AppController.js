/**
 * # Application
 *
 * Core Application controller that includes functions used before we kickStart the Application
 * The functions store within this files live outside of the ngView and are used as global function
 */

(function (angular) {
    'use strict';

    angular.module('app').controller('appController', AppController);

    AppController.$inject = ['clientService', 'electron', '$sce', 'postMessage', '$document'];

    function AppController(clientService, electron, $sce, postMessage, $document) {
        //send a message to electron
        electron.send("Hello from the client.");
        var self = this,
        //clientService is added in the injector to initiate the service to load
        //the application user-agent classes
            client = clientService.info,
            count = 0,
            href = 'https://dev-eligibility-phoenix.labcorp.com/reyramos/dist/',
            iframe = document.createElement('iframe');


        iframe.onload = function () {
            //the first load don't count
            if (count > 0) {
                console.log('PAGE LOADED');
                angular.element($document[0].querySelector('#splashScreen')).remove();
            } else {
                count++;
            }
        };


        angular.element($document[0].querySelector('#mainContent')).append(iframe);

        function loadUrl(url) {
            self.href = $sce.trustAsResourceUrl(url);
            iframe.src = self.href;
        }

        loadUrl(href)


    };

})(window.angular);
