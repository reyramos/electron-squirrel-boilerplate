/**
 * # Application
 *
 * Core Application controller that includes functions used before we kickStart the Application
 * The functions store within this files live outside of the ngView and are used as global function
 */

(function (angular) {
	'use strict';

	angular.module('app').service('appSettings', AppService);

	//AppService.$inject = [];

	function AppService() {


		var self = this;



	};

})(window.angular);
