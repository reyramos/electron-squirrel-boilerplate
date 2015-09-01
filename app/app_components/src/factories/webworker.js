(function (angular) {
	'use strict';


    angular.module('redroger.webworker', ['reyramos.templateCache']).factory('Worker', WebWorkerFactory);


    WebWorkerFactory.$inject = ['templates', '$templateCache', '$q'];

    function WebWorkerFactory(templates, $templateCache, $q) {


        var DEFAULTS = {}

        return function(options) {

            // private
            var opts = angular.extend({}, DEFAULTS, options),
                defer = $q.defer();

            templates.init({
                path: '/',
                pre: false,
                templates: angular.isArray(opts.url) ? opts.url : [opts.url]
            }).then(function() {

                var blob = new Blob([$templateCache.get(opts.url)]),
                    blobURL = window.URL.createObjectURL(blob);

                //create a new webworker
                var worker = new Worker(blobURL);


                worker.addEventListener('message', function(e) {}, false);


                worker.start = function(data) {
                    worker.postMessage(data); // Start the worker.
                }

                worker.end = function() {
                    //kill the url no longer needed
                    window.URL.revokeObjectURL(blobURL);
                    worker.terminate();
                }

                defer.resolve(worker)


            }, function() {
                defer.reject()

            })


            return defer.promise;

        }


    }



})(window.angular);
