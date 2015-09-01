(function (angular) {
	"use strict";

	/**
	 * @ngdoc overview
	 * @name reyramos.logger
	 *
	 *
	 * @description
	 *
	 * Event logger is a tool to display logs on production environments,
	 * By added url query debug=true, will display the logs from the instance of that controller, enabled.
	 *
	 * Within the console,
	 * angular.element(document.body).injector().get('Logger').setLoggingEnabled(true);
	 *
	 * Will enable loggind for the entire site.
	 *
	 */

	angular.module('reyramos.logger', []).factory('APP_OVERRIDE', AppOverride).provider('Logger', LoggerProvider);

	/**
	 * @ngdoc service
	 * @name reyramos.logger.factory:APP_OVERRIDE
	 *
	 * @description
	 * Set the host to display the Logger service within the factory:APP_OVERRIDE
	 *
	 * ```js
	 angular.module('app', []).factory('APP_OVERRIDE',
	 function() {
                var override = {
                    loggerHost: "localhost"
                }
                return override;
            });
	 * ```
	 *
	 */
	function AppOverride() {
		var override = {
			loggerHost: "localhost"
		}
		return override;
	}

	/**
	 * @ngdoc service
	 * @name reyramos.logger.Logger
	 *
	 * @description
	 * Allows modification of Angular $log features. It is set to display on console while the user is in
	 * development mode, localhost:8080
	 *
	 * ```js
	 *      var logger = $log.getInstance('ControllerName');
	 * ```
	 * Output:
	 *```js
	 *  Friday 2:22:10 pm::[ControllerName]> Message
	 *```
	 *
	 */


	function LoggerProvider() {
		var debug = location.search.split('debug=')[1] || location.hash.split('debug=')[1];
		this.$get = [
			'$log',
			'APP_OVERRIDE',
			'$rootScope',
			function ($log, APP_OVERRIDE, $rootScope) {
				var loggingPattern = '%s::[%s]> ',
					scope = $rootScope.$new(),
					hostUrl = APP_OVERRIDE.loggerHost || 'localhost',
					loggingEnabled = typeof(debug) === 'boolean' ? debug : (typeof(debug) === 'undefined' ?
						(location.host.indexOf(hostUrl) > -1 ? true : scope.$eval(location.search.split('debug=')[1]) || scope.$eval(location.hash.split('debug=')[1]) || false) : scope.$eval(debug));

				return {
					enhanceAngularLog: function ($log) {
						$log.enabledContexts = [];

						$log.setLoggingEnabled = function (boolean) {
							loggingEnabled = boolean;
						};

						$log.getInstance = function (context) {
							$log.enabledContexts[context] = loggingEnabled;

							return {
								log: enhanceLogging($log.log, context, loggingPattern),
								info: enhanceLogging($log.info, context, loggingPattern),
								warn: enhanceLogging($log.warn, context, loggingPattern),
								debug: enhanceLogging($log.debug, context, loggingPattern),
								error: enhanceLogging($log.error, context, loggingPattern)
							};
						};

						function enhanceLogging(loggingFunc, context, loggingPattern) {
							return function () {
								var contextEnabled = loggingEnabled || $log.enabledContexts[context];
								if (contextEnabled === undefined || contextEnabled) {
									var modifiedArguments = [].slice.call(arguments);
									if (arguments.length === 1 && typeof(arguments[0]) === "object") {
										angular.forEach(
											arguments,
											function (value) {
												this.push(value);
											}, modifiedArguments
										);
									}
									modifiedArguments[0] = [sprintf(loggingPattern, moment().format("dddd h:mm:ss a"), context)] + (typeof(modifiedArguments[0]) === "string" ? modifiedArguments[0] : "");
									loggingFunc.apply(null, modifiedArguments);
								}
							};
						}
					}
				};
			}
		];
	}


})(window.angular);
