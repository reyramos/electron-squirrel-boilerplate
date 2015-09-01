(function (angular) {
	'use strict';

	angular.module('app').factory('utilitiesFactory', UtilitiesFactory);

	UtilitiesFactory.$inject = ['modalFactory', '$templateCache', '$timeout'];

	function UtilitiesFactory(modalFactory, $templateCache, $timeout) {

		var utilities = {


		};


		return utilities;
	}

})(window.angular);
