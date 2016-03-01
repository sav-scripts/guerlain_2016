/**
 * Created by sav on 2016/2/28.
 */
(function(){



    var _p = window.MainContent =
    {
        init: function()
        {
            _p.VideoGroup.init();
            _p.ProductGroup.init();
            _p.VideoCreateGroup.init();
            _p.BloggerGroup.init();
            _p.PrizeGroup.init();
        },
        resize: function()
        {
            _p.VideoGroup.resize();
            _p.ProductGroup.resize();
            _p.VideoCreateGroup.resize();
            _p.BloggerGroup.resize();
        }
    };

}());

(function(){

    var $doms = {};

    var _setting =
    {
        offset0: 1206,
        offset1: 480
    };

    var _currentIndex = 0,
        _numContents = 4,
        _isLocking = true;

    window.MainContent.VideoGroup =
    {
        init: function()
        {
            $doms.container = $(".video-group");

            $doms.videos = [];

            $doms.container.find(".video-player").each(function(index, dom)
            {
                var $dom = $doms.videos[index] = $(dom);

                var tubeId = dom.getAttribute('youtube-view');

                $dom.tubeplayer({
                    width: "100%",
                    height: "100%",
                    allowFullScreen: "true",
                    initialVideo: tubeId, // the video that is loaded into the player
                    preferredQuality: "large",// preferred quality: default, small, medium, large, hd720
                    iframed:true,
                    protocol:Utility.protocol,
                    autoPlay:false
                    //onPlayerEnded:onComplete
                });
            });

            $doms.contentContainer = $doms.container.find(".video-container");

            $doms.btnPrev = $doms.container.find(".arrow-left").on("mousedown", function()
            {
                //if(_isLocking) return;

                var index = _currentIndex - 1;
                if(index >= 0 && index < _numContents) toContent(index);
            });

            $doms.btnNext = $doms.container.find(".arrow-right").on("mousedown", function()
            {
                //if(_isLocking) return;

                var index = _currentIndex + 1;
                if(index >= 0 && index < _numContents) toContent(index);

            });

            $doms.thumbs = $doms.container.find(".video-thumb").each(function(index, dom)
            {
                $(dom).on("click", function()
                {
                    //if(_isLocking) return;
                    toContent(index);
                });

            });

            _isLocking = false;
        },
        resize: function()
        {
            var cv = Main.settings.currentView;
            if(cv.modeChanged)
            {
                toContent(_currentIndex, 0, true);
            }
        }
    };

    function toContent(index, duration, noPlay)
    {
        if(duration == undefined) duration = 1;

        _currentIndex = index;

        for(var i=0;i<_numContents;i++)
        {
            if(i==_currentIndex)
            {
                $doms.videos[i].css("pointer-events", "auto");
            }
            else
            {
                $doms.videos[i].tubeplayer("pause").css("pointer-events", "none");
            }
        }

        $doms.thumbs.each(function(i, dom)
        {
            $(dom).toggleClass("disactive", _currentIndex != i);
        });


        var gap = _setting["offset" + Main.settings.currentView.modeIndex];

        $doms.btnPrev.toggleClass("disactive", _currentIndex == 0);
        $doms.btnNext.toggleClass("disactive", _currentIndex == (_numContents-1));

        _isLocking = true;

        var targetLeft = -_currentIndex * gap;

        TweenMax.to($doms.videos,.5, {alpha:.2});
        TweenMax.to($doms.videos[index],.5, {alpha:1});

        TweenMax.killTweensOf($doms.contentContainer);
        TweenMax.to($doms.contentContainer,duration, {ease:Power3.easeInOut, marginLeft: targetLeft, onComplete:function()
        {
            if(!noPlay) $doms.videos[index].tubeplayer('play');
            _isLocking = false;
        }});
    }

}());

(function(){


    var $doms = {};

    var _contentGap = 480;

    var _currentIndex = 0,
        _numContents = 2,
        _isLocking = true;

    window.MainContent.ProductGroup =
    {
        init: function()
        {
            $doms.container = $(".product-group");

            $doms.contentContainer = $doms.container.find(".topic-container");

            $doms.btnPrev = $doms.container.find(".btn-left").on("mousedown", function()
            {
                //if(_isLocking) return;

                var index = _currentIndex - 1;
                if(index >= 0 && index < _numContents) toContent(index);
            });

            $doms.btnNext = $doms.container.find(".btn-right").on("mousedown", function()
            {
                //if(_isLocking) return;

                var index = _currentIndex + 1;
                if(index >= 0 && index < _numContents) toContent(index);

            });

            _isLocking = false;
        },
        resize: function()
        {
            var cv = Main.settings.currentView;
            if(cv.modeChanged)
            {
                toContent(_currentIndex, 0, true);
            }
        }
    };

    function toContent(index, duration, noPlay)
    {
        if(duration == undefined) duration = 1;

        _currentIndex = index;

        var gap = _contentGap;

        $doms.btnPrev.toggleClass("disactive", _currentIndex == 0);
        $doms.btnNext.toggleClass("disactive", _currentIndex == (_numContents-1));

        _isLocking = true;

        var targetLeft = -_currentIndex * gap;

        TweenMax.killTweensOf($doms.contentContainer);
        TweenMax.to($doms.contentContainer,duration, {ease:Power3.easeInOut, marginLeft: targetLeft, onComplete:function()
        {
            _isLocking = false;
        }});
    }

}());

(function(){


    var $doms = {};

    var _contentGap = 480;

    var _currentIndex = 0,
        _numContents = 3,
        _isLocking = true;

    window.MainContent.VideoCreateGroup =
    {
        init: function()
        {
            $doms.container = $(".video-create-group");

            $doms.contentContainer = $doms.container.find(".kv-area-m");

            $doms.btnPrev = $doms.container.find(".btn-left").on("mousedown", function()
            {
                //if(_isLocking) return;

                var index = _currentIndex - 1;
                if(index >= 0 && index < _numContents) toContent(index);
            });

            $doms.btnNext = $doms.container.find(".btn-right").on("mousedown", function()
            {
                //if(_isLocking) return;

                var index = _currentIndex + 1;
                if(index >= 0 && index < _numContents) toContent(index);

            });

            $doms.kvPc = $doms.container.find(".kv-area");
            $doms.kvMobile = $doms.container.find(".kv-area-m");

            setupKv(1, '7v7O9GR9v1Q');
            setupKv(2, '7v7O9GR9v1Q');
            setupKv(3, '7v7O9GR9v1Q');

            _isLocking = false;
        },
        resize: function()
        {
            var cv = Main.settings.currentView;
            if(cv.modeChanged)
            {
                toContent(_currentIndex, 0, true);
            }
        }
    };

    function setupKv(index, tubeId)
    {
        $doms.kvPc.find(".kv-" + index).on("click", trigger);
        $doms.kvMobile.find(".kv-" + index + " .video-btn").on('click', trigger);

        function trigger()
        {
            VideoPopup.show(tubeId);
        }

    }

    function toContent(index, duration)
    {
        if(duration == undefined) duration = 1;

        _currentIndex = index;

        var gap = _contentGap;

        $doms.btnPrev.toggleClass("disactive", _currentIndex == 0);
        $doms.btnNext.toggleClass("disactive", _currentIndex == (_numContents-1));

        _isLocking = true;

        var targetLeft = -_currentIndex * gap;

        TweenMax.killTweensOf($doms.contentContainer);
        TweenMax.to($doms.contentContainer,duration, {ease:Power3.easeInOut, marginLeft: targetLeft, onComplete:function()
        {
            _isLocking = false;
        }});
    }

}());


(function(){


    var $doms = {};

    var _contentGap = 480;

    var _currentIndex = 0,
        _numContents = 2,
        _isLocking = true;

    window.MainContent.BloggerGroup =
    {
        init: function()
        {
            $doms.container = $(".blogger-group");

            $doms.contentContainer = $doms.container.find(".blogger-container");

            $doms.btnPrev = $doms.container.find(".btn-left").on("mousedown", function()
            {
                //if(_isLocking) return;

                var index = _currentIndex - 1;
                if(index >= 0 && index < _numContents) toContent(index);
            });

            $doms.btnNext = $doms.container.find(".btn-right").on("mousedown", function()
            {
                //if(_isLocking) return;

                var index = _currentIndex + 1;
                if(index >= 0 && index < _numContents) toContent(index);

            });

            _isLocking = false;
        },
        resize: function()
        {
            var cv = Main.settings.currentView;
            if(cv.modeChanged)
            {
                if(cv.modeIndex == 0)
                {
                    TweenMax.killTweensOf($doms.contentContainer);
                    _currentIndex = 0;
                    TweenMax.set($doms.contentContainer, {marginLeft:0});
                }
                else
                {
                    toContent(_currentIndex, 0, true);
                }
            }
        }
    };

    function toContent(index, duration)
    {
        if(duration == undefined) duration = 1;

        _currentIndex = index;

        var gap = _contentGap;

        $doms.btnPrev.toggleClass("disactive", _currentIndex == 0);
        $doms.btnNext.toggleClass("disactive", _currentIndex == (_numContents-1));

        _isLocking = true;

        var targetLeft = -_currentIndex * gap;

        TweenMax.killTweensOf($doms.contentContainer);
        TweenMax.to($doms.contentContainer,duration, {ease:Power3.easeInOut, marginLeft: targetLeft, onComplete:function()
        {
            _isLocking = false;
        }});
    }

}());

(function(){

    var $doms = {};

    _p = window.MainContent.PrizeGroup =
    {
        init: function()
        {
            $doms.container = $(".prize-group");

            $doms.fields =
            {
                "name": $doms.container.find(".input-name"),
                "phone": $doms.container.find(".input-phone"),
                "email": $doms.container.find(".input-email")
            };

            $doms.privacyCheck = $doms.container.find(".check-privacy");

            $doms.btnRetail = $doms.container.find(".btn-retail").on("click", function()
            {

            });

            $doms.btnSend = $doms.container.find(".btn-send").on("click", function()
            {
                trySend();
            });

            _p.reset();
        },
        reset: function()
        {

            $doms.fields.name.val('');
            $doms.fields.phone.val('');
            $doms.fields.email.val('');

            $doms.privacyCheck.prop("checked", false);

        }
    };

    function trySend()
    {

        var formObj = checkForm();

        if(formObj) execute(formObj);

        function execute(params)
        {
            Loading.progress("表單送出中... 請稍候").show();

            $.getJSON(Main.settings.apiPath + 'send_form.ashx?callback=?', params, function(data)
            {
                if(data)
                {
                    if(data.error)
                    {
                        alert(data.error);
                    }
                    else
                    {
                        alert("資料成功送出");
                        _p.reset();
                    }
                }
                else
                {
                    _p.reset();
                    alert("資料傳送失敗");
                }

                Loading.hide();
            }).fail(function()
            {
                alert("無法取得伺服器回應");
                Loading.hide();
            });
        }
    }

    function checkForm()
    {

        var formObj={};
        var dom;

        if(!$doms.privacyCheck.prop("checked"))
        {
            alert('您必須同意 "嬌蘭Guerlain 隱私權條款/注意事項" 才能參加活動');
            return;
        }

        dom = $doms.fields.name[0];
        if(PatternSamples.onlySpace.test(dom.value))
        {
            alert('請輸入您的名稱'); dom.focus(); return;
        }else formObj.user_name = dom.value;

        dom = $doms.fields.phone[0];
        if(!PatternSamples.phone.test(dom.value))
        {
            alert('請輸入正確的手機號碼'); dom.focus(); return;
        }
        else formObj.phone = dom.value;

        dom = $doms.fields.email[0];
        if(!PatternSamples.email.test(dom.value))
        {
            alert('請輸入您的電子郵件信箱'); dom.focus(); return;
        }
        else formObj.email = dom.value;

        return formObj;
    }

}());