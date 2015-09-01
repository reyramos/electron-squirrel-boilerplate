(function (angular) {
	'use strict';


	angular.module('app').run(template).directive('dropZone', DropZone)

	template.$inject = ['$templateCache']

	DropZone.$inject = ['$timeout', '$q', '$templateCache', '$compile', '$log', '$window']

	function template($templateCache) {
		$templateCache.put('/previewTemplate',
			'<div class="dz-preview dz-file-preview" data-context-menu="imageContext">' +
			'<div class="dz-details">' +
			'<div class="dz-filename"><span data-dz-name></span></div>' +
			'<div class="dz-size" data-dz-size></div>' +
			'<img data-dz-thumbnail />' +
			'</div>' +
			'<div class="dz-progress"><span class="dz-upload" data-dz-upload></span></div>' +
			'<div class="dz-success-mark"><i class="fa fa-check"></i></div>' +
			'<div class="dz-error-mark"><i class="fa fa-times"></i></div>' +
			'<div class="dz-error-message"><span data-dz-errormessage></span></div>' +
			'</div>')
	}


	function DropZone($timeout, $q, $templateCache, $compile, $log, $window) {
		var directive = {
			scope: {
				dropZoneOpts: '=dropZone'
			},
			template: [
				'<div class="dropzone">',
				'<div class="dz-default dz-message">',
				'<div class="dz-image"><i class="fa fa-picture-o"></i></div>',
				'</div>',
				'</div>'
			].join(''),
			replace: true,
			link: linkFunc
		};

		function linkFunc(scope, element, attr) {

			var logger = $log.getInstance('dropZone'),
				hiddenFileInput,
				loader = angular.element('<div class="dz-loader"><div class="circle"></div></div>'),
				files = [],

				STATUS = {
					ADDED: "added",
					QUEUED: "queued",
					ACCEPTED: "accepted",
					UPLOADING: "uploading",
					PROCESSING: "processing",
					CANCELED: "canceled",
					ERROR: "error",
					SUCCESS: "success"
				},
				defaults = {
					mediaTypes: [
						'image/jpeg',
						'image/gif',
						'image/pjpeg',
						'image/png',
						'image/tiff'
					],
					allowedExtensions: [],
					maxFilesize: 2, //Mib
					createImageThumbnails: true,
					maxThumbnailFilesize: 10,
					thumbnailWidth: 100,
					thumbnailHeight: 100,
					resizeHeight: 500,
					resizeWidth: 500,
					maxFiles: 5,
					ignoreHiddenFiles: true,
					acceptedFiles: null,
					acceptedMimeTypes: null,
					autoProcessQueue: true,
					addRemoveLinks: true,
					previewsContainer: null,
					allowDirectoryUpload: true,
					dictCancelUploadConfirmation: "Are you sure you want to cancel this upload?",
					wsFileTransfer: false,
					resizeImg: true,
					onError: function () {
					},
					onDrop: function () {
					},
					onRemove: function (file) {
						var defer = $q.defer();

						if ($window.confirm(defaults.dictCancelUploadConfirmation)) {
							defer.resolve(true)
						} else {
							defer.reject(false)
						}
						return defer.promise;

					},
					removeFile: function (index) {
					},
					onDrag: function (index) {
					},

				};

			var opts = angular.extend({}, defaults, scope.dropZoneOpts);

			scope.$watch(function () {
				return element.children().length
			}, function (ele) {
				if (ele === 1) {
					element.removeClass('dz-started')
				}
			})

			function handleDragStart() {
				event.dataTransfer.effectAllowed = 'move';
				element.unbind('dragstart')
			}


			function handleDragOver() {
				event.stopPropagation();
				event.preventDefault();
				element.addClass('hover');
				event.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
			}

			function removeDragOver() {
				element.removeClass('hover');
			}


			function DragHandleFileSelect() {

				event.stopPropagation();
				event.preventDefault();

				if (!event.dataTransfer) {
					return;
				}

				var files = event.dataTransfer.files; // FileList object.

				// files is a FileList of File objects. List some properties.
				if (files.length) {
					element.append(loader)


					var items = event.dataTransfer.items;
					if (items && items.length && ((items[0].webkitGetAsEntry != null) || (items[0].getAsEntry != null))) {
						handleItems(items);
					} else {
						handleFiles(files);
					}
				}

				return false;

			}

			function handleItems(items) {

				var entry, item, _i, _len;
				for (_i = 0, _len = items.length; _i < _len; _i++) {
					!function outer(_i) {
						item = items[_i];
						if (item.webkitGetAsEntry != null) {
							entry = item.webkitGetAsEntry();
							if (entry.isFile) {
								handleFiles(item.getAsFile())
							} else if (entry.isDirectory && opts.allowDirectoryUpload) {
								addDirectory(entry, entry.name);
							} else {
								logger.log('SORRY DIRECTORY NOT ALLOWED');
							}
						} else {
							handleFiles(item.getAsFile())
						}
					}(_i);
				}
				removeDragOver();
			}

			function addDirectory(entry, path) {

				var dirReader, entriesReader;
				dirReader = entry.createReader();
				entriesReader = function (entries) {
					var _i, _len;
					for (_i = 0, _len = entries.length; _i < _len; _i++) {
						!function outer(_i) {
							entry = entries[_i];
							if (entry.isFile) {
								entry.file(
									function (file) {
										if (opts.ignoreHiddenFiles && file.name.substring(0, 1) === '.') {
											return;
										}
										file.fullPath = "" + path + "/" + file.name;
										return handleFiles(file);
									}
								);
							} else if (entry.isDirectory) {
								addDirectory(entry, "" + path + "/" + entry.name);
							}

						}(_i);
					}
				};
				return dirReader.readEntries(
					entriesReader,
					function (error) {
						return typeof console !== "undefined" && console !== null ? typeof console.log === "function" ? console.log(error) : void 0 : void 0;
					}
				);
			};


			function removeFile(file) {
				var defer = $q.defer();
				for (var i = 0; i < files.length; i++) {
					!function outer(i) {

						if (files[i].timeStamp === file.timeStamp && files[i].thumbnail === file.thumbnail) {
							files[i].previewElement.addClass('dz-fade-out');
							files[i].previewElement.remove();


							$timeout(function () {
								files.splice(i, 1);
								defer.resolve(true)
							}, 350)

						}

					}(i);
				}

				return defer.promise;
			}

			/**
			 * Initialize the creation of the thumbnail to add to the
			 * dropZone
			 *
			 */
			function createImagePreview(file) {

				var previewElement = angular.element($templateCache.get('/previewTemplate')), //create the preview Element
					removeLink = angular.element('<a class="dz-remove" href="javascript:void(0);">Remove</a>')
						.on('click', function (e) {
							e.preventDefault();
							e.stopPropagation();

							opts.onRemove(file).then(function () {
								removeFile(file);
								setMessage();
							})

						});


				previewElement[0].querySelector("[data-dz-name]").textContent = file.name;
				previewElement.append(removeLink)
				file.previewElement = previewElement; //save a copy of the object

			}

			function updatePreviewImage(file){
				var fileData = file.hasOwnProperty('b64toBlob')?file.b64toBlob:file;
				console.log('fileData.size',fileData.size)
				file.previewElement[0].querySelector("[data-dz-size]").innerHTML = getfilesize(fileData.size);
			}

			function setMessage() {
				element[files.length ? "addClass" : "removeClass"]("dz-started")
			}

			/**
			 * Receive array of files
			 */
			function handleFiles(files) {
				var file,
					_results = [],
					files = files[0] ? files : [files];

				for (var i = 0; i < files.length; i++) {

					if ((opts.maxFiles < 0) || (opts.maxFiles > -1 && i < opts.maxFiles)) {
						file = files[i];
						_results.push(addFile(file));
					}
				}
				opts.onDrag.apply(this);
				return _results;
			};

			function isWithinSize(file) {

				if (file.size <= 10 * 1024 * 1024) {
					return true;
				} else {
					opts.onError.apply(this, [{
						error: "file is too big"
					}]);
				}

				return false;
			}

			function isFileType(file) {

				var fileType = false,
					ext = file.name.substr((~-file.name.lastIndexOf(".") >>> 0) + 2);

				if (opts.mediaTypes.indexOf(file.type) !== -1)
					fileType = true;

				if (opts.allowedExtensions.length) {
					fileType = false;

					if (opts.allowedExtensions.indexOf(ext) !== -1) {
						fileType = true;
					}
				}

				if (!fileType) {
					opts.onError.apply(this, [{
						error: "incorrect file type"
					}]);
				}

				return fileType;

			}


			function addFile(file) {
				//check if file size was not rejected


				if (isFileType(file) && isWithinSize(file)) {

					file.timeStamp = Math.round((new Date()).getTime() / 1000);
					file.status = STATUS.ADDED;

					//create the imagePreview
					createImagePreview(file)

					getBase64Images(file).finally(function () {

						b64toBlob(file).then(function (blob) {
							file.b64toBlob = blob;

							updatePreviewImage(file)

							//var url = window.URL.createObjectURL(blob);
							// do something with url
						}).finally(function () {


							if (checkDups(file)) {
								files.push(file);

								element.append($compile(file.previewElement)(scope)); //append it to the dropZone
								return _enqueueFile(file);
							} else {
								loader.remove();
							}
						})
					})
				} else {
					loader.remove();
				}

			};


			function checkDups(file) {
				var status = files.length < opts.maxFiles ? true : (opts.maxFiles < 0 ? true : false);
				if (files.length === opts.maxFiles) {
					opts.onError.apply(this, [{
						error: "reached max files"
					}]);
				} else {
					for (var i = 0; i < files.length; i++) {
						if (files[i].name === file.name && files[i].thumbnail === file.thumbnail) {
							status = false;
						}
					}
				}
				return status;
			}

			function _enqueueFile(file) {
				file.accepted = true;
				if (file.status === STATUS.ADDED) {
					file.status = STATUS.QUEUED;

					var arrF = [],
						cfile;

					for (var i in files) {
						var cf = {};
						angular.forEach(files[i], function (value, key) {
							if (key !== "previewElement") {
								cf[key] = value;
							}

						});

						arrF.push(angular.copy(cf))
					}

					opts.onDrop.apply(this, [file, arrF]);
					element.removeClass('hover');
					loader.remove();

				} else {
					throw new Error("This file can't be queued because it has already been processed or was rejected.");
				}

				setMessage();

			};


			function resize(file, width, height) {
				var arg = arguments,
					info, srcRatio, trgRatio;

				if (!arg[1] && !arg[2]) {
					width = opts.thumbnailWidth
					height = opts.thumbnailHeight
				}

				info = {
					srcX: 0,
					srcY: 0,
					srcWidth: file.width,
					srcHeight: file.height
				};

				srcRatio = file.width / file.height;
				trgRatio = width / height;
				if (file.height < height || file.width < width) {
					info.trgHeight = info.srcHeight;
					info.trgWidth = info.srcWidth;
				} else {
					if (srcRatio > trgRatio) {
						info.srcHeight = file.height;
						info.srcWidth = info.srcHeight * trgRatio;
					} else {
						info.srcWidth = file.width;
						info.srcHeight = info.srcWidth / trgRatio;
					}
				}
				info.srcX = (file.width - info.srcWidth) / 2;
				info.srcY = (file.height - info.srcHeight) / 2;
				return info;
			}

			function createThumbnail(file, dataUrl) {

				var thumbnailElement = file.previewElement[0].querySelector("[data-dz-thumbnail]");
				thumbnailElement.alt = file.name;

				file.previewElement.removeClass("dz-file-preview");
				file.previewElement.addClass("dz-image-preview");

				return thumbnailElement.src = dataUrl;
			}

			function b64toBlob(file) {
				var deferred = $q.defer();


				if (file.hasOwnProperty('base64')) {

					var rawBase64 = file.base64.substring(file.base64.indexOf("base64,") + 7),
						binary = atob(rawBase64),
						buffer = new ArrayBuffer(binary.length),
						view = new Uint8Array(buffer);

					for (var i = 0; i < binary.length; i++) {
						view[i] = binary.charCodeAt(i);
					}

					var blob = new Blob([view], {type: file.type});

					deferred.resolve(blob)

				} else {

					deferred.reject();

				}

				return deferred.promise;
			}

			/**
			 * Creates the originalImage and thumbnail base64 images, and appends key to file object
			 * @param file {object}
			 */
			function getBase64Images(file) {

				var fileReader = new FileReader,
					deferred = $q.defer();


				fileReader.onload = function () {
					var img = new Image;
					img.onload = function () {

						var canvas, ctx, resizeInfo, thumbnail, _ref, _ref1, _ref2, _ref3, original, oSize;
						file.width = img.width;
						file.height = img.height;


						//CREATE THE THUMBNAIL
						resizeInfo = resize(file);
						if (resizeInfo.trgWidth == null) resizeInfo.trgWidth = opts.thumbnailWidth;
						if (resizeInfo.trgHeight == null) resizeInfo.trgHeight = opts.thumbnailHeight;
						canvas = document.createElement("canvas");
						ctx = canvas.getContext("2d");
						canvas.width = resizeInfo.trgWidth;
						canvas.height = resizeInfo.trgHeight;
						ctx.drawImage(img, (_ref = resizeInfo.srcX) != null ? _ref : 0, (_ref1 = resizeInfo.srcY) != null ? _ref1 : 0, resizeInfo.srcWidth, resizeInfo.srcHeight, (_ref2 = resizeInfo.trgX) != null ? _ref2 : 0, (_ref3 = resizeInfo.trgY) != null ? _ref3 : 0, resizeInfo.trgWidth, resizeInfo.trgHeight);
						thumbnail = canvas.toDataURL(file.type);
						file.base64_thumb = thumbnail;


						//ORIGINAL IMAGE RESIZE
						if (opts.resizeWidth && opts.resizeHeight) {
							canvas.width = opts.resizeWidth;
							canvas.height = opts.resizeHeight * img.height / img.width;

							ctx.drawImage(img, 0, 0, opts.resizeWidth, opts.resizeWidth * img.height / img.width)
							file.base64 = canvas.toDataURL(file.type)

						}


						canvas = null;
						ctx = null;

						//add imageBase64 to object
						createThumbnail(file, thumbnail)
						deferred.resolve(file);

					};

					img.onerror = function () {
						deferred.reject(file);
					};

					return img.src = fileReader.result;
				};

				fileReader.readAsDataURL(file)
				return deferred.promise;

			};
			/**
			 * Converst image from kb to string format
			 * @param size in kib
			 * @returns {string}
			 */
			function getfilesize(size) {
				var string;
				if (size >= 100000000000) {
					size = size / 100000000000;
					string = "TB";
				} else if (size >= 100000000) {
					size = size / 100000000;
					string = "GB";
				} else if (size >= 100000) {
					size = size / 100000;
					string = "MB";
				} else if (size >= 100) {
					size = size / 100;
					string = "KB";
				} else {
					size = size * 10;
					string = "b";
				}
				return "<strong>" + (Math.round(size) / 10) + "</strong> " + string;
			};


			//TODO: only do one hidden input no matter how many files
			function setupHiddenFileInput() {

				hiddenFileInput = $('#hiddenDropZone');

				if (hiddenFileInput.length)
					hiddenFileInput.remove();


				hiddenFileInput = $('<input>')
					.attr("id", "hiddenDropZone")
					.attr("type", "file")
					.attr("multiple", "multiple")
					.css({
						visibility: "hidden",
						position: "absolute",
						top: "0",
						left: "0",
						height: "0",
						width: "0"
					})

				$('body').append(hiddenFileInput);

				hiddenFileInput.on(
					"change",
					function () {
						var f = hiddenFileInput[0].files;
						if (f.length) {
							element.append(loader)
							handleFiles(f);
						}
					})

				return hiddenFileInput.trigger("click");

			};

			element.on('click', setupHiddenFileInput);


			// Check for the various File API support.
			if ($window.File && $window.FileReader && $window.FileList && $window.Blob) {
				// Setup event listeners.
				element.on('dragstart', handleDragStart);
				element.on('dragover dragenter', handleDragOver);
				element.on('dragend dragleave', removeDragOver);
				element.on('drop', DragHandleFileSelect);
			}

			scope.$on('dropZone.removeFile', function (e, data) {
				removeFile(data.file).then(data.callback)
			});


		}

		return directive;
	}


})(window.angular);
