/**
 * # Main Application bootstrap file
 *
 * Allows main Application to be bootloaded. This separate file is required in
 * order to properly isolate angular logic from requirejs module loading
 */
(function(angular) {
    'use strict';
    fetchData().then(bootstrapApplication);


    function fetchData() {
        var app = angular.module("app"),
            initInjector = angular.injector(["ng"]),
            $http = initInjector.get("$http");

        return $http.get('version.json').then(function(response) {
            console.log('=====================VERSION=========================');
            console.log('version:',response.data);

            app.constant("VERSION", response.data);
        }, function(error) {
            console.error(error)
            app.constant("VERSION", {});
        })

    }

    function bootstrapApplication() {
        console.log('===================BOOTSTRAPING======================');
        angular.bootstrap(document, ["app"]);
    }

})(window.angular);
