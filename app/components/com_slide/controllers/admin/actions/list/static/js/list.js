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
            query:{method:'GET', isArray: true}, // note - slideshows is in node "slideshows"
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

    $scope.edit_slides = function(ss){
        $scope.current_slideshow = ss;
        $scope.slides = Slides.query(ss, function(slides){
            console.log('slides: ', slides);
        })
    }

    $scope.view_slideshow = function(ss){
        document.location= '/slideshow/view/' + ss._id;
    }

    $scope.add_slide = function(){
        new_slide_ck.setData('');
        $('#newSlide').modal({backdrop: true, show: true})
    }

    $scope.edit_slide = function(slide){
        $scope.current_slide = slide;
        console.log('editing ', slide);
        edit_slide_ck.setData(slide.content);
        $('#editSlide').modal({backdrop: true, show: true})
    }

    $scope.ordered_slides = function(){
        var out = _.sortBy($scope.slides, function(s){
            return parseInt(s.weight);
        })

        return out;
    }

   function _slide_summary(){
      return _.reduce($scope.slides, function(w, slide){
           w[slide._id] = {weight: slide.weight, title: slide.title};
           return w;
       }, {});
   }

    function _reorder(summary){
        var weights = _slide_summary();
        console.log('reorder: summary', summary, weights);
        if (weights){
            $.post('/admin/slideshow/order_slides', {weights: weights});
        }
    }

    $scope.$watch(function(){
        return angular.toJson(_slide_summary());
    }, _reorder);

    $scope.new_slide = {
        title: 'New Slide',
        notes: '',
        content: ''
    }

    $scope.save_new_slide = function(){
        $scope.new_slide.slideshow = $scope.current_slideshow._id;
        $scope.new_slide.content = new_slide_ck.getData();
        console.log('saving new slide ', $scope.new_slide);
        Slides.add($scope.new_slide, function(e, r){
            console.log('added slide ', e, r);

            $scope.slides = Slides.query($scope.current_slideshow, function(slides){
                console.log('slides: ', slides);
                $('#newSlide').modal('hide')
            })
        })

        $scope.new_slide = {
            title: 'New Slide',
            notes: '',
            content: ''
        }
    }

    $scope.parentable_slides = function(){
        return _.reject($scope.slides, function(s){ return s.checked});
    }

    $scope.save_current_slide = function(){
        var slide = $scope.current_slide;
        slide.content = edit_slide_ck.getData();
        console.log('edit - update slide ', slide);
        Slides.update(slide, function(e, r){
            console.log('updated slide ', e, r);

            $scope.slides = Slides.query($scope.current_slideshow, function(slides){
                console.log('slides: ', slides);
                $('#editSlide').modal('hide')
            })
        })

        $scope.new_slide = {
            title: 'New Slide',
            notes: '',
            content: ''
        }
    }

    $scope.new_slideshow = function(){
        document.location="/admin/slideshow/new"
    }

    $scope.delete_slide = function(slide){
        Slides.delete(slide)
    }
}

SlideCtrl.$inject = ['$scope', '$filter', '$compile', 'Slideshows', 'Slides'];


