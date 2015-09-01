/**
 * Created by redroger on 1/21/14.
 */
(function (angular) {
	'use strict';

	angular.module('app').directive('jarvisMenu', JarvisMenu);

	JarvisMenu.$inject = ['$document', '$q'];

	function JarvisMenu($document, $q) {
		var directive = {
			restrict: 'A',
			scope: {
				opts: '=?jarvisMenu'
			},
			link: linkFun
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


			//add a mark [+] to a multilevel menu
			el.find("li").each(function () {
				if ($(this).find("ul").size() !== 0) {
					$(this).addClass('jarvisMenu');
					$(this).find("a:first").append("<b class='collapse-sign'></b>");
					$(this).find("b:first").html(defaults.closedSign);


					//avoid jumping to the top of the page when the href is an #
					if ($(this).find("a:first").attr('href') === "#") {
						$(this).find("a:first").click(function (event) {
							event.preventDefault();
							event.stopPropagation();
						});
					}
				}
			});
			//open active level
			el.find("li.active").each(function () {
				var self = $(this),
					ul = self.find("ul:first");

				self.find("ul:first").slideUp(defaults.speed, function () {
					self.find("b:first").delay(defaults.speed)
				});

				openList($(this));

				scope.$emit('directive:jarvisMenu', {
					element: this,
					class: "open"
				})
			});
			el.find("li a").on('click', function (event) {

				//remove all active element
				var parents = $(this).parents(),
					listElement = parents.closest("li"),
					listElements = parents.find("li"),
					target = angular.element(event.target).parents().closest('li.open.active');


				//lets leave it open if itself
				if (listElement.is(target) && listElement.has(target).length === 0) {
					return;
				}


				listElements.removeClass('active')

				if (listElement.find("ul").size() != 0) {
					if (defaults.accordion) {
						//Do nothing when the list is open
						if (!listElement.parent().find("ul").is(':visible')) {
							var parents = $(this).parent().parents("ul"),
								visible = el.find("ul:visible");

							visible.each(function (visibleIndex) {
								var close = true;
								parents.each(function (parentIndex) {
									if (parents[parentIndex] == visible[visibleIndex]) {
										close = false;
										return false;
									}
								});
								if (close) {
									if (listElement.parent().find("ul") != visible[visibleIndex]) {
										$(visible[visibleIndex]).slideUp(defaults.speed, function () {
											$(this).parent("li").find("b:first").html(defaults.closedSign);
											$(this).parent("li").removeClass("open");

											scope.$emit('directive:jarvisMenu', {
												element: this,
												class: ""
											})
										});

									}
								}
							});
						}
					} // end if
					if (listElement.find("ul:first").is(":visible") && !listElement.find("ul:first").hasClass("active")) {
						closeList(listElement)
					} else {
						openList(listElement)

					} // end else
				} else {
					$(this).parent().addClass('active')
					if (parents.find('li.open')) {
						closeList(parents.find('li.open'))
					}
				}

			})


			function closeList(ele) {
				var defer = $q.defer();
				ele.find("ul:first").slideUp(defaults.speed, function () {
					ele.removeClass("open active").find("b:first").delay(defaults.speed).html(defaults.closedSign);
					scope.$emit('directive:jarvisMenu', {
						element: this,
						class: ""
					})
					defer.resolve();
				});

				return defer.promise;
			}

			function openList(ele) {
				var defer = $q.defer();
				if (ele.parents().closest('.minify-closed').length)return;
				ele.find("ul:first").slideDown(defaults.speed, function () {
					ele.addClass("open active").find("b:first").delay(defaults.speed).html(defaults.openedSign);
					scope.$emit('directive:jarvisMenu', {
						element: this,
						class: "open"
					})
					defer.resolve();

				});

				return defer.promise;

			}

		}


		return directive;
	}


})(window.angular);
