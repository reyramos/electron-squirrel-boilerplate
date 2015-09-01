(function (angular) {
	"use strict";

    /**
     * @ngdoc overview
     * @name reyramos.loader
     *
     * @description
     * Complete customizable loading bar, which uses $templateCache to load onto the DOM when called
     * upon service
     *
     */
    angular.module('reyramos.loader', [])
        .run([
            '$templateCache',
            function($templateCache) {
                $templateCache.put('/loader/loader.html',
                    '<div class="loader-block"><div class="loading-backdrop" data-ng-show="loader.backdrop"></div>' +
                    '<div class="loader-message"><span data-ng-bind-html="loader.message"></span></div></div>'
                )
            }
        ])
        .directive('loader', LoadingDirective)
        .service('loaderService', LoadingService)

    LoadingDirective.$inject = ['$timeout']
    LoadingService.$inject = ['$document', '$timeout', '$animate', '$rootScope', '$templateCache', '$compile', '$parse']

    /**
     * @ngdoc directive
     * @name loader.directive.directive:loader
     * @restrict E
     *
     * @description
     * Replace element <loader> with $templateCache.get('/loader/loader.html')
     *
     */
    function LoadingDirective($timeout) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/loader/loader.html',
            link: function(scope, elem, attr) {
                var count = 0,
                    interval,
                    element,
                    string = "";

                $timeout(init, 250)

                function init() {
                    element = elem.find('.loader-dots-dots')

                    interval = setInterval(increment, 1000)
                }


                function increment() {
                    if (count < 3) {
                        count += 1;
                        string += "."
                        element.html(string)
                    } else {
                        count = 0;
                        string = ""
                    }

                }
            }
        };
    }


    /**
     * @ngdoc service
     * @name reyramos.loader.loaderService
     *
     * @description
     * This service handles adding and removing the actual element in the DOM.
     * Generally, best practices for DOM manipulation is to take place in a
     * directive, but because the element itself is injected in the DOM only upon
     * requests, and it's likely needed on every view, the best option is to
     * use a service, that inject a directive.
     *
     */
    function LoadingService($document,$timeout,$animate,$rootScope,$templateCache,$compile,$parse) {

        //the directive to load the service
        this.loaderContainer = '<loader></loader>';

        var options = {
                includeBar: true,
                includeSpinner: false,
                // target:'JQuery'
                loadingBar: '<div id="loading-bar"><div class="bar"><div class="peg"></div></div></div>',
                spinnerContainer: '<div id="loading-bar-spinner"><div class="spinner-icon"></div></div>',
                message: "",
				backdrop:true
            },
            spinner = angular.element(options.spinnerContainer),
            $loaderContainer = String(this.loaderContainer),
            loadingBar = angular.element(options.loadingBar),
            bar = loadingBar.find('div').eq(0),
            loaderContainer = null,
            incTimeout,
            completeTimeout,
            setCompleteTimeout,
            started = false,
            status = 0;

        /**
         * Inserts the loading bar element into the dom, and sets it to 2%
         */
        function _start(obj) {

            $timeout.cancel(completeTimeout);
            $timeout.cancel(setCompleteTimeout);

            var opts = angular.copy(options);
            opts = angular.extend(opts, obj || {});

			$parse('loader').assign($rootScope, {
				message: opts.message?(opts.message + (angular.element(opts.message)[0] ? "" : "<span class='loader-dots-dots'></span>")):"",
				backdrop:opts.backdrop
			});

            var $parent = opts.target || angular.element($document.find('body'));

            loaderContainer = angular.element($loaderContainer);
            var compiled = $compile(loaderContainer)($rootScope);

            // do not continually broadcast the started event:
            if (started) {
                return;
            }

            $rootScope.$broadcast('loaderService:started');

            $parent.append(loaderContainer);

            started = true;

            if (opts.includeBar) {
                $parent.append(loadingBar)
            }

            if (opts.includeSpinner) {
                $parent.append(spinner);
            }

            _set(0.02);
        }

        /**
         * Set the loading bar's width to a certain percent.
         *
         * @param n any value between 0 and 1
         */
        function _set(n) {
            if (!started) {
                return;
            }
            var pct = (n * 100) + '%';
            bar.css('width', pct);
            status = n;
            // increment loadingbar to give the illusion that there is always
            // progress but make sure to cancel the previous timeouts so we don't
            // have multiple incs running at the same time.
            $timeout.cancel(incTimeout);
            incTimeout = $timeout(function() {
                _inc();
            }, 250);

        }

        /**
         * Increments the loading bar by a random amount
         * but slows down as it progresses
         */
        function _inc() {
            if (_status() >= 1) {
                return;
            }
            var rnd = 0;
            // TODO: do this mathmatically instead of through conditions
            var stat = _status();
            if (stat >= 0 && stat < 0.25) {
                // Start out between 3 - 6% increments
                rnd = (Math.random() * (5 - 3 + 1) + 3) / 100;
            } else if (stat >= 0.25 && stat < 0.65) {
                // increment between 0 - 3%
                rnd = (Math.random() * 3) / 100;
            } else if (stat >= 0.65 && stat < 0.9) {
                // increment between 0 - 2%
                rnd = (Math.random() * 2) / 100;
            } else if (stat >= 0.9 && stat < 0.99) {
                // finally, increment it .5 %
                rnd = 0.005;
            } else {
                // after 99%, don't increment:
                rnd = 0;
            }
            var pct = _status() + rnd;
            _set(pct);
        }

        function _status() {
            return status;
        }

        function _hide() {

            $parse('loader').assign($rootScope, {});

            $rootScope.$broadcast('loaderService:hide');

            if (status < 1) {
                _set(1);
                setCompleteTimeout = $timeout(complete, 500);
            } else {
                complete()
            }

        }


        function complete() {

            if (!loaderContainer) return;

            completeTimeout = $timeout(function() {
                started = false;
                status = 0;

                loaderContainer.remove();
                loadingBar.remove();
                spinner.remove();

                angular.element(document.getElementsByClassName('loader-block')).remove();

            }, 1);
        }

        return {
            /**
             * @ngdoc method
             * @name loader.loaderService#hide
             * @methodOf reyramos.loader.loaderService
             * @kind function
             *
             *
             * @description
             * Runs the leave animation operation and, upon completion, removes the element from the DOM
             *
             */
            hide: _hide,
            /**
             * @ngdoc method
             * @name loader.loaderService#start
             * @methodOf reyramos.loader.loaderService
             * @kind function
             *
             * @param {object} object with parameters
             *
             *
             * @description
             * Enters the animation and add the element to the DOM
             *
             * @example
             *
             * ```js
             * var options = {
             *  includeBar:true,
             *   includeSpinner:false,
             *   parentSelector:'body',
             *   message:""
             * },
             *
             * loaderService.start(options);
             *
             * ```
             */
            start: _start
        };

    }

})(window.angular);
