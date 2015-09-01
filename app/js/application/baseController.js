/**
 * # Application
 *
 * Core Application controller that includes functions used before we kickStart the Application
 * The functions store within this files live outside of the ngView and are used as global function
 */

(function (angular) {
    'use strict';

    angular.module('app').controller('baseController', BaseController);

    BaseController.$inject = ['$log', '$state', 'appSettings', 'clientService'];

    function BaseController($log, $state, appSettings, clientService) {


        var self = this,
        //clientService is added in the injector to initiate the service to load
        //the application user-agent classes
            client = clientService.info;

        $log.info('client', client)

        self.faCogOpts = [
            [{
                name: 'Settings',
                icon: 'fa fa-cogs',
                callback: function () {
                    $state.go('profile')
                }
            }],
            [{
                name: 'Empty Trash',
                icon: "fa fa-trash-o",
                callback: function () {
                }
            }]
        ]


    };

})(window.angular);
