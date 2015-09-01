angular.module('app')


.service(
  'appData', [
        '$rootScope',
        '$log',
        '$q',
        '$http',
        'ngDancikHttp',
        'utilities',
        'loaderService',
        'APP_ENV',
        'HTTP_VERB',
        function (
      $rootScope,
      $log,
      $q,
      $http,
      ngDancikHttp,
      utilities,
      loaderService,
      APP_ENV,
      HTTP_VERB
        ) {

      var logger = $log.getInstance('appData'),
        config_settings = {},
        appService = {};


      /**
       * @ngdoc method
       * @name init
       * @methodOf app.service:applicationService
       * @kind function
       *
       * @description
       * Initialize application, get Application Config Settings,
       * It will gather the user config settings
       * ../../dancik-aws/navigator/getConfig
       *
       */
      this.init = function () {

        var _this = this,
          defer = $q.defer(),
          requestTypes = [{
            url: 'http://' + document.domain + ':9989/initApplication',
            method: HTTP_VERB.POST,
            data: {}
        }],
          handler = [],
          process = false;


        fetch(requestTypes).then(function (response) {

          //if we need to get more data well reloop within this functionaliy
          defer.resolve();
          loaderService.hide();

        }, function (response) {
          logger.error('requestTypes >', response);
        })

        return defer.promise;

      }

      /**
       * Private function loop to gather the necessary data
       * @param  {[type]} requestTypes [description]
       * @return {[type]}              [description]
       */
      var fetch = function (requestTypes) {

        var defer = $q.defer(),
          handler = [],
          process = false;


        for (var i = 0; i < requestTypes.length; i++) {
          handler.push(ngDancikHttp[String(requestTypes[i].method).toLowerCase()](
            requestTypes[i].url, requestTypes[i].data))
        }

        $q.all(handler).then(function (arrayOfResults) {
          for (var i in arrayOfResults) {
            // handle success
            if (arrayOfResults[i].status === 200) {
              config_settings[arrayOfResults[i].config.url] = cleanData(
                arrayOfResults[i].data);
            }
          }

          defer[Number(i) === Number(arrayOfResults.length - 1) ? 'resolve' :
            'reject']();

        }, function (response) {
          logger.error('requestTypes >', response);
        });


        return defer.promise;
      }


      /**
       * @ngdoc method
       * @name getConfigSettings
       * @methodOf app.service:applicationService
       * @kind function
       *
       * @description
       * Return configSetting from init request call
       *
       * @returns {{}}
       */
      this.getConfigSettings = function (key) {
        return config_settings[!key ? APP_ENV.AWS_PATH + enums.NAVIGATOR.GET_CONFIG :
          key]
      }

      /**
       * @ngdoc method
       * @name getVersion
       * @methodOf app.service:applicationService
       * @kind function
       *
       * @description
       * Return the version of the application, version xml
       *
       * @param {callback} handleSuccess
       * @param {callback} handleError
       * @returns {{}}
       */

      this.getVersion = function (handleSuccess, handleError) {
        var request = $http({
          method: "GET",
          url: "../version.json"
        });
        request.then(handleSuccess, handleError)
      }

      /**
       * Removes white space form data, set Y/N values to boolean
       * @param {object} obj
       * @private
       */
      function cleanData(obj) {
        //remove whitespace from user results
        angular.forEach(obj, function (value, key) {
          if (typeof (obj[key]) === 'object') {
            cleanData(obj[key])
          } else {
            var value = String(value).trim();
            switch (String(value).toLowerCase()) {
            case 'y':
            case 'true':
            case 'yes':
              obj[key] = true;
              break;
            case 'n':
            case 'false':
            case 'no':
              obj[key] = false;
              break;
            default:
              obj[key] = value;
            }
          }
        });


        return obj;

      }

        }
    ]
)
