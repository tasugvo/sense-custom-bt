/*!
 * sense-export - Just a simple button to export data in your Qlik Sense application without displaying them in a table first.
 * --
 * @version v1.3.5
 * @link https://github.com/stefanwalther/sense-export
 * @author Stefan Walther
 * @license MIT
 */

/*!
 * sense-angular-directives - AngularJS directives ready to be used in Qlik Sense visualization extensions.
 * --
 * @version v0.4.2
 * @link https://github.com/stefanwalther/sense-angular-directives
 * @author Stefan Walther
 * @license MIT
 */

define([
    "qvangular",
    "angular",
    "text!./eui-button.ng.html"
], function (qvangular, angular, ngTemplate) {
    "use strict";
    
    var component = {
        restrict: "E",
        replace: true,
        template: ngTemplate,
        scope: {
            label: "=",
            theme: "=",
            icon: "=",
            fullWidth: "=",
            align: "=",
            click: "&",
            spinning: "="
        },
        controller: ["$scope", "$attrs", function ($scope) {
            $scope.onClick = function () {
                if ($scope.click) {
                    $scope.click();
                }
            };
        }]
    };
    
    return qvangular.directive("euiButton", function () {
        return component;
    });
});