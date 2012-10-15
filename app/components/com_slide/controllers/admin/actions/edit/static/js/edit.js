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
        return $resource('/admin/slideshow/slides/:_id', {_id:"@_id"}, {
            get:{method:'GET'},
            query:{method:'GET', isArray:true}, // note - slideshows is in node "slideshows"
            add:{method:'POST' },
            update:{method:'PUT' },// note - must be in an embedded envelope: {_id: "value", slideshow: {slideshow} }
            delete:{method:'DELETE'}
        });
    });

function SlideshowCtrl($scope, $filter, $compile, Slideshows, Slides) {
    $scope.slideshow = {};
    $scope.slides = [];

    $scope.$root.$on('id', function(e, value){
        $scope.slideshow = Slideshows.get({_id: value}, function(shows){
            $scope.slides = Slides.query($scope.slideshow);
        })
    });

    $scope.update_slideshow = function(ss){
        Slideshows.update({_id: ss._id, slideshow: ss});
    }

    $scope.save_slide = function(s){
        Slides.update(s);
    }

    $scope.content = function(slide){
        if (slide.markdown){
            return marked(slide.content)
        } else {
            return slide.content;
        }
    }

    $('.tabs a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    })
}

SlideshowCtrl.$inject = ['$scope', '$filter', '$compile', 'Slideshows', 'Slides'];


