/**
 * Created by redroger on 11/5/14.
 */
(function (angular) {
	'use strict';

	angular.module('app').directive('minifyMenu', minifyMenu);

	minifyMenu.$inject = ['$document', 'appSettings'];


	function minifyMenu($document, appSettings) {

		var directive = {
				link: linkFunc
			},
			targets = ['#sidebar', '#mainContent'];

		var jarvisMenu = appSettings.jarvisMenu;


		function linkFunc(scope, ele, attrs) {

			function closeList(ele) {
				ele.find("ul:first").slideUp(jarvisMenu.speed, function () {
					ele.find("b:first").delay(jarvisMenu.speed).html(jarvisMenu.closedSign);
					scope.$emit('directive:jarvisMenu', {
						element: this,
						class: ""
					})

				});
			}

			function openList(ele) {
				ele.addClass('open active').find("ul:first").slideDown(jarvisMenu.speed, function () {
					ele.find("b:first").delay(jarvisMenu.speed).html(jarvisMenu.openedSign);
					scope.$emit('directive:jarvisMenu', {
						element: this,
						class: "open"
					})
				});
			}


			ele.on("click", function (event) {

				event.preventDefault()
				event.stopPropagation();

				var sidebar = angular.element($document[0].querySelector(targets[0])),
					main = angular.element($document[0].querySelector(targets[1])),
					activeSidebar = sidebar.find('li.active');


				if (sidebar.css("width") !== jarvisMenu.min + 'px') {
					ele.addClass('minify-closed')
					sidebar.css({width: jarvisMenu.min + 'px'}).addClass('minify-closed')
					main.css({left: jarvisMenu.min + 'px'}).addClass('minify-closed')
					sidebar.find('li.jarvisMenu').addClass('minifyMenu')

					closeList(activeSidebar)
				} else {
					ele.removeClass('minify-closed')
					sidebar.css({width: jarvisMenu.max + 'px'}).removeClass('minify-closed')
					main.css({left: jarvisMenu.max + 'px'}).removeClass('minify-closed')

					sidebar.find('li.minifyMenu').removeClass('minifyMenu')

					openList(activeSidebar)

				}
			})
		};


		return directive;

	}


})(window.angular);
