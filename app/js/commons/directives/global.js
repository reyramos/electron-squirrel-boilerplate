(function(angular) {
    'use strict';

    angular.module('app')
        .directive('a', AnchorDirective)
		//.directive('ngRepeatDone', ngRepeatDone)
        .directive('passwordMatch', PasswordMatch);


    function AnchorDirective() {
        return {
            restrict: 'E',
            link: function(scope, elem, attrs) {
                if (attrs.ngClick || attrs.href === '' || attrs.href === '#') {
                    elem.on('click', function(event) {
                        event.preventDefault();
                        event.stopPropagation();


                    });
                }
            }
        };
    }


	//function ngRepeatDone() {
	//    return function(scope, element, attrs) {
	//        if (scope.$last) {
	//
	//            var _parent = element.parent()
	//            angular.forEach(_parent.find('li'), function(value, index) {
	//
	//                ! function outer(index) {
	//                    var _this = angular.element(value)
	//                    _this.data('position', _this[0].offsetTop)
	//
	//                }(index);
	//
	//            });
	//
	//        }
	//    };
	//}

    function PasswordMatch() {
        return {
            restrict: 'A',
            scope: true,
            require: 'ngModel',
            link: function(scope, elem, attrs, control) {
                var checker = function() {

                    //get the value of the first password
                    var e1 = scope.$eval(attrs.ngModel);

                    //get the value of the other password
                    var e2 = scope.$eval(attrs.passwordMatch);
                    return e1 == e2;
                };
                scope.$watch(checker, function(n) {

                    //set the form control to valid if both
                    //passwords are the same, else invalid
                    control.$setValidity("unique", n);
                });
            }
        };
    }

})(window.angular);
