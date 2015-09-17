/**
 * Created by redroger on 11/5/14.
 */

(function (angular) {
    'use strict';
    angular.module('app').directive('loading', Loading)

    Loading.$inject = ['$sce', '$document', 'postMessage', '$timeout', 'APP_ENV']

    function Loading($sce, $document, postMessage, $timeout, APP_ENV) {

        var directive = {
                restrict: 'E',
                template: ['<div id="splashScreen"><img src="icon.png"></div>'].join("")
            },
            iframe = null;
        directive.link = {
            pre: function (scope, element) {
                iframe = document.createElement('iframe');
                iframe.setAttribute("id", "iframeSource");
                iframe.onload = function () {
                    console.log('PAGE_LOADED');
                    element.find($document[0].querySelector('#splashScreen')).remove();

                    $timeout(function () {
                        postMessage.send('electron', APP_ENV.info, iframe)
                    }, 0, false)

                };
            },
            post: function (scope, element, attr) {
                if (!attr.loadingHref) return;
                iframe.src = $sce.trustAsResourceUrl(attr.loadingHref);
                element.append(iframe);

            }
        }


        return directive;
    }


})(window.angular);
