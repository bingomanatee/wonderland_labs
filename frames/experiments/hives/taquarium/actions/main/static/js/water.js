$(function () {

    var video = document.getElementById("video");
    var water = $('#water');
    var water_canvas = water.find('canvas')[0];
    water_canvas.width = Math.floor(water.width());
    water_canvas.height = Math.floor(water.height());
    var taco_image,taco_image2, taco_blue, taco_image_canvas;
    var taco_alphas, wave_alphas;

    var direct_canvas = $('body').find('#water_direct')[0];

    var dc_ctx = direct_canvas.getContext('2d');

    var video_height,
        video_width,
        video_bitmap,
        taco,
        video_offset_bitmap,
        scale,
        half_vw,
        half_vh;

    var highlights = [];

    var vi;
    var SIZE = water_canvas.height;
    var SCALE = 3;
    var WIDTH = 5;
    var MAX = 50;
    var CUTOFF = 150;
    var ANGLE = 0.1;
    var RAY_OP = 20;
    var H_SCALE = 0.5;

    var avg_r = 0;

    var stage = new createjs.Stage(water_canvas);

    var highlight_container = new createjs.Container();

    var hl_index = 0;
    var setting = false;


    function halo() {
        return 'rgba(153,204,255,' + (Math.random() / RAY_OP) + ')';
    };

    function timerCallback() {
        if (video.paused || video.ended) {
            clearInterval(vi);
            return;
        }

        read_highlights();

        alter_caustics();

        stage.update();
    }

    function alter_caustics() {

        video_bitmap.updateCache(0, 0, video_width * scale, video_height * scale);

      /*  var ctx = video_bitmap.cacheCanvas.getContext('2d');

        var id = ctx.getImageData(0, 0, video_bitmap.cacheCanvas.width, video_bitmap.cacheCanvas.height);

        if (!avg_r) {
            var c = 0;

            _.each(_.range(0, id.data.length, 4), function (index) {
                avg_r += id.data[index];
                ++c;
            });

            avg_r *= 2;
            avg_r /= c;
        }

        var column = 0;
        var row = 0;
        var col_fract = 0;
        var ROWS = video_bitmap.cacheCanvas.width * 4;


        wave_alphas = [];
        _.each(_.range(0, id.data.length, 4), function (index) {
            var r = id.data[index];
            wave_alphas.push(r * avg_r);

            id.data[index] = 153;
            id.data[index + 1] = 204;
            id.data[index + 2] = 255;
            ++row;
            if (row > ROWS) {
                ++column;
                row = 0;
                var fract = Math.sqrt(column / video_bitmap.cacheCanvas.height);
                col_fract = avg_r * fract;
            }
            id.data[index + 3] = Math.floor(r * col_fract);
        });

        var canvas = document.createElement('canvas');
        var ctxc = canvas.getContext('2d');

        canvas.width = video_bitmap.cacheCanvas.width;
        canvas.height = video_bitmap.cacheCanvas.height;

        ctxc.putImageData(id, 0, 0);

        video_bitmap.cacheCanvas = canvas;
        video_offset_bitmap.cacheCanvas = canvas;*/

        video_offset_bitmap.cacheCanvas = video_bitmap.cacheCanvas;
    }

    function start_highlights() {
        hl_index = 0;
        highlights = [];
        setting = true;
    }

    function read_highlights() {
        dc_ctx.drawImage(video, 0, 0, half_vw, half_vh);

        var img = dc_ctx.getImageData(0, 0, half_vw, half_vh).data;

        start_highlights();

        var found = false;
        var found_index = 0;
        _.each(_.range(2, img.length, 4), function (i) {
            if (found) return;

            var red = img[i];

            if (red > CUTOFF) {
                var index = (i - 2) / 4;
                var x = index % half_vw;
                var y = Math.floor(index / half_vw);
                x *= 2 * scale;
                y *= 2 * scale;

                make_highlight(x, y, found_index, (red - CUTOFF) / (255 - CUTOFF));
                ++found_index;
            }

        });

        done_highlights(found_index);

    }

    function make_highlight(x, y, index, ratio) {

        var hl = new createjs.Shape();

        hl.graphics.f(halo())
            .mt(0, 0)
            .lt(-SIZE * ANGLE, -SIZE)
            .lt((-SIZE + WIDTH) * ANGLE, -SIZE)
            .lt(WIDTH, 0);

        if (ratio > 0.25) hl.graphics.f(halo())
            .mt(-WIDTH, 0)
            .lt((-SIZE - WIDTH) * ANGLE, -SIZE)
            .lt((-SIZE + WIDTH * 2) * ANGLE, -SIZE)
            .lt(WIDTH * 2, 0);

        hl.x = x;
        hl.y = y;

        var hl2 = hl.clone();
        hl2.x += SIZE;

        var s = new createjs.Container();

        s.addChild(hl, hl2);

        // // console.log('made hl at ', x, y);
        highlights[index] = s;
    }

    function done_highlights(index) {

        highlights = _.shuffle(highlights).slice(0, MAX);

        highlight_container.removeAllChildren();
        _.each(highlights, function (hl) {
            highlight_container.addChild(hl);
        });

        setting = false;
    }

    function make_taco() {

        var queue = new createjs.LoadQueue();
        queue.addEventListener("complete", handleComplete);
        //queue.loadFile({id: "taco", src: "/tacos/taco.png"});
        queue.loadFile({id: "taco_blue", src: "/img/taquarium/tacos/taco_blue_sm.png"});
        function handleComplete() {
            var image = queue.getResult("taco_blue");

            taco_image = new createjs.Bitmap(image);
            
            taco_image.x = Math.random() * 1000;
            taco_image.y = Math.random() * 1000;
/*

            taco_image_canvas = document.createElement('canvas');
            taco_image_canvas.width = image.width;
            taco_image_canvas.height = image.height;

            taco_stage = new createjs.Stage(taco_image_canvas);

            var image_blue = queue.getResult('taco_blue');

            taco_blue = new createjs.Bitmap(image_blue);

            taco_stage.addChild(taco);
            taco_stage.addChild(taco_blue);

            taco_image = new createjs.Bitmap(taco_image_canvas);
            taco_image.regX = 100;
            taco_image.regy = 100;
            taco_image.x = 200;
            taco_image.y = 200;
            taco_image.rotation = 20;

            taco_stage.update();
*/

            stage.addChild(taco_image);

            taco_image2 = new createjs.Bitmap(image);

            taco_image2.x = Math.random() * 1000;
            taco_image2.y = Math.random() * 1000;

            stage.addChild(taco_image2);

            createjs.Ticker.addEventListener("tick", follow_mouse);

        }

    }

    var target_y = 300, target_x = 200;

    function move_taco(event){
        if (!taco_image) return;
        var x = event.stageX;
        var y = event.stageY;

        target_y = y - 50;
        target_x = x - 100;
        follow_mouse();
    }

    var momentum_x = 0;
    var momentum_y = 0;

    var momentum_x2 = 0;
    var momentum_y2 = 0;

    function follow_mouse(){

        if (!taco_image) return;

        if (target_x < taco_image.x){
            momentum_x -= 2;
        } else if (target_x > taco_image.x){
            momentum_x += 2;
        }

        if (target_y < taco_image.y){
            momentum_y -= 2;
        } else if (target_y > taco_image.y){
            momentum_y += 2;
        }

        momentum_x *= 0.8;
        momentum_y *= 0.8;

        taco_image.x += momentum_x;
        taco_image.y += momentum_y;

        if (target_x < taco_image2.x){
            momentum_x2 -= 2;
        } else if (target_x > taco_image2.x){
            momentum_x2 += 2;
        }

        if (target_y < taco_image2.y){
            momentum_y2 -= 2;
        } else if (target_y > taco_image2.y){
            momentum_y2 += 2;
        }

        taco_image2.x += momentum_x2;
        taco_image2.y += momentum_y2;
    }

    video.addEventListener("play", function () {
        video_width = video.videoWidth;
        video_height = video.videoHeight;
        half_vw = Math.floor(video_width / 2);
        half_vh = Math.floor(video_height / 2);

        scale = Math.min(water_canvas.width / video_width, water_canvas.height / video_height);

        direct_canvas.width = video_width;
        direct_canvas.height = video_height;


        video_bitmap = new createjs.Bitmap(video);

        video_bitmap.regX = video_bitmap.regY = 0;
        video_bitmap.scaleX = scale;
        video_bitmap.scaleY = scale;
        video_bitmap.x = 0;
        video_bitmap.y = 0;
        video_bitmap.compositeOperation = 'lighter';

        video_bitmap.cache(0, 0, video_width * scale, video_height * scale);

        video_offset_bitmap = new createjs.Bitmap(new Image());

        video_offset_bitmap.regX = video_offset_bitmap.regY = 0;
        video_offset_bitmap.scaleX = scale;
        video_offset_bitmap.scaleY = scale;
        video_offset_bitmap.x = (video_width * scale);
        video_offset_bitmap.y = 0;
        video_bitmap.cache(0, 0, video_width * scale, video_height * scale);

        var floor_container = new createjs.Container();
        floor_container.scaleY = H_SCALE;

        floor_container.addChild(video_bitmap);
        floor_container.addChild(video_offset_bitmap);
        floor_container.addChild(highlight_container);
        floor_container.y = half_vh * scale;

        stage.addChild(floor_container);

        stage.addEventListener('stagemousemove', move_taco);
        stage.enableDOMEvents(true);

        make_taco();

        vi = setInterval(timerCallback, 100)

    }, false);
});