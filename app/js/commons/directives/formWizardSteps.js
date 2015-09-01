/**
 *
 * Wrap the ul.element with directive to set the width of each list item.
 *
 * <ul class="form-wizard-stepper" data-form-wizard-steps="formWizardSteps">
 *        <li><a href="#"> <span class="step">1</span> <span class="title">Title</span></a></li>
 *        <li><a href="#"> <span class="step">2</span> <span class="title">Title</span> </a></li>
 *        <li><a href="#"> <span class="step">3</span> <span class="title">Title</span></a></li>
 * </ul>
 *
 * formWizardSteps = {
 *			nextButton: document.querySelector('[data-form-wizard-next]'),
 *			prevButton: document.querySelector('[data-form-wizard-previous]'),
 *			onClick: function (event) {},
 *			previous: function (event) {},
 *			next: function (event) {},
 *			onChange:function(event){}
 *		};
 *
 *
 */

!(function (angular) {
	"use strict";

	angular.module('app').directive('formWizardSteps', FormWizardSteps)

	FormWizardSteps.$inject = ['$window'];

	function FormWizardSteps($window) {

		var directive = {
			scope: {
				wOpts: "=formWizardSteps"
			},
			link: linkFunc
		};

		function linkFunc(scope, element, attr) {
			var opt = scope.wOpts,
				listItems = element.children(),
				activeIndex = 0;

			element.css({
				"-webkit-margin-before": "0em",
				"-webkit-margin-after": "0em",
				"-webkit-padding-start": "0px",
				"margin": "0",
				"padding": "0px",
				"list-style": "none",
			});
			setActive(activeIndex);

			if (opt.onClick) {
				angular.forEach(listItems, function (item, index) {
					var listItem = angular.element(item);
					listItem.on('click', function (event) {
						activeIndex = index;
						setActive(index);
						listItem.addClass('active');
						opt.onClick.apply(event, [listItem]);
					})
				});
			}

			if (opt.nextButton)
				angular.element(opt.nextButton).on('click', function (event) {
					return !opt.onNext ? nextFunction(event) : (opt.onNext.apply(this, [activeIndex,event]) ? nextFunction(event) : true);
				});

			if (opt.prevButton)
				angular.element(opt.prevButton).on('click', function (event) {
					return !opt.onPrevious ? prevFunction(event) : (opt.onPrevious.apply(this, [activeIndex,event]) ? prevFunction(event) : true);
				})


			function setActive(index) {
				angular.forEach(listItems, function (item) {
					angular.element(item).removeClass('active')
				});
				angular.element(listItems[index]).addClass('active');
				if (opt.onChange)
					opt.onChange.apply(this, [activeIndex, listItems])
			}

			function nextFunction(event) {
				event.preventDefault();
				event.stopPropagation();


				if (activeIndex < (listItems.length - 1)) {
					activeIndex++;
					setActive(activeIndex);


				}
			}


			function prevFunction(event) {
				event.preventDefault();
				event.stopPropagation();

				if (activeIndex != 0 && activeIndex > -1) {
					activeIndex--;
					setActive(activeIndex);
				}
			}

			function initialize() {
				angular.forEach(listItems, function (item) {
					angular.element(item).css({
						width: (100 / listItems.length) + "%",
						display: "inline-block",
						float: "left"
					})
				})
			};

			initialize()
			$($window).on("resize", initialize)

		}


		return directive;


	}


})(window.angular);
