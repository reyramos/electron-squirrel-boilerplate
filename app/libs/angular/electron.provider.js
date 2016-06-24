/**
 * @ngdoc service
 * @name electronService
 *
 * @description
 * # Create custom function if its inside electron
 *
 *
 */


module.exports = function (app) {
	'use strict';

	app.run(['lcpElectron', function (lcpElectron) {
		return lcpElectron
	}]).provider('lcpElectron', ElectronProvider);


	function ElectronProvider() {

		var menuHandler = [],
			hotKeysHandler = [],
			injectHandler = [];

		this.inject = function (func) {
			injectHandler.push(angular.isFunction(func) ? func : angular.noop)
		};

		this.menu = function (obj) {
			menuHandler.push(obj)
		};

		this.hotkeys = function (obj, callback) {
			hotKeysHandler.push([obj, angular.isFunction(callback) ? callback : angular.noop]);
		};


		this.$get = ['electron', 'hotkeys', '$log', '$q', function (electron, hotkeys, $log, $q) {
			$log.log('electron', electron)

			if (!electron.exist)return {
				send: function () {
					return $q(function (resolve) {
						resolve({});
					});
				}
			};

			var Menu, MenuItem, menu,
				remote = electron.remote;

			try {
				Menu = remote.Menu;
				MenuItem = remote.MenuItem;
				menu = new Menu();
			} catch (e) {
			}

			angular.forEach(injectHandler, function (func) {
				func.apply(remote, [hotkeys])
			});

			angular.forEach(menuHandler, function (obj) {
				menu.append(new MenuItem(obj));
			});

			window.addEventListener('contextmenu', function (e) {
				e.preventDefault();
				menu.popup(remote.getCurrentWindow());
			}, false);

			angular.forEach(hotKeysHandler, function (obj) {
				hotkeys.add(obj[0]);
				obj[1].apply(remote, [])
			});


			return function (callback) {
				var func = angular.isFunction(callback) ? function () {
					callback.apply(remote, [])
				} : angular.noop;

				return angular.isFunction(callback) ? func() : new function () {
					func();
					this.send = function (eventType, msg) {
						return electron.send(eventType, msg);
					};
				};

			}();
		}];


	}
};
