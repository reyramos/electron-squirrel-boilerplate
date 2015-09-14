/**
 * # Application
 *
 * Core Application controller that includes functions used before we kickStart the Application
 * The functions store within this files live outside of the ngView and are used as global function
 */

(function (angular) {
    'use strict';

    angular.module('app').controller('appController', AppController);

    AppController.$inject = ['clientService', 'electron', '$sce', 'postMessage'];

    function AppController(clientService, electron, $sce, postMessage) {
        //send a message to electron
        electron.send("Hello from the client.");


        var self = this,
        //clientService is added in the injector to initiate the service to load
        //the application user-agent classes
            client = clientService.info,
        //href = 'https://dev-eligibility-phoenix.labcorp.com/reyramos/dist/';
            href = 'https://demo-phoenix.labcorp.com/web-ui/';

        self.headerIcon = 'fa-globe'

        function loadUrl(url) {
            self.href = $sce.trustAsResourceUrl(url);
            console.log('url', url)
        }

        loadUrl(href)
        self.faCogOpts = [
            [{
                name: 'Demo Server',
                icon: 'fa fa-globe',
                callback: function () {
                    self.headerIcon = 'fa-globe'

                    href = 'https://demo-phoenix.labcorp.com/web-ui/';
                    loadUrl(href)
                }
            }],
            [{
                name: 'Eligibility Server',
                icon: "fa fa-hand-peace-o",
                callback: function () {
                    self.headerIcon = 'fa-hand-peace-o'
                    href = 'https://dev-eligibility-phoenix.labcorp.com/web-ui/';
                    loadUrl(href)
                }
            }],
            [{
                name: 'Demographics Server',
                icon: "fa fa-hand-spock-o",
                callback: function () {
                    self.headerIcon = 'fa-hand-spock-o'
                    href = 'https://dev-demographics-phoenix.labcorp.com/web-ui/';
                    loadUrl(href)
                }
            }]
        ];




    };

})(window.angular);
