/**
 * # appData
 *
 * Initializes the Application, gets the necessary data from socket server
 * Builds the appData object
 *
 */

(function (angular) {

	'use strict';

	angular.module('app').service('appData', AppData)

	AppData.$inject = ['$q',
		'$rootScope',
		'$log',
		'socketService',
		'enums']


	function AppData($q,
					 $rootScope,
					 $log,
					 socketService,
					 enums) {

		var logger = $log.getInstance('appData'),
			service = {},
			appData = {
				user: false,
				userInfo: null
			},
			requestTypes = [
				enums.APP_DATA.EVENT,
				enums.CATEGORY.EVENT
			],
			count = 0;


		/**
		 * Get the necessary files and enums from server
		 *
		 * @returns {promise|a.fn.promise}
		 */
		service.init = function () {
			var defer = $q.defer();
			reInit().then(function () {
				defer.resolve();
			})

			return defer.promise;
		}

		service.getAppData = function (key) {
			return key ? appData[key] : appData;
		}


		service.setAppData = function (key, obj) {
			if (!key)
				return;
			appData[key] = obj;
		}


		service.getUser = function () {

			var user = appData.userInfo || null;

			if (appData.hasOwnProperty('appData') && appData.appData.userInfo) {
				user = appData.appData.userInfo;
			}


			return user;
		}

		service.setUser = function (user) {
			appData.userInfo = user; //save the user on this object to used for later calls
		}

		/**
		 * re-initialize requestTypes from visit to application
		 *
		 */
		function reInit() {
			var defer = $q.defer();

			getRequest(count);

			var counting = $rootScope.$watch(
				function () {
					return count === requestTypes.length ? true : false;
				},
				function (status) {
					if (!status) return;
					if (count === requestTypes.length) {
						defer.resolve();
					}
					//stop the watchs
					counting();
				})

			return defer.promise;

		}


		/**
		 * Functionality to loop through the array of requestTypes, to makes to a socket call
		 * @param  {[type]} index [description]
		 * @return {[type]}       [description]
		 */
		function getRequest(index) {

			if(!requestTypes[index])return;

			socketService.send(requestTypes[index], {}).then(function (data) {
				appData[requestTypes[index]] = [];

				appData[requestTypes[index]] = data;
				count++;
				if (count < requestTypes.length)
					getRequest(count)

			}, function (resolve) {
				throw 'ERROR:	REQUEST_TYPE:' + requestTypes[index] + '		MESSAGE:' + resolve.message;
			})
		}


		return service;


	}

})(window.angular);


