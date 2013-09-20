(function(){

    function PaintCtrl($scope, $filter, $compile, $window, Export_Drawing, drawings){

        $scope.tab = 'drawing';
        $scope.$watch('current_color', function(color){
            console.log('current color set to ', color);
            if (color){
                $scope.set_current_color(color);
            }
        });

        $scope.export = function(){
            var data = Export_Drawing($scope.paint_manager);
            _.each(data.tokens, function(t){
                t.shape_type = t.type;
                delete t.type;
            });

            drawings.add(data, function(saved){
                console.log('saved ', data, 'as', saved);
            });

        }
    }

    PaintCtrl.$inject = ['$scope', '$filter', '$compile', '$window', 'Export_Drawing', 'drawings'];

    angular.module('PaintApp').controller('PaintCtrl', PaintCtrl);


})(window);
