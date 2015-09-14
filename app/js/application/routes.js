(function (angular) {
    'use strict';

    angular.module('app').config(function ($provide) {

        $provide.decorator('$state', function ($delegate, $stateParams) {

            $delegate.forceReload = function () {
                return $delegate.go($delegate.current, $stateParams, {
                    reload: true,
                    inherit: false,
                    notify: true
                });
            };
            return $delegate;
        });
    }).config(RouteProvider).run(Run);


    RouteProvider.$inject = ['$httpProvider', '$stateProvider', '$urlRouterProvider'];
    Run.$inject = ['$rootScope'];
    InitializePostMessage.$inject = ['postMessageInterceptor'];

    //function InitializeApplication(appService) {
    //    return appService.init()
    //}

    function InitializePostMessage(postMessageInterceptor) {
        //BUILD THE LISTENER FROM THE CHILD FRAME/IFRAME
        return postMessageInterceptor;
    }

    function RouteProvider($httpProvider, $stateProvider, $urlRouterProvider) {

        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        var path = 'js/application/views/',
            routes = [{
                name: "root",
                url: "/",
                views: {
                    'applicationContainer@': {
                        templateUrl: path + 'index.html',
                        controller: 'appController',
                        controllerAs: 'app',
                        resolve: {
                            //InitializeApplication: InitializeApplication,
                            InitializePostMessage: InitializePostMessage
                        }
                    },
                    'appHeader@root': {
                        templateUrl: path + 'header.html',

                    },
                    'mainContent@root': {
                        templateUrl: path + 'mainContent.html',
                    },
                    'eventLog@root': {}
                }
            }];


        /**
         * ## HTML5 pushState support
         *
         * This enables urls to be routed with HTML5 pushState so they appear in a
         * '/someurl' format without a page refresh
         *
         * The server must support routing all urls to index.html as a catch-all for
         * this to function properly,
         *
         * The alternative is to disable this which reverts to '#!/someurl'
         * anchor-style urls.
         */
            // $locationProvider.html5Mode({
            //     enabled: true,
            //     requireBase: false
            // });
            // $locationProvider.hashPrefix('!');

        angular.forEach(routes, function (route) {
            route.data = {
                debug: location.search.split('debug=')[1] || location.hash.split('debug=')[1]
            };

            $stateProvider.state(route);
        })

        $urlRouterProvider.otherwise(function ($injector) {
            $injector.get('$state').transitionTo('root');
        });
    }


    function Run($rootScope) {

        //listen for host messages
        $rootScope.$on('electron-host', function (evt, data) {
            console.log(data);
        });

    }


})(window.angular);
