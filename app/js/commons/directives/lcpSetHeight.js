/**
 * @ngdoc directive
 * @name lcpSetHeight
 *
 * @description
 * It will set the height of the element offset from the parent window. To be used when set height are needed
 * on elements which can be difficult to apply with only css.
 *
 *
 * @element A , restricted to attribute to accept additional parameter on directive attribute
 *
 * @example
 <example>
 <file name="index.html">
 ```html

 <div class="evResponseScroll" lcp-set-height="120"></div>

 ```
 </file>
 </example>
 *
 * It will dynamically set the height of the element window.height - 120 px, which it will response
 * eventListener onResize
 *
 */


SetHeight.$inject = ['$window']

function SetHeight($window) {

	var directive = {
		restrict: 'A',
		scope: {
			opts: '=lcpSetHeight'
		},
		link: {
			pre: funcLink
		}
	};

	function funcLink(scope, element, attr) {

		var resize = function () {

			var opts = {
					offset: 0,
					property: "height"
				},
				offset = opts.offset,
				wh = $window.innerHeight,
				parent = element.parent(),
				childs = parent.children()

			if (Number(scope.opts)) {
				offset = Number(scope.opts) * -1
			}

			if (typeof (scope.opts) === "object") {
				opts = angular.extend({}, opts, scope.opts);
				offset = Number(opts.offset) * -1
			}


			var pHeight = parent[0].clientHeight,
				cHeight = [];

			angular.forEach(childs, function (ele) {
				var ele = angular.element(ele)
				if (!$(element).is(ele) && $(element).has(ele).length === 0) {
					cHeight.push(ele[0].clientHeight)
				}

			});

			var offset = (cHeight.length ? scope.$eval(cHeight.join('+')) : 0) - offset;


			element.css(opts.property, (pHeight - offset) + 'px');

			if (opts.callback)
				opts.callback.apply(this, element)

		};

		resize();
		angular.element($window).on("resize", resize)
		scope.$on('$destroy', function () {
			angular.element($window).unbind('resize', resize);
		});


	}


	return directive;
}

module.exports = function (app) {
	app.directive('lcpSetHeight', SetHeight);
}
