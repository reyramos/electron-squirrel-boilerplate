(function (angular) {
    "use strict";
    /**
     * @ngdoc overview
     * @name reyramos.contextMenu
     *
     *
     * @requires $templateCache
     * @requires reyramos.client
     *
     * @description
     * # reyramos.contextMenu
     *
     * A context menu (also called contextual, shortcut, and popup or pop-up menu)
     * is a menu in a graphical user interface (GUI) that appears upon user interaction,
     * such as a right-click mouse operation.
     *
     *
     */

    angular.module('reyramos.contextMenu', [])
        .run(cmRun)
        .directive('contextMenu', ContextMenu)

    cmRun.$inject = ['$templateCache']
    ContextMenu.$inject = ['$templateCache', '$compile', '$timeout', '$state']

    function cmRun($templateCache) {
        $templateCache.put(
            '/ngContextMenu/ContextMenu.html',
            [
                '<div id="contextMenu"><div class="context-menu"><ul data-ng-repeat="ul in _cm_d.contextMenu.ul"><li data-ng-repeat="li in ul">',
                '<div data-ng-click="li.callback(li)"><i class="{{::li.icon}}"></i>{{::li.name}}',
                '<i class="fa fa-caret-right pull-right" data-ng-show="li.list"></i></div>',
                '<ul data-ng-show="li.list"><li data-ng-repeat="subli in li.list">',
                '<div data-ng-click="subli.callback(subli)"><i class="{{::subli.icon}}"></i>{{::subli.name}}</div>',
                '</li></ul>',
                '</li></ul></div></div>'

            ].join(''))
    }


    /**
     * @ngdoc object
     *
     * @name reyramos.contextMenu.directive:contextMenu
     * @restrict AE
     *
     * @description
     * Create a custom contextMenu
     *
     * To apply your own custom context menu, apply the directive to the object where you want to build the context menu.
     *
     *
     * @example
     *
     * ```html
     *  <div data-context-menu="contextMenu"></div>
     * ```
     *
     *
     *
     * ```js
     self.contextMenuOpts = [
     	[{
			name: 'Add new Category',
			icon: 'fa fa-plus-circle',
			callback: function () {}
		}],
    	[{
			name: 'Add new Model',
			icon: "fa fa-upload",
			callback: function () {}
		}]
    ]
     *```
     *
     * If the parent element has already a bind contextMenu, it can be override by assigning child element with its own
     * contextMenu options
     *
     *
     * ```html
     *      <span data-cm-override="contextItem" data-cm-name="123456"></span>
     * ```
     * ```js
     *      $scope.contextItem = {
                    list:[
                        [
                            {name:'Add new folder',icon:'fa fa-plus-circle', call:"addFolder"},
                            {name:'Delete folder',icon:'fa fa-minus-circle', call:"deleteFolder"}
                        ],
                        [
                            {
                            name:'Upload new file',
                            name:'Rename folder',
                            }
                        ]
                    ],
                    callback:function(string, name){
                    //params string, definition of which element was click
                    //params name, display the value from 'cmName'

                    },
                    onContext:function(element,event){},
                    offContext:function(element){})
                    }
     }
     *```
     */
    function ContextMenu($templateCache, $compile, $timeout, $state) {
        var directive = {
            restrict: 'AEC',
            scope: {
                cmOpts: "=contextMenu"
            },
            controller: ['$scope', function ($scope) {
                var _this = this;
                _this.cMenuCallBack = function (callback) {
                }
                _this.onContext = function (ele) {
                }
            }],
            controllerAs: '_cm_d',
            link: linkFunc,
            bindToController: false
        };

        function linkFunc(scope, element, attr, _cm_d) {

            if (!scope.cmOpts || scope.$eval($state.current.data.debug)) return;

            _cm_d.contextMenu = {ul: []}

            var contextMenuObjs = {}

            angular.forEach(scope.cmOpts, function (i, n) {
                if (angular.isArray(i)) {
                    _cm_d.contextMenu.ul.push(i)
                } else {
                    contextMenuObjs = i
                }

            })

            var cmElement = null,
                override, name, target = {
                    t: null,
                    e: null
                },
                options = angular.extend({}, {
                    onContext: function () {
                    },
                    offContext: function () {
                    }
                }, contextMenuObjs)

            element.bind('contextmenu', BindContextMenu);


            function getPosition(ele) {
                var rect = null;
                try {
                    rect = ele.getBoundingClientRect();
                } catch (e) {
                    rect = ele[0].getBoundingClientRect();
                }

                var rectTop = rect.top + window.pageYOffset - document.documentElement.clientTop;
                var rectLeft = rect.left + window.pageXOffset - document.documentElement.clientLeft;
                return {top: rectTop, left: rectLeft};
            }


            function isElementBound(event) {
                var elePos = getPosition(element),
                    elHeight = element[0].clientHeight,
                    eleWidth = element[0].clientWidth,
                    clkPos = {
                        y: event.pageY,
                        x: event.pageX
                    };

                if (clkPos.x <= eleWidth && clkPos.y <= elHeight) {
                    if (elePos.left <= clkPos.x && elePos.top <= clkPos.y)
                        return true;
                }

                return false;
            }

            function BindContextMenu(event) {
                event.preventDefault();
                event.stopPropagation();

                if (options.hasOwnProperty('onContext')) {
                    target.t = angular.element(event.target)
                    target.e = event
                    options.onContext(target, event);
                }

                var template = $templateCache.get('/ngContextMenu/ContextMenu.html');
                cmElement = angular.element(template)
                $compile(cmElement)(scope);
                $timeout(function () {
                    cmElement.on("click", mouseUp)
                    cmElement.bind("contextmenu", function (e) {
                        e.preventDefault();
                        mouseUp(e);

                        return isElementBound(e) ? BindContextMenu(e) : cmElement.unbind("contextmenu");

                    })

                    $('body').append(cmElement);

                }, 1)

                $(cmElement.children()[0]).css({
                    top: event.pageY + 'px',
                    left: event.pageX + 'px'
                }).on('contextmenu', function (event) {
                    event.preventDefault();
                })
            }

            function mouseUp(e) {
                cmElement.remove();
                if (options.hasOwnProperty('offContext')) {
                    options.offContext(target.t, target.e)
                }
                cmElement.unbind("click", mouseUp)
            }


            scope.$on('$destroy', function () {
                console.log("contextMenu.destroy");
                if (cmElement) {
                    cmElement.unbind("click", mouseUp)
                    cmElement.remove();
                }
            });

        }

        return directive;
    }


})(window.angular);


