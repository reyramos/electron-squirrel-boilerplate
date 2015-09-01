/**
 * Created by redroger on 1/21/14.
 */
(function (angular) {
	'use strict';

	angular.module('app').directive('dashboardJarvis', JarvisMenu);

	JarvisMenu.$inject = ['$document'];
	function JarvisMenu($document) {
		var directive = {
			link: linkFun,
			scope: {
				opts: '=?dashboardJarvis'
			}
		};


		function linkFun(scope, element, attr) {
			if (typeof jQuery === "undefined" && jQuery === null) {
				throw new DOMException("Missing JQuery");
			}
			var el = $(element),
				defaults = {
					accordion: false,
					speed: 200,
					closedSign: '[+]',
					openedSign: '[-]'
				};

			// Extend our default options with those provided.
			if (typeof(scope.opts) != "undefined" && typeof(scope.opts) != "undefined") {
				defaults = angular.extend({}, defaults, scope.opts)
			}

			function closeList(ele) {
				ele.find("ul:first").slideUp(defaults.speed, function () {
					ele.removeClass("open active").find("b:first").delay(defaults.speed).html(defaults.closedSign);
					scope.$emit('directive:jarvisMenu', {
						element: this,
						class: ""
					})

				});
			}


			el.find("li a").on('click', function (event) {

				//remove all active element
				var parents = angular.element($document[0].querySelector('#sidebar')),
					listElements = parents.find("li"),
					target = listElements.find("ul");

				listElements.removeClass('active');

				if (target.is(':visible')) {
					closeList(target.parent())
				}


			})


		}

		return directive;
	}


})(window.angular);
