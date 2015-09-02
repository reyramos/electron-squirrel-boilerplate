/**
 * Created by redroger on 6/2/2015.
 *
 *        self.faThOpts = [
 [{
				name: 'Poster',
				icon: 'fa fa-th-large',
				callback: function () {
				}
			}],
 [{
				name: 'Details',
				icon: "fa fa-th-list",
				callback: function () {
				}
			}],
 [{
				name: 'List',
				icon: "fa fa-list",
				callback: function () {
				}
			}]
 ]

 */
(function (angular) {
	"use strict";


	angular.module('app').run(ddRun).directive('dropDownOptions', DropDownOptions)


	ddRun.$inject = ['$templateCache'];
	DropDownOptions.$inject = ['$templateCache', '$compile', '$timeout', '$state', '$document'];

	function ddRun($templateCache) {
		$templateCache.put(
			'/bgDropDownButtons/bgDropDownButtons.html',
			[
				'<div id="bgDropDownButtons"><div class="dropdown-buttons" ><ul data-ng-repeat="ul in ctrl.unorder.ul"><li data-ng-repeat="li in ul">',
				'<div data-ng-click="li.callback(li, $event);ctrl.forceClose($event)"><i class="{{::li.icon}}"></i>{{::li.name}}',
				'<i class="fa fa-caret-right pull-right" data-ng-show="li.list"></i></div>',
				'<ul data-ng-show="li.list"><li data-ng-repeat="subli in li.list">',
				'<div data-ng-click="subli.callback(subli, $event)"><i class="{{::subli.icon}}"></i>{{::subli.name}}</div>',
				'</li></ul>',
				'</li></ul></div></div>'
			].join(''))
	}


	function DropDownOptions($templateCache, $compile, $timeout, $state, $document) {

		var directive = {
			restrict: 'AEC',
			scope: {
				ddOpts: "=dropDownOptions",
				ngModel: "=?ngModel",
			},
			controller: ['$scope', function ($scope) {

				var self = this,
					ddOpts = [],
					ctrl = $scope.ctrl;

				if (!ctrl.ddOpts)return;


				angular.forEach(angular.copy(ctrl.ddOpts), function (obj) {
					if (obj[0] && ctrl.hasOwnProperty('ngModel') && Object.keys(ctrl.ngModel).length) {
						angular.forEach(obj, function (obj) {
							obj.params = ctrl.ngModel;
						})
					}


					this.push(obj)
				}, ddOpts);

				var options = angular.extend({}, {
					id: Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + Date.now().toString(),
					ddOpts: ddOpts || {}, //set the options to reset
				});

				self.opts = options;

			}],
			controllerAs: 'ctrl',
			bindToController: true,
			link: linkFunc
		};

		function linkFunc(scope, element, attr, ctrl) {

			var cmElement = null,
				options = [],
				acceptedOpts = ['offsetTop', 'offsetRight', 'offsetLeft', 'offsetBottom', 'position'];

			if (!ctrl.ddOpts)return;

			ctrl.unorder = {ul: []};

			angular.forEach(ctrl.opts.ddOpts, function (obj, n) {
				this.push(obj)

				if (obj[0]) {
					angular.forEach(obj, function (obj) {
						for (var i in acceptedOpts)
							if (obj.hasOwnProperty(acceptedOpts[i])) {
								var handler = {}
								handler[acceptedOpts[i]] = obj[acceptedOpts[i]];
								this.push(handler)
							}
					}, options)
				}

			}, ctrl.unorder.ul);

			if (options[0]) {
				var handler = [];
				for (var i in options) {
					Object.keys(options[i]).forEach(function (key) {
						handler[key] = options[i][key];
					});
				}
				options = handler;
			}


			element.on('click', ClickOnElement)

			function getPosition(ele) {
				var rect = null;
				try {
					rect = ele.getBoundingClientRect();
				} catch (e) {
					rect = ele[0].getBoundingClientRect();
				}
				var rectTop = rect.top + window.pageYOffset - document.documentElement.clientTop;
				var rectLeft = rect.left + window.pageXOffset - document.documentElement.clientLeft;

				return {top: rectTop, left: rectLeft};

			}


			function ClickOnElement(event) {
				event.preventDefault();
				event.stopPropagation();


				var elePos = getPosition(element),
					eCw = event.currentTarget.clientWidth;

				angular.element($document[0].querySelector('#bgDropDownButtons')).remove();

				cmElement = angular.element($templateCache.get('/bgDropDownButtons/bgDropDownButtons.html'));

				$compile(cmElement)(scope);

				$timeout(function () {

					angular.element($document[0].querySelector('body')).append(cmElement[0]);

					var ulElement = angular.element(cmElement.children()[0]),
						ulW = ulElement[0].clientWidth,
						wW = window.innerWidth,
						leftPosition = elePos.left - (options.hasOwnProperty('offsetRight') ? options.offsetRight : 0) - (options.hasOwnProperty('offsetLeft') ? options.offsetLeft : 0),
						offset = wW - leftPosition - eCw;

					angular.element(window).on("click contextmenu mousedown", mouseUp);

					if (!scope.$eval($state.current.data.debug))
						cmElement.bind("contextmenu", function (event) {
							event.preventDefault();
							mouseUp(event);
							cmElement.unbind("contextmenu")
						})


					if (options.hasOwnProperty('options') && options.position === 'right') {
						leftPosition = leftPosition - ulW + eCw;
					} else if ((ulW + leftPosition) > wW) {
						leftPosition = Math.abs(wW - ulW - offset)
					}

					ulElement.css({
						top: (elePos.top + element[0].clientHeight
						- (options.hasOwnProperty('offsetTop') ? options.offsetTop : 0)
						- (options.hasOwnProperty('offsetBottom') ? options.offsetTop : 0)    ) + 'px',
						left: leftPosition + 'px'
					})

				}, 0)


			}

			function mouseUp(e) {
				e.preventDefault();

				if (!cmElement.is(e.target) && cmElement.has(e.target).length === 0) {
					destroy(event)
				}
			}

			function destroy(event) {
				cmElement.remove();
				angular.element(window).unbind("click contextmenu mousedown", mouseUp);
			}

			ctrl.forceClose = function (event) {
				destroy(event)
			}


			scope.$on('$destroy', function () {
				if (cmElement) {
					cmElement.unbind("click", mouseUp)
					cmElement.remove();
				}
			});

		}

		return directive;

	}


})(window.angular);
