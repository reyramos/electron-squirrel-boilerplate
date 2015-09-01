/**
 * Created by redroger on 11/5/14.
 */

(function (angular) {
	'use strict';
	angular.module('app').directive('cogLoader', cogLoader)

	function cogLoader() {

		var directive = {
			restrict: 'EA',
			template: '<i class="fa fa-refresh "></i>',
			transclude: true,
			link: funcLink
		};

		function funcLink(scope, element, attr, ctrl) {
			function addClassCogLoader(boolean) {
				element.find('i.fa-refresh')[boolean ? 'addClass' : 'removeClass']('fa-spin')
			}

			scope.$on('$stateChangeStart', function(){
				addClassCogLoader(true)
			});
			scope.$on('$stateChangeSuccess', function(){
				addClassCogLoader(false)
			});
		}

		return directive;
	}

})(window.angular);
