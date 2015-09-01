(function (angular) {
	'use strict';


	angular.module('app').run(template).directive('dropZone', DropZone)

	template.$inject = ['$templateCache']

	DropZone.$inject = ['$timeout', '$q', '$templateCache', '$compile', '$document', '$window']

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


	function DropZone($timeout, $q, $templateCache, $compile, $document, $window) {
		var directive = {
			scope: {
				dropZoneOpts: '=dropZone'
			},
			controller: ['$scope', function ($scope) {
				var self = this;
				self.files = [];

				self.removeImage = function (event) {
					event.preventDefault();
					event.stopPropagation();

					var opts = self.opts,
						ele = angular.element(event.target),
						file = ele.data('file');

					opts.onRemove(file).then(function () {
						file.previewElement.addClass('dz-fade-out');
						delete self.files[file.lastModified];
						ele.parent().remove();
					})
				}

			}],
			controllerAs: 'ctl',
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

		function linkFunc(scope, element, attr, ctl) {


			var loader = angular.element('<div class="dz-loader"><div class="circle"></div></div>'),
				files = [],
				thumbnailWidth = 100,
				thumbnailHeight = 100,
				imgTypes = [
					'image/jpeg',
					'image/gif',
					'image/pjpeg',
					'image/png',
					'image/tiff'
				],
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
					allowedExtensions: [],
					maxFilesize: 2, //Mib
					resizeHeight: 500,
					resizeWidth: 500,
					maxFiles: 5,
					ignoreHiddenFiles: true,
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
					}
				},
				opts = angular.extend({}, defaults, scope.dropZoneOpts);
			//assing to controller
			ctl.opts = opts;


			function removeDragOver() {
				element.removeClass('hover');
			}


			function handleItems(items) {
				files = []; //reset the files container
				angular.forEach(items, function (item, index) {
					if (item.webkitGetAsEntry != null) {
						var entry = item.webkitGetAsEntry();
						if (entry.isFile) {
							files.push(item.getAsFile())
						} else if (entry.isDirectory && opts.allowDirectoryUpload) {
							//addDirectory(entry, entry.name).then(function (data) {
							//	files.concat(data);
							//});
						} else {
							opts.onError.apply(this, [{
								error: 'sorry directory not allowed'
							}]);
						}
					} else {
						files.push(item.getAsFile())
					}
				})

				handleFiles(files);
			}

			function addDirectory(entry, path) {
				var deffer = $q.defer();

				var dirReader = entry.createReader(),
					entriesReader = function (entries) {
						angular.forEach(entries, function (entry, index) {
							if (entry.isFile) {
								entry.file(function (file) {
									if (opts.ignoreHiddenFiles && file.name.substring(0, 1) === '.') {
										return;
									}
									file.fullPath = "" + path + "/" + file.name;
									files.push(file)
									//return handleFiles(file);
								});
							} else if (entry.isDirectory) {
								addDirectory(entry, "" + path + "/" + entry.name).then(function (data) {
									files.concat(data);
								});
							}

							if (files.length === entries.length)
								deffer.resolve()
						});
					};

				dirReader.readEntries(entriesReader, function (error) {
					deffer.reject(error)
				});

				return deffer.promise;
			};


			/**
			 * Initialize the creation of the thumbnail to add to the
			 * dropZone
			 *
			 */
			function createImagePreview(file) {
				var removeEle = angular.element('<a class="dz-remove">Remove</a>')
					.css({cursor: 'pointer'})
					.attr({'ng-click': 'ctl.removeImage($event)'}).data('file', file);

				file.previewElement = angular.element($templateCache.get('/previewTemplate')); //create the preview Element
				file.previewElement[0].querySelector("[data-dz-name]").textContent = file.name;
				file.previewElement.append(removeEle);
				$compile(file.previewElement)(scope);

			}

			function updatePreviewImage(file) {
				var fileData = file.hasOwnProperty('b64toBlob') ? file.b64toBlob : file;
				file.previewElement[0].querySelector("[data-dz-size]").innerHTML = getfilesize(fileData.size);
			}

			function addFile(file) {
				var deffer = $q.defer();
				file.timeStamp = Math.round((new Date()).getTime() / 1000);
				file.status = STATUS.ADDED;
				//create the imagePreview
				createImagePreview(file)
				//if its an image
				if (imgTypes.indexOf(file.type) !== -1) {
					getBase64Images(file).finally(function () {
						b64toBlob(file).then(function (blob) {
							file.b64toBlob = blob;
							updatePreviewImage(file);

							deffer.resolve()
						})
					})
				} else {
					deffer.resolve()
				}


				return deffer.promise;
			};

			/**
			 * Receive array of files
			 */
			function handleFiles(files) {

				var results = [],
					files = angular.isArray(files) ? files : [files];

				loopOnPromise(files, 0).then(function () {
					console.log('IMAGES LOADED')
					results = ctl.files;
				});

				opts.onDrag.apply(this, [results]);
				return results;
			};

			function loopOnPromise(array, index) {

				if (typeof (array) === "undefined") return;

				if (!array.hasOwnProperty('defer'))
					array.defer = $q.defer();

				if (index < array.length) {
					var reached = getNumFiles();
					if (opts.maxFiles > -1 && reached) {
						var file = array[index];
						if (isFileType(file) && isUnique(file)) {
							addFile(file).finally(function () {
								if (isWithinSize(file)) {
									ctl.files[file.lastModified] = file;
									element.append(file.previewElement); //append it to the dropZone
								}
								loopOnPromise(array, index + 1);
							})
						} else {
							loopOnPromise(array, index + 1);
						}
					} else {
						opts.onError.apply(this, [{
							error: "reached max files"
						}]);
						loopOnPromise(array, index + 1);
					}

				} else {
					array.defer.resolve();
				}

				return array.defer.promise;
			}

			function isWithinSize(file) {
				var fileData = file.hasOwnProperty('b64toBlob') ? file.b64toBlob : file;
				//1e+6 kb === 1mb
				if (fileData.size <= 1e+6 * opts.maxFilesize) {
					return true;
				} else {
					opts.onError.apply(this, [{
						error: "file is too big"
					}]);
				}

				return false;
			}

			function isFileType(file) {

				var fileType = true,
					ext = file.name.substr((~-file.name.lastIndexOf(".") >>> 0) + 2);

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

			function getNumFiles() {
				var count = 0;
				Object.keys(ctl.files).forEach(function (key) {
					count++;
				})

				console.log('getNumFiles', count)
				return count < opts.maxFiles ? true : false;
			}

			function isUnique(file) {
				var reached = getNumFiles(),
					count = 0;

				if (!reached) {
					opts.onError.apply(this, [{
						error: "reached max files"
					}]);

					return false;
				} else {
					Object.keys(ctl.files).forEach(function (key) {
						count++;

						if (ctl.files[key].name === file.name && ctl.files[key].size === file.size) {
							opts.onError.apply(this, [{
								error: "duplicate file"
							}]);

							reached = false;
						}
					})
				}
				return reached;
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
						canvas = document.createElement("canvas");
						ctx = canvas.getContext("2d");
						canvas.width = thumbnailWidth;
						canvas.height = thumbnailHeight;
						ctx.drawImage(img, 0, 0, thumbnailWidth, thumbnailHeight);
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
				var string, mbKb = [{x: 100, n: 'KB'}, {x: 100000, n: 'MB'}];
				for (var i in mbKb)
					if (size >= mbKb[i].x) {
						size = size / mbKb[i].x;
						string = mbKb[i].n;
					}

				return "<strong>" + (Math.round(size) / 10) + "</strong> " + string;
			};

			element.on('click', function () {
				angular.element(document.querySelector('#hiddenDropZone')).remove();
				var hiddenInput = angular.element('<input type="file" multiple="true" id="hiddenDropZone" />')
					.css({visibility: "hidden"})
					.on("change", function () {
						var _this = angular.element(this),
							f = _this[0].files;
						if (f.length) {
							handleFiles(f);
						}
						_this.remove();
					});

				angular.element(document.querySelector('body')).append(hiddenInput);
				return hiddenInput.trigger("click");
			}).on('dragstart', function () {
				try {
					event.dataTransfer.effectAllowed = 'move';
				} catch (e) {
				}
				element.unbind('dragstart')
			}).on('dragover dragenter', function () {
				event.stopPropagation();
				event.preventDefault();
				element.addClass('hover');
				try {
					event.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
				} catch (e) {
				}
			}).on('drop', function () {
				event.stopPropagation();
				event.preventDefault();

				removeDragOver();

				if (!event.dataTransfer) {
					return;
				}

				var files = event.dataTransfer.files; // FileList object.
				// files is a FileList of File objects. List some properties.
				if (files.length) {
					var items = event.dataTransfer.items;
					if (items && items.length && ((items[0].webkitGetAsEntry != null) || (items[0].getAsEntry != null))) {
						handleItems(items);
					} else {
						handleFiles(files);
					}
				}

				return false;
			}).on('dragend dragleave', removeDragOver);

		}

		return directive;
	}


})(window.angular);
