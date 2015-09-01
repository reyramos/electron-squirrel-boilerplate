(function (angular) {
	"use strict";

    /**
     * @ngdoc overview
     * @name redroger
     *
     *
     * @requires reyramos.templateCache
     * @requires reyramos.loader
     * @requires reyramos.modal
     * @requires reyramos.client
     *
     * @description
     * # redroger
     *
     * There are several sub-modules included with the redroger module, however only this module is needed
     * as a dependency within your angular app. The other modules are for organization purposes.
     * Combination of services and modules for redroger framework,
     * You are not obligated to use all of the modules provided here, and may select the module to insert into your angular project.
     *
     * The modules are:
     * * redroger - the main "umbrella" module
     * * languageService -
     * * modalFactory -
     * * modal -
     * * client -
     *
     *
     * *You'll need to include **only** this module as the dependency within your angular app.*
     *
     * @example
     * ```html
     * <pre>
     * <!doctype html>
     * <html ng-app="myApp">
     * <head>
     *   <script src="js/angular.js"></script>
     *   <!-- Include the ui-router script -->
     *   <script src="build/min.js"></script>
     *   <script>
     *     // ...and add 'ui.router' as a dependency
     *     var myApp = angular.module('myApp', ['redroger']);
     *   </script>
     * </head>
     * <body>
     * </body>
     * </html>
     * </pre>
     * ```
     */

    angular.module('ngGoodies', ['reyramos.client', 'reyramos.utilities'])
        .factory('ngGoodies', ngGoodies)
        .directive('fullScreen', FullScreenDirect)
        .directive('toolTip', ToolTipDirect);

    reyramos.$inject = ['$document', '$log', '$templateCache'];
    FullScreenDirect.$inject = ['$timeout', 'clientService'];
    ToolTipDirect.$inject = ['$timeout', '$compile', 'utilities'];

    function ngGoodies($document, $log, $templateCache) {

        var logger = $log.getInstance('ngGoodies');

        var service = {}

        /**
         * @ngdoc function
         * @name redroger#growl
         * @methodOf redroger
         *
         * @param {object} Set of options to modify the Growl notifications
         *
         * * callback - when the Growl box is closed it will send the cbk
         *
         * @description
         * Trigger an event to be process through the application
         *
         */
        service.growl = function(opts) {

            var defaults = {
                callback: angular.noop()
            };

            angular.extend(defaults, opts, {});
            $.bigBox(defaults, defaults.callback);
        }

        return service;
    }


    /**
     * @ngdoc overview
     * @name reyramos.directive.directive:fullScreen
     * @restrict A
     *
     * @description
     * Bind the attribute string to fullscreen change events
     *
     *
     * @example
     * ```html
     * <a href='#' data-full-screen >FullScreen</a>
     *```
     *
     */
    function FullScreenDirect($timeout, clientService) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var $body = $('body'),
                    target = attrs.hasOwnProperty('fullScreen') && attrs.fullScreen !== "" ? $(attrs.fullScreen) : document.documentElement;

                //we dont need this on IOS devices
                if (String(clientService.osName).toLowerCase() === "ios") {
                    element.parent().remove();
                    return;
                }


                var toggleFullSceen = function(e) {
                    if (!$body.hasClass("full-screen")) {
                        $body.addClass("full-screen");
                        if (document.documentElement.requestFullscreen) {
                            document.documentElement.requestFullscreen();
                        } else if (document.documentElement.mozRequestFullScreen) {
                            document.documentElement.mozRequestFullScreen();
                        } else if (document.documentElement.webkitRequestFullscreen) {
                            document.documentElement.webkitRequestFullscreen();
                        } else if (document.documentElement.msRequestFullscreen) {
                            document.documentElement.msRequestFullscreen();
                        }
                    } else {
                        $body.removeClass("full-screen");
                        if (document.exitFullscreen) {
                            document.exitFullscreen();
                        } else if (document.mozCancelFullScreen) {
                            document.mozCancelFullScreen();
                        } else if (document.webkitExitFullscreen) {
                            document.webkitExitFullscreen();
                        }
                    }
                };



                element.on('click', toggleFullSceen);

            }
        }
    }



    function ToolTipDirect($timeout, $compile, utilities) {
        return {
            restrict: 'A',
            link: function(scope, elem, attrs) {

                var defaults = {
                        message: "",
                        class: '',
                        position: 'bottom',
                        pointers: 1,
                        offset: 20
                    },
                    template = angular.element('<div class="dws-toolTip">')
                    .attr('id', 'dwsToolTip').append(angular.element('<span>')),
                    opts = angular.extend({}, defaults, attrs.hasOwnProperty('toolTip') ? scope[attrs.toolTip] : {}),
                    element = {};

                setElementProp(); //needs to get element information first
                displayToolTip() //want to see it now

                function setElementProp() {
                    $timeout(function() {
                        element = { //some information of the element
                            offset: $(elem).offset(),
                            offsetHeight: elem[0].offsetHeight,
                            offsetWidth: elem[0].offsetWidth
                        };

                        template.css({
                            top: element.offsetHeight + 'px',
                            left: '0px',
                            width: (element.offsetWidth) + 'px',
                            position: 'absolute'
                        }).addClass(opts.class)

                        angular.element(template[0].childNodes[0]).html(opts.message)



                    }, 1)
                }


                function displayToolTip(e) {
                    console.log("toolTip", opts)

                    //append to the elem
                    elem.append(template)
                    $compile(template)(scope);

                }



                utilities.addEvent(window, "resize", setElementProp); //need to listen for event change
                utilities.addEvent(window, "orientationchange", setElementProp);



            }
        };
    }

})(window.angular);
