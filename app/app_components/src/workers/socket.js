/**
 * Created by redroger on 5/17/2015.
 */
(function () {
	"use strict";

	importScripts('https://cdn.socket.io/socket.io-1.3.5.js');

	var ports = [];


	self.addEventListener('connect', function (e) {

		var port = e.ports[0], socket = io(self.name);

		ports.push(port);
		port.start();

		port.onmessage = function (e) {

			var data = e.data;

			if (typeof (data) === "undefined") return;

			switch (data.cmd) {
				case 'send':
					var eventType = data.eventType,
						msg = data.message;

					if (eventType) {
						socket.emit(eventType, msg, function (data) {
							if (data.callback)
								port.postMessage({type: '_callback', data: data});
						})
					} else {
						socket.send(msg, function (data) {
							if (data.callback)
								port.postMessage({type: '_callback', data: data});
						})
					}
					port.postMessage({type: '_send', data: msg});
					break;
				default:
					port.postMessage(data);
			}

		}

		port.start();

		//if there is more than one connection resend the message to all the _reconnect
		if (ports.length > 1) {
			port.postMessage({type: '_reconnect'});
		}

		socket.on('connect', function () {
			port.postMessage({type: '_connect'});

		});

		socket.on('disconnect', function () {
			port.postMessage({type: '_disconnect'});
		});

		socket.on('message', function (data) {
			port.postMessage({type: '_message', data: data});
		})
	})

})();



