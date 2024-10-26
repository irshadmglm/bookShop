(function () {

    if (typeof $ !== "function")
        throw Error('JQuery is not present.');

    var times = 2, handler;

    var init = function () {

        var t = $(this),
            p = t.parent(),
            v = p.next(),
            cs = v.next(),
            iw = v.children();

        handler = function () {

            var [w, h] = ['width', 'height'].map(x => $.fn[x].call(t)),
                nw = w * times, nh = h * times, cw = w / times, ch = h / times;

            // Initializing container sizes
            p.width(w).height(h);
            cs.width(cw).height(ch);
            iw.width(nw).height(nh);

            // Your simplified mousemove function
            p.mousemove(function (event) {
                var magnifier = $(this).next('.magnifier');
                var viewer = $(this).next('.viewer').find('img');

                var offset = $(this).offset();
                var x = event.pageX - offset.left;
                var y = event.pageY - offset.top;

                var posX = x / $(this).width() * 100;
                var posY = y / $(this).height() * 100;

                // Move the zoomed image
                viewer.css({
                    'transform-origin': `${posX}% ${posY}%`,
                    'transform': `scale(${times})` // Adjust the zoom scale here
                });

                // Position the magnifier on the image
                magnifier.css({
                    'top': y - magnifier.height() / 2,
                    'left': x - magnifier.width() / 2
                });
            });
        };

        // Ensure the zoom handler is only called once the image is loaded
        t.on('load', handler);
    };

    // jQuery plugin definition for zoom
    $.fn.extend({

        zoom: function (t) {
            times = t || times;

            for (let x of this)
                init.call(x);

            return this;
        },
        setZoom: function (t) {
            times = t || times;

            if (handler === void 0)
                throw Error('Zoom not initialized.');

            handler();
        }

    });

}());
