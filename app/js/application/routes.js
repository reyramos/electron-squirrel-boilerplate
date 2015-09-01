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


	RouteProvider.$inject = ['$stateProvider', 'localStorageServiceProvider', '$urlRouterProvider', 'deviceType'];
	InitializeData.$inject = ['appData', 'loaderService'];
	InitializeTemplates.$inject = ['APP_ENV'];
	Run.$inject = ['$log', 'Logger', '$rootScope', '$templateCache', 'config'];

	function InitializeData(appData, loaderService) {


		loaderService.start({
			backdrop: false
		});


		return appData.init();
	}

	function InitializeTemplates(APP_ENV) {
		return APP_ENV.templates();
	}

	function RouteProvider($stateProvider, localStorageServiceProvider, $urlRouterProvider, deviceType) {
		localStorageServiceProvider.setPrefix('app');
		var path = 'js/application/views/' + deviceType + '/',
			routes = [{
				name: "root",
				url: "/",
				views: {
					'applicationContainer@': {
						templateUrl: path + 'index.html',
						controller: 'baseController',
						controllerAs: '_bc',
						reloadOnSearch: false,
						resolve: {
							initializeData: InitializeData,
							InitializeTemplates: InitializeTemplates
						}
					},
					'appHeader@': {
						templateUrl: path + 'header.html',
					},
					'mainContent@root': {
						templateUrl: 'js/dashboard/views/dashboard.html',
						controller: 'dashboardController',
						controllerAs: '_dc'
					},
					'sidebar@root': {
						templateUrl: path + 'sidebar-left.html'
					},
					'leftNavContainer@root': {
						templateUrl: path + 'main-navigation.html'
					},
					'collectionNavigation@root': {
						template: '<li><a ng-click="_bc.addNewCategory($event)"><span class="menu-item-parent">Add a New Collection</span></a></li>',
						controller: 'collectionNavigation',
						controllerAs: 'ctrl'
					},
					'eventLog@root': {
						templateUrl: 'js/eventLog/views/logger.html'
					}
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

	function Run($log, Logger, $rootScope, $templateCache, config) {
		Logger.enhanceAngularLog($log);
		if (Object.keys(config).length)
			angular.forEach(config, function (obj, i) {
				if ($templateCache.get(i)) return;
				$templateCache.put(i, obj);
				console.log('$templateCache.put(' + i + ')')
			});

		$rootScope.$on('$stateChangeStart', function (event, next, nextParams) {
			console.log("$stateChangeStart.next: ", next, nextParams);
			if (next.name !== 'signing') {
				//save the next route to reroute the application
				$rootScope.$$next = {
					state: next,
					params: nextParams
				};
			}
		});
	}


})(window.angular);
