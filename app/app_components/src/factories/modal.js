(function (angular) {
	"use strict";

	/**
	 * @ngdoc overview
	 * @name reyramos.modal
	 */
	angular.module('reyramos.modal', [])
		.run([
			'$templateCache',
			function ($templateCache) {
				$templateCache.put('/modalTemplate',
					'<div class="modal-box">' +
					'   <div class="panel" data-modal-class>' +
					'       <div class="panel-heading">' +
					'           <h3 class="panel-title" data-modal-title></h3>' +
					'       </div>' +
					'   <div data-modal-body></div>' +
					'   </div>' +
					'</div>'
				)
			}
		]).directive('goModal', goModalDirective).factory('modalFactory', ModalFactory)


	goModalDirective.$inject = ['$templateCache', '$timeout', '$compile', '$document', 'modalFactory', '$parse', '$rootScope', '$window'];
	ModalFactory.$inject = ['$document', '$rootScope', '$compile', '$timeout'];


	/**
	 * @ngdoc overview
	 * @name reyramos.modal.directive:goModal
	 * @restrict A
	 *
	 * @description
	 * Push a modal to the body of the document, accepts $templateCache route to a custom modal to push to DOM
	 *
	 * @requires reyramos.modal.modalFactory
	 *
	 * @example
	 * Push the defaul modal
	 *
	 * ```html
	 * <div data-go-modal ></div>
	 * ```
	 *
	 * Provide a custom $templateCache to push to DOM
	 *
	 * ```html
	 * <div data-go-modal="/modal/modalSample.html" ></div>
	 *```
	 *
	 */
	function goModalDirective($templateCache, $timeout, $compile, $document, modalFactory, $parse, $rootScope, $window) {
		return {
			restrict: 'A',
			scope: {
				opts: '=?goModal'
			},
			link: function postLink(scope, element, attr) {

				var defaults = {
						speed: 100,
						template: '/modalTemplate',
						onMouseup: true,
						backdrop: false,
						position: {
							top: '40%',
							left: '50%'
						}
					},
					opts = angular.extend(defaults, element.data('options') || {}, scope.opts || {}),
					milliseconds = (new Date).getTime(),
					windowBackDrop = angular.element(document.getElementById('mfBackDrop') || '<div id="mfBackDrop"></div>'),
					backDrop = $document,
					template,
					modal = angular.copy(opts);

				template = angular.element($templateCache.get(modal.template));
				if (opts.controller) {
					template.attr('data-ng-controller', modal.controller)
				}

				if (opts.onCreate && typeof(opts.onCreate) === 'function') {
					$timeout(function (fn) {
						fn(angular.element(template[0]))
					}, 0, false, opts.onCreate)
				}

// 					if (opts.contextMenu){
// 						var cmWrapper = angular.element("<div></div>").attr("data-context-menu",modal.contextMenu)
// 						template = cmWrapper.append(template)
// 					}


				delete opts.speed;
				delete opts.onCreate;
				delete opts.onDestroy;
				delete opts.template;
				delete opts.parent;

				stringReplace(); //first run will check for modules variables
				stringReplace(); //second run will check for user defined variables

				//wrapped the template inside the backDrop
				if (opts.backdrop) {
					backDrop = angular.element('<div id="' + milliseconds + '" class="mf-backdrop"></div>');

					backDrop.append(template)
					if (!document.getElementById('mfBackDrop')) {
						$('body').append(windowBackDrop);
					}
				}


				backDrop.on('mfMouseUp', mousedown); //add a custom jquery event

				if (defaults.onMouseup)
					backDrop.on('click contextmenu mousedown', mousedown);


				var describe = angular.copy(opts),
					compiledModal = $compile(opts.backdrop ? backDrop : template)(scope);

				describe.mf = milliseconds;

				$('body').append(compiledModal);

				//send an alert when this is created for the controller
				$rootScope.$broadcast('factory:modalFactory:show', describe);

				$timeout(function () {
					setPosition()
					template.addClass('in')
				}, 1)


				function stringReplace() {

					Object.keys(opts).forEach(function (key) {
						var query = angular.element(template[0].querySelector('[data-modal-' + key + ']')).removeAttr('data-modal-' + key);

						if (query) {
							switch (key) {
								case 'class':
									query.addClass(opts[key]);
									break;
								case 'body':
									query.replaceWith(opts[key]);
									break;
								case 'parentClass':
									template.addClass(opts[key]);
									break;
								default:
									switch (typeof(opts[key])) {
										case 'string':
											query.html(opts[key]);
											break;
										case 'object':
											$parse(key).assign(scope, opts[key]);
											break;
										case 'function':
											if (query.length)
												query.on('click', opts[key])
											break;
										default:
											break;
									}
									break;
							}
						}
					});

				}


				function setPosition() {

					template.css({
						"left": opts.position.left,
						"margin-left": ((template[0].clientWidth / 2) * -1) + "px",
						"top": opts.position.top,
						"margin-top": ((template[0].clientHeight / 2) * -1) + "px",
					})
				}

				function mousedown(event) {
					event.preventDefault();
					if (!template.is(event.target) && template.has(event.target).length === 0) {
						removeElement(event);
					}


				}

				function removeElement(event) {
					template.removeClass('in').addClass('out');
					backDrop.unbind('click contextmenu mousedown', mousedown);



					$timeout(function () {
						(opts.backdrop ? backDrop : template).remove();

						if (!document.getElementsByClassName('mf-backdrop').length) {
							windowBackDrop.remove();
						}

						if (modal.onDestroy && typeof(modal.onDestroy) === 'function') {
							modal.onDestroy(event)
						}

					}, modal.speed)


				}

				$document.on("resize orientationchange", setPosition)

				scope.$on('$destroy', function () {
					$document.unbind('click contextmenu mousedown', mousedown);
					$document.unbind("resize orientationchange", setPosition)

					if (backDrop || template) {

						backDrop.unbind('click contextmenu mousedown', mousedown);
						(opts.backdrop ? backDrop : template).remove();

						if (windowBackDrop)
							windowBackDrop.remove();
					}


				});
			}
		};
	}

	/**
	 * @ngdoc object
	 * @name reyramos.modal.modalFactory
	 *
	 * @description
	 * # modal.modalFactory
	 *
	 *
	 * This factory will build a modal onto the screen with user specify options and callbacks.
	 * The modalFactory is completely customizable
	 *
	 *
	 *
	 */

	function ModalFactory($document, $rootScope, $compile, $timeout) {

		var $parent = $document.find('body');

		return {
			/**
			 * @ngdoc function
			 * @name modal.modalFactory#show
			 * @methodOf reyramos.modal.modalFactory
			 *
			 * @param {object} obj Pass in definition of modal template
			 *
			 * @description
			 * set modal params and show the modal to DOM
			 *
			 */
			show: function (obj) {

				var modalContainer = angular.element("<div>").attr("data-go-modal", '');
				modalContainer.data('options', obj);

				angular.element($parent[0]).append($compile(modalContainer)($rootScope.$new()));
				$timeout(function () {
					modalContainer.remove()
				}, 1);

			},

			/**
			 * @ngdoc function
			 * @name modal.modalFactory#hide
			 * @methodOf reyramos.modal.modalFactory
			 *
			 * @description
			 * Hide the modal
			 *
			 *
			 */
			hide: function (event) {
				event.preventDefault();
				event.stopPropagation();
				$document.trigger('mfMouseUp');
			}
		}
	}

})(window.angular);
