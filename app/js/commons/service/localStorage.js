(function (angular) {
	'use strict';

	angular.module('app').service('localStorage', LocalStorage)

	LocalStorage.$inject = ['localStorageService', 'utilities']

	function LocalStorage(localStorageService, utilities) {

		var service = {

			set: function (key, data) {
				var val = typeof(data) === "object" ? JSON.stringify(data) : data,
					string = utilities.encode(val);
				localStorageService.set(key, string)

			},
			get: function (key) {
				var encodeString = localStorageService.get(key),
					string = encodeString ? utilities.decode(encodeString) : false;

				return typeof(string) === "object" ? string : JSON.parse(string);
			}

		};

		return angular.extend({}, localStorageService, service);


	}

})(window.angular);
