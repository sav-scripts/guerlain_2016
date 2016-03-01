/**
 * Created by sav on 2016/3/1.
 */
(function()
{
    var $doms = {},
        _displayTL;

    var _p = window.VideoPopup =
    {
        init: function()
        {
            $doms.container = $(".video-popup");
            $doms.content = $doms.container.find(".content");
            $doms.btnClose = $doms.container.find(".btn-close").on("click", function()
            {
                _p.hide();
            });
        },
        show: function(tubeId)
        {
            $doms.container.css("display", "block");

            embedVideo(tubeId);

            Main.lockScroll();

            if(_displayTL) _displayTL.kill();

            MainCover.show();

            var tl = _displayTL = new TimelineMax;
            tl.set($doms.container, {autoAlpha:0});
            tl.to($doms.container,.5, {autoAlpha:1}, "-=.2");

            return _p;
        },
        hide: function()
        {
            if(_displayTL) _displayTL.kill();



            var tl = _displayTL = new TimelineMax;
            tl.to($doms.container,.5, {autoAlpha:0});
            tl.add(MainCover.hide,.3);
            tl.add(function()
            {
                destry();
                $doms.container.css("display", "none");
                Main.unlockScroll();
            });


            return _p;
        },
        resize: function()
        {
            var cv = Main.settings.currentView;
            var inflate = 20* 2,
                vWidth= 720,
                vHeight= 480;
            var bound = Helper.getSize_contain(cv.width-inflate, cv.height-inflate, vWidth, vHeight);

            $doms.container.css("width", bound.width).css("height", bound.height)
                .css("margin-left", -bound.width *.5).css("margin-top", -bound.height *.5);
        }
    };

    function embedVideo(tubeId)
    {
        $doms.content.tubeplayer({
            width: "100%",
            height: "100%",
            allowFullScreen: "true",
            initialVideo: tubeId, // the video that is loaded into the player
            preferredQuality: "large",// preferred quality: default, small, medium, large, hd720
            iframed:true,
            protocol:Utility.protocol,
            autoPlay:true
            //onPlayerEnded:onComplete
        });

    }

    function destry()
    {
        $doms.content.tubeplayer("destroy");
    }
}());