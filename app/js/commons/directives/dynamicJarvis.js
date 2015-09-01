/**
 * Created by redroger on 11/12/14.
 */

(function(angular) {
    'use strict';
    angular.module('app').directive('dynamicJarvis', DynamicJarvis)


    DynamicJarvis.$inject = ['$compile', 'utilities', '$templateCache', '$parse', '$rootScope']


    function DynamicJarvis($compile, utilities, $templateCache, $parse, $rootScope) {

        var directive = {
            restrict: 'A',
            scope:{
              opts: '=dynamicJarvis'
            },
            link: function(scope, element, attr) {
                var parentWrapper = "<ul></ul>",
                    template = $templateCache.get('/contextItem/dynamicJarvis.html'),
                    listArray = [],
                    listContainer;

                $parse('DynamicJarvisObjectParse').assign($rootScope, []);


                function init() {
                    listArray = attr.hasOwnProperty('dynamicJarvis') ? scope.opts: [];
                }


                function loopArray(list) {
                    var $parentWrapper = angular.element(parentWrapper);
                    for (var i = 0; i < list.length; i++) {
                        var string = template,
                            strEle;
                        for (var key in list[i]) {
                            if (list[i].hasOwnProperty(key)) {

                                if (typeof(list[i][key]) === 'object' && string.indexOf("@@" + key + "@@") > -1) {
                                    //TODO: something about object parsing
                                    scope['DynamicJarvisObjectParse'][utilities.encode(list[i]['path'] + list[i]['name'])] = {
                                        path: list[i]['path'] + list[i]['name'],
                                        obj: list[i][key],
                                        utf: utilities.encode(list[i]['path'] + list[i]['name'])
                                    }

                                    string = utilities.str_replace("@@" + key + "@@", utilities.encode(list[i]['path'] + list[i]['name']), string);
                                } else {
                                    string = utilities.str_replace("@@" + key + "@@", String(list[i][key]), string);
                                }

                                strEle = angular.element(string);
                                if (key.toLowerCase().trim() === "folders" && list[i][key].length) {
                                    var subString = loopArray(list[i][key]);
                                    strEle.append(angular.element(subString))
                                }
                            }
                        }
                        $parentWrapper.append(strEle);
                    }
                    return $parentWrapper;
                }


                scope.$on('directive:dynamicJarvis', function() {
                    if (listContainer) {
                        listContainer.remove()
                    }
                    init();
                    listContainer = loopArray(listArray);
                    //add directive and properties
                    listContainer
                        .attr("data-jarvis-menu", "")
                        .attr("options", "jarvisMenu")

                    $compile(listContainer)(scope)
                    element.append(listContainer);
                })

                scope.$broadcast('directive:dynamicJarvis')
            }
        }

        return directive;

    }




})(window.angular);
