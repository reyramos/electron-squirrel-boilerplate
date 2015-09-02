/**
 * # Application
 *
 * Core Application controller that includes functions used before we kickStart the Application
 * The functions store within this files live outside of the ngView and are used as global function
 */

(function (angular) {
    'use strict';

    angular.module('app').controller('headerController', HeaderController);

    HeaderController.$inject = ['electron'];

    function HeaderController(electron) {


        var self = this;


        self.closeWindow = function(){
            console.log('close Window')

            var window = electron.remote.getCurrentWindow();

            console.log('close Window',window)

            if(window)
            window.close();



        }


    };

})(window.angular);
