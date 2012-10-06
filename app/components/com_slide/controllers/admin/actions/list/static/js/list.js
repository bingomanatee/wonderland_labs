angular.module('slides', ['slidesServices']);

angular.module('slidesServices', ['ngResource']).factory('Slideshows',
    function ($resource) {
        return $resource('/admin/slideshow/rest/:_id', {_id:"@_id"}, {
            get:{method:'GET'},
            query:{method:'GET'}, // note - slideshows is in node "slideshows"
            add:{method:'POST' },
            update:{method:'PUT' },
            delete:{method:'DELETE'}
        });
    }).factory('Slides',
    function ($resource) {
        return $resource('/admin/slides/:slideshow', {slideshow:"@_id"}, {
            get:{method:'GET'},
            query:{method:'GET'}, // note - slideshows is in node "slideshows"
            add:{method:'POST' },
            update:{method:'PUT' },
            delete:{method:'DELETE'}
        });
    });

function SlideCtrl($scope, $filter, $compile, Slideshows, Slides) {
    $scope.slideshows = [];
    Slideshows.query({}, function(ss, bb){

        console.log('slideshows: ', ss);
        $scope.slideshows = ss.slideshows;
    });

    $scope.current_slideshow = false;

    $scope.view = function(ss){
        $scope.current_slideshow = ss;
      //  $scope.slides = Slides.query(ss)
    }

    $scope.add_slide = function(){
        $('#newSlide').modal({backdrop: true, show: true})
    }

    $scope.new_slide = {
        title: 'New Slide',
        notes: '',
        content: ''
    }
}

SlideCtrl.$inject = ['$scope', '$filter', '$compile', 'Slideshows', 'Slides'];


