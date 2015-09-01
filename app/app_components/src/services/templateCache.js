(function (angular) {

	'use strict';

	/**
	 * @ngdoc overview
	 * @name reyramos.templateCache
	 *
	 * @description
	 * constant value to set the TEMPLATE_CACHE,
	 * It uses default path = template folder and it takes an array of files to load into $templateCache for quick retrieval,
	 * You can replace the template by defining your own by using $templateCache {@link https://docs.angularjs.org/api/ng/service/$templateCache}
	 * @param {object} TEMPLATE_CACHE, default { path:'template/',  templates:["application/about.html] }
	 *
	 */

	angular.module('reyramos.templateCache', []).constant('TEMPLATE_CACHE', {
		path: 'template/',
		pre: '/',
		templates: []
	}).factory('templates', TemplateService);


	TemplateService.$inject = ['$log', '$q', '$http', '$templateCache', 'TEMPLATE_CACHE']

	/**
	 * @ngdoc service
	 * @name reyramos.templateCache.templates
	 *
	 * @description
	 * It load files path from TEMPLATE_CACHE into $templateCache for quick retrieval, You can replace the template
	 * by defining your own by using $templateCache {@link https://docs.angularjs.org/api/ng/service/$templateCache}
	 *
	 * Best practive to use this service is within the $routeProvider:
	 * ```js
	 *      $routeProvider.resolve
	 * ```
	 *
	 * Adding via the $templateCache service:
	 * ```js
	 * var myApp = angular.module('myApp', []);
	 * myApp.run(function($templateCache) {
     *   $templateCache.put('/template/someFile.html', 'This is the content of the template');
     * });
	 * ```
	 *
	 * To retrieve the template later, simply use it in your HTML:
	 * ```html
	 * <div ng-include=" '/someFile.html' "></div>
	 * ```
	 *
	 * or get it via Javascript:
	 * ```js
	 * $templateCache.get('/someFile.html')
	 * ```
	 *
	 *
	 */
	function TemplateService($log, $q, $http, $templateCache, TEMPLATE_CACHE) {

		var defaults = angular.extend({}, {
				path: 'template/',
				pre: '/',
				templates: []
			}, TEMPLATE_CACHE),
			factory = {};

		/**
		 * Initialize application, buildTemplates
		 * @param type
		 * @returns {*}
		 */

		factory.init = function (options) {

			var defer = $q.defer(),
				opts = angular.extend({}, angular.copy(defaults), options),
				templates = opts.templates || false,
				handler = [];

			if (!templates || templates.length === 0) {
				defer.resolve();
			} else {
				for (var i = 0; i < templates.length; i++) {
					handler.push($http({
						method: "GET",
						url: opts.path + templates[i],
						file: templates[i],
						cache: $templateCache
					}))
				}
				$q.all(handler).then(function (arrayOfResults) {
					for (var i in arrayOfResults) {
						if (arrayOfResults[i].status == 200) {
							console.log('templateCache.put', (opts.pre ? opts.pre : "") + arrayOfResults[i].config.file);
							$templateCache.put((opts.pre ? opts.pre : "") + arrayOfResults[i].config.file, arrayOfResults[i].data);
						}
					}
					defer.resolve();
				}, function (response) {
					$log.debug('failed getting templates >', response);
				});
			}

			return defer.promise;
		};


		return factory;
	}


})(window.angular);
