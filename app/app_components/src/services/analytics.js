/**
 * @ngdoc overview
 * @name reyramos.analytics
 *
 *
 * @requires app.APP_ENV
 * @requires https://github.com/luisfarzati/angulartics
 *
 * @description
 * # reyramos.analytics
 *
 * Uses google analytics services to track any events within the application.
 * http://luisfarzati.github.io/angulartics/
 *
 * The modules are:
 * * reyramos.analytics - the main "umbrella" module
 * * app.APP_ENV -
 * * https://github.com/luisfarzati/angulartics -
 *
 *
 */

(function (angular) {

	'use strict';
	angular.module('reyramos.analytics', [])
		.run(AnaRun)
		.service('analytics', AnalyticsService);

	AnaRun.$inject = ['$window', 'APP_ENV'];

	function AnaRun($window, APP_ENV) {

		var i = $window,
			r = 'ga',
			q = '//www.google-analytics.com/analytics.js'

		i['GoogleAnalyticsObject'] = r;

		i[r] = i[r] || function () {
				(i[r].q = i[r].q || []).push(arguments)
			}, i[r].l = 1 * new Date();


		var ga = document.createElement('script');
		ga.type = 'text/javascript';
		ga.async = true;
		ga.src = q;
		var s = document.getElementsByTagName('script')[0];
		s.parentNode.insertBefore(ga, s);

		return APP_ENV.ga ? $window.ga('create', APP_ENV.ga, "auto") : false;

	}


	function AnalyticsService() {}


})(window.angular);


