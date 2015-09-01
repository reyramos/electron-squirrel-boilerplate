/**
 * @ngdoc overview
 * @name ngDancik.http
 *
 *
 * @requires ngDancik.http.ngDancikHttp
 *
 *
 * @requires HTTP_VERB
 * @requires REQUEST_TYPES
 *
 * @description
 * # ngDancik.http
 *
 * There are several sub-modules included with the ngDancik module, however only this module is needed
 * as a dependency within your angular app. The other modules are for organization purposes.
 *
 * The modules are:
 * * ngDancik.http - the main "umbrella" module
 * * ngDancikHttp -
 *
 *
 * *You'll need to include **only** this module as the dependency within your angular app.*
 */
angular.module('ngDancik.http', ['reyramos.loader', 'reyramos.logger'], function($httpProvider) {
    // Use x-www-form-urlencoded Content-Type
    $httpProvider.defaults.headers.post['Content-Type'] =
        'application/x-www-form-urlencoded;charset=utf-8;';

    /**
     * The workhorse; converts an object to x-www-form-urlencoded serialization.
     * @param {Object} obj
     * @return {String}
     */
    var param = function(obj) {
        var query = '',
            name, value, fullSubName, subName, subValue, innerObj, i;
        for (name in obj) {
            value = obj[name];

            if (value instanceof Array) {
                for (i = 0; i < value.length; ++i) {
                    subValue = value[i];
                    fullSubName = name + '[' + i + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            } else if (value instanceof Object) {
                for (subName in value) {
                    subValue = value[subName];
                    fullSubName = name + '[' + subName + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            } else if (value !== undefined && value !== null)
                query += encodeURIComponent(name) + '=' + encodeURIComponent(value) +
                '&';
        }

        return query.length ? query.substr(0, query.length - 1) : query;
    };

    // Override $http service's default transformRequest
    $httpProvider.defaults.transformRequest = [function(data) {
        return angular.isObject(data) && String(data) !== '[object File]' ? param(
            data) : data;
    }];
})


/**
 * @ngdoc object
 * @name ngDancik.http.HTTP_VERB
 *
 * @description
 * constant value to set the HTTP_VERB,
 *
 * @param {object} HTTP_VERB, default { GET:'GET', PUT:'PUT', POST:'POST', DELETE:'DELETE' }
 *
 *
 */
.constant('HTTP_VERB', {
        GET: 'GET',
        PUT: 'PUT',
        POST: 'POST',
        DELETE: 'DELETE'
    })
    /**
     * @ngdoc object
     * @name ngDancik.http.REQUEST_TYPES
     *
     * @description
     * constant value REQUEST_TYPES, these keys are set after the dancik-aws/REQUEST_TYPES route path,
     *
     * @param {object} REQUEST_TYPES, default { NAVIGATOR:{
                          GET_CONFIG:'/navigator/getConfig'
                    } }
     *
     *
     */
    .constant('REQUEST_TYPES', {
        NAVIGATOR: {
            GET_CONFIG: '/navigator/getConfig'
        }
    })

/**
 * @ngdoc object
 * @name ngDancik.http.ngDancikHttp
 *
 * @requires ngDancik
 * @requires HTTP_VERB
 * @requires APP_ENV
 *
 * @description
 * # ngDancik.http sub-module
 *
 * @description
 * It uses Angular $http server to facilitates comminication with remote server.
 * It uses Angular $Q for promise/deffered implementation
 *
 * It utilizes REQUEST_TYPES.
 *
 * ```js
 *
 * ngDancikHttp.post({params}).then(function(data){},function(response){})
 *
 * ```
 *
 */

.factory('ngDancikHttp', [
    '$q',
    '$http',
    '$resource',
    'APP_ENV',
    'HTTP_VERB',
    '$log',
    '$exceptionHandler',
    'loaderService',
    '$templateCache',
    function($q, $http, $resource, APP_ENV, HTTP_VERB, $log, $exceptionHandler, loaderService, $templateCache) {
        var service = {}
        var logger = $log.getInstance('ngDancik.http');


        var defaults = {
            data: {},
            cache: $templateCache
        }

        /**
         * @ngdoc function
         * @name ngDancik.http.ngDancikHttp#post
         * @methodOf ngDancik.http.ngDancikHttp
         *
         * @param {string} Url slug to send to
         * @param {object} Data to transfer to the request
         *
         * @description
         * Makes a POST request to AWS_PATH/REQUEST_TYPES
         *
         */
        service.post = function(url, data) {
                var defer = $q.defer();

                send_request(data, url, HTTP_VERB.POST, function(data) {
                    defer.resolve(data)
                }, function(response) {
                    defer.reject(response)
                })

                return defer.promise;
            }
            /**
             * @ngdoc function
             * @name ngDancik.http.ngDancikHttp#get
             * @methodOf ngDancik.http.ngDancikHttp
             *
             * @param {string} Url slug to send to
             * @param {object} Data to transfer to the request
             *
             * @description
             * Makes a GET request to AWS_PATH/REQUEST_TYPES
             *
             */
        service.get = function(url, data) {
                var defer = $q.defer();


                send_request(data, url, HTTP_VERB.GET, function(data) {
                    defer.resolve(data)
                }, function(response) {
                    defer.reject(response)
                })

                return defer.promise;
            }
            /**
             * @ngdoc function
             * @name ngDancik.http.ngDancikHttp#put
             * @methodOf ngDancik.http.ngDancikHttp
             *
             * @param {string} Url slug to send to
             * @param {object} Data to transfer to the request
             *
             * @description
             * Makes a PUT request to AWS_PATH/REQUEST_TYPES
             *
             */
        service.put = function(url, data) {
                var defer = $q.defer();


                send_request(data, url, HTTP_VERB.PUT, function(data) {
                    defer.resolve(data)
                }, function(response) {
                    defer.reject(response)
                })

                return defer.promise;
            }
            /**
             * @ngdoc function
             * @name ngDancik.http.ngDancikHttp#delete
             * @methodOf ngDancik.http.ngDancikHttp
             *
             * @param {string} Url slug to send to
             * @param {object} Data to transfer to the request
             *
             * @description
             * Makes a DELETE request to AWS_PATH/REQUEST_TYPES
             *
             */
        service.delete = function(url, data) {
            var defer = $q.defer();

            send_request(data, url, HTTP_VERB.DELETE, function(data) {
                defer.resolve(data)
            }, function(response) {
                defer.reject(response)
            })

            return defer.promise;
        }


        /**
         *
         * @param obj
         * @param url
         * @param method
         * @param handleSuccess
         * @param handleError
         */
        function send_request(obj, url, method, handleSuccess, handleError) {

            var errorCallback = handleError || _handleErrors,
                ajax_options = angular.extend({
                    url: url,
                    method: method,
                    data: obj,
                    headers: {},
                }, obj, {
                    data: out_filter(obj)
                });

            // GET requests do not use json
            if (method != HTTP_VERB.GET) {

                $http.defaults.headers["X-DANCIK-APIS-REQUEST-ENCODING"] = "JSON"
                $http.defaults.headers["x-dancik-apis-request-encoding"] = "JSON"

            }

            logger.info('send_request >> ', ajax_options)
            var request = $http(ajax_options)

            request.then(function(data) {
                var results = data.data

                // Now it can be used reliably with $.map()
                var error = $.map(results, function(val, key) {
                    if (key === 'error')
                        return val;
                })[0];




                if (results && error) {


                    handleError(error);
                } else {
                    try {
                        handleSuccess(in_filter(data))
                    } catch (exception) {
                        $exceptionHandler(exception);
                        errorCallback([{
                            errmsg: 'Error communicating with server.'
                        }]);
                    }
                }

            }, function(response) {

                //Don't do anything if this was a manual abort.
                if (!response.aborted) {
                    errorCallback([{
                        errmsg: 'Error communicating with server.'
                    }]);
                }
            })


        };

        /* End Named & Queued Call Helpers */
        /**
         * Handle errors, Fire event
         * @param errors
         */
        function _handleErrors(errors) {}

        /**
         * filter to run before returning incoming objects
         * @param obj
         * @returns {*}
         */
        function in_filter(obj) {
            return obj;
        }

        /**
         * Filter to run before sending outgoing objects
         * @param obj
         * @returns {*}
         */
        function out_filter(obj) {
            return obj;
        }


        return service;

    }
])
