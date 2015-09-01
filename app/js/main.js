// Require JS  Config File
require
({
		baseUrl: '/js/',
		noGlobal: true,
		removeCombined: true,
		paths: {
			//BOWER COMPONENTS
			'angular': '../../lib/angular/angular',
			'ui-router': '../../lib/ui-router/release/angular-ui-router',
			'angular-resource': '../../lib/angular-resource/index',
			'angular-cookies': '../../lib/angular-cookies/index',
			'angular-sanitize': '../../lib/angular-sanitize/index',
			'angular-animate': '../../lib/angular-animate/index',
			'angular-touch': '../../lib/angular-touch/index',
			'jquery': '../../lib/jquery/dist/jquery',

			//VENDORS
			'UAParser': 'vendor/ua-parser',


			//FACTORIES
			'utilities': '../app_components/src/factories/utilities',

			//PROVIDERS
			'client': '../app_components/src/providers/client',

			/* CONFIGS */
			'development': 'configs/development'
		},
		map: {
			'*': {'jquery': 'jquery'},
			'noconflict': {"jquery": "jquery"}
		},
		shim: {
			'app': {
				'deps': [
					'angular',
					'ui-router',
					'angular-resource',
					'angular-sanitize',
					'angular-animate',
					'angular-cookies',
					'angular-touch',
					'utilities',
					'client'
				]
			},
			'angular': {'deps': ['jquery']},
			'ui-router': {'deps': ['angular']},
			'angular-resource': {'deps': ['angular']},
			'angular-cookies': {'deps': ['angular']},
			'angular-sanitize': {'deps': ['angular']},
			'angular-animate': {'deps': ['angular']},
			'angular-touch': {'deps': ['angular']},
			'jquery': {
				init: function ($) {
					return $.noConflict(true);
				},
				exports: 'jquery'
			},

			//LOADING COMPONENTS BASED ON FEATURES
			'client': {'deps': ['angular', 'UAParser']},
			'utilities': {'deps': ['angular']},


			//ROUTES
			'application/routes': {'deps': ['app']},

			//APPLICATION
			'development': {'deps': ['app']},
			'application/appSettings': {'deps': ['app']},
			'application/baseController': {'deps': ['app']},



			//COMMONS
			'commons/directives/global': {'deps': ['app']},
			'commons/directives/dropDownOptions': {'deps': ['app']},
			'commons/directives/offset': {'deps': ['app']},
			'commons/directives/resizer': {'deps': ['app']},

		}
	}, [
		'require',
		//ROUTES
		'application/routes',

		//APPLICATION
		'development',
		'application/appSettings',
		'application/baseController',


		//COMMONS
		'commons/directives/global',
		'commons/directives/dropDownOptions',
		'commons/directives/offset',
		'commons/directives/resizer',
	],
	function (require) {
		return require(['bootstrap'])
	}
);
