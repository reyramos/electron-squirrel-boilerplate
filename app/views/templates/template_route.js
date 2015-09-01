/**
 * Created by redroger on 8/5/2015.
 */
(function () {
	'use strict';

	angular.module('app').config(RouteProvider)
	RouteProvider.$inject = ['$stateProvider'];

	function RouteProvider($stateProvider) {

		var path = 'js/explore/views/',
			routes = [
				{
					name: 'explore',
					url: 'explore',
					parent: 'root',
					views: {
						'mainContent@root': {
							templateUrl: path+'explore.html',
						}
					}
				},
			];


		angular.forEach(routes, function (route) {
			route.reloadOnSearch = false;
			route.data = {
				debug: location.search.split('debug=')[1] || location.hash.split('debug=')[1]
			};

			$stateProvider.state(route);
		})
	}

})();
