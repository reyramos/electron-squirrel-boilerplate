/**
 * Created by redroger on 11/5/14.
 */
(function (angular) {
	'use strict';

	angular.module('app').directive('resizer', resizer);

	resizer.$inject = ['$document'];


	function resizer($document) {

		var directive = {
			link: linkFunc
		};


		function linkFunc(scope, ele, attrs) {
			var options = scope.$eval(attrs.resizer),
				dragEle = null;

			dragEle = angular.element('<div>').addClass('drag ' + options.position);
			ele.append(dragEle);

			dragEle.on('mousedown', function (event) {
				event.preventDefault();
				ele.addClass('mousedown-resizer')
				dragEle.addClass('mousedown')
				$document.on('mousemove', mousemove);
				$document.on('mouseup', mouseup);
			});

			function mouseup() {
				$document.unbind('mousemove', mousemove);
				$document.unbind('mouseup', mouseup);
				dragEle.removeClass('mousedown')
				ele.removeClass('mousedown-resizer')

			}

			function mousemove(event) {

				if (options.direction == 'vertical') {
					var x = event.pageX;
					if (options.maxWidth && x > options.maxWidth) {
						x = parseInt(options.maxWidth);
					} else if (options.minWidth && x < options.minWidth) {
						x = parseInt(options.minWidth);
					}
					$(ele).css({
						width: x + 'px'
					});
					if (options.right) {
						$(options.right).css({
							left: x + 'px'
						});
					}

				} else {
					// Handle horizontal resizer
					var y = window.innerHeight - event.pageY,
						offsetElements = angular.isArray(options.offset) ? options.offset : [options.offset];

					if (options.maxHeight && y > options.maxHeight) {
						y = parseInt(options.maxHeight);
					} else if (options.minHeight && y < options.minHeight) {
						y = parseInt(options.minHeight);
					}

					ele.css({
						height: y + 'px'
					});

					for (var i in offsetElements) {
						var offsetEle = angular.element($document[0].querySelector(offsetElements[i]));
						offsetEle.css({
							bottom: y + 'px'
						})
					}

				}
			}

		};


		return directive;

	}


})(window.angular);
