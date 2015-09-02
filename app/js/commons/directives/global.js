(function(angular) {
    'use strict';

    angular.module('app')
        .directive('a', AnchorDirective)
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
