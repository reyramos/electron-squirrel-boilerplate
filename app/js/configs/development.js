/**
 * Created by redroger on 2/18/15.
 */

(function (angular) {
	'use strict';


	angular.module('app').factory('APP_OVERRIDE', AppOverride)

	AppOverride.$inject = ['$rootScope', 'utilities'];



	function AppOverride($rootScope, utilities) {


		var override = {
			//loggerHost:"localhost" //used to override the debug functionality
			env: 'development',
			iframeSrc:'http://labcorp.com:8080/#/'
		};

		$rootScope.$on('$stateChangeError', function (event) {
			console.log("$stateChangeError: ", arguments);

		});
		$rootScope.$on('$stateNotFound', function (event) {
			console.log("$stateNotFound: ", arguments);

		});


		return override;
	}


})(window.angular);
