(function (angular) {
	'use strict';

	angular.module('app').service('socketService', SocketService);

	SocketService.$inject = [
		'socket',
		'$rootScope',
		'$q',
		'$log',
		'$injector',
		'localStorage',
		'$timeout',
		'$state',
		'utilities',
		'loaderService'
	];

	function SocketService(socket,
						   $rootScope,
						   $q,
						   $log,
						   $injector,
						   localStorage,
						   $timeout,
						   $state,
						   utilities,
						   loaderService) {

		var logger = $log.getInstance('socketService'),
			pending = [],
			service = {};


		service.socket_open = false;
		/**
		 * Send function transmit data to the socket module, This is used to change the data
		 * or add additional parameters before sending
		 * @param eventType
		 * @param data
		 * @returns {*}
		 */
		service.send = function (eventType, data, callback) {
			var defer = $q.defer(),
				data = typeof(eventType) === 'object' ? eventType : (typeof(data) === "undefined" ? {} : data);

			if (!data.user) {
				var user = localStorage.get('client') || $injector.get('appData').getUser();
				//needed data to validate
				if (user) {
					data.token = user ? user.token : null;
				}
			}

			var encode_data = {
				encode: utilities.encode(JSON.stringify(data))
			};

			if(!eventType) return;

			if (service.socket_open) {

				logger.log('socket.send(' + eventType + ')', data);

				(typeof(eventType) === 'object' ? socket.send(encode_data, callback) : socket.send(eventType, encode_data, callback)).then(function (success) {

					if (success.message && success.message.hasOwnProperty('encode')) {
						try {
							success.message = JSON.parse(utilities.decode(success.message.encode))
						} catch (e) {
							success.message = utilities.decode(success.message.encode)
						}
					}


					logger.log('socket.send(' + eventType + ').then => ', success);

					switch (Number(success.code)) {
						case 200:
							defer.resolve(success.message);
							break;
						case 403:
							$state.go('signing', {location: false, notify: false});
						default:
							defer.reject(success)
							break;
					}

				}, function (error) {
					logger.error('error', error)
					defer.reject(error)
				}).finally(function(){
					loaderService.hide();
				})

			} else {
				pending.push({
					data: [eventType, data],
					time: new Date(),
					cb: defer
				})
			}

			return defer.promise;

		};

		function processPendingRequest() {

			if (pending.length) {
				logger.info('pending', pending)
				$timeout(function () {

					for (var i in pending) {
						logger.log('pending', pending[i])

						!(function (i) {
							service.send(pending[i].data[0], pending[i].data[1]).then(function (success) {
								if (pending[i]) {
									pending[i].cb.resolve(success)
									pending.splice(i, 1);
								}
							}, function (error) {
								if (pending[i]) {
									pending[i].cb.reject(error)
									pending.splice(i, 1);
								}
							}).finally(function(){
								loaderService.hide();

							});
						})(i)
					}

				}, 1) //wait a second
			}
		}

		$rootScope.$on('SOCKET_ID', processPendingRequest)
		$rootScope.$on('SOCKET_CONNECT', function () {
			service.socket_open = true;
			processPendingRequest();
		})

		$rootScope.$on('SOCKET_DISCONNECT', function () {
			service.socket_open = false;
		})

		return service;
	}

})(window.angular);
