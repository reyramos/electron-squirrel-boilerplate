(function (angular) {
    'use strict';

    angular.module('app', [
        'ui.router',
        'ngResource',
        'ngSanitize',
        'ngAnimate',
        'ngElectron',
        'reyramos.utilities',
        'reyramos.client',
        'reyramos.contextMenu',
        'sg.postMessenger',
    ]).factory('APP_ENV', appOverride).factory('APP_OVERRIDE', function () {
        return {}
    })


    appOverride.$inject = ['APP_OVERRIDE', 'VERSION'];

    /**
     * @ngdoc object
     * @name app.APP_ENV
     *
     * @description
     * Provide application environment setting and variables
     *
     */

    function appOverride(APP_OVERRIDE, VERSION) {
        var settings = {},
            info = VERSION,
            template = 'template';


        //if version is a number
        if (!isNaN(parseFloat(info.version))) {
            template = template + '-' + info.version;
        }

        settings.env = 'development'; //run with the development profile (only effects logging setup by default)
        settings.ga = ''; //Google Analytics
        settings.info = info; //Google Analytics
        settings.templates = function () {
        }

        //LOOP THROUGH OVERRIDES FOR THE ENV SETTINGS
        angular.forEach(APP_OVERRIDE, function (value, key) {
            settings[key] = value
        });

        return settings;

    }

})(window.angular);

