(function (angular) {
	"use strict";


	/**
	 * @ngdoc directive
	 * @name lcpDatePicker
	 *
	 * @description
	 * It will automatically create the elements needed to create a custom datepicker base on LabCorp Style Guide.
	 * The lcpDatePicker directive allows you to specify custom behaviour when element is clicked.
	 *
	 * It will accept numerous different element set as attributes or objects.
	 *
	 *
	 * @element A , restricted to attribute to accept additional parameter on directive attribute
	 *
	 *
	 * @params {expression} lcpDatePicker {@link object/expression} to evaluates options upon compile
	 *
	 * lcpDatePicker additional accepted attributes.
	 * @params {placeholder, ngRequired, minDate, maxDate, ngModel} Insert the class on parent container
	 *
	 * @example
	 <example>
	 <file name="index.html">
	 ```html

	 <div class="form-group" data-lcp-date-picker="ctrl.serviceDatePickerOpts" ng-model="ctrl.verifyEntry.serviceDate" placeholder="Service Date" ng-required="true" max-date="{{ctrl.maxDate}}"></div>

	 ```
	 </file>
	 <file name="controller.js"
	 ```js

	 self.maxDate = new Date(); //set the maximun date to select, no future dates
	 self.serviceDatePickerOpts = {
		format: 'MM/dd/yyyy', //set the format of the calendar defaults to MM/dd/yyyy <https://docs.angularjs.org/api/ng/filter/date>
		id: 'serviceDateInput', //id to implement to the input
		class: '', //class to add the input fields
		placeholder:'Service Date', //placeholder for the input field
		callback: function () {
			//called when the element is compiled,
			//@return {arguments}
		},
		onChange: function () {
			//called when the input field is changed,
			//@return {arguments}
		}
		options: {
			//Based on angular-bootstrap API, <https://angular-ui.github.io/bootstrap/#/datepicker>
			formatYear: 'yy',
			startingDay: 0, //starting on Sunday
			showWeeks: false
		}

	};

	 ```

	 </file>

	 </example>
	 *
	 * A collection of attributes that allows creation of custom event handlers that are defined as
	 * angular expressions and are compiled and executed within the current scope.
	 *
	 */



	angular.module('reyramos.datepicker', ['ui.bootstrap.datepicker'])
		.run(DatePickerTemplates)
		.directive('lcpDatePicker', DatePicker)
		.directive('lcpDateFormat', ['$parse', '$filter', function ($parse, $filter) {

			var directive = {
				priority: 8,
				restrict: 'A',
				required: 'ngModel',
				scope: false
			};

			directive.link = {
				pre: function (scope, element, attr) {

					var format = attr['lcpDateFormat'] || 'MM/dd/yyyy',
						ngModel = element.controller('ngModel'); //since this directive can be nested we need to get he controller

					function allowKeyCode(code) {
						var allow = false;
						// 0-9 || number pad
						if (code >= 47 && code <= 57 || code >= 96 && code <= 105) {
							allow = true;

						}
						return allow;
					}

					element.on('keyup', function (event) {
						event.keyCode = event.charCode || event.keyCode;
						var string = String(event.target.value).trim().replace(/(\/)/g, ""),
							dateSplit = [],
							validated = true;

						element[string !== '' ? 'addClass' : 'removeClass']('isNotEmpty');
						if (!string || !allowKeyCode(event.keyCode))return;


						dateSplit[0] = string.substr(0, 2);
						if (string.substr(2, 2) !== "")
							dateSplit[1] = string.substr(2, 2);
						if (string.substr(4) !== "")
							dateSplit[2] = string.substr(4);

						event.target.value = dateSplit.join('/')
						validated = String(new Date(event.target.value)) === 'Invalid Date' ? false : true;
						if (dateSplit.length === 3) {
							if (validated)
								event.target.value = $filter('date')(event.target.value, format);
						}
						//Invalid Date
						ngModel.$setValidity('lcpDateFormat', validated)

					}).bind('keypress', function (event) {
						event.keyCode = event.charCode || event.keyCode;
						if (event.shiftKey					// disallow Shift
							|| ( event.keyCode < 48 || event.keyCode > 57)// disallow non-numbers
							&& event.keyCode != 46			// allow delete
							&& event.keyCode != 8		 	// allow backspace
							&& event.keyCode != 9			// allow not tab
							&& event.keyCode != 27			// allow escape
							&& event.keyCode != 13			// allow enter
							&& event.keyCode != 39			// allow right arrow
							&& event.keyCode != 40			// allow left arrow
							&& event.keyCode != 47			// allow divide arrow
							&& !( event.keyCode == 65 && event.ctrlKey === true)// allow CTRL+A
							&& !( event.keyCode == 67 && event.ctrlKey === true)// allow CTRL+C
							&& !( event.keyCode == 80 && event.ctrlKey === true)// allow CTRL+P

						) {
							event.preventDefault()
							scope.$apply()
						}
					});

				}
			}

			return directive;
		}]);


	DatePickerTemplates.$inject = ['$templateCache'];
	DatePicker.$inject = ['$timeout'];
	function DatePicker($timeout) {

		var directive = {
			restrict: 'A',
			priority: 9,
			required: 'ngModel',
			replace: true,
			scope: {
				ddOpts: '=lcpDatePicker',
				value: '=?ngModel',
				model: '@?ngModel',
				required: "@",
				format: "@",
			},
			controller: ['$scope', '$timeout', function ($scope, $timeout) {

				var self = this;

				self.opts = {
					format: 'MM/dd/yyyy',
					options: {
						formatYear: 'yyyy',
						formatMonth: 'MMM',
						startingDay: 0, //starting on Sunday
						showWeeks: false
					}
				};
				self.date = false;

				//open the target calendar
				self.open = function (event) {
					event.preventDefault();
					$timeout(function () {
						self.date = !self.date;

					}, 1)
				};

			}],
			controllerAs: 'ctrl',
			bindToController: true,
			template: [
				'<div class="lcpInputTxtGrp lcpDatePicker">',
				'<a class="trigger" ng-class="{\'open\':ctrl.date}" ng-click="ctrl.open($event)"><span class="arrow"></span></a>',
				'<input type="tel"  ng-required="ctrl.opts.required"',
				'datepicker-options="ctrl.opts.options" ng-model="ctrl.value"',
				'ng-change="ctrl.onChangeDate(ctrl.value)" ',
				'datepicker-append-to-body =\'true\'',
				'lcp-date-format',
				'ng-focus="focused = true;ctrl.date=true" ng-blur="focused=false" close-text="OK" ',
				'datepicker-popup="{{ctrl.opts.format}}"',
				'id="{{ctrl.opts.id}}" name="{{ctrl.opts.name}}" ',
				'max-date="{{ctrl.opts.maxDate}}" min-date="{{ctrl.opts.minDate}}" ',
				'is-open="ctrl.date"  ng-class="{\'isNotEmpty\':ctrl.value || focused === true}" />',
				'<label>{{ctrl.opts.placeholder}}</label>',
				'</div>'
			].join(' ')
		}

		function buildOpts(scope, attr) {
			var unique = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + Date.now().toString(),
				defaults = {
					placeholder: attr.placeholder,
					required: attr.required || attr.ngRequired,
					maxDate: attr.maxDate || false,
					minDate: attr.minDate || false,
					class: attr.class,
					id: attr.id || unique,
					name: attr.name || attr.id || unique
				};


			//assign to the controller
			scope.ctrl.opts = angular.extend({}, scope.ctrl.opts, defaults, scope.ddOpts);

			return scope.ctrl.opts;

		}


		directive.link = {
			pre: function (scope, ele, attr, ctrl) {


				var opts = buildOpts(scope, attr),
					input = ele.find('input');

				Object.keys(attr).forEach(function (key) {
					switch (key) {
						case 'disabled':
							input.attr('disabled', true)
							break;
						default :
							break;
					}
				});

				ele.controller('ngModel').$name = opts.name;

			},
			post: function (scope, ele, attr, ctrl) {
				var opts = ctrl.opts,
					input = ele.find('input');

				ctrl.onChangeDate = function (event) {
					if (!event) return;

					if (opts.onChange) {
						opts.onChange.apply(this, [element, event])
					}
				};


				/**
				 * If the user uses tabs to blur out of input, it will hide the datepicker
				 */
				input.bind('keydown', function (event) {
					event.keyCode = event.charCode || event.keyCode;
					if (event.keyCode === 9)
						ctrl.date = false;
				});


				Object.keys(attr.$attr).forEach(function (key) {
					if (key !== 'class' && key !== 'id' && key !== 'ngClass')
						ele.removeAttr(attr.$attr[key]);
				});

				if (opts.callback)
					opts.callback.apply(this, [ele, input, opts.id])


			}
		}
		return directive;
	}


	function DatePickerTemplates($templateCache) {

		$templateCache.put('template/datepicker/datepicker.html',
			"<div ng-switch=datepickerMode role=application ng-keydown=keydown($event)><daypicker ng-switch-when=day tabindex=0></daypicker><monthpicker ng-switch-when=month tabindex=0></monthpicker><yearpicker ng-switch-when=year tabindex=0></yearpicker></div>"
		);

		$templateCache.put('template/datepicker/day.html',
			"<table class=calendar-day role=grid aria-labelledby={{uniqueId}}-title aria-activedescendant={{activeDateId}}><thead><tr><th><button type=button class=\"btn cal-btn btn-default btn-sm pull-left\" ng-click=move(-1) tabindex=-1><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th><th colspan=\"{{5 + showWeeks}}\"><button id={{uniqueId}}-title role=heading aria-live=assertive aria-atomic=true type=button class=\"btn cal-btn btn-default btn-sm\" ng-click=toggleMode() tabindex=-1 style=width:100%><strong>{{title}}</strong></button></th><th><button type=button class=\"btn cal-btn btn-default btn-sm pull-right\" ng-click=move(1) tabindex=-1><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th></tr><tr><th ng-show=showWeeks class=text-center></th><th ng-repeat=\"label in labels track by $index\" class=text-center><small aria-label={{label.full}}>{{label.abbr}}</small></th></tr></thead><tbody><tr ng-repeat=\"row in rows track by $index\"><td ng-show=showWeeks class=\"text-center h6\"><em>{{ weekNumbers[$index] }}</em></td><td ng-repeat=\"dt in row track by dt.date\" class=text-center role=gridcell id={{dt.uid}} aria-disabled={{!!dt.disabled}}><button type=button style=width:100% class=\"btn cal-btn btn-default btn-sm\" ng-class=\"{'btn-info': dt.selected, active: isActive(dt)}\" ng-click=select(dt.date) ng-disabled=dt.disabled tabindex=-1><span ng-click=select(dt.date) ng-class=\"{'text-muted': dt.secondary, 'text-info': dt.current}\">{{dt.label}}</span></button></td></tr></tbody></table>"
		);

		$templateCache.put('template/datepicker/month.html',
			"<table class=calendar-month role=grid aria-labelledby={{uniqueId}}-title aria-activedescendant={{activeDateId}}><thead><tr><th><button type=button class=\"btn cal-btn btn-default btn-sm pull-left\" ng-click=move(-1) tabindex=-1><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th><th><button id={{uniqueId}}-title role=heading aria-live=assertive aria-atomic=true type=button class=\"btn cal-btn btn-default btn-sm\" ng-click=toggleMode() tabindex=-1 style=width:100%><strong>{{title}}</strong></button></th><th><button type=button class=\"btn cal-btn btn-default btn-sm pull-right\" ng-click=move(1) tabindex=-1><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th></tr></thead><tbody><tr ng-repeat=\"row in rows track by $index\"><td ng-repeat=\"dt in row track by dt.date\" class=text-center role=gridcell id={{dt.uid}} aria-disabled={{!!dt.disabled}}><button type=button style=width:100% class=\"btn cal-btn btn-default\" ng-class=\"{'btn-info': dt.selected, active: isActive(dt)}\" ng-click=select(dt.date) ng-disabled=dt.disabled tabindex=-1><span ng-click=select(dt.date) ng-class=\"{'text-info': dt.current}\">{{dt.label}}</span></button></td></tr></tbody></table>"
		);

		$templateCache.put('template/datepicker/popup.html',
			"<ul class=\"dropdown-menu calendar-popup\" ng-style=\"{display: (isOpen && 'block') || 'none', top: position.top+'px', left: position.left+'px'}\" ng-keydown=keydown($event)><li ng-transclude></li><li class=calender-btn-footer ng-if=showButtonBar style=\"padding:10px 0px 2px\"><span class=\"btn-group pull-left\"><button type=button class=\"btn cal-btn btn-sm btn-info\" ng-click=\"select('today')\">{{ getText('current') }}</button> <button type=button class=\"btn cal-btn btn-sm btn-danger\" ng-click=select(null)>{{ getText('clear') }}</button></span> <button type=button class=\"btn cal-btn btn-sm btn-success pull-right\" ng-click=close()>{{ getText('close') }}</button></li></ul>"
		);

		$templateCache.put('template/datepicker/year.html',
			"<table class=calendar-year role=grid aria-labelledby={{uniqueId}}-title aria-activedescendant={{activeDateId}}><thead><tr><th><button type=button class=\"btn cal-btn btn-default btn-sm pull-left\" ng-click=move(-1) tabindex=-1><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th><th colspan=3><button id={{uniqueId}}-title role=heading aria-live=assertive aria-atomic=true type=button class=\"btn cal-btn btn-default btn-sm\" ng-click=toggleMode() tabindex=-1 style=width:100%><strong>{{title}}</strong></button></th><th><button type=button class=\"btn cal-btn btn-default btn-sm pull-right\" ng-click=move(1) tabindex=-1><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th></tr></thead><tbody><tr ng-repeat=\"row in rows track by $index\"><td ng-repeat=\"dt in row track by dt.date\" class=text-center role=gridcell id={{dt.uid}} aria-disabled={{!!dt.disabled}}><button type=button style=width:100% class=\"btn cal-btn btn-default\" ng-class=\"{'btn-info': dt.selected, active: isActive(dt)}\" ng-click=select(dt.date) ng-disabled=dt.disabled tabindex=-1><span ng-click=select(dt.date) ng-class=\"{'text-info': dt.current}\">{{dt.label}}</span></button></td></tr></tbody></table>"
		);

	}

})(window.angular);
