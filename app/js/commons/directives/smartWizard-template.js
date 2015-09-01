/**
 * Created by redroger on 5/25/2015.
 */

(function (angular) {
	'use strict';
	angular.module('app')
		.directive('SmartWizard', SmartWizard)

	function SmartWizard() {

		return {
			restrict: 'A',
			link: function (scope, element, attr) {

				var stepsCount = element.find('[data-smart-wizard-tab]').length,
					currentStep = 1,
					$form = element.closest('form'),
					$prev = element.find('[data-smart-wizard-prev]'),
					$next = element.find('[data-smart-wizard-next]');


				function setStep(step) {
					currentStep = step;

					var pane = element.find('[data-smart-wizard-pane=' + step + ']'),
						tabs = element.find('[data-smart-wizard-tab=' + step + ']');

					pane.addClass('active').siblings('[data-smart-wizard-pane]').removeClass('active');
					tabs.addClass('active').siblings('[data-smart-wizard-tab]').removeClass('active');

				}

				setStep(currentStep);

				$prev.on('click', function (e) {
					if (currentStep > 1) {
						setStep(currentStep - 1);
					}
				});

				$next.on('click', function (e) {
					element.find('[data-smart-wizard-tab=' + currentStep + ']')
						.addClass('complete')
						.find('.step')
						.html('<i class="fa fa-check"></i>');

					if (currentStep < stepsCount) {
						setStep(currentStep + 1);
					}
				});


			}
		}

	}


})(window.angular);
