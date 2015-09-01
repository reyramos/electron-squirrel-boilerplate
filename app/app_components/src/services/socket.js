(function (angular) {
	'use strict';


	/**
	 * @ngdoc overview
	 * @name reyramos.socket
	 *
	 *
	 * @description
	 * # SockIO socket management service
	 *
	 * Creates SockIO socket connection to server, on socket.send(eventType[optional],data).then(function(data){}),
	 * It will attach a $q service,
	 * https://docs.angularjs.org/api/ng/service/$q
	 *
	 * socket.send(eventType[optional],data).then(function(data){})
	 * EventType are optional, the socket server will add a promise_id for $q functionality
	 * Since socket server are asynchronous, return messages can return out of order.  The promise_id, will determine
	 * the send messages and promise for each.
	 *
	 * Server:
	 * The server will need to return the promise_id send from message to keep the message in order. See EX: server.js
	 *
	 */

	angular.module('reyramos.socket', []).constant("SOCKET_ENUMS", {"PORT": 9998}).service('socket', SocketService);

	SocketService.$inject = ['$q', '$rootScope', 'SOCKET_ENUMS'];

	/**
	 * @ngdoc object
	 * @name reyramos.socket.socket
	 *
	 * @description
	 * # SockIO socket management service
	 */
	function SocketService($q, $rootScope, SOCKET_ENUMS) {
		var currentCallbackId = 0, // Create a unique callback ID to map requests to responses
			//workerString = '!function(){"use strict";importScripts("https://cdn.socket.io/socket.io-1.3.5.js");var e=[];self.addEventListener("connect",function(t){var s=t.ports[0],n=io(self.name);e.push(s),s.start(),s.onmessage=function(e){var t=e.data;if("undefined"!=typeof t)switch(t.cmd){case"send":var a=t.eventType,c=t.message;a?n.emit(a,c,function(e){e.callback&&s.postMessage({type:"_callback",data:e})}):n.send(c,function(e){e.callback&&s.postMessage({type:"_callback",data:e})}),s.postMessage({type:"_send",data:c});break;default:s.postMessage(t)}},s.start(),e.length>1&&s.postMessage({type:"_reconnect"}),n.on("connect",function(){s.postMessage({type:"_connect"})}),n.on("disconnect",function(){s.postMessage({type:"_disconnect"})}),n.on("message",function(e){s.postMessage({type:"_message",data:e})})})}();',
			worker, //if the browser allows for WebWorkers
			socket, //store the socket connection
			service = {
				callbacks: [], // Keep all pending requests here until they get responses
				onmessage: [],
				open: false,
				times_opened: 0
			};


		// This creates a new callback ID for a request
		function getCallbackId() {
			currentCallbackId += 1;
			//reset callback id
			if (currentCallbackId > 10000) {
				currentCallbackId = 0;
			}
			return currentCallbackId;
		}

		/**
		 * Will check if promise has been sent to return back to
		 * defer.promise() message
		 */
		function listening() {
			if (service.onmessage.hasOwnProperty(this.promise)) {
				service.onmessage[this.promise].cb.resolve(this)
				delete service.onmessage[this.promise];
				delete this.promise;
			}
		}

		function onConnect() {
			service.open = true;
			service.times_opened++;
			console.debug('SOCKET_CONNECT')
			$rootScope.$broadcast('SOCKET_CONNECT');
		}

		function onDisconnect() {
			console.debug('SOCKET DISCONNECT')
			$rootScope.$broadcast('SOCKET_DISCONNECT')
			service.open = false;
		}

		function onMessage(data) {

			var msg = data.message || data;

			//if we have a broadcast, push message
			if (msg.broadcast) {
				$rootScope.$broadcast(msg.broadcast, msg);
			}

			listening.apply(data)
		}

		function onCallback(data) {
			if (service.onmessage.hasOwnProperty(data.promise)) {
				var func = service.onmessage[data.promise].callback;

				if (typeof func === 'function')
					service.onmessage[data.promise].callback(data)
			}
		}

		function startWorker(uri) {

			worker = new SharedWorker('socket.min.js', uri)
			worker.port.start();

			worker.port.onmessage = function (e) {

				switch (e.data.type) {
					case "_connect":
					case "_reconnect":
						onConnect(); //send the message
						break;
					case "_disconnect":
						onDisconnect();
						break;
					case "_message":
						var msg = e.data;
						onMessage(msg.data, e.data.callback)
						break;
					case "_callback":
						var msg = e.data;
						onCallback(msg.data)
						break;
					default:
						console.log('default', e.data)
						break;
				}

			};

			worker.onerror = function (evt) {
				console.error(evt)
			};
		}

		(function () {
			if (!!window.SharedWorker) {
				startWorker('http://' + document.domain + ':' + SOCKET_ENUMS.PORT);
			} else {
				/**
				 * Creates the socket connection
				 * @returns {*}
				 */
				socket = socketConnection();
			}

		})();

		function socketConnection() {

			socket = io.connect('http://' + document.domain + ':' + SOCKET_ENUMS.PORT);
			/**
			 * Socket Connect, broadcast SOCKET_CONNECT, set service.open = true;
			 */
			socket.on('connect', onConnect);
			/**
			 * Listening for messages, it will check for the following keys within
			 * message obj,
			 * broadcast, will broadcast an ngEvent listener
			 * promise, will return defer.promise() back to the send message
			 *
			 */
			socket.on('message', onMessage);
			/**
			 * Socket Disconnect, broadcast SOCKET_DISCONNECT, set service.open  = false;
			 */
			socket.on('disconnect', onDisconnect);

			return socket;
		}

		this.on = function () {
			var defer = $q.defer();
			$rootScope.$on('SOCKET_CONNECT', function () {
				defer.resolve()
			})
			return defer.promise;
		}

		this.getStatus = function () {
			return service;
		}

		this.disconnect = function () {
			socket.disconnect();
		}

		/**
		 * @ngdoc function
		 * @name socket#send
		 * @methodOf reyramos.socket
		 *
		 * @param {string} [eventType] Notification Type
		 * @param {object} [data] JSON object to send to socket server
		 *
		 *
		 * @description
		 *
		 */
		this.send = function (eventType, data, callback) {
			var defer = $q.defer();

			if (service.open) {
				var callback_id = getCallbackId();

				var etype = typeof arguments[0],
					dtype = typeof arguments[1];


				if (etype === 'object') {
					data = eventType;
					eventType = (typeof(data.promise) === "undefined" ? callback_id : data.promise);
				}

				if (dtype === 'function') {
					callback = data || null;
				}

				data.promise = callback_id;


				//set to true, to always encode the message
				var odata = angular.copy(data),
					msg = typeof(data) === "object" ? JSON.stringify(data) : data;

				//set the caller
				service.onmessage[callback_id] = {
					time: new Date(),
					cb: defer,
					callback: callback
				};

				if (!!window.SharedWorker) {

					var postMessage = {
						cmd: 'send',
						message: odata,
						eventType: typeof(arguments[0]) === 'object' ? false : eventType,
						callback: callback ? callback.toString() : null
					}

					worker.port.postMessage(postMessage);
				} else {

					if (typeof eventType === "undefined" || typeof(arguments[0]) === 'object') {
						socket.send(msg, callback)
						console.log('socket.emit(send)', msg);

					} else {

						if (!eventType) return;
						socket.emit(eventType, msg, callback)
						console.log('socket.emit(' + eventType + ')', odata);

					}
				}


			} else {

				defer.reject({
					status: "SOCKET_DISCONNECT"
				});

			}

			return defer.promise;
		}
	}

})(window.angular);
