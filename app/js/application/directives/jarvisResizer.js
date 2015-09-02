/**
 * Created by redroger on 8/8/2015.
 */
(function (angular) {
	'use strict';

	angular.module('app').directive('jarvisResizer', JarvisResizer)

	JarvisResizer.$inject = ['$document', 'appSettings']

	function JarvisResizer($document, appSettings) {

		var directive = {
			restrict: 'A',
			link: funcLink
		}

		var jarvisMenu = appSettings.jarvisMenu;


		function closeList(ele) {
			ele.find("ul:first").slideUp(jarvisMenu.speed, function () {
				ele.find("b:first").delay(jarvisMenu.speed).html(jarvisMenu.closedSign);
				ele.addClass('minifyMenu')

			});
		}

		function openList(ele) {
			ele.addClass('open active').find("ul:first").slideDown(jarvisMenu.speed, function () {
				ele.find("b:first").delay(jarvisMenu.speed).html(jarvisMenu.openedSign);

				ele.removeClass('minifyMenu')

			});
		}

		function funcLink(scope, ele, attr, ctrl) {
			var rDrag = angular.element(ele.find('.drag.right')),
				minifyMenu = angular.element(ele.find('.minifyme'));

			rDrag.on('mousedown', function (event) {
				event.preventDefault();
				$document.on('mousemove', mousemove);
				$document.on('mouseup', mouseup);
			});


			function mousemove(event) {
				var eleW = ele[0].clientWidth,
					openedEle = ele.find('li.active.jarvisMenu');

				/**
				 * Controll the setting of the menu item that is
				 * active
				 */
				if (eleW >= jarvisMenu.offsetMin) {
					openList(openedEle)

				} else if (eleW < jarvisMenu.offsetMin) {
					closeList(openedEle)
				}

				/**
				 * Controller the view of the minifyMenu class
				 */
				if (eleW <= jarvisMenu.min) {
					minifyMenu.addClass('minify-closed')
					ele.addClass('minify-closed')
				} else {
					minifyMenu.removeClass('minify-closed')
					ele.removeClass('minify-closed')
				}

			}

			function mouseup() {
				$document.unbind('mousemove', mousemove);
				$document.unbind('mouseup', mouseup);
			}
		}


		return directive;

	}


})(window.angular);
