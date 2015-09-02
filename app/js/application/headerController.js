/**
 * # Application
 *
 * Core Application controller that includes functions used before we kickStart the Application
 * The functions store within this files live outside of the ngView and are used as global function
 */

(function (angular) {
    'use strict';

    angular.module('app').controller('headerController', HeaderController);

    HeaderController.$inject = ['$log'];

    function HeaderController($log) {


        var self = this;




        self.closeWindow = function(){
            console.log('close Window')
        }


    };

})(window.angular);
