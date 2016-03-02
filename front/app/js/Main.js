(function(){

    var $doms = {};

    "use strict";
    var _p = window.Main =
    {
        localSettings:
        {
            fb_appid: "1124585734259271",
            //socketUrl: "ws://219.85.64.49:3005"
            socketUrl: "ws://local.savorks.com:3005"
        },
        settings:
        {
            //socketUrl: "ws://local.savorks.com:3005",
            socketUrl: "ws://219.85.64.49:3005",

            fb_appid: "1120712347979943",
            fbPermissions: ['publish_actions'],

            apiPath: "http://www.ozo-studio.com/marieclaire/20160303/",

            currentView:
            {
                width: 0,
                height: 0,
                mobileWidth: 480,
                modeIndex: -1,
                modeChanged: false
            }
        },
        init: function()
        {
            if( window.location.host == "local.savorks.com" || window.location.host == "socket.savorks.com")
            {
                var key;
                for(key in _p.localSettings)
                {
                    _p.settings[key] = _p.localSettings[key];
                }
            }

            _p.settings.isIE = msieversion() !== false;

            _p.settings.isiOsChrom = navigator.userAgent.match('CriOS');
            //_p.settings.isiOsChrom = true;

            window.Loading = SquareLoading;

            $doms.container = $("#scene-container");
            $doms.body = $("body");

            VideoCreate.init();
            MainCover.init();
            MainContent.init();
            VideoPopup.init();


            $(window).on("resize", onResize);
            onResize();

            //alert($(window).width());
        },
        lockScroll: function()
        {
            //var top = $(document).scrollTop();

            $doms.body.toggleClass("lock-mode", true);
            //console.log($(document).scrollTop());
        },
        unlockScroll: function()
        {
            $doms.body.toggleClass("lock-mode", false);
        }
    };

    function msieversion() {

        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");

        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))      // If Internet Explorer, return version number
            return (parseInt(ua.substring(msie + 5, ua.indexOf(".", msie))));
        else                 // If another browser, return 0
            return false;
    }

    function onResize()
    {
        var width = $(window).width(),
            height = $(window).height();

        var cv = _p.settings.currentView;
        var oldMode = cv.modeIndex;
        cv.modeIndex = width > cv.mobileWidth? 0: 1;
        cv.modeChanged = oldMode != cv.modeIndex;

        cv.width = width;
        cv.height = height;

        MainContent.resize();
        VideoPopup.resize();
        VideoCreateForm.resize();
    }

}());

(function(){

    var $dom;

    window.MainCover =
    {
        init: function()
        {
            $dom = $(".main-cover");
        },
        show: function()
        {
            TweenMax.killTweensOf($dom);
            $dom.css("display", "block");
            TweenMax.set($dom, {alpha:0});
            TweenMax.to($dom,.5, {alpha:1});
        },
        hide: function()
        {
            TweenMax.killTweensOf($dom);
            TweenMax.to($dom,.5, {alpha:0, onComplete:function()
            {
                $dom.css("display", "none");
            }});

        }
    };

}());