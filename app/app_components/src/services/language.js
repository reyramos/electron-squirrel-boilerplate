(function (angular) {

    "use strict";


	/**
	 * @ngdoc overview
	 * @name reyramos.language
	 *
	 * @description
	 * Gather all the supported language from JSON files
	 *
	 * When defining this within your application it will make sure to gather all supported language
	 * into the application
	 * @example
	 * ```js
	 * angular.module('app')
	 *     .constant('LANGUAGE', {
 	 *      path: 'FOLDER_PATH/',
 	 *      languages: ["en"] //ARRAY OF SUPPORTED LANGUAGES
 	 *  })
	 * ```
	 *
	 *
	 */
	angular.module('reyramos.language', []).constant('LANGUAGE', {path: 'i18n/', languages: ["en"]})
		.service('languageService', LanguageService)
		.factory('language', LanguageFactory);

	LanguageService.$inject = ['$log', '$q', '$http', '$templateCache', 'LANGUAGE']
	LanguageFactory.$inject = ['languageService', 'LANGUAGE']

	/**
	 * @ngdoc object
	 * @name reyramos.language.languageService
	 *
	 * @requires reyramos.language.constant:LANGUAGE
	 *
	 * @description
	 * # languageService sub-module
	 *
	 *
	 */
	function LanguageService($log, $q, $http, $templateCache, LANGUAGE) {

		var i18n = LANGUAGE.languages[0]
		var language = {
			supported: LANGUAGE.languages || [i18n]
		}


		/**
		 * @ngdoc function
		 * @name languageService#getLanguage
		 * @methodOf reyramos.language.languageService
		 *
		 *
		 * @description
		 * Retrieves laguages accepted within the application
		 *
		 */

		this.getLanguage = function () {
			return language;
		}


		/**
		 * @ngdoc function
		 * @name languageService#init
		 * @methodOf reyramos.language.languageService
		 *
		 *
		 * @description
		 * Initialize application, buildTemplates
		 *
		 */
		this.init = function () {
			var defer = $q.defer();

			getLanguage().then(function (data) {
				defer.resolve();
			})

			return defer.promise;
		}

		/**
		 * Builds $templateCache base on CONSTANT TEMPLATE_CACHE.templates
		 * @returns {*}
		 */
		function getLanguage() {
			var defer = $q.defer(),
				handler = [],
				templates = LANGUAGE.languages || [i18n];

			for (var i = 0; i < templates.length; i++) {
				handler.push($http({
					method: "GET",
					url: LANGUAGE.path + templates[i] + '.json',
					language: templates[i],
					cache: $templateCache
				}))
			}

			$q.all(handler).then(function (arrayOfResults) {
				for (var i in arrayOfResults) {
					if (arrayOfResults[i].status == 200) {
						language[arrayOfResults[i].config.language] = arrayOfResults[i].data
					}
				}

				defer.resolve();
			}, function (response) {
				$log.debug('failed getting templates >', response);
			});

			return defer.promise;
		}


	}

	/**
	 * @ngdoc object
	 * @name reyramos.language.language
	 *
	 * @requires reyramos.language.constant:LANGUAGE
	 * @requires reyramos.language.service:languageService
	 *
	 * @description
	 * # language sub-module
	 *
	 *
	 */
	function LanguageFactory(languageService, LANGUAGE) {

		var i18n = LANGUAGE.languages[0], //set the first language from the array to be the default language
			language = languageService.getLanguage();


		var getLanguage = function () {
			var lang = location.search.split('lang=')[1] || location.hash.split('lang=')[1];

			i18n = typeof(lang) === 'string' ? (language.supported.indexOf(lang) > -1 ? lang : LANGUAGE.languages[0]) : (typeof(lang) === 'undefined' ? LANGUAGE.languages[0] : lang);

			//update the list of languages
			update();
		}


		function update() {
			//Loop through the selected language and make sure we have all keys, if missing it will be replace with the EN version string
			angular.forEach(language[LANGUAGE.languages[0]], function (value, key) {
				if (!language[i18n].hasOwnProperty(key)) {
					language[i18n][key] = value;
				}
			});
		}

		getLanguage(); //init the language settings
		return {
			update: getLanguage,
			i18n: function () {
				return language[i18n];
			}
		}
	}

})(window.angular);




