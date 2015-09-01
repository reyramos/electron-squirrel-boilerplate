(function (angular) {
	'use strict';

	angular.module('app').constant('enums', {

		APP_DATA: {
			EVENT: 'appData',
		},
		CATEGORY: {
			EVENT: 'category',
			DEACTIVATE: 'deactivateCategory',
			DELETE: 'deleteCategory',
			ACTIVATE: 'activateCategory',
			UPDATE: 'updateCategory',
			GET: 'getCategories',
			SET: 'setCategory',
			RENAME: 'renameCategory',
			ADD: 'addCategory'
		},
		MODELS: {
			EVENT: 'models',
			GET: 'getModels',
			UPDATE: 'updateModel',
			ADD: 'addModel'
		},
		USER: {
			EVENT: 'user',
			AUTH: 'Authenticate',
		},
		WS_FILE_TRANSER: {
			EVENT: 'wsFileTransfer',
			INIT: 'init',
			COMPLETE: 'complete',
			DATA: 'data'
		}
	});


})(window.angular);
