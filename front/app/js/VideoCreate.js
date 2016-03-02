(function()
{
    var $doms = {};

    window.VideoCreate =
    {
        init: function()
        {


            FBHelper.init(Main.settings.fb_appid, function()
            {
                VideoCreateForm.init();

                $doms.container = $(".video-create-group");

                setupTrigger(1);
                setupTrigger(2);
                setupTrigger(3);

                //VideoCreateForm.reset(1).show();

                function setupTrigger(index)
                {
                    $doms['trigger-' + index] = $doms.container.find(".btn-"+index).on("click", onTriggerClick);
                    $doms.container.find(".kv-"+index+" .btn").on("click", onTriggerClick);

                    function onTriggerClick()
                    {
                        doLogin(function()
                        {
                            VideoCreateForm.reset(index).show();
                        });
                    }
                }
            });
        }
    };

    function doLogin(cb)
    {
        Loading.progress("登入 Facebook 中...請稍候").show();

        if(Main.settings.fbUid)
        {
            complete();
        }
        else
        {
            if(Main.settings.isiOsChrom)
            {
                FB.getLoginStatus(function(response)
                {
                    if (response.status === 'connected')
                    {
                        checkPermissions(response.authResponse, true);
                    }
                    else
                    {
                        doRedirectLogin();
                    }
                });
            }
            else
            {
                FB.login(function(response)
                {
                    if(response.error)
                    {
                        alert("登入 Facebook 失敗");
                    }
                    else if(response.authResponse)
                    {
                        checkPermissions(response.authResponse, false);
                    }
                    else
                    {
                        alert("您必須登入 Facebook 才能參加本活動");
                        Loading.hide();
                    }

                },
                {
                    scope: Main.settings.fbPermissions,
                    return_scopes: true,
                    auth_type: "rerequest"
                });
            }

        }

        function checkPermissions(authResponse, redirectToLogin)
        {
            FB.api('/me/permissions', function(response)
            {
                if (response && response.data && response.data.length)
                {

                    var i, obj, permObj = {};
                    for(i=0;i<response.data.length;i++)
                    {
                        obj = response.data[i];
                        permObj[obj.permission] = obj.status;
                    }

                    if (permObj.publish_actions != 'granted')
                    {
                        fail("您必須給予發佈權限才能製作分享影片");
                    }
                    else
                    {
                        complete(authResponse);
                    }
                }
                else
                {
                    alert("fail when checking permissions");
                    Loading.hide();
                }
            });

            function fail(message)
            {
                alert(message);
                Loading.hide();
                if(redirectToLogin) doRedirectLogin();
            }
        }

        function doRedirectLogin()
        {
            var url = "https://www.facebook.com/dialog/oauth?"+
                "client_id="+Main.settings.fb_appid+
                "&scope="+Main.settings.fbPermissions.join(",")+
                "&redirect_uri=" + encodeURI(window.location.href);
            window.open(url, "_self");
        }


        function complete(authResponse)
        {
            if(authResponse)
            {
                Main.settings.fbToken = authResponse.accessToken;
                Main.settings.fbUid = authResponse.userID;
            }

            Loading.hide();
            if(cb) cb.apply();
        }
    }

}());

(function()
{
    var _photoSettings =
    {
        v1:
        [
            {
                mw: 384, mh: 288,
                w: 200, h: 150,
                rw: 353, rh: 265,
                texts: [
                    "Clever聰明",
                    "Naughty調皮",
                    "Mischievous淘氣"
                ]
            },
            {
                mw: 384, mh: 288,
                w: 200, h: 150,
                rw: 353, rh: 265,
                texts: [
                    "Cunning漂亮",
                    "Ingenious靈巧",
                    "Bright開朗"
                ]
            },
            {
                mw: 258, mh: 344,
                w: 150, h: 200,
                rw: 265, rh: 353,
                texts: [
                    "Alert靈活",
                    "Witty詼諧",
                    "Subtle難捉摸"
                ]
            }
        ],
        v2:
        [
            {
                mw: 384, mh: 288,
                w: 200, h: 150,
                rw: 353, rh: 265,
                texts: [
                    "Bewitching令人陶醉",
                    "Lovely優美",
                    "Angelic天使感覺"
                ]
            },
            {
                mw: 384, mh: 288,
                w: 200, h: 150,
                rw: 353, rh: 265,
                texts: [
                    "Fascinating迷人",
                    "Ravishing吸引人",
                    "Adorable可愛"
                ]
            },
            {
                mw: 258, mh: 344,
                w: 150, h: 200,
                rw: 265, rh: 353,
                texts: [
                    "Winning可愛",
                    "Pleasant優美",
                    "Enchanting旖旎"
                ]
            }
        ],
        v3:
        [
            {
                mw: 384, mh: 288,
                w: 200, h: 150,
                rw: 353, rh: 265,
                texts: [
                    "Gorgeous華麗",
                    "Stylish時尚",
                    "Modish流行"
                ]
            },
            {
                mw: 384, mh: 288,
                w: 200, h: 150,
                rw: 353, rh: 265,
                texts: [
                    "Trendy新潮",
                    "Chic別緻",
                    "Dapper俐落"
                ]
            },
            {
                mw: 258, mh: 344,
                w: 150, h: 200,
                rw: 265, rh: 353,
                texts: [
                    "Neat靈巧",
                    "Natty敏捷",
                    "Saucy漂亮"
                ]
            }
        ]
    };

    var _readyStatus =
    {
        all: false,
        image: false,
        text: false,
        privacy: false,
        fb: false
    };

    var $doms = {},
        _currentIndex = 0,
        _defaultText = '請輸入您的期待',
        _displayTL;

    var _p = window.VideoCreateForm =
    {
        init: function()
        {
            $doms.container = $(".video-create-form").css("visibility", "visible").css("display", "none");

            if(Main.settings.isIE)
            {
                $doms.container.find(".select-icon").css("display", "none");
            }

            $doms.formContainer = $doms.container.find(".form-container");

            $doms.btnClose = $doms.container.find(".btn-close").on("click", function()
            {
               _p.hide();
            });

            $doms.btnSend = $doms.container.find(".btn-send").on("click", function()
            {
                if(_readyStatus.all)
                {
                    sendToServer();
                }
                else if(!_readyStatus.image)
                {
                    alert('請上傳您的生活寫真照');
                }
                else if(!_readyStatus.text)
                {
                    alert('請選擇代表您風格的文字');
                }
                else if(!_readyStatus.privacy)
                {
                    alert('您必須同意我們的隱私權政策');
                }
                else if(!_readyStatus.fb)
                {
                    alert('您必須同意分享個人影片至 Facebook 塗鴉牆');
                }
            });

            $doms.checkPrivacy = $doms.container.find('.check-privacy').on("change", checkReadyStatus);

            $doms.checkFbShare = $doms.container.find('.check-fb-share').on("change", checkReadyStatus);

            $doms.items = {};
            setupItem(1);
            setupItem(2);
            setupItem(3);

            $doms.textArea = $doms.container.find(".input-field");
            setupTextarea();

            //_p.reset(1).show();

            return _p;
        },
        show: function()
        {
            $doms.container.css("display", "block");

            Main.lockScroll();

            if(_displayTL) _displayTL.kill();

            MainCover.show();

            var tl = _displayTL = new TimelineMax;
            tl.set($doms.formContainer, {autoAlpha:0});
            tl.to($doms.formContainer,.5, {autoAlpha:1}, "-=.2");

            return _p;
        },
        hide: function()
        {
            if(_displayTL) _displayTL.kill();



            var tl = _displayTL = new TimelineMax;
            tl.to($doms.formContainer,.5, {autoAlpha:0});
            tl.add(MainCover.hide,.3);
            tl.add(function()
            {
                $doms.container.css("display", "none");
                Main.unlockScroll();
            });


            return _p;
        },
        reset: function(index)
        {
            _currentIndex = index;
            resetImageItems();

            $doms.checkPrivacy.prop("checked", true);
            $doms.checkFbShare.prop("checked", true);

            $doms.textArea[0].value = _defaultText;

            _readyStatus =
            {
                all: false,
                image: false,
                text: false,
                privacy: false,
                fb: false
            };

            $doms.btnSend.toggleClass("disable-mode", true);

            return _p;
        },
        resize: function()
        {
            updateSize(1);
            updateSize(2);
            updateSize(3);
        }
    };

    function setupTextarea()
    {
        $doms.textArea.focus(function()
        {
            if($doms.textArea[0].value == _defaultText)
            {
                $doms.textArea[0].value = "";
            }
        });

        $doms.textArea.blur(function()
        {
            if(PatternSamples.onlySpace.test($doms.textArea[0].value))
            {
                $doms.textArea[0].value = _defaultText;
            }
        });
    }

    function updateSize(index)
    {
        if(_currentIndex == 0) return;

        var settingGroup = _photoSettings["v" + _currentIndex];
        var st = settingGroup[index-1];
        var $item = $doms.items["i" + index];

        var cv = Main.settings.currentView,
            w, h;

        if(cv.modeIndex == 0)
        {
            w = st.w;
            h = st.h;
        }
        else
        {
            w = st.mw;
            h = st.mh;
        }


        $item.leftPart.css("width", w).css("height", h);
    }

    function resetImageItems()
    {
        var settingGroup = _photoSettings["v" + _currentIndex];

        setupOne(1);
        setupOne(2);
        setupOne(3);

        function setupOne(index)
        {
            var st = settingGroup[index-1];
            var $item = $doms.items["i" + index];

            $item.imageReady = false;

            if($item.image)
            {
                $($item.image).detach();
                $item.image = null;
            }
            if($item.canvas)
            {
                $($item.canvas).detach();
                $item.canvas = null;
            }

            //console.log(item.container.length);
            updateSize(index);

            $item.textSelect.html('');

        $item.textSelect.append('<option disabled selected> -- 請選擇一段文字 -- </option>\n');

            var array = st.texts,i;
            for(i=0;i<array.length;i++)
            {
                $item.textSelect.append('<option value="'+ i +'">'+ array[i] +'</option>\n');
            }

            //$item.textSelect.prop('selectedIndex', 0);
        }
    }



    function setupItem(index)
    {
        //var $dom = $doms["input_" + index] = $($(".input-area").find(".photo-input")[index]);

        var key = "i" + index;

        var $item = $doms.items[key] = {};
        $item.index = index;
        var $container = $item.container = $doms.container.find(".item-" + index);



        $item.leftPart = $container.find(".left-part");
        $item.userImage = $container.find(".user-image");

        $item.btnSelectImage = $container.find(".btn-select-image");
        $item.textSelect = $container.find(".text-select select");
        $item.input = $container.find("input")[0];



        $item.btnSelectImage.on("click", selectFile);
        $item.leftPart.on("click", selectFile);

        function selectFile()
        {
            $item.input.value = null;
            $item.input.click();
        }

        $($item.input).on("change", function()
        {
            $item.imageReady = false;
            loadFile($item);
        });

        $item.textSelect.on("change", function()
        {
            checkReadyStatus();
        });
    }

    function loadFile($item)
    {
        if ($item.input.files && $item.input.files[0])
        {

            //console.log($item.input.files[0].size);
            var reader = new FileReader();

            reader.onload = function (event)
            {
                loadImg($item, event.target.result);
            };

            reader.readAsDataURL($item.input.files[0]);
        }
    }

    function loadImg($item, src)
    {
        if($item.image)
        {
            $($item.image).detach();
            $($item.canvas).detach();
        }
        $item.canvas = document.createElement("canvas");
        $item.image = document.createElement("img");

        $item.userImage.append($item.canvas);
        //$item.userImage.append($item.image);


        $item.image.onload = function()
        {
            imageToCanvas($item);
        };

        $item.image.src = src;
    }

    function imageToCanvas($item)
    {
        var image = $item.image;

        var iosFix = Boolean(Main.isiPhone5 && image.width >= 3264 && image.height >= 2448),
            scaleRate = iosFix? .5: 1;

        var imageSetting = _photoSettings["v"+_currentIndex][$item.index-1];
        
        var rw = imageSetting.rw;
        var rh = imageSetting.rh;

        var canvas = $item.canvas;
        canvas.width = rw;
        canvas.height = rh;

        var ctx = canvas.getContext("2d");
        var bound = Helper.getSize_cover(rw, rh, image.width, image.height);

        var offsetX = (rw-bound.width)*.5;
        var offsetY = (rh-bound.height)*.5;

        if(bound.ratio < 1)
        {
            $($item.canvas).detach();
            $item.canvas = Helper.downScaleImage($item.image, bound.ratio, offsetX, offsetY, rw, rh);
            $item.userImage.append($item.canvas);
        }
        else
        {
            ctx.drawImage(image, 0, 0, image.width, image.height, offsetX, offsetY, bound.width * scaleRate, bound.height);
        }


        TweenMax.from($item.canvas,.5,{alpha:0});

        $item.imageReady = true;

        checkReadyStatus();
    }

    function checkReadyStatus()
    {
        var wasAllReady = _readyStatus.all;

        _readyStatus.image = ($doms.items.i1.imageReady && $doms.items.i2.imageReady && $doms.items.i3.imageReady);
        _readyStatus.text =
            $doms.items.i1.textSelect[0].selectedIndex != 0 &&
            $doms.items.i2.textSelect[0].selectedIndex != 0 &&
            $doms.items.i3.textSelect[0].selectedIndex != 0;

        _readyStatus.privacy = $doms.checkPrivacy.prop("checked");
        _readyStatus.fb = $doms.checkFbShare.prop("checked");

        _readyStatus.all = _readyStatus.image && _readyStatus.text && _readyStatus.privacy && _readyStatus.fb;
        //_readyStatus.all = _readyStatus.image;

        if(wasAllReady != _readyStatus.all)
        {
            $doms.btnSend.toggleClass("disable-mode", !_readyStatus.all);
        }
    }


    function sendToServer()
    {
        var imageArray = [], textIndexArray = [], i, $item;
        for(i=0;i<3;i++)
        {
            $item = $doms.items["i"+(i+1)];
            imageArray[i] = $item.canvas.toDataURL("image/jpeg", .95).replace(/^data:image\/jpeg;base64,/, "");
            textIndexArray[i] = $doms.items['i' + (i+1)].textSelect[0].selectedIndex;
        }

        var shareText = $doms.textArea[0].value;
        if(shareText == _defaultText) shareText = '';

        ServerProxy.start(_currentIndex, imageArray, textIndexArray, shareText, function(success)
        {
            if(success)
            {
                _p.hide();
            }
        });
    }

}());