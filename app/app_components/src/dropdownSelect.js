(function (angular) {
	"use strict";

	angular.module('reyramos.select', ['reyramos.client'])
		.run(DropdownTemplate)
		.directive('dropdownSelect', DropdownSelect)

	DropdownTemplate.$inject = ['$templateCache'];
	DropdownSelect.$inject = ['$window', '$document', '$parse', '$compile', '$templateCache', 'clientService'];

	function DropdownTemplate($templateCache) {
		$templateCache.put(
			'/ddSelect/dropdown.html',
			'<div><input class="dd-select form-control" type="text"><span class="input-btn"><button class="" type="button"><i class="fa fa-chevron-circle-down"></i></button></span></div>'
		)
	}


	function DropdownSelect($window, $document, $parse, $compile, $templateCache, clientService) {
		return {
			restrict: 'A',
			scope: {
				ddOpts: '=dropdownSelect'
			},
			require: '?ngModel',
			link: function (scope, elem, attrs, controller) {

				if (clientService.deviceType === 'mobile' || clientService.deviceType === 'tablet') {
					return;
				}

				var defaults = angular.extend({
						placeholder: '',
						required: false,
					}, {
						placeholder: attrs.placeholder || "",
						required: attrs.required || false,
					}, scope.ddOpts),
					wrapper = angular.element('<div>').addClass('ddSelect'),
					ul = angular.element('<ul class="ng-goodies-dropdown">'),
					elHeight,
					elWidth,
					downPress = 0,
					dropDown = angular.element($templateCache.get('/ddSelect/dropdown.html')).addClass('dd-drop'),
					button = dropDown.find('button').on("click", triggerDropDown),
					modelSetter;

				dropDown.find('input').addClass('dd-select').attr({
					//"ng-model": ddModel + "input",
					placeholder: defaults.placeholder
				})
				//.on("keyup", function () {
				//	modelSetter(scope, "");
				//
				//	validate(angular.element(this), true)
				//	for (var i in model) {
				//		if (model[i].name === String(this.value).trim()) {
				//			modelSetter(scope, this.value);
				//			validate(angular.element(this), false)
				//		}
				//	}
				//}).on("keydown", function (event) {
				//
				//	event.stopPropagation();
				//	event.stopImmediatePropagation();
				//
				//	var direction,
				//		keyCode = event.keyCode,
				//		list = ul.find('li'),
				//		selectedEnter = false;
				//
				//	if (isArrowKey(keyCode)) {
				//		direction = getArrowKeyDirection(keyCode);
				//
				//		switch (direction) {
				//			case "down":
				//				if (list.length >= downPress)
				//					downPress++;
				//				break;
				//
				//			case "up":
				//				if (downPress > 0)
				//					downPress--;
				//				break;
				//
				//			case "space":
				//			case "tab":
				//				if (downPress) {
				//					selectedEnter = true;
				//				}
				//				break;
				//		}
				//
				//
				//		if (downPress === 1) {
				//			triggerDropDown();
				//		} else {
				//			var theList = angular.element(list[downPress - 2]);
				//
				//			angular.forEach(list, function (ele) {
				//				angular.element(ele).removeClass('hover')
				//			})
				//
				//			theList.addClass('hover')
				//
				//			if (selectedEnter) {
				//				theList.removeClass('hover')
				//
				//				downPress = 0
				//
				//				inputField.val(theList[0].textContent)
				//
				//				if (attrs['ngModel']) {
				//					modelSetter(scope, theList[0].textContent);
				//				}
				//
				//				validate(inputField, false)
				//
				//				removeEle();
				//			}
				//
				//		}
				//
				//	}
				//
				//});
				//
				//var liItems = ul.find('li').attr({
				//		"ng-repeat": "dd in " + ddModel
				//	});

				elem.data('status', false)

				if (attrs['ngModel'])
					modelSetter = $parse(attrs['ngModel']).assign;

				function getArrowKeyDirection(keyCode) {
					return {
						37: 'left',
						39: 'right',
						38: 'up',
						40: 'down',
						9: 'tab',
						32: 'space'
					}[keyCode];
				}

				function isArrowKey(keyCode) {
					return !!getArrowKeyDirection(keyCode);
				}

				function validate(target, invalid) {

					target[invalid ? 'addClass' : 'removeClass']('ng-dirty ng-invalid')[invalid ? 'removeClass' : 'addClass']('ng-pristine ng-valid')

					if (invalid) {
						target[defaults.required ? 'addClass' : 'removeClass']('ng-invalid-required')[defaults.required ? 'removeClass' : 'addClass']('ng-valid-required')
					} else {
						target[defaults.required ? 'addClass' : 'removeClass']('ng-valid-required')[defaults.required ? 'removeClass' : 'addClass']('ng-invalid-required')
					}

					if (!invalid) {
						target.parents().closest('.dd-error').removeClass('dd-error')
					}

				}


				var init = function () {

					//$compile(ul)(scope);
					//$compile(dropDown)(scope);

					//append the items to elem
					elem.wrap(wrapper).parent().append(dropDown)

					elem.css({
						"visibility": "hidden"
					});

				}


				function getPosition(ele) {
					var rect = ele.getBoundingClientRect();

					var rectTop = rect.top + window.pageYOffset - document.documentElement.clientTop;
					var rectLeft = rect.left + window.pageXOffset - document.documentElement.clientLeft;

					return {top: rectTop, left: rectLeft};

				}

				function triggerDropDown() {

					elHeight = elem[0].offsetHeight;
					elWidth = elem[0].offsetWidth;

					var position = getPosition(dropDown[0])
					// set the position of the ul element
					ul.css({
						top: (position.top) + 'px',
						left: (position.left) + 'px',
						width: (elWidth) + 'px',
						position: "absolute",
						"z-index": 2147483647
					});


					if (!elem.data('status')) {

						////setPosition();
						buildOptions();

						elem.data('status', true)

						elem.parent().addClass('dd-backdrop')

						elem.parent().on('mouseup', mouseUp); //add a custom jquery event

						angular.forEach(ul.find('li'), function (element, index) {

							//var ele = angular.element(element),
							//	_enter = "mouserover mouseenter",
							//	_out = "mouseleave";
							//
							//ele.unbind(_enter + " " + _out).on(_enter, function () {
							//	angular.element(this).addClass('hover')
							//}).on(_out, function () {
							//	angular.element(this).removeClass('hover')
							//})

						});


						$('body').append(ul);
					} else {
						removeEle();
					}

				}

				function setPosition() {
					elHeight = elem[0].offsetHeight;
					elWidth = elem[0].offsetWidth;

					// set the position of the ul element
					ul.css({
						top: (elHeight - 1) + 'px'
					});

					// rebuild the size of the anchors
					angular.forEach(ul.find("li a"), function (value, key) {
						angular.element(value).css({
							height: elem[0].clientHeight + 'px',
							width: elem[0].clientWidth + 'px',
							'line-height': (elem[0].clientHeight - 2) + 'px'
						});
					});
				}


				function buildOptions() {


					angular.forEach(elem[0].options, function (list) {
						var li = angular.element('<li><a><span>' + list.innerText + '</span></a></li>')
						ul.append(li)
					})

					//
					//setTimeout(function () {
					//
					//	angular.forEach(ul.find("li"), function (list, i) {
					//
					//		!function outer(i) {
					//
					//			var li = angular.element(list);
					//			li.on("click keydown", function (event) {
					//				inputField.val(li[0].textContent)
					//
					//				if (attrs['ngModel']) {
					//					modelSetter(scope, li[0].textContent);
					//				}
					//
					//
					//				validate(inputField, false)
					//
					//				removeEle();
					//			})
					//
					//		}(i);
					//
					//	});
					//
					//
					//}, 1)

				}

				function mouseUp(e) {
					if (!dropDown.is(e.target) && dropDown.has(e.target).length === 0) {
						removeEle();
					}
				}

				function removeEle() {
					downPress = 0; //set a flag to know when is open

					elem.parent().removeClass('dd-backdrop');
					elem.parent().unbind('mouseup');
					elem.data('status', false)
				}


				setTimeout(init, 1)
				$(window).on("resize orientationchange", setPosition)


			}
		};
	}

})(window.angular);


