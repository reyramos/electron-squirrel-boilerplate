(function(angular) {
    'use strict';

    angular.module('app').directive('jssorSlider', jssorSlider)

    jssorSlider.$inject = ['$timeout']

    function jssorSlider($timeout) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {

                element.css({
                    height: element[0].clientHeight,
                    width: element[0].clientWidth,
                })

                $timeout(function() {

                    var _SlideshowTransitions = [

                        // //Zoom- in
                        {
                            $Duration: 1200,
                            $Zoom: 1,
                            $Easing: {
                                $Zoom: $JssorEasing$.$EaseInCubic,
                                $Opacity: $JssorEasing$.$EaseOutQuad
                            },
                            $Opacity: 2
                        },
                        // //Zoom+ out
                        // {
                        //     $Duration: 1000,
                        //     $Zoom: 11,
                        //     $SlideOut: true,
                        //     $Easing: {
                        //         $Zoom: $JssorEasing$.$EaseInExpo,
                        //         $Opacity: $JssorEasing$.$EaseLinear
                        //     },
                        //     $Opacity: 2
                        // },
                        // //Rotate Zoom- in
                        // {
                        //     $Duration: 1200,
                        //     $Zoom: 1,
                        //     $Rotate: 1,
                        //     $During: {
                        //         $Zoom: [0.2, 0.8],
                        //         $Rotate: [0.2, 0.8]
                        //     },
                        //     $Easing: {
                        //         $Zoom: $JssorEasing$.$EaseSwing,
                        //         $Opacity: $JssorEasing$.$EaseLinear,
                        //         $Rotate: $JssorEasing$.$EaseSwing
                        //     },
                        //     $Opacity: 2,
                        //     $Round: {
                        //         $Rotate: 0.5
                        //     }
                        // },
                        // //Rotate Zoom+ out
                        // {
                        //     $Duration: 1000,
                        //     $Zoom: 11,
                        //     $Rotate: 1,
                        //     $SlideOut: true,
                        //     $Easing: {
                        //         $Zoom: $JssorEasing$.$EaseInExpo,
                        //         $Opacity: $JssorEasing$.$EaseLinear,
                        //         $Rotate: $JssorEasing$.$EaseInExpo
                        //     },
                        //     $Opacity: 2,
                        //     $Round: {
                        //         $Rotate: 0.8
                        //     }
                        // },

                        // //Zoom HDouble- in
                        // {
                        //     $Duration: 1200,
                        //     x: 0.5,
                        //     $Cols: 2,
                        //     $Zoom: 1,
                        //     $Assembly: 2049,
                        //     $ChessMode: {
                        //         $Column: 15
                        //     },
                        //     $Easing: {
                        //         $Left: $JssorEasing$.$EaseInCubic,
                        //         $Zoom: $JssorEasing$.$EaseInCubic,
                        //         $Opacity: $JssorEasing$.$EaseLinear
                        //     },
                        //     $Opacity: 2
                        // },
                        // //Zoom HDouble+ out
                        // {
                        //     $Duration: 1200,
                        //     x: 4,
                        //     $Cols: 2,
                        //     $Zoom: 11,
                        //     $SlideOut: true,
                        //     $Assembly: 2049,
                        //     $ChessMode: {
                        //         $Column: 15
                        //     },
                        //     $Easing: {
                        //         $Left: $JssorEasing$.$EaseInExpo,
                        //         $Zoom: $JssorEasing$.$EaseInExpo,
                        //         $Opacity: $JssorEasing$.$EaseLinear
                        //     },
                        //     $Opacity: 2
                        // },

                        // //Rotate Zoom- in L
                        // {
                        //     $Duration: 1200,
                        //     x: 0.6,
                        //     $Zoom: 1,
                        //     $Rotate: 1,
                        //     $During: {
                        //         $Left: [0.2, 0.8],
                        //         $Zoom: [0.2, 0.8],
                        //         $Rotate: [0.2, 0.8]
                        //     },
                        //     $Easing: {
                        //         $Left: $JssorEasing$.$EaseSwing,
                        //         $Zoom: $JssorEasing$.$EaseSwing,
                        //         $Opacity: $JssorEasing$.$EaseLinear,
                        //         $Rotate: $JssorEasing$.$EaseSwing
                        //     },
                        //     $Opacity: 2,
                        //     $Round: {
                        //         $Rotate: 0.5
                        //     }
                        // },
                        // //Rotate Zoom+ out R
                        // {
                        //     $Duration: 1000,
                        //     x: -4,
                        //     $Zoom: 11,
                        //     $Rotate: 1,
                        //     $SlideOut: true,
                        //     $Easing: {
                        //         $Left: $JssorEasing$.$EaseInExpo,
                        //         $Zoom: $JssorEasing$.$EaseInExpo,
                        //         $Opacity: $JssorEasing$.$EaseLinear,
                        //         $Rotate: $JssorEasing$.$EaseInExpo
                        //     },
                        //     $Opacity: 2,
                        //     $Round: {
                        //         $Rotate: 0.8
                        //     }
                        // },
                        //Rotate Zoom- in R
                        // {
                        //     $Duration: 1200,
                        //     x: -0.6,
                        //     $Zoom: 1,
                        //     $Rotate: 1,
                        //     $During: {
                        //         $Left: [0.2, 0.8],
                        //         $Zoom: [0.2, 0.8],
                        //         $Rotate: [0.2, 0.8]
                        //     },
                        //     $Easing: {
                        //         $Left: $JssorEasing$.$EaseSwing,
                        //         $Zoom: $JssorEasing$.$EaseSwing,
                        //         $Opacity: $JssorEasing$.$EaseLinear,
                        //         $Rotate: $JssorEasing$.$EaseSwing
                        //     },
                        //     $Opacity: 2,
                        //     $Round: {
                        //         $Rotate: 0.5
                        //     }
                        // },
                        // //Rotate Zoom+ out L
                        // {
                        //     $Duration: 1000,
                        //     x: 4,
                        //     $Zoom: 11,
                        //     $Rotate: 1,
                        //     $SlideOut: true,
                        //     $Easing: {
                        //         $Left: $JssorEasing$.$EaseInExpo,
                        //         $Zoom: $JssorEasing$.$EaseInExpo,
                        //         $Opacity: $JssorEasing$.$EaseLinear,
                        //         $Rotate: $JssorEasing$.$EaseInExpo
                        //     },
                        //     $Opacity: 2,
                        //     $Round: {
                        //         $Rotate: 0.8
                        //     }
                        // },

                        // //Rotate HDouble- in
                        // {
                        //     $Duration: 1200,
                        //     x: 0.5,
                        //     y: 0.3,
                        //     $Cols: 2,
                        //     $Zoom: 1,
                        //     $Rotate: 1,
                        //     $Assembly: 2049,
                        //     $ChessMode: {
                        //         $Column: 15
                        //     },
                        //     $Easing: {
                        //         $Left: $JssorEasing$.$EaseInCubic,
                        //         $Top: $JssorEasing$.$EaseInCubic,
                        //         $Zoom: $JssorEasing$.$EaseInCubic,
                        //         $Opacity: $JssorEasing$.$EaseOutQuad,
                        //         $Rotate: $JssorEasing$.$EaseInCubic
                        //     },
                        //     $Opacity: 2,
                        //     $Round: {
                        //         $Rotate: 0.7
                        //     }
                        // },
                        // //Rotate HDouble- out
                        // {
                        //     $Duration: 1000,
                        //     x: 0.5,
                        //     y: 0.3,
                        //     $Cols: 2,
                        //     $Zoom: 1,
                        //     $Rotate: 1,
                        //     $SlideOut: true,
                        //     $Assembly: 2049,
                        //     $ChessMode: {
                        //         $Column: 15
                        //     },
                        //     $Easing: {
                        //         $Left: $JssorEasing$.$EaseInExpo,
                        //         $Top: $JssorEasing$.$EaseInExpo,
                        //         $Zoom: $JssorEasing$.$EaseInExpo,
                        //         $Opacity: $JssorEasing$.$EaseLinear,
                        //         $Rotate: $JssorEasing$.$EaseInExpo
                        //     },
                        //     $Opacity: 2,
                        //     $Round: {
                        //         $Rotate: 0.7
                        //     }
                        // },
                        // //Rotate VFork in
                        // {
                        //     $Duration: 1200,
                        //     x: -4,
                        //     y: 2,
                        //     $Rows: 2,
                        //     $Zoom: 11,
                        //     $Rotate: 1,
                        //     $Assembly: 2049,
                        //     $ChessMode: {
                        //         $Row: 28
                        //     },
                        //     $Easing: {
                        //         $Left: $JssorEasing$.$EaseInCubic,
                        //         $Top: $JssorEasing$.$EaseInCubic,
                        //         $Zoom: $JssorEasing$.$EaseInCubic,
                        //         $Opacity: $JssorEasing$.$EaseOutQuad,
                        //         $Rotate: $JssorEasing$.$EaseInCubic
                        //     },
                        //     $Opacity: 2,
                        //     $Round: {
                        //         $Rotate: 0.7
                        //     }
                        // },
                        // //Rotate HFork in
                        // {
                        //     $Duration: 1200,
                        //     x: 1,
                        //     y: 2,
                        //     $Cols: 2,
                        //     $Zoom: 11,
                        //     $Rotate: 1,
                        //     $Assembly: 2049,
                        //     $ChessMode: {
                        //         $Column: 19
                        //     },
                        //     $Easing: {
                        //         $Left: $JssorEasing$.$EaseInCubic,
                        //         $Top: $JssorEasing$.$EaseInCubic,
                        //         $Zoom: $JssorEasing$.$EaseInCubic,
                        //         $Opacity: $JssorEasing$.$EaseOutQuad,
                        //         $Rotate: $JssorEasing$.$EaseInCubic
                        //     },
                        //     $Opacity: 2,
                        //     $Round: {
                        //         $Rotate: 0.8
                        //     }
                        // }
                    ];

                    var options = {
                        $AutoPlay: false, //[Optional] Whether to auto play, to enable slideshow, this option must be set to true, default value is false
                        $AutoPlayInterval: 1500, //[Optional] Interval (in milliseconds) to go for next slide since the previous stopped if the slider is auto playing, default value is 3000
                        $PauseOnHover: 1, //[Optional] Whether to pause when mouse over if a slider is auto playing, 0 no pause, 1 pause for desktop, 2 pause for touch device, 3 pause for desktop and touch device, 4 freeze for desktop, 8 freeze for touch device, 12 freeze for desktop and touch device, default value is 1

                        $DragOrientation: 0, //[Optional] Orientation to drag slide, 0 no drag, 1 horizental, 2 vertical, 3 either, default value is 1 (Note that the $DragOrientation should be the same as $PlayOrientation when $DisplayPieces is greater than 1, or parking position is not 0)
                        $ArrowKeyNavigation: true, //[Optional] Allows keyboard (arrow key) navigation or not, default value is false
                        $SlideDuration: 600, //Specifies default duration (swipe) for slide in milliseconds

                        $SlideshowOptions: { //[Optional] Options to specify and enable slideshow or not
                            $Class: $JssorSlideshowRunner$, //[Required] Class to create instance of slideshow
                            $Transitions: _SlideshowTransitions, //[Required] An array of slideshow transitions to play slideshow
                            $TransitionsOrder: 1, //[Optional] The way to choose transition to play slide, 1 Sequence, 0 Random
                            $ShowLink: true //[Optional] Whether to bring slide link on top of the slider when slideshow is running, default value is false
                        },

                        $ArrowNavigatorOptions: { //[Optional] Options to specify and enable arrow navigator or not
                            $Class: $JssorArrowNavigator$, //[Requried] Class to create arrow navigator instance
                            $ChanceToShow: 1, //[Required] 0 Never, 1 Mouse Over, 2 Always
                            $AutoCenter: 2, //[Optional] Auto center navigator in parent container, 0 None, 1 Horizontal, 2 Vertical, 3 Both, default value is 0
                            $Steps: 1 //[Optional] Steps to go for each navigation request, default value is 1
                        },

                        $ThumbnailNavigatorOptions: { //[Optional] Options to specify and enable thumbnail navigator or not
                            $Class: $JssorThumbnailNavigator$, //[Required] Class to create thumbnail navigator instance
                            $ChanceToShow: 2, //[Required] 0 Never, 1 Mouse Over, 2 Always

                            $ActionMode: 1, //[Optional] 0 None, 1 act by click, 2 act by mouse hover, 3 both, default value is 1
                            $Lanes: 2, //[Optional] Specify lanes to arrange thumbnails, default value is 1
                            $SpacingX: 14, //[Optional] Horizontal space between each thumbnail in pixel, default value is 0
                            $SpacingY: 12, //[Optional] Vertical space between each thumbnail in pixel, default value is 0
                            $DisplayPieces: 6, //[Optional] Number of pieces to display, default value is 1
                            $ParkingPosition: 156, //[Optional] The offset position to park thumbnail
                            $Orientation: 2 //[Optional] Orientation to arrange thumbnails, 1 horizental, 2 vertical, default value is 1
                        }
                    };

                    var jssor_slider1 = new $JssorSlider$(element[0], options);
                    //responsive code begin
                    //you can remove responsive code if you don't want the slider scales while window resizes
                    function ScaleSlider() {
                        var parentWidth = jssor_slider1.$Elmt.parentNode.clientWidth;
                        if (parentWidth)
                            jssor_slider1.$ScaleWidth(Math.max(Math.min(parentWidth, 960), 300));
                        else
                            $Jssor$.$Delay(ScaleSlider, 30);
                    }

                    ScaleSlider();
                    $Jssor$.$AddEvent(window, "load", ScaleSlider);
                    $Jssor$.$AddEvent(window, "resize", $Jssor$.$WindowResizeFilter(window, ScaleSlider));
                    $Jssor$.$AddEvent(window, "orientationchange", ScaleSlider);
                    //responsive code end

                }, 1)

            }
        };
    }


})(window.angular);
