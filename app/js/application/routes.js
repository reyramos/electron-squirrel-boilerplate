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
                            InitializePostMessage: InitializePostMessage
                        }
                    }
                }
            }];


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
            console.log('ELECTRON SAYS => ', evt, data);
        });
    }


})(window.angular);
