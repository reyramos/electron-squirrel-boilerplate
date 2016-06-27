/**
 * Created by Ramor11 on 11/12/2015.
 *
 * THIS IS FOR ELECTRON INJECTION WITHIN THE WEBVIEW WEBAPPLICATION
 *
 */
module.exports = function (app) {
	'use strict';


	app.service('electron', ['$q', function ($q) {

		var objElec = new angular.noop, electron = {exist: false};

		var init = function () {
			var defer = $q.defer();

			if (document.documentElement.getAttribute('id') !== 'ELECTRON_PARENT_CONTAINER')return {};

			try {
				objElec = new Electron();
				electron.exist = true;
				defer.resolve(true)

			} catch (e) {
				init().then(function () {
					init = null;
				});
			}

			return defer.promise;
		}

		electron.send = function (eventType, msg) {
			if (objElec.hasOwnProperty('send')) {
				return objElec.send(eventType, msg);
			} else {
				return $q(function (resolve) {
					resolve(false);
				});
			}
		};
		
		init();
		return angular.extend({}, objElec, electron);

	}]);

}
