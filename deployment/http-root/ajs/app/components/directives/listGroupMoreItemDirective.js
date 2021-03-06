(function (angular) {
    'use strict';

    //// JavaScript Code ////
    function listGroupMoreItem() {
        return {
            restrict: 'E',
            scope: {
                maxItems : '=',
                items : '='
            },
            link : function($scope) {
                $scope.showMore = true;
                $scope.showAllItems = function() {
                    $scope.showMore = false;
                    $scope.maxItems = 99999;
                };
            },
            template: '<span class="list-group-item" ng-show="showMore && items.length > maxItems"><button ng-click="showAllItems()" class="btn btn-default btn-sm">More...</button></span>'
        };
    }

    //// Angular Code ////
    angular.module('codeine').directive('listGroupMoreItem', listGroupMoreItem);

})(angular);