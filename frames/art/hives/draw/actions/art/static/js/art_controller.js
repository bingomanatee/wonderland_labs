(function () {

    function ArtCtrl($scope, $filter, $compile, $window, $modal, drawings) {

        $scope.drawings = drawings.query(function (drawings) {
            console.log("drawings found (", drawings.length, ')');

            $scope._unrendered_drawings = drawings.slice();
        });

    }

    ArtCtrl.$inject = ['$scope', '$filter', '$compile', '$window', '$modal', 'drawings'];

    angular.module('ArtApp').controller('ArtCtrl', ArtCtrl);


})(window);
