(function(){

    var $doms = {};

    "use strict";
    var _p = window.Main =
    {
        localSettings:
        {
            fb_appid: "1124585734259271"
        },
        settings:
        {
            fb_appid: "1120712347979943",
            fbPermissions: ['user_photos', 'publish_actions']
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

            _p.settings.isiOsChrom = navigator.userAgent.match('CriOS');
            //_p.settings.isiOsChrom = true;

            window.Loading = SquareLoading;

            $doms.container = $("#scene-container");
            $doms.body = $("body");

            VideoCreate.init();
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

}());
