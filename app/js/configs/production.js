/**
 * Created by redroger on 3/14/15.
 */

(function (angular) {
	'use strict';

	angular.module('app').factory('APP_OVERRIDE', AppOverride);

	//AppOverride.$inject = [];

	function AppOverride() {

		var override = {
			//loggerHost:"localhost" //used to override the debug functionality
			env: 'production',
			iframeSrc:'https://dev-eligibility-phoenix.labcorp.com/reyramos/dist/'

		};
		return override;
	}

})(window.angular);
