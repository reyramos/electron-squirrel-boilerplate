/**
 * # Main Application bootstrap file
 *
 * Allows main Application to be bootloaded. This separate file is required in
 * order to properly isolate angular logic from requirejs module loading
 */
(function(angular) {
    'use strict';

    console.log('===================BOOTSTRAPING======================');
    angular.bootstrap(document, ["app"]);

})(window.angular);
