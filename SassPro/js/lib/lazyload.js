/**
 * Created by xcar on 2014/4/28.
 */
define("lib/lazyload",function (require, exports, module) {
    var $=require("lib/zepto");
    (function($, window, document, undefined) {
        var $window = $(window);
        $.grep=function( elems, callback, inv ) {
            var retVal,
                ret = [],
                i = 0,
                length = elems.length;
            inv = !!inv;

            // Go through the array, only saving the items
            // that pass the validator function
            for ( ; i < length; i++ ) {
                retVal = !!callback( elems[ i ], i );
                if ( inv !== retVal ) {
                    ret.push( elems[ i ] );
                }
            }

            return ret;
        };
        $.each({
            fadeIn: { opacity: "1"}
        }, function( name, props ) {
            $.fn[ name ] = function( speed, easing, callback ) {
                this.css({display:'block',opacity: "0"});
                return this.animate( props, speed, easing, callback );
            };
        });
        $.fn.lazyload = function(options) {
            var elements = this;
            var $container;
            var settings = {
                threshold       : 0,
                failure_limit   : 0,
                event           : "scroll",
                effect          : "show",
                container       : window,
                data_attribute  : "original",
                data_attribute_retina  : "original-retina",
                skip_invisible  : true,
                appear          : null,
                load            : null,
                placeholder     : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC"
            };

            function update() {
                var counter = 0;

                elements.each(function() {
                    var $this = $(this);
//                if (settings.skip_invisible && !$this.is(":visible")) {
//                    return;
//                }
                    if ($.abovethetop(this, settings) ||
                        $.leftofbegin(this, settings)) {
                        /* Nothing. */
                    } else if (!$.belowthefold(this, settings) &&
                        !$.rightoffold(this, settings)) {
                        $this.trigger("appear");
                        /* if we found an image we'll load, reset the counter */
                        counter = 0;
                    } else {
                        if (++counter > settings.failure_limit) {
                            return false;
                        }
                    }
                });

            }

            if(options) {
                /* Maintain BC for a couple of versions. */
                if (undefined !== options.failurelimit) {
                    options.failure_limit = options.failurelimit;
                    delete options.failurelimit;
                }
                if (undefined !== options.effectspeed) {
                    options.effect_speed = options.effectspeed;
                    delete options.effectspeed;
                }

                $.extend(settings, options);
            }

            /* Cache container as jQuery as object. */
            $container = (settings.container === undefined ||
                settings.container === window) ? $window : $(settings.container);

            /* Fire one scroll event per scroll. Not one scroll event per image. */
            if (0 === settings.event.indexOf("scroll")) {
                $container.bind(settings.event, function() {
                    return update();
                });
            }

            this.each(function() {
                var self = this;
                var $self = $(self);

                self.loaded = false;

                /* If no src attribute given use data:uri. */
                if ($self.attr("src") === undefined || $self.attr("src") === false) {
                    if ($self.is("img")) {
                        $self.attr("src", settings.placeholder);
                    }
                }

                /* When appear is triggered load original image. */
                $self.one("appear", function() {
                    if (!this.loaded) {
                        if (settings.appear) {
                            var elements_left = elements.length;
                            settings.appear.call(self, elements_left, settings);
                        }
                        $("<img />")
                            .bind("load", function() {

                                var original = $self.attr("data-" + settings.data_attribute_retina)||$self.attr("data-" + settings.data_attribute);
                                $self.hide();
                                if ($self.is("img")) {
                                    $self.attr("src", original);
                                } else {
                                    $self.css("background-image", "url('" + original + "')");
                                    $self.css({"background-size":"cover","-webkit-background-size":"cover","-moz-background-size":"cover"});
                                }
                                $self[settings.effect](settings.effect_speed);

                                self.loaded = true;

                                /* Remove image from array so it is not looped next time. */
                                var temp = $.grep(elements, function(element) {
                                    return !element.loaded;
                                });
                                elements = $(temp);

                                if (settings.load) {
                                    var elements_left = elements.length;
                                    settings.load.call(self, elements_left, settings);
                                }
                            })
                            .bind('error',function(){
                                $self.trigger('error');
                            })
                            .attr("src", $self.attr("data-" + settings.data_attribute));
                    }
                });

                /* When wanted event is triggered load original image */
                /* by triggering appear.                              */
                if (0 !== settings.event.indexOf("scroll")) {
                    $self.bind(settings.event, function() {
                        if (!self.loaded) {
                            $self.trigger("appear");
                        }
                    });
                }
            });

            /* Check if something appears when window is resized. */
            $window.bind("resize", function() {
                update();
            });

            /* With IOS5 force loading images when navigating with back button. */
            /* Non optimal workaround. */
            if ((/(?:iphone|ipod|ipad).*os 5/gi).test(navigator.appVersion)) {
                $window.bind("pageshow", function(event) {
                    if (event.originalEvent && event.originalEvent.persisted) {
                        elements.each(function() {
                            $(this).trigger("appear");
                        });
                    }
                });
            }

            /* Force initial check if images should appear. */
            $(document).ready(function() {
                update();
            });

            return this;
        };

        /* Convenience methods in jQuery namespace.           */
        /* Use as  $.belowthefold(element, {threshold : 100, container : window}) */

        $.belowthefold = function(element, settings) {
            var fold;

            if (settings.container === undefined || settings.container === window) {
                fold = (window.innerHeight ? window.innerHeight : $window.height()) + window.scrollY;
                //fold = (window.innerHeight ? window.innerHeight : $window.height()) + $window.scrollTop();
            } else {
                fold = $(settings.container).offset().top + $(settings.container).height();
            }

            return fold <= $(element).offset().top - settings.threshold;
        };

        $.rightoffold = function(element, settings) {
        };

        $.abovethetop = function(element, settings) {
            var fold;

            if (settings.container === undefined || settings.container === window) {
                fold = window.scrollY;
                //fold = $window.scrollTop();
            } else {
                fold = $(settings.container).offset().top;
            }

            return fold >= $(element).offset().top + settings.threshold  + $(element).height();
        };

        $.leftofbegin = function(element, settings) {
        };

        $.inviewport = function(element, settings) {
            return !$.rightoffold(element, settings) && !$.leftofbegin(element, settings) &&
                !$.belowthefold(element, settings) && !$.abovethetop(element, settings);
        };

    })($, window, document);
});