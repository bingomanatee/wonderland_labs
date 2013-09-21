(function () {

    function DrawingSaveEditor($scope, $modalInstance, drawing_metadata){
        $scope.drawing_metadata = _.clone(drawing_metadata);

        $scope.save_drawing_dlog = function(preserve){
            if (preserve){

                $modalInstance.close($scope.drawing_metadata);
            } else {
                $modalInstance.dismiss();
            }
        }
    }

    function NoMemberWarningController($scope, $modalInstance){
        $scope.warning_read = function(){
            $modalInstance.close();
        }
    }

    function PaintCtrl($scope, $filter, $compile, $window, $modal, Export_Drawing, drawings) {

        $scope.tab = 'drawing';
        $scope.$watch('current_color', function (color) {
            console.log('current color set to ', color);
            if (color) {
                $scope.set_current_color(color);
            }
        });

        $scope.member = $window.member;
        $scope.member_warning = false;

        if (!$scope.member){

            var modalInstance = $modal.open({
                templateUrl: 'noMemberWarning.html',
                controller: NoMemberWarningController
            })

        }

        $scope.drawing_metadata = {name: '', description: '', public: 1};

        $scope.save = function () {
            var modalInstance = $modal.open({
                templateUrl: 'drawingSaveDialog.html',
                controller: DrawingSaveEditor,
                resolve: {
                    drawing_metadata: function () {
                        return $scope.drawing_metadata;
                    }
                }
            });

            modalInstance.result.then(function (drawing_metadata) {
                console.log('done with metadata', drawing_metadata);
                $scope.drawing_metadata = drawing_metadata;
                $scope.export(drawing_metadata);
            }, function(){
                console.log('dismissed');
            });

        };

        $scope.export = function (meta) {
            var data = Export_Drawing($scope.paint_manager);
            _.extend(data, meta);
            data.creator = $scope.member._id;
            _.each(data.tokens, function (t) {
                t.shape_type = t.type;
                delete t.type;
            });

            drawings.add(data, function (saved) {
                console.log('saved ', data, 'as', saved);
                document.location="/art/draw/" + saved._id;
            });

        }
    }

    PaintCtrl.$inject = ['$scope', '$filter', '$compile', '$window', '$modal', 'Export_Drawing', 'drawings'];

    angular.module('PaintApp').controller('PaintCtrl', PaintCtrl);


})(window);
