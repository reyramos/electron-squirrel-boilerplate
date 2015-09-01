/**
 *
 *
 * new wsFileTransfer({
 *            	file: file,
 *            	blockSize: 1024,
 *            	resize: true,
 *            	progress: function (data) {
 *             		logger.log("wsFileTransfer.progress", data)
 *            	},
 *            	success: function (data) {}
 *   })
 *
 *
 */
(function (angular) {
	'use strict';

	angular.module('app').factory('wsFileTransfer', WsFileTransfer);

	WsFileTransfer.$inject = ['socketService', '$log', '$window', 'enums']

	function WsFileTransfer(socketService, $log, $window, enums) {

		// private static
		var DEFAULTS = {
			type: 'binary',
			blockSize: 1024
		}, opts = {};

		// constructor
		var cls = function (obj) {

			opts = angular.extend({}, DEFAULTS, obj);

			var startTime, curIndex, lastBlock, filename = null,
				fileBlob = opts.file.hasOwnProperty('b64toBlob') ? opts.file.b64toBlob : opts.file;

			var response = {
				'requestType': enums.WS_FILE_TRANSER.INIT,
				'base64_thumb': opts.file.base64_thumb || null,
				'base64': opts.file.base64 || null,
				'b64toBlob': opts.file.hasOwnProperty('b64toBlob') ? opts.file.b64toBlob : null,
				'filename': opts.file.name,
				'size': opts.file.size, //original file size
				'type': opts.type,
				'ext': opts.file.name.substr((~-opts.file.name.lastIndexOf(".") >>> 0) + 2)
			};

			socketService.send(enums.WS_FILE_TRANSER.EVENT, response).then(function (data) {

				if (typeof(data._id) !== "undefined") {

					response._id = data._id;

					socketResponse(data)
				}

			})

			var socketResponse = function (data) {
				var self = this;

				switch (data.type) {
					case 'STOR':

						// Response to a STOR command.
						startTime = (new Date().getTime()) / 1000.0;
						readSlice(0, opts.blockSize);

						break;
					case 'DATA':

						filename = data.filename


						// Response to a DATA command.
						// Copy object information into local var to have the
						var data = {
							progress: curIndex / fileBlob.size * 100,
							index: data.index
						}

						opts.progress(data);

						// If all the data has been sent, send a success event
						if (lastBlock) {

							response.requestType = enums.WS_FILE_TRANSER.COMPLETE

							socketService.send(enums.WS_FILE_TRANSER.EVENT, response).then(function (data) {
								// socketResponse(data.data)
								opts.progress({
									progress: 100
								});

								opts.success(data);

							})
							return;
						}


						// Read and send the next block
						readSlice((Number(curIndex) + opts.blockSize), opts.blockSize);

						break;
					case 'STAT':
						opts.progress({
							progress: 100
						});

						opts.success(data);
						break;

				}
			}

			var readSlice = function (start, length) {

				console.log('====================READSLICE======================')
				console.log('start',start)

				var self = this;

				// Updates the current index
				curIndex = parseInt(start);
				// Make sure we stop at end of file
				var stop = Math.min(start + length - 1, fileBlob.size - 1),
					length = stop - start + 1;

				console.log('stop',stop)
				console.log('fileBlob.size',fileBlob.size)


				// Save if it is the last block of data to send
				lastBlock = (stop == fileBlob.size - 1);

				// Get blob and check his size
				var blob = new Blob([fileBlob.slice(start, start + length)], {type: fileBlob.type}) ;

				// Creates the reader only for base 64 encoded data
				var reader = new FileReader();
				reader.onabort = function () {
					$log.error('reader: abort')
				};
				reader.onerror = function (event) {
					switch (event.target.error.code) {
						case event.target.error.NOT_FOUND_ERR:
							$log.error('File not found');
							break;
						case event.target.error.NOT_READABLE_ERR:
							$log.error('File is not readable');
							break;
						case event.target.error.ABORT_ERR:
							$log.error('File upload aborted');
							break;
						default:
							$log.error('An error occurred reading the file.');
					};
				};

				// If we use STOR, we need to check the readyState.
				reader.onloadend = function (evt) {
					//only send if we have data to send
					if (length > 0 && evt.target.readyState == FileReader.DONE) { // DONE == 2
						sendB64Slice(event.target.result);
					}
				};

				reader.readAsBinaryString(blob);

			}

			var sendB64Slice = function (data) {

				response.requestType = enums.WS_FILE_TRANSER.DATA
				response.data = $window.btoa(data)

				delete response.original;
				delete response.thumbnail;

				socketService.send(enums.WS_FILE_TRANSER.EVENT, response).then(function (response) {
					socketResponse(response);

				})
			}


		};


		return cls;

	}


})(window.angular);

