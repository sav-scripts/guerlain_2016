(function()
{
    var $doms = {};

    window.VideoCreate =
    {
        init: function()
        {
            VideoCreateForm.init();

            setupTrigger(1);
            setupTrigger(2);
            setupTrigger(3);

            function setupTrigger(index)
            {
                $doms['trigger-' + index] = $(".trigger-"+index).on("click", function()
                {
                    VideoCreateForm.reset(index).show();
                });
            }

        }
    };

}());

(function()
{
    var _photoSettings =
    {
        v1:
        [
            {
                w: 242, h: 150,
                texts: [
                    "video1, image 1, text1",
                    "video1, image 1, text2"
                ]
            },
            {
                w: 242, h: 150,
                texts: [
                    "video1, image 2, text1",
                    "video1, image 2, text2"
                ]
            },
            {
                w: 156, h: 206,
                texts: [
                    "video1, image 3, text1",
                    "video1, image 3, text2"
                ]
            }
        ],
        v2:
        [
            {
                w: 242, h: 150,
                texts: [
                    "video2, image 1, text1",
                    "video2, image 1, text2"
                ]
            },
            {
                w: 200, h: 150,
                texts: [
                    "video2, image 2, text1",
                    "video2, image 2, text2"
                ]
            },
            {
                w: 156, h: 206,
                texts: [
                    "video2, image 3, text1",
                    "video2, image 3, text2"
                ]
            }
        ],
        v3:
        [
            {
                w: 242, h: 150,
                texts: [
                    "video3, image 1, text1",
                    "video3, image 1, text2"
                ]
            },
            {
                w: 242, h: 150,
                texts: [
                    "video3, image 2, text1",
                    "video3, image 2, text2"
                ]
            },
            {
                w: 242, h: 150,
                texts: [
                    "video3, image 3, text1",
                    "video3, image 3, text2"
                ]
            }
        ]
    };

    var $doms = {},
        _currentIndex = 0,
        _displayTL;

    var _p = window.VideoCreateForm =
    {
        init: function()
        {
            $doms.container = $(".video-create-form").css("visibility", "visible").css("display", "none");
            $doms.cover = $doms.container.find(".cover");
            $doms.formContainer = $doms.container.find(".form-container");

            $doms.btnClose = $doms.container.find(".btn-close").on("click", function()
            {
               _p.hide();
            });

            $doms.btnSend = $doms.container.find(".btn-send").on("click", function()
            {
            });

            $doms.items = {};
            setupItem(1);
            setupItem(2);
            setupItem(3);

            _p.reset(1).show();

            return _p;
        },
        show: function()
        {
            $doms.container.css("display", "block");

            Main.lockScroll();

            if(_displayTL) _displayTL.kill();

            var tl = _displayTL = new TimelineMax;
            tl.set($doms.cover, {autoAlpha:0});
            tl.set($doms.formContainer, {autoAlpha:0});
            tl.to($doms.cover,.5, {autoAlpha:1});
            tl.to($doms.formContainer,.5, {autoAlpha:1}, "-=.2");

            return _p;
        },
        hide: function()
        {
            if(_displayTL) _displayTL.kill();

            var tl = _displayTL = new TimelineMax;
            tl.to($doms.formContainer,.5, {autoAlpha:0});
            tl.to($doms.cover,.5, {autoAlpha:0}, "-=.2");
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

            return _p;
        }
    };

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
            $item.leftPart.css("width", st.w).css("height", st.h);

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
    }

    function loadFile($item)
    {
        if ($item.input.files && $item.input.files[0])
        {
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

        var canvas = $item.canvas;
        canvas.width = imageSetting.w;
        canvas.height = imageSetting.h;

        var ctx = canvas.getContext("2d");
        var bound = Helper.getSize_cover(imageSetting.w, imageSetting.h, image.width, image.height);

        var offsetX = (imageSetting.w-bound.width)*.5;
        var offsetY = (imageSetting.h-bound.height)*.5;

        if(bound.ratio < 1)
        {
            $($item.canvas).detach();
            $item.canvas = Helper.downScaleImage($item.image, bound.ratio, offsetX, offsetY, imageSetting.w, imageSetting.h);
            $item.userImage.append($item.canvas);
        }
        else
        {
            ctx.drawImage(image, 0, 0, image.width, image.height, offsetX, offsetY, bound.width * scaleRate, bound.height);
        }


        TweenMax.from($item.canvas,.5,{alpha:0});

        $item.imageReady = true;

        checkAllReady();
    }

    function checkAllReady()
    {

        if($doms.items.i1.imageReady && $doms.items.i2.imageReady && $doms.items.i3.imageReady)
        {
            console.log("all ready");
            //Main.setBtnContinue("開始製作", sendToServer);
        }
    }

}());