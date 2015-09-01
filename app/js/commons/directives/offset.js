/**
 * Created by redroger on 11/5/14.
 */

(function (angular) {
	'use strict';
	angular.module('app').directive('rrOffset', setHeight)

	setHeight.$inject = ['$window']

	function setHeight($window) {

		var directive = {
			scope: {
				opts: '=rrOffset'
			},
			link: funcLink
		};


		function funcLink(scope, element, attr) {

			var resize = function () {
				var opts = {
						offset: 0,
						property: "height"
					},
					offset = opts.offset,
					wh = $window.innerHeight;
				;

				if (Number(scope.opts)) {
					offset = Number(scope.opts) * -1
				}

				if (typeof (scope.opts) === "object") {
					opts = angular.extend({}, opts, scope.opts);
					offset = Number(opts.offset) * -1
				}

				element.css(opts.property, (wh + offset) + 'px');

				if(opts.callback)
					opts.callback.apply(this,element)

			}


			resize()

			$($window).on("resize", resize)

		}


		return directive;
	}


})(window.angular);
