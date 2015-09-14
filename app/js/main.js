// Require JS  Config File
require
({
        baseUrl: '/js/',
        noGlobal: true,
        removeCombined: true,
        paths: {
            //BOWER COMPONENTS
            'angular': '../lib/angular/angular',
            'ui-router': '../lib/ui-router/release/angular-ui-router',
            'angular-resource': '../lib/angular-resource/index',
            'angular-sanitize': '../lib/angular-sanitize/index',
            'angular-animate': '../lib/angular-animate/index',
            'jquery': '../lib/jquery/dist/jquery',
            'electron': 'vendor/ng-electron',

            //VENDORS
            'UAParser': 'vendor/ua-parser',

            //FACTORIES
            'utilities': 'commons/factory/utilities',

            //PROVIDERS
            'client': 'commons/provider/client',

            /* CONFIGS */
            'development': 'configs/development'
        },
        map: {
            '*': {'jquery': 'jquery'},
            'noconflict': {"jquery": "jquery"}
        },
        shim: {
            'app': {
                'deps': [
                    'angular',
                    'ui-router',
                    'angular-resource',
                    'angular-sanitize',
                    'angular-animate',
                    'electron',
                    'utilities',
                    'client'
                ]
            },
            'angular': {'deps': ['jquery']},
            'ui-router': {'deps': ['angular']},
            'angular-resource': {'deps': ['angular']},
            'angular-sanitize': {'deps': ['angular']},
            'angular-animate': {'deps': ['angular']},
            'electron': {'deps': ['angular']},
            'jquery': {
                init: function ($) {
                    return $.noConflict(true);
                },
                exports: 'jquery'
            },

            //LOADING COMPONENTS BASED ON FEATURES
            'client': {'deps': ['angular', 'UAParser']},
            'utilities': {'deps': ['angular']},


            //ROUTES
            'application/routes': {'deps': ['app']},

            //APPLICATION
            'development': {'deps': ['app']},
            'application/appController': {'deps': ['app']},
            'application/appService': {'deps': ['app']},


            //COMMONS
            'commons/directives/global': {'deps': ['app']},
            'commons/directives/dropDownOptions': {'deps': ['app']},
            'commons/directives/offset': {'deps': ['app']},
            'commons/directives/resizer': {'deps': ['app']},
            'commons/service/postMessage': {'deps': ['app']},
            'commons/service/postMessageInterceptor': {'deps': ['app', 'commons/service/postMessage']},

        }
    }, [
        'require',
        //ROUTES
        'application/routes',

        //APPLICATION
        'development',
        'application/appController',
        'application/appService',


        //COMMONS
        'commons/directives/global',
        'commons/directives/dropDownOptions',
        'commons/directives/offset',
        'commons/directives/resizer',
        'commons/service/postMessage',
        'commons/service/postMessageInterceptor'
    ],
    function (require) {
        return require(['bootstrap'])
    }
);
