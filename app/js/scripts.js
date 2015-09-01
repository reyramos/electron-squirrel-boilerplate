/**
 * Created by ramor11 on 9/1/2015.
 */
(function(){

    var element = $('.app-body');

    var resize = function () {
        var opts = {
                offset: 0,
                property: "height"
            },
            offset = 26 * -1,
            wh = window.innerHeight;

        element.css(opts.property, (wh + offset) + 'px');

    };


    resize()

    $(window).on("resize", resize)

})();