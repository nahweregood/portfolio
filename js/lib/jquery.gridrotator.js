(function(jQuery, window, undefined) {
    var $event = jQuery.event,
        $special, resizeTimeout;
    $special = $event.special.debouncedresize = {
        setup: function() {
            jQuery(this).on("resize", $special.handler);
        },
        teardown: function() {
            jQuery(this).off("resize", $special.handler);
        },
        handler: function(event, execAsap) {
            var context = this,
                args = arguments,
                dispatch = function() {
                    event.type = "debouncedresize";
                    $event.dispatch.apply(context, args);
                };
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
            execAsap ? dispatch() : resizeTimeout = setTimeout(dispatch, $special.threshold);
        },
        threshold: 100
    };
    Array.prototype.shuffle = function() {
        var i = this.length,
            p, t;
        while (i--) {
            p = Math.floor(Math.random() * i);
            t = this[i];
            this[i] = this[p];
            this[p] = t;
        }
        return this;
    };

    function getHiddenProp() {
        var prefixes = ["webkit", "moz", "ms", "o"];
        if ("hidden" in document) {
            return "hidden";
        }
        for (var i = 0; i < prefixes.length; i++) {
            if ((prefixes[i] + "Hidden") in document) {
                return prefixes[i] + "Hidden";
            }
        }
        return null;
    }

    function isHidden() {
        var prop = getHiddenProp();
        if (!prop) {
            return false;
        }
        return document[prop];
    }

    function isEmpty(obj) {
        return Object.keys(obj).length === 0;
    }
    var $window = jQuery(window),
        Modernizr = window.Modernizr;
    jQuery.GridRotator = function(options, element) {
        this.$el = jQuery(element);
        if (Modernizr.backgroundsize) {
            var self = this;
            this.$el.addClass("ri-grid-loading");
            this._init(options);
        }
    };
    jQuery.GridRotator.defaults = {
        rows: 2,
        columns: 10,
        w1200: {
            rows:2,
            columns: 10
        },
        w992: {
            rows: 2,
            columns: 6
        },
        w510: {
            rows: 2,
            columns: 4
        },
        w480: {
            rows: 2,
            columns: 3
        },
        w320: {
            rows: 2,
            columns: 2
        },
        w240: {
            rows: 2,
            columns: 2
        },
        step: 5,
        maxStep: 3,
        preventClick: true,
        animType: "random",
        animSpeed: 800,
        animEasingOut: "linear",
        animEasingIn: "linear",
        interval: 3000,
        slideshow: true,
        onhover: false,
        nochange: []
    };
    jQuery.GridRotator.prototype = {
        _init: function(options) {
            this.options = jQuery.extend(true, {}, jQuery.GridRotator.defaults, options);
            this._config();
        },
        _config: function() {
            var self = this,
                transEndEventNames = {
                    WebkitTransition: "webkitTransitionEnd",
                    MozTransition: "transitionend",
                    OTransition: "oTransitionEnd",
                    msTransition: "MSTransitionEnd",
                    transition: "transitionend"
                };
            this.supportTransitions = Modernizr.csstransitions;
            this.supportTransforms3D = Modernizr.csstransforms3d;
            this.transEndEventName = transEndEventNames[Modernizr.prefixed("transition")] + ".gridrotator";
            this.animTypes = this.supportTransforms3D ? ["fadeInOut", "slideLeft", "slideRight", "slideTop", "slideBottom", "rotateLeft", "rotateRight", "rotateTop", "rotateBottom", "scale", "rotate3d", "rotateLeftScale", "rotateRightScale", "rotateTopScale", "rotateBottomScale"] : ["fadeInOut", "slideLeft", "slideRight", "slideTop", "slideBottom"];
            this.animType = this.options.animType;
            if (this.animType !== "random" && !this.supportTransforms3D && jQuery.inArray(this.animType, this.animTypes) === -1 && this.animType !== "showHide") {
                this.animType = "fadeInOut";
            }
            this.animTypesTotal = this.animTypes.length;
            this.$list = this.$el.children("ul");
            var loaded = 0,
                $imgs = this.$list.find("img"),
                count = $imgs.length;
            $imgs.each(function() {
                var $img = jQuery(this),
                    src = $img.attr("src");
                jQuery("<img/>").load(function() {
                    ++loaded;
                    $img.parent().css("background-image", "url(" + src + ")");
                    if (loaded === count) {
                        $imgs.remove();
                        self.$el.removeClass("ri-grid-loading");
                        self.$items = self.$list.children("li");
                        self.$itemsCache = self.$items.clone();
                        self.itemsTotal = self.$items.length;
                        self.outItems = [];
                        self._layout(function() {
                            self._initEvents();
                        });
                        self._start();
                    }
                }).attr("src", src);
            });
        },
        _layout: function(callback) {
            var self = this;
            this._setGridDim();
            this.$list.empty();
            this.$items = this.$itemsCache.clone().appendTo(this.$list);
            var $outItems = this.$items.filter(":gt(" + (this.showTotal - 1) + ")"),
                $outAItems = $outItems.children("span");
            this.outItems.length = 0;
            $outAItems.each(function(i) {
                self.outItems.push(jQuery(this));
            });
            $outItems.remove();
            var containerWidth = (document.defaultView) ? parseInt(document.defaultView.getComputedStyle(this.$el.get(0), null).width) : this.$el.width(),
                itemWidth = Math.floor(containerWidth / this.columns),
                gapWidth = containerWidth - (this.columns * Math.floor(itemWidth));
            for (var i = 0; i < this.rows; ++i) {
                for (var j = 0; j < this.columns; ++j) {
                    var idx = this.columns * i + j,
                        $item = this.$items.eq(idx);
                    $item.css({
                        width: j < Math.floor(gapWidth) ? itemWidth + 1 : itemWidth,
                        height: itemWidth
                    });
                    if (jQuery.inArray(idx, this.options.nochange) !== -1) {
                        $item.addClass("ri-nochange").data("nochange", true);
                    }
                }
            }
            if (this.options.preventClick) {
                this.$items.children().css("cursor", "default").on("click.gridrotator", false);
            }
            if (callback) {
                callback.call();
            }
        },
        _setGridDim: function() {
            var c_w = this.$el.width();
            switch (true) {
                case (c_w < 240):
                    this.rows = this.options.w240.rows;
                    this.columns = this.options.w240.columns;
                    break;
                case (c_w < 320):
                    this.rows = this.options.w320.rows;
                    this.columns = this.options.w320.columns;
                    break;
                case (c_w < 480):
                    this.rows = this.options.w480.rows;
                    this.columns = this.options.w480.columns;
                    break;
                case (c_w < 510):
                    this.rows = this.options.w510.rows;
                    this.columns = this.options.w510.columns;
                    break;
                case (c_w < 992):
                    this.rows = this.options.w992.rows;
                    this.columns = this.options.w992.columns;
                    break;
                case (c_w < 1200):
                    this.rows = this.options.w1200.rows;
                    this.columns = this.options.w1200.columns;
                    break;
                default:
                    this.rows = this.options.rows;
                    this.columns = this.options.columns;
                    break;
            }
            this.showTotal = this.rows * this.columns;
        },
        _initEvents: function() {
            var self = this;
            $window.on("debouncedresize.gridrotator", function() {
                self._layout();
            });
            var visProp = getHiddenProp();
            if (visProp) {
                var evtname = visProp.replace(/[H|h]idden/, "") + "visibilitychange";
                document.addEventListener(evtname, function() {
                    self._visChange();
                });
            }
            if (!Modernizr.touch && this.options.onhover) {
                self.$items.on("mouseenter.gridrotator", function() {
                    var $item = jQuery(this);
                    if (!$item.data("active") && !$item.data("hovered") && !$item.data("nochange")) {
                        $item.data("hovered", true);
                        self._replace($item);
                    }
                }).on("mouseleave.gridrotator", function() {
                    jQuery(this).data("hovered", false);
                });
            }
        },
        _visChange: function() {
            isHidden() ? clearTimeout(this.playtimeout) : this._start();
        },
        _start: function() {
            if (this.showTotal < this.itemsTotal && this.options.slideshow) {
                this._showNext();
            }
        },
        _getAnimType: function() {
            return this.animType === "random" ? this.animTypes[Math.floor(Math.random() * this.animTypesTotal)] : this.animType;
        },
        _getAnimProperties: function($out) {
            var startInProp = {},
                startOutProp = {},
                endInProp = {},
                endOutProp = {},
                animType = this._getAnimType(),
                speed, delay = 0;
            switch (animType) {
                case "showHide":
                    speed = 0;
                    endOutProp.opacity = 0;
                    break;
                case "fadeInOut":
                    endOutProp.opacity = 0;
                    break;
                case "slideLeft":
                    startInProp.left = $out.width();
                    endInProp.left = 0;
                    endOutProp.left = -$out.width();
                    break;
                case "slideRight":
                    startInProp.left = -$out.width();
                    endInProp.left = 0;
                    endOutProp.left = $out.width();
                    break;
                case "slideTop":
                    startInProp.top = $out.height();
                    endInProp.top = 0;
                    endOutProp.top = -$out.height();
                    break;
                case "slideBottom":
                    startInProp.top = -$out.height();
                    endInProp.top = 0;
                    endOutProp.top = $out.height();
                    break;
                case "rotateLeft":
                    speed = this.options.animSpeed / 2;
                    startInProp.transform = "rotateY(90deg)";
                    endInProp.transform = "rotateY(0deg)";
                    delay = speed;
                    endOutProp.transform = "rotateY(-90deg)";
                    break;
                case "rotateRight":
                    speed = this.options.animSpeed / 2;
                    startInProp.transform = "rotateY(-90deg)";
                    endInProp.transform = "rotateY(0deg)";
                    delay = speed;
                    endOutProp.transform = "rotateY(90deg)";
                    break;
                case "rotateTop":
                    speed = this.options.animSpeed / 2;
                    startInProp.transform = "rotateX(90deg)";
                    endInProp.transform = "rotateX(0deg)";
                    delay = speed;
                    endOutProp.transform = "rotateX(-90deg)";
                    break;
                case "rotateBottom":
                    speed = this.options.animSpeed / 2;
                    startInProp.transform = "rotateX(-90deg)";
                    endInProp.transform = "rotateX(0deg)";
                    delay = speed;
                    endOutProp.transform = "rotateX(90deg)";
                    break;
                case "scale":
                    speed = this.options.animSpeed / 2;
                    startInProp.transform = "scale(0)";
                    startOutProp.transform = "scale(1)";
                    endInProp.transform = "scale(1)";
                    delay = speed;
                    endOutProp.transform = "scale(0)";
                    break;
                case "rotateLeftScale":
                    startOutProp.transform = "scale(1)";
                    speed = this.options.animSpeed / 2;
                    startInProp.transform = "scale(0.3) rotateY(90deg)";
                    endInProp.transform = "scale(1) rotateY(0deg)";
                    delay = speed;
                    endOutProp.transform = "scale(0.3) rotateY(-90deg)";
                    break;
                case "rotateRightScale":
                    startOutProp.transform = "scale(1)";
                    speed = this.options.animSpeed / 2;
                    startInProp.transform = "scale(0.3) rotateY(-90deg)";
                    endInProp.transform = "scale(1) rotateY(0deg)";
                    delay = speed;
                    endOutProp.transform = "scale(0.3) rotateY(90deg)";
                    break;
                case "rotateTopScale":
                    startOutProp.transform = "scale(1)";
                    speed = this.options.animSpeed / 2;
                    startInProp.transform = "scale(0.3) rotateX(90deg)";
                    endInProp.transform = "scale(1) rotateX(0deg)";
                    delay = speed;
                    endOutProp.transform = "scale(0.3) rotateX(-90deg)";
                    break;
                case "rotateBottomScale":
                    startOutProp.transform = "scale(1)";
                    speed = this.options.animSpeed / 2;
                    startInProp.transform = "scale(0.3) rotateX(-90deg)";
                    endInProp.transform = "scale(1) rotateX(0deg)";
                    delay = speed;
                    endOutProp.transform = "scale(0.3) rotateX(90deg)";
                    break;
                case "rotate3d":
                    speed = this.options.animSpeed / 2;
                    startInProp.transform = "rotate3d( 1, 1, 0, 90deg )";
                    endInProp.transform = "rotate3d( 1, 1, 0, 0deg )";
                    delay = speed;
                    endOutProp.transform = "rotate3d( 1, 1, 0, -90deg )";
                    break;
            }
            return {
                startInProp: startInProp,
                startOutProp: startOutProp,
                endInProp: endInProp,
                endOutProp: endOutProp,
                delay: delay,
                animSpeed: speed != undefined ? speed : this.options.animSpeed
            };
        },
        _showNext: function(time) {
            var self = this;
            clearTimeout(this.playtimeout);
            this.playtimeout = setTimeout(function() {
                var step = self.options.step,
                    max = self.options.maxStep,
                    min = 1;
                if (max > self.showTotal) {
                    max = self.showTotal;
                }
                var nmbOut = step === "random" ? Math.floor(Math.random() * max + min) : Math.min(Math.abs(step), max),
                    randArr = self._getRandom(nmbOut, self.showTotal);
                for (var i = 0; i < nmbOut; ++i) {
                    var $out = self.$items.eq(randArr[i]);
                    if ($out.data("active") || $out.data("nochange")) {
                        self._showNext(1);
                        return false;
                    }
                    self._replace($out);
                }
                self._showNext();
            }, time || Math.max(Math.abs(this.options.interval), 300));
        },
        _replace: function($out) {
            $out.data("active", true);
            var self = this,
                $outA = $out.children("span:last"),
                newElProp = {
                    width: $outA.width(),
                    height: $outA.height()
                };
            $out.data("active", true);
            var $inA = this.outItems.shift();
            this.outItems.push($outA.clone().css("transition", "none"));
            $inA.css(newElProp).prependTo($out);
            var animProp = this._getAnimProperties($outA);
            $inA.css(animProp.startInProp);
            $outA.css(animProp.startOutProp);
            this._setTransition($inA, "all", animProp.animSpeed, animProp.delay, this.options.animEasingIn);
            this._setTransition($outA, "all", animProp.animSpeed, 0, this.options.animEasingOut);
            this._applyTransition($inA, animProp.endInProp, animProp.animSpeed, function() {
                var $el = jQuery(this),
                    t = animProp.animSpeed === self.options.animSpeed && isEmpty(animProp.endInProp) ? animProp.animSpeed : 0;
                setTimeout(function() {
                    if (self.supportTransitions) {
                        $el.off(self.transEndEventName);
                    }
                    $el.next().remove();
                    $el.parent().data("active", false);
                }, t);
            }, animProp.animSpeed === 0 || isEmpty(animProp.endInProp));
            this._applyTransition($outA, animProp.endOutProp, animProp.animSpeed);
        },
        _getRandom: function(cnt, limit) {
            var randArray = [];
            for (var i = 0; i < limit; ++i) {
                randArray.push(i);
            }
            return randArray.shuffle().slice(0, cnt);
        },
        _setTransition: function(el, prop, speed, delay, easing) {
            setTimeout(function() {
                el.css("transition", prop + " " + speed + "ms " + delay + "ms " + easing);
            }, 25);
        },
        _applyTransition: function(el, styleCSS, speed, fncomplete, force) {
            var self = this;
            setTimeout(function() {
                jQuery.fn.applyStyle = self.supportTransitions ? jQuery.fn.css : jQuery.fn.animate;
                if (fncomplete && self.supportTransitions) {
                    el.on(self.transEndEventName, fncomplete);
                    if (force) {
                        fncomplete.call(el);
                    }
                }
                fncomplete = fncomplete || function() {
                    return false;
                };
                el.stop().applyStyle(styleCSS, jQuery.extend(true, [], {
                    duration: speed + "ms",
                    complete: fncomplete
                }));
            }, 25);
        }
    };
    var logError = function(message) {
        if (window.console) {
            window.console.error(message);
        }
    };
    jQuery.fn.gridrotator = function(options) {
        var instance = jQuery.data(this, "gridrotator");
        if (typeof options === "string") {
            var args = Array.prototype.slice.call(arguments, 1);
            this.each(function() {
                if (!instance) {
                    logError("cannot call methods on gridrotator prior to initialization; attempted to call method '" + options + "'");
                    return;
                }
                if (!jQuery.isFunction(instance[options]) || options.charAt(0) === "_") {
                    logError("no such method '" + options + "' for gridrotator instance");
                    return;
                }
                instance[options].apply(instance, args);
            });
        } else {
            this.each(function() {
                if (instance) {
                    instance._init();
                } else {
                    instance = jQuery.data(this, "gridrotator", new jQuery.GridRotator(options, this));
                }
            });
        }
        return instance;
    };
})(jQuery, window);