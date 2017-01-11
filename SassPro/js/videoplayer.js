define("videoplayer",["xcarplayer"],function(require, exports, module){
    var xcarplayer=require('xcarplayer')
    require('ext/support');
    require('engine/embed');
    require('engine/flash');    //优先flash
    require('engine/html5');


    return xcarplayer;
});


define("ext/events",[],function(require, exports, module){
    'use strict';
    /* global jQuery */
    /**
     * Mimimal jQuery-like event emitter implementation
     */
    module.exports = function (obj, elem) {
        if (!elem) elem = document.createElement('div'); //In this case we always want to trigger (Custom)Events on dom element
        var handlers = {}, eventArguments = {};

        var listenEvent = function (type, hndlr, disposable) {
            var actualEvent = type.split('.')[0]; //Strip namespace
            var internalHandler = function (ev) {
                if (disposable) {
                    elem.removeEventListener(actualEvent, internalHandler);
                    handlers[type].splice(handlers[type].indexOf(internalHandler), 1);
                }
                var args = [ev].concat(eventArguments[ev.timeStamp + ev.type] || []);
                if (hndlr) hndlr.apply(undefined, args);
            };
            elem.addEventListener(actualEvent, internalHandler);

            //Store handlers for unbinding
            if (!handlers[type]) handlers[type] = [];
            handlers[type].push(internalHandler);
        };

        obj.on = obj.bind = function (typ, hndlr) {
            var types = typ.split(' ');
            types.forEach(function (type) {
                listenEvent(type, hndlr);
            });
            return obj; //for chaining
        };

        obj.one = function (typ, hndlr) {
            var types = typ.split(' ');
            types.forEach(function (type) {
                listenEvent(type, hndlr, true);
            });
            return obj;
        };

        // Function to check if all items in toBeContained array are in the containing array
        var containsAll = function (containing, toBeContained) {
            return toBeContained.filter(function (i) {
                    return containing.indexOf(i) === -1;
                }).length === 0;
        };


        obj.off = obj.unbind = function (typ) {
            var types = typ.split(' ');
            types.forEach(function (type) {
                var typeNameSpaces = type.split('.').slice(1),
                    actualType = type.split('.')[0];
                Object.keys(handlers).filter(function (t) {
                    var handlerNamespaces = t.split('.').slice(1);
                    return (!actualType || t.indexOf(actualType) === 0) && containsAll(handlerNamespaces, typeNameSpaces);
                }).forEach(function (t) {
                    var registererHandlers = handlers[t],
                        actualEvent = t.split('.')[0];
                    registererHandlers.forEach(function (hndlr) {
                        elem.removeEventListener(actualEvent, hndlr);
                        registererHandlers.splice(registererHandlers.indexOf(hndlr), 1);
                    });
                });
            });
            return obj;
        };

        obj.trigger = function (typ, args, returnEvent) {
            if (!typ) return;
            args = (args || []).length ? args || [] : [args];
            var event = document.createEvent('Event'), typStr;
            typStr = typ.type || typ;
            event.initEvent(typStr, false, true);
            if (Object.defineProperty) event.preventDefault = function () {
                Object.defineProperty(this, 'defaultPrevented', {
                    get: function () {
                        return true;
                    }
                });
            };
            eventArguments[event.timeStamp + event.type] = args;
            elem.dispatchEvent(event);
            return returnEvent ? event : obj;
        };
    };


    module.exports.EVENTS = [
        'beforeseek',
        'disable',
        'error',
        'finish',
        'fullscreen',
        'fullscreen-exit',
        'load',
        'mute',
        'pause',
        'progress',
        'ready',
        'resume',
        'seek',
        'speed',
        'stop',
        'unload',
        'volume',
        'boot',
        'shutdown'
    ];
});
define("ext/resolve",["lib/zepto"],function(require, exports, module){
    'use strict';
    var TYPE_RE = /\.(\w{3,4})(\?.*)?$/i,
        extend = require('lib/zepto').extend;

    function parseSource(el) {

        var src = el.attr("src"),
            type = el.attr("type") || "",
            suffix = src.split(TYPE_RE)[1];
        console.log(src.split(TYPE_RE));

        type = type.toLowerCase();
        return extend(el.data(), {src: src, suffix: suffix || type, type: type || suffix});
    }

    function getType(typ) {
        if (/mpegurl/i.test(typ)) return 'application/x-mpegurl';
        return 'video/' + typ;
    }

    /* Resolves video object from initial configuration and from load() method */
    module.exports = function URLResolver() {
        var self = this;

        self.sourcesFromVideoTag = function (videoTag, $) {
            /* global $ */
            var sources = [];
            // initial sources
            $("source", videoTag).each(function () {
                sources.push(parseSource($(this)));
            });

            if (!sources.length && videoTag.length) sources.push(parseSource(videoTag));

            return sources;
        };


        self.resolve = function (video, sources) {
            if (!video) return {sources: sources};

            if (typeof video == 'string') {
                video = {src: video, sources: []};
                video.sources = (sources || []).map(function (source) {
                    var suffix = source.src.split(TYPE_RE)[1];
                    return {type: source.type, src: video.src.replace(TYPE_RE, '.' + suffix + "$2")};
                });
            }

            if (video instanceof Array) {
                video = {
                    sources: video.map(function (src) {
                        if (src.type && src.src) return src;
                        return Object.keys(src).reduce(function (m, typ) {
                            return extend(m, {
                                type: getType(typ),
                                src: src[typ]
                            });
                        }, {});
                    })
                };
            }

            return video;
        };
    };

    module.exports.TYPE_RE = TYPE_RE;
})
define("xcarplayer",["lib/zepto"],function(require, exports, module){
    'use strict';
    var
        $ = require('lib/zepto'),
        extend = $.extend,
        isFunction = $.isFunction,

        events = require('ext/events');

    var instances = [],
        extensions = [];


    var oldHandler = window.onbeforeunload;
    window.onbeforeunload = function (ev) {
        instances.forEach(function (api) {
            //api.unload();
        });
        if (oldHandler) return oldHandler(ev);
    };

    var supportLocalStorage = false;
    try {
        if (typeof window.localStorage == "object") {
            supportLocalStorage = true;
        }
    } catch (ignored) {
    }

    var isSafari = /Safari/.exec(navigator.userAgent) && !/Chrome/.exec(navigator.userAgent),
        m = /(\d+\.\d+) Safari/.exec(navigator.userAgent),
        safariVersion = m ? Number(m[1]) : 100;

    var xcarplayer = module.exports = function (fn, opts, callback) {
        if (isFunction(fn)) return extensions.push(fn);       //fn参数为函数时 判断为插件

        if (instances[fn])return instances[fn];
        if (typeof fn === 'undefined')return instances[0];

        if (typeof fn === 'string') {
            var el = $(fn);
            return xcarplayer(el, opts, callback);
        }
        if (fn.nodeType) {
            return xcarplayer($(fn), opts, callback);
        }

        if (typeof fn == 'object') { // Is an element 单个节点初始化
            if (fn.attr('data-xcarplayer-instance-id')) { // Already xcarplayer instance
                return instances[fn.attr('data-xcarplayer-instance-id')];
            }
            if (!opts) return; // 不能无参数初始化
            return initializePlayer(fn, opts, callback);
        }

    };


    extend(xcarplayer, {

        version: '1.0',

        engines: [],

        conf: {},

        set: function (key, value) {
            if (typeof key === 'string') xcarplayer.conf[key] = value;
            else extend(xcarplayer.conf, key);
        },

        support: {},

        defaults: {

            debug: supportLocalStorage ? !!localStorage.xcarplayerDebug : false,

            // true = forced playback
            disabled: false,

            fullscreen: window == window.top,

            // keyboard shortcuts
            keyboard: true,

            // default aspect ratio
            ratio: 9 / 16,

            adaptiveRatio: false,

            rtmp: 0,

            proxy: 'best',

            live: false,

            swf: "xcarplayer.swf",
            swfHls: "xcarplayerhls.swf",

            speeds: [0.25, 0.5, 1, 1.5, 2],

            tooltip: true,

            mouseoutTimeout: 5000,

            // initial volume level
            volume: !supportLocalStorage ? 1 : localStorage.muted == "true" ? 0 : !isNaN(localStorage.volume) ? localStorage.volume || 1 : 1,

            // http://www.whatwg.org/specs/web-apps/current-work/multipage/the-video-element.html#error-codes
            errors: [

                // video exceptions
                '',
                '视频加载失败',
                '网络错误',
                '无法解码',
                '视频无法找到',

                // player exceptions
                '无法支持视频播放',
                '皮肤未找到',
                '无法找到SWF文件',
                '字幕未找到',
                '直播地址无效',
                'Unsupported video format. Try installing Adobe Flash.'
            ],
            errorUrls: ['', '', '', '', '', '', '', '', '', '',
                'http://get.adobe.com/flashplayer/'
            ],
            playlist: [],

            hlsFix: isSafari && safariVersion < 8

        },
        // Expose utilities for plugins
        //bean: bean,
        common: $,
        extend: extend,
        instances: instances
    });

// keep track of players
    var playerCount = 0;

    var URLResolver = require('ext/resolve');


    function initializePlayer(element, opts, callback) {
        if (opts && opts.embed) opts.embed = extend({}, xcarplayer.defaults.embed, opts.embed);

        var root = element,

            conf = extend({}, xcarplayer.defaults, xcarplayer.conf, opts),
            storage = {},
            lastSeekPosition,
            engine,
            url,
            urlResolver = new URLResolver();
        var wrapper = $('<div class="xplayer"></div>');
        root.append(wrapper)
            .addClass('is-loading');
        root.find('video').appendTo(wrapper)


        try {
            storage = supportLocalStorage ? window.localStorage : storage;
        } catch (e) {
        }

        var isRTL
        /* = (root.currentStyle && root.currentStyle.direction === 'rtl') ||
         (window.getComputedStyle && window.getComputedStyle(root, null) !== null && window.getComputedStyle(root, null).getPropertyValue('direction') === 'rtl');

         if (isRTL) rootClasses.add('is-rtl');*/
        /*** API ***/
        var api = {

            // properties
            conf: conf,
            currentSpeed: 1,
            volumeLevel: conf.muted ? 0 : typeof conf.volume === "undefined" ? storage.volume * 1 : conf.volume,
            video: {},

            // states
            disabled: false,
            finished: false,
            loading: false,
            muted: storage.muted == "true" || conf.muted,
            paused: false,
            playing: false,
            ready: false,
            rtl: isRTL,

            // methods
            load: function (video, callback) {

                if (api.error || api.loading) return;
                api.video = {};

                api.finished = false;

                video = video || conf.clip;
                // resolve URL
                video = extend({}, urlResolver.resolve(video, conf.clip.sources));
                if (api.playing || api.engine) video.autoplay = true;

                var engineImpl = selectEngine(video);
                if (!engineImpl) return api.trigger("error", [api, {code: xcarplayer.support.flashVideo ? 5 : 10}]);
                if (!engineImpl.engineName) throw new Error('engineName property of factory should be exposed');
                if (!api.engine || engineImpl.engineName !== api.engine.engineName) {
                    api.ready = false;
                    if (api.engine) {
                        api.engine.unload();
                        api.conf.autoplay = true;
                    }
                    api.one('ready', function () {
                        engine.volume(api.volumeLevel);
                    });
                    engine = api.engine = engineImpl(api, root);

                }
                extend(video, engine.pick(video.sources.filter(function (source) { // Filter out sources explicitely configured for some other engine
                    if (!source.engine) return true;
                    return source.engine === engine.engineName;
                })));
                if (video.src) {
                    var e = api.trigger('load', [api, video, engine], true);
                    if (!e.defaultPrevented) {
                        engine.load(video);

                        // callback
                        if (isFunction(video)) callback = video;
                        if (callback) api.one("ready", callback);
                    } else {
                        api.loading = false;
                    }
                }

                return api;
            },

            pause: function (fn) {
                if (api.ready && !api.seeking && !api.loading) {
                    engine.pause();
                    api.one("pause", fn);
                }
                return api;
            },

            resume: function () {
                if (1) {
                //if (api.ready && api.paused) {
                    engine.resume();
                    // Firefox (+others?) does not fire "resume" after finish
                    if (api.finished) {
                        api.trigger("resume", [api]);
                        api.finished = false;
                    }
                }

                return api;
            },

            toggle: function () {
                return api.ready ? api.paused ? api.resume() : api.pause() : api.load();
            },

            /*
             seek(1.4)   -> 1.4s time
             seek(true)  -> 10% forward
             seek(false) -> 10% backward
             */
            seek: function (time, callback) {
                if (api.ready && !api.live) {

                    if (typeof time == "boolean") {
                        var delta = api.video.duration * 0.1;
                        time = api.video.time + (time ? delta : -delta);
                    }
                    time = lastSeekPosition = Math.min(Math.max(time, 0), api.video.duration - 0.1).toFixed(1);
                    var ev = api.trigger('beforeseek', [api, time], true);
                    if (!ev.defaultPrevented) {
                        engine.seek(time);
                        if (isFunction(callback)) api.one("seek", callback);
                    } else {
                        api.seeking = false;
                        root.toggleClass('is-seeking', api.seeking); // remove loading indicator
                    }
                }
                return api;
            },

            /*
             seekTo(1) -> 10%
             seekTo(2) -> 20%
             seekTo(3) -> 30%
             ...
             seekTo()  -> last position
             */
            seekTo: function (position, fn) {
                var time = position === undefined ? lastSeekPosition : api.video.duration * 0.1 * position;
                return api.seek(time, fn);
            },

            mute: function (flag, skipStore) {
                if (flag === undefined) flag = !api.muted;
                if (!skipStore) {
                    storage.muted = api.muted = flag;
                    storage.volume = !isNaN(storage.volume) ? storage.volume : conf.volume; // make sure storage has volume
                }
                api.volume(flag ? 0 : storage.volume, true);
                api.trigger("mute", [api, flag]);
                return api;
            },

            volume: function (level, skipStore) {
                if (api.ready) {
                    level = Math.min(Math.max(level, 0), 1);
                    if (!skipStore) storage.volume = level;
                    engine.volume(level);
                }

                return api;
            },

            speed: function (val, callback) {

                if (api.ready) {

                    // increase / decrease
                    if (typeof val == "boolean") {
                        val = conf.speeds[conf.speeds.indexOf(api.currentSpeed) + (val ? 1 : -1)] || api.currentSpeed;
                    }

                    engine.speed(val);
                    if (callback) root.one("speed", callback);
                }

                return api;
            },


            stop: function () {
                if (api.ready) {
                    api.pause();
                    api.seek(0, function () {
                        api.trigger("stop", [api]);
                    });
                }
                return api;
            },

            unload: function () {
                api.trigger("unload", [api]);
                if (engine) {
                    engine.unload();
                    api.engine = engine = 0;
                }
                return api;
            },

            shutdown: function () {
                api.unload();
                api.trigger('shutdown', [api]);
                //bean.off(root);
                root.off();
                delete instances[root.attr('data-xcarplayer-instance-id')];
                root.removeAttr('data-xcarplayer-instance-id');
            },

            disable: function (flag) {
                if (flag === undefined) flag = !api.disabled;

                if (flag != api.disabled) {
                    api.disabled = flag;
                    api.trigger("disable", flag);
                }
                return api;
            }

        };

        api.conf = extend(api.conf, conf);

        /* event binding / unbinding */
        events(api);

        var selectEngine = function (clip) {
            var engine;
            var engines = xcarplayer.engines;
            if (conf.engine) {
                var eng = engines.filter(function (e) {
                    return e.engineName === conf.engine;
                })[0];
                if (eng && clip.sources.some(function (source) {
                        if (source.engine && source.engine !== eng.engineName) return false;
                        return eng.canPlay(source.type, api.conf);
                    })) return eng;
            }
            if (conf.enginePreference) engines = xcarplayer.engines.filter(function (one) {
                return conf.enginePreference.indexOf(one.engineName) > -1;
            }).sort(function (a, b) {
                return conf.enginePreference.indexOf(a.engineName) - conf.enginePreference.indexOf(b.engineName);
            });
            clip.sources.some(function (source) {
                var eng = engines.filter(function (engine) {
                    if (source.engine && source.engine !== engine.engineName) return false;
                    return engine.canPlay(source.type, api.conf);
                }).shift();
                /*
                * 所有播放器都不过直接返回html5播放器
                * */

                if (eng) {
                    engine = eng
                }else{
                    engine=engines[engines.length-1]
                }
                return !!eng;
            });
            return engine;
        };

        /*** Behaviour ***/
        if (!root.attr('data-xcarplayer-instance-id')) { // Only bind once
            root.attr('data-xcarplayer-instance-id', playerCount);
            api.id = playerCount;
            playerCount++;
            api.on('boot', function () {


                root.find('video').remove();

                if (conf.live || root.hasClass('is-live')) {
                    api.live = conf.live = true;
                    root.addClass('is-live');
                }

                // extensions
                extensions.forEach(function (e) {
                    e(api, root);
                });

                // instances
                instances.push(api);
                // start
                api.load();
                // disabled
                if (conf.disabled) api.disable();

                // initial callback
                api.one("ready", callback);


            }).on("load", function (e, api, video) {



                // loading
                root.addClass("is-loading");
                api.loading = true;

                if (typeof video.live !== 'undefined') {
                    root.toggleClass('is-live', video.live);
                    api.live = video.live;
                }


            }).on("ready", function (e, api, video) {
                video.time = 0;
                api.video = video;

                root.removeClass("is-loading");
                api.loading = false;

                // saved state
                if (api.muted) api.mute(true, true);
                else api.volume(api.volumeLevel);


                var hlsFix = api.conf.hlsFix && /mpegurl/i.exec(video.type);
                root.toggleClass('hls-fix', !!hlsFix);

            }).on("unload", function (e) {
                root
                    .removeClass("is-loading")
                    .removeClass("is-paused")
                    .removeClass("is-played");
                api.loading = false;


            }).on("ready unload", function (e) {
                var is_ready = e.type == "ready";
                root.toggleClass('is-ready', is_ready);
                api.ready = is_ready;


            }).on("progress", function (e, api, time) {
                api.video.time = time;


            }).on("speed", function (e, api, val) {
                api.currentSpeed = val;

            }).on("volume", function (e, api, level) {
                api.volumeLevel = Math.round(level * 100) / 100;
                if (!api.muted) storage.volume = level;
                else if (level) api.mute(false);


            }).on("beforeseek seek", function (e) {
                api.seeking = e.type == "beforeseek";
                root.toggleClass('is-seeking', api.seeking);

            }).on("ready pause resume unload finish stop", function (e, _api, video) {
                // PAUSED: pause / finish
                api.paused = /pause|finish|unload|stop/.test(e.type);
                api.paused = api.paused || e.type === 'ready' && !conf.autoplay && !api.playing;

                // the opposite
                api.playing = !api.paused;

                // CSS classes
                root.toggleClass('is-paused', api.paused);
                root.toggleClass('is-playing', api.playing);

                // sanity check
                //if (!api.load.ed) api.pause();

            }).on("finish", function (e) {
                api.finished = true;

            }).on("error", function () {
            });
        }

        // boot
        api.trigger('boot', [api, root]);
        return api;
    }
});
define("ext/support",["lib/zepto","xcarplayer"],function(require, exports, module){
    'use strict';
    /* global ActiveXObject */
    var xcarplayer = require('xcarplayer'),
        extend = require('lib/zepto').extend;
    (function () {

        var parseIpadVersion = function (UA) {
            var e = /Version\/(\d\.\d)/.exec(UA);
            if (e && e.length > 1) {
                return parseFloat(e[1], 10);
            }
            return 0;
        };

        var createVideoTag = function () {
            var videoTag = document.createElement('video');
            videoTag.loop = true;
            videoTag.autoplay = true;
            videoTag.preload = true;
            return videoTag;
        };

        var b = {},
            ua = navigator.userAgent.toLowerCase(),
            match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
                /(safari)[ \/]([\w.]+)/.exec(ua) ||
                /(webkit)[ \/]([\w.]+)/.exec(ua) ||
                /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
                /(msie) ([\w.]+)/.exec(ua) ||
                ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) || [];

        if (match[1]) {
            b[match[1]] = true;
            b.version = match[2] || "0";
        }

        var video = createVideoTag(),
            UA = navigator.userAgent,
            IS_IE = b.msie || /Trident\/7/.test(UA),
            IS_IPAD = /iPad|MeeGo/.test(UA) && !/CriOS/.test(UA),
            IS_IPAD_CHROME = /iPad/.test(UA) && /CriOS/.test(UA),
            IS_IPHONE = /iP(hone|od)/i.test(UA) && !/iPad/.test(UA) && !/IEMobile/i.test(UA),
            IS_ANDROID = /Android/.test(UA) && !/Firefox/.test(UA),
            IS_ANDROID_FIREFOX = /Android/.test(UA) && /Firefox/.test(UA),
            IS_SILK = /Silk/.test(UA),
            IS_WP = /IEMobile/.test(UA),
            WP_VER = IS_WP ? parseFloat(/Windows\ Phone\ (\d+\.\d+)/.exec(UA)[1], 10) : 0,
            IE_MOBILE_VER = IS_WP ? parseFloat(/IEMobile\/(\d+\.\d+)/.exec(UA)[1], 10) : 0,
            IPAD_VER = IS_IPAD ? parseIpadVersion(UA) : 0,
            ANDROID_VER = IS_ANDROID ? parseFloat(/Android\ (\d\.\d)/.exec(UA)[1], 10) : 0,
            s = extend(xcarplayer.support, {

                browser: b,
                subtitles: !!video.addTextTrack,
                fullscreen: typeof document.webkitCancelFullScreen == 'function' && !/Mac OS X 10_5.+Version\/5\.0\.\d Safari/.test(UA) ||
                document.mozFullScreenEnabled ||
                typeof document.exitFullscreen == 'function' ||
                typeof document.msExitFullscreen == 'function',
                inlineBlock: !(IS_IE && b.version < 8),
                touch: ('ontouchstart' in window),
                dataload: !IS_IPAD && !IS_IPHONE && !IS_WP,
                zeropreload: !IS_IE && !IS_ANDROID, // IE supports only preload=metadata
                volume: !IS_IPAD && !IS_ANDROID && !IS_IPHONE && !IS_SILK && !IS_IPAD_CHROME,
                cachedVideoTag: !IS_IPAD && !IS_IPHONE && !IS_IPAD_CHROME && !IS_WP,
                firstframe: !IS_IPHONE && !IS_IPAD && !IS_ANDROID && !IS_SILK && !IS_IPAD_CHROME && !IS_WP && !IS_ANDROID_FIREFOX,
                inlineVideo: !IS_IPHONE && (!IS_WP || (WP_VER >= 8.1 && IE_MOBILE_VER >= 11)) && (!IS_ANDROID || ANDROID_VER >= 3),
                hlsDuration: !IS_ANDROID && (!b.safari || IS_IPAD || IS_IPHONE || IS_IPAD_CHROME),
                seekable: !IS_IPAD && !IS_IPAD_CHROME
            });

        // flashVideo
        try {
            var plugin = navigator.plugins["Shockwave Flash"],
                ver = IS_IE ? new ActiveXObject("ShockwaveFlash.ShockwaveFlash").GetVariable('$version') : plugin.description;
            if (!IS_IE && !plugin[0].enabledPlugin) s.flashVideo = false;
            else {

                ver = ver.split(/\D+/);
                if (ver.length && !ver[0]) ver = ver.slice(1);

                s.flashVideo = ver[0] > 9 || ver[0] == 9 && ver[3] >= 115;
            }

        } catch (ignored) {
        }
        try {
            s.video = !!video.canPlayType;
            if (s.video) video.canPlayType('video/mp4');
        } catch (e) {
            s.video = false;
        }

        // animation
        s.animation = (function () {
            var vendors = ['', 'Webkit', 'Moz', 'O', 'ms', 'Khtml'], el = document.createElement('p');

            for (var i = 0; i < vendors.length; i++) {
                if (typeof el.style[vendors[i] + 'AnimationName'] !== 'undefined') return true;
            }
        })();


    })();

});
define("engine/embed",["lib/zepto"],function(require, exports, module){
    'use strict';
    var common = require('lib/zepto');

// movie required in opts
    module.exports = function embed(swf, flashvars, wmode, bgColor) {
        wmode = wmode || "opaque";

        var id = "obj" + ("" + Math.random()).slice(2, 15),
            tag = '<object class="x-engine" id="' + id + '" name="' + id + '" ',
            msie = navigator.userAgent.indexOf('MSIE') > -1;

        tag += msie ? 'classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000">' :
        ' data="' + swf + '" type="application/x-shockwave-flash">';

        var opts = {
            width: "100%",
            height: "100%",
            allowscriptaccess: "always",
            wmode: wmode,
            quality: "high",
            flashvars: "",

            // https://github.com/flowplayer/flowplayer/issues/13#issuecomment-9369919
            movie: swf + (msie ? "?" + id : ""),
            name: id
        };

        if (wmode !== 'transparent') opts.bgcolor = bgColor || '#000000';

        // flashvars
        Object.keys(flashvars).forEach(function (key) {
            opts.flashvars += key + "=" + flashvars[key] + "&";
        });

        // parameters
        Object.keys(opts).forEach(function (key) {
            tag += '<param name="' + key + '" value="' + opts[key] + '"/>';
        });

        tag += "</object>";
        return common(tag);

    };


// Flash is buggy allover
    if (window.attachEvent) {
        window.attachEvent("onbeforeunload", function () {
            window.__flash_savedUnloadHandler = window.__flash_unloadHandler = function () {
            };
        });
    }
});

define("engine/flash",["xcarplayer","lib/zepto","engine/embed"],function(require, exports, module){
    'use strict';
    var xcarplayer = require('xcarplayer'),
        $ = require('lib/zepto'),
        embed = require('engine/embed'),
        extend = $.extend,
        engineImpl;

    engineImpl = function flashEngine(player, root) {
        var conf = player.conf,
            video = player.video,
            loadVideo,
            callbackId,
            objectTag,
            api;

        var win = window;

        var engine = {
            engineName: engineImpl.engineName,

            pick: function (sources) {

                var source = extend({}, (function () {
                    if (xcarplayer.support.flashVideo) {
                        var selectedSource;
                        for (var i = 0, source; i < sources.length; i++) {
                            source = sources[i];
                            if (/mp4|flv|flash/i.test(source.type)) selectedSource = source;
                            if (player.conf.swfHls && /mpegurl/i.test(source.type)) selectedSource = source;
                            if (selectedSource && !/mp4/i.test(selectedSource.type)) return selectedSource;
                            // Did not find any source or source was video/mp4, let's try find more
                        }
                        return selectedSource; // Accept the fact we don't have anything or just an MP4
                    }
                })());

                if (!source) return;
                if (source.src && !isAbsolute(source.src) && !player.conf.rtmp && !source.rtmp) source.src = createAbsoluteUrl(source.src);
                return source;
            },

            load: function (video) {
                loadVideo = video;

                function escapeURL(url) {
                    return url.replace(/&amp;/g, '%26').replace(/&/g, '%26').replace(/=/g, '%3D');
                }

                var html5Tag = root.find('video'),
                    url = video.src,
                    is_absolute = isAbsolute(url);
                var removeTag = function () {
                    html5Tag.remove();
                };
                var hasSupportedSource = function (sources) {
                    return sources.some(function (src) {
                        return !!html5Tag[0].canPlayType(src.type);
                    });
                };
                if (xcarplayer.support.video &&
                    html5Tag.prop('autoplay') &&
                    hasSupportedSource(video.sources)) {
                    html5Tag.one('timeupdate', removeTag);
                    //bean.one(html5Tag, 'timeupdate', removeTag);
                }
                else {
                    removeTag();
                }

                // convert to absolute
                var rtmp = video.rtmp || conf.rtmp;
                if (!is_absolute && !rtmp) url = createAbsoluteUrl(url);

                if (api && isHLS(video) && api.data !== conf.swfHls) engine.unload();

                if (api) {
                    ['live', 'preload', 'loop'].forEach(function (prop) {
                        if (!video.hasOwnProperty(prop)) return;
                        api.__set(prop, video[prop]);
                    });
                    Object.keys(video.flashls || {}).forEach(function (key) {
                        api.__set('hls_' + key, video.flashls[key]);
                    });
                    var providerChangeNeeded = false;
                    if (!is_absolute && rtmp) api.__set('rtmp', rtmp.url || rtmp);
                    else {
                        var oldRtmp = api.__get('rtmp');
                        providerChangeNeeded = !!oldRtmp;
                        api.__set('rtmp', null);
                    }
                    api.__play(url, providerChangeNeeded || video.rtmp && video.rtmp !== conf.rtmp);

                } else {

                    callbackId = "fpCallback" + ("" + Math.random()).slice(3, 15);
                    url = escapeURL(url);

                    var opts = {
                        hostname: conf.embedded ? gethostname(conf.hostname) : gethostname(location.hostname),
                        url: url,
                        callback: callbackId
                    };
                    if (root.attr('data-origin')) {
                        opts.origin = root.attr('data-origin');
                    }

                    // optional conf
                    ['proxy', 'key', 'autoplay', 'preload', 'subscribe', 'live', 'loop', 'debug', 'splash', 'poster', 'rtmpt'].forEach(function (key) {
                        if (conf.hasOwnProperty(key)) opts[key] = conf[key];
                        if (video.hasOwnProperty(key)) opts[key] = video[key];
                        if ((conf.rtmp || {}).hasOwnProperty(key)) opts[key] = (conf.rtmp || {})[key];
                        if ((video.rtmp || {}).hasOwnProperty(key)) opts[key] = (video.rtmp || {})[key];
                    });
                    if (conf.rtmp) opts.rtmp = conf.rtmp.url || conf.rtmp;
                    if (video.rtmp) opts.rtmp = video.rtmp.url || video.rtmp;
                    Object.keys(video.flashls || {}).forEach(function (key) {
                        var val = video.flashls[key];
                        opts['hls_' + key] = val;
                    });
                    // bufferTime might be 0
                    if (conf.bufferTime !== undefined) opts.bufferTime = conf.bufferTime;

                    if (is_absolute) delete opts.rtmp;

                    // issues #376
                    if (opts.rtmp) {
                        opts.rtmp = escapeURL(opts.rtmp);
                    }

                    // issues #733, 906
                    var bgColor = conf.bgcolor || root.css('background-color') || '', bg;
                    if (bgColor.indexOf('rgb') === 0) {
                        bg = toHex(bgColor);
                    } else if (bgColor.indexOf('#') === 0) {
                        bg = toLongHex(bgColor);
                    }

                    // issues #387
                    opts.initialVolume = player.volumeLevel;

                    var swfUrl = isHLS(video) ? conf.swfHls : conf.swf;

                    api = embed(swfUrl, opts, conf.wmode, bg)[0];
                    var container = root.find('.xplayer');

                    container.prepend(api);

                    // throw error if no loading occurs
                    setTimeout(function () {
                        try {
                            if (!api.PercentLoaded()) {
                                return player.trigger("error", [player, {code: 7, url: conf.swf}]);
                            }
                        } catch (e) {
                        }
                    }, 5000);

                    // detect disabled flash
                    setTimeout(function () {
                        if (typeof api.PercentLoaded === 'undefined') {
                            player.trigger('flashdisabled', [player]);
                        }
                    }, 1000);

                    player.off('resume.flashhack').on('resume.flashhack', function () {
                        var timer = setTimeout(function () {
                            if (player.playing) {
                                player.trigger('flashdisabled', [player]);
                            }
                        }, 1000);
                        player.one('progress', function () {
                            clearTimeout(timer);
                        });
                    });


                    api.pollInterval = setInterval(function () {
                        if (!api) return;
                        var status = api.__status ? api.__status() : null;

                        if (!status) return;

                        if (player.playing && status.time && status.time !== player.video.time) player.trigger("progress", [player, status.time]);

                        video.buffer = status.buffer / video.bytes * video.duration;
                        player.trigger("buffer", [player, video.buffer]);
                        if (!video.buffered && status.time > 0) {
                            video.buffered = true;
                            player.trigger("buffered", [player]);
                        }

                    }, 250);

                    // listen
                    window[callbackId] = function (type, arg) {
                        var video = loadVideo;

                        if (conf.debug) {
                            if (type.indexOf('debug') === 0 && arg && arg.length) {
                                console.log.apply(console, ['-- ' + type].concat(arg));
                            }
                            else console.log("--", type, arg);
                        }

                        var event = {
                            type: type
                        };

                        switch (type) {

                            // RTMP sends a lot of finish events in vain
                            // case "finish": if (conf.rtmp) return;
                            case "ready":
                                arg = extend(video, arg);
                                break;
                            case "click":
                                event.flash = true;
                                break;
                            case "keydown":
                                event.which = arg;
                                break;
                            case "seek":
                                video.time = arg;
                                break;
                            case "status":
                                player.trigger("progress", [player, arg.time]);

                                if (arg.buffer < video.bytes && !video.buffered) {
                                    video.buffer = arg.buffer / video.bytes * video.duration;
                                    player.trigger("buffer", video.buffer);
                                } else if (!video.buffered) {
                                    video.buffered = true;
                                    player.trigger("buffered");
                                }

                                break;
                        }
                        if (type === 'click' || type === 'keydown') {
                            event.target = root;
                            $(root).trigger(type, [event])
                            //bean.fire(root, type, [event]);
                        }
                        else if (type != 'buffered' && type !== 'unload') {
                            // add some delay so that player is truly ready after an event
                            setTimeout(function () {
                                player.trigger(event, [player, arg]);
                            }, 1);
                        } else if (type === 'unload') {
                            player.trigger(event, [player, arg]);
                        }

                    };

                }

            },

            // not supported yet
            speed: $.noop,


            unload: function () {
                if (api && api.__unload) api.__unload();
                try {
                    if (callbackId && window[callbackId])delete window[callbackId];
                } catch (e) {
                }
                root.find("object,.xplayer").remove();
                api = 0;
                clearInterval(api.pollInterval);
            }

        };

        ['pause', 'resume', 'seek', 'volume'].forEach(function (name) {

            engine[name] = function (arg) {
                try {
                    if (player.ready) {
                        if (arg === undefined) {
                            api["__" + name]();

                        } else {
                            api["__" + name](arg);
                        }

                    }
                } catch (e) {
                    if (typeof api["__" + name] === 'undefined') { //flash lost it's methods
                        return player.trigger('flashdisabled', [player]);
                    }
                    throw e;
                }
            };

        });

        function toHex(bg) {
            function hex(x) {
                return ("0" + parseInt(x).toString(16)).slice(-2);
            }

            bg = bg.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            if (!bg) return;

            return '#' + hex(bg[1]) + hex(bg[2]) + hex(bg[3]);
        }

        function toLongHex(bg) {
            if (bg.length === 7) return bg;
            var a = bg.split('').slice(1);
            return '#' + a.map(function (i) {
                    return i + i;
                }).join('');
        }

        function isHLS(video) {
            return /application\/x-mpegurl/i.test(video.type);
        }

        return engine;

    };


    engineImpl.engineName = 'flash';
    engineImpl.canPlay = function (type, conf) {
        return xcarplayer.support.flashVideo && /video\/(mp4|flash|flv)/i.test(type) || xcarplayer.support.flashVideo && conf.swfHls && /mpegurl/i.test(type);
    };
    xcarplayer.engines.push(engineImpl);


    function isAbsolute(url) {
        return /^https?:/.test(url);
    }

    function createAbsoluteUrl(url) {
        return $('<a href="' + url + '"></a>').attr('href'); // This won't work on IE7
    }

    function gethostname(host) {
        return window.location.hostname;
    }
});
define("engine/html5",["xcarplayer","lib/zepto"],function(require, exports, module){
    'use strict';
    var xcarplayer = require('xcarplayer'),
        $ = require('lib/zepto'),
        extend = $.extend;
    var VIDEO = document.createElement('video');

// HTML5 --> Flowplayer event
    var EVENTS = {

        // fired
        ended: 'finish',
        pause: 'pause',
        play: 'resume',
        progress: 'buffer',
        timeupdate: 'progress',
        durationchange:'progress',
        volumechange: 'volume',
        ratechange: 'speed',
        //seeking: 'beforeseek',
        seeked: 'seek',
        // abort: 'resume',

        // not fired
        loadeddata: 'ready',
        loadedmetadata: 'loadedmetadata',
        // canplay: 0,

        // error events
        // load: 0,
        // emptied: 0,
        // empty: 0,
        error: 'error',
        dataunavailable: 'error',
        webkitendfullscreen: 'pause'

    };

    function round(val, per) {
        per = per || 100;
        return Math.round(val * per) / per;
    }

    function getType(type) {
        return /mpegurl/i.test(type) ? "application/x-mpegurl" : type;
    }

    function canPlay(type) {
        if (!/^(video|application)/i.test(type))
            type = getType(type);
        return !!VIDEO.canPlayType(type).replace("no", '');
    }

    function findFromSourcesByType(sources, type) {
        var arr = sources.filter(function (s) {
            return s.type === type;
        });
        return arr.length ? arr[0] : null;
    }

    var videoTagCache;
    var createVideoTag = function (video, autoplay, preload, useCache) {
        if (typeof autoplay === 'undefined') autoplay = true;
        if (typeof preload === 'undefined') preload = 'none';
        if (typeof useCache === 'undefined') useCache = true;
        if (useCache && videoTagCache) {
            videoTagCache.type = getType(video.type);
            videoTagCache.src = video.src;
            $(videoTagCache).find('track').remove();
            videoTagCache.removeAttribute('crossorigin');
            return videoTagCache;
        }
        var el = document.createElement('video');
        el.src = video.src;
        el.type = getType(video.type);
        el.className = 'x-engine';
        el.autoplay = autoplay ? 'autoplay' : false;
        el.preload = preload;
        el.setAttribute('x-webkit-airplay', 'allow');
        el.setAttribute('webkit-playsinline', 'webkit-playsinline');
        el.style.display = 'none';
        if (useCache) videoTagCache = el;
        return el;
    };

    var engine;
    engine = function (player, root) {
        var
            api,
            support = xcarplayer.support,
            conf = player.conf,
            self,
            timer,
            volumeLevel;
        /*jshint -W093 */
        return self = {
            engineName: engine.engineName,

            pick: function (sources) {
                var source = (function () {
                    if (support.video) {
                        if (conf.videoTypePreference) {
                            var mp4source = findFromSourcesByType(sources, conf.videoTypePreference);
                            if (mp4source) return mp4source;
                        }
                        if(sources.length>1){
                            for (var i = 0, source; i < sources.length; i++) {
                                if (canPlay(sources[i].type)) return sources[i];
                            }
                        }else{
                            return sources[0]
                        }

                    }
                })();
                if (!source) return;
                if (typeof source.src === 'string') source.src = createAbsoluteUrl(source.src);
                return source;
            },

            load: function (video) {
                var container = root.find('.xplayer');
                api = createVideoTag(video, !!video.autoplay || !!conf.autoplay, conf.clip.preload||'meta', false);
                container.html(api);
                //TODO subtitles support
                // IE does not fire delegated timeupdate events
                $(api).off('timeupdate', $.noop);
                $(api).on('timeupdate', $.noop);

                $(api).prop('loop', !!(video.loop || conf.loop));

                if (typeof volumeLevel !== 'undefined') {
                    api.volume = volumeLevel;
                }

                if (player.video.src && video.src != player.video.src || video.index) $(api).attr('autoplay', 'autoplay');

                self._listeners = listen(api, video);

                // iPad (+others?) demands load()
                if (conf.clip.preload != 'none' && video.type != "mpegurl" || !support.zeropreload || !support.dataload) api.load();
                if (api.paused && (video.autoplay || conf.autoplay)) api.play();
            },

            pause: function () {
                api.pause();
            },

            resume: function () {
                if(api.style.display=='none'){
                    //api.load();
                }
                api.style.display = 'block';
                api.play();
            },

            speed: function (val) {
                api.playbackRate = val;
            },

            seek: function (time) {
                try {
                    var pausedState = player.paused;
                    api.currentTime = time;
                    if (pausedState) api.pause();
                } catch (ignored) {
                }
            },

            volume: function (level) {
                volumeLevel = level;
                if (api) {
                    api.volume = level;
                }
            },

            unload: function () {
                root.find('video.x-engine,.xplayer').remove();
                if (!support.cachedVideoTag) videoTagCache = null;
                timer = clearInterval(timer);
                var instanceId = root.attr('data-xcarplayer-instance-id');
                delete api.listeners[instanceId];
                api = 0;
                if (self._listeners) Object.keys(self._listeners).forEach(function (typ) {
                    self._listeners[typ].forEach(function (l) {
                        root[0].removeEventListener(typ, l, true);
                    });
                });
            }

        };

        function listen(api, video) {
            // listen only once
            var instanceId = root.attr('data-xcarplayer-instance-id');
            if (api.listeners && api.listeners.hasOwnProperty(instanceId)) {
                api.listeners[instanceId] = video;
                return;
            }
            (api.listeners || (api.listeners = {}))[instanceId] = video;

            $(api).on('error', function (e) {
                try {
                    /*if (canPlay(e.target.getAttribute('type'))) {
                        player.trigger("error", [player, {
                            code: 4,
                            video: extend(video, {src: api.src, url: api.src})
                        }]);
                    }*/
                } catch (er) {
                    // Most likely: https://bugzilla.mozilla.org/show_bug.cgi?id=208427
                }
            });

            player.on('shutdown', function () {
                $(api).off();
            });

            var eventListeners = {};
            Object.keys(EVENTS).forEach(function (type) {
                var flow = EVENTS[type];
                if (!flow) return;
                var l = function (e) {
                    video = api.listeners[instanceId];
                    if (!e.target || !$(e.target).hasClass('x-engine')) return;

                    if (conf.debug && !/progress/.test(flow)) console.log(type, "->", flow, e);
                    // no events if player not ready
                    if (!player.ready && /buffer/.test(flow)) {
                        flow = 'ready';
                    }

                    if (!player.ready && !/ready|error/.test(flow) || !flow || !root.find('video').length) {
                        return;
                    }

                    var arg, vtype;



                    var triggerEvent = function () {
                        player.trigger(flow, [player, arg]);
                    };
                    //if(api.duration&&isNaN(+video.duration)){
                    if($.isNumeric(video.duration)){
                        video.duration=Math.max(video.duration,api.duration);
                    }else{
                        video.duration= api.duration&&api.duration
                    }

                    switch (flow) {

                        case "ready":

                            arg = extend(video, {
                                duration: api.duration&&api.duration,
                                width: api.videoWidth,
                                height: api.videoHeight,
                                url: api.currentSrc,
                                src: api.currentSrc
                            });
                            try {
                                arg.seekable = !player.live && /mpegurl/i.test(video ? (video.type || '') : '') && api.duration || api.seekable && api.seekable.end(null);

                            } catch (ignored) {
                            }

                            // buffer
                            timer = timer || setInterval(function () {

                                    try {
                                        arg.buffer = api.buffered.end(null);

                                    } catch (ignored) {
                                    }

                                    if (arg.buffer) {
                                        if (round(arg.buffer, 1000) < round(arg.duration, 1000) && !arg.buffered) {
                                            player.trigger("buffer", e);

                                        } else if (!arg.buffered) {
                                            arg.buffered = true;
                                            player.trigger("buffer", e).trigger("buffered", e);
                                            clearInterval(timer);
                                            timer = 0;
                                        }
                                    }

                                }, 250);
                            break;
                        case "loadedmetadata":
                            break;

                        case "progress":
                        case "seek":

                            //video.duration=api.duration

                            var dur = player.video.duration;
                            if (api.currentTime > 0 || player.live) {
                                arg = Math.max(api.currentTime, 0);

                            } else if (flow == 'progress') {
                                return;
                            }
                            break;


                        case "speed":
                            arg = round(api.playbackRate);
                            break;

                        case "volume":
                            arg = round(api.volume);
                            break;

                        case "error":
                            try {
                                arg = (e.srcElement || e.originalTarget).error;
                                arg.video = extend(video, {src: api.src, url: api.src});
                            } catch (er) {
                                // Most likely https://bugzilla.mozilla.org/show_bug.cgi?id=208427
                                return;
                            }
                    }

                    triggerEvent();


                };
                api.addEventListener(type, l, true);
                if (!eventListeners[type]) eventListeners[type] = [];
                eventListeners[type].push(l);

            });
            return eventListeners;

        }

    };


    engine.canPlay = function (type) {
        return xcarplayer.support.video && canPlay(type);
    };

    engine.engineName = 'html5';

    xcarplayer.engines.push(engine);


    function isAbsolute(url) {
        return /^https?:/.test(url);
    }

    function createAbsoluteUrl(url) {
        return $('<a href="' + url + '"></a>').attr('href'); // This won't work on IE7
    }

    function gethostname(host) {
        return window.location.hostname;
    }
});