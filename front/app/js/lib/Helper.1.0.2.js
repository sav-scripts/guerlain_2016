(function()
{

    "use strict";

    var _p = window.Helper = {};

    _p.getSize_cover = function(containerWidth, containerHeight, contentWidth, contentHeight)
    {
        var containerRatio = containerWidth / containerHeight,
            contentRatio = contentWidth / contentHeight,
            width, height;

        if(contentRatio > containerRatio)
        {
            height = containerHeight;
            width = height * contentRatio;
        }
        else
        {
            width = containerWidth;
            height = width / contentRatio;
        }

        var ratio = width/contentWidth;

        var tw = containerWidth / ratio,
            th = containerHeight / ratio;
        var contentCenterBound =
        {
            x: (contentWidth - tw) *.5,
            y: (contentHeight - th) *.5,
            width: tw,
            height: th
        };

        //console.log(contentCenterBound);

        return {width:width, height:height, ratio:ratio, contentCenterBound: contentCenterBound};
    };

    _p.getSize_contain = function(containerWidth, containerHeight, contentWidth, contentHeight)
    {
        var containerRatio = containerWidth / containerHeight,
            contentRatio = contentWidth / contentHeight,
            width, height;

        if(contentRatio > containerRatio)
        {
            width = containerWidth;
            height = width / contentRatio;
        }
        else
        {
            height = containerHeight;
            width = height * contentRatio;
        }

        return {width:width, height:height, ratio:width/contentWidth};
    };


    Helper.extract = function (selector, sourceDom, parentDom, domIndex)
    {
        if (domIndex == null) domIndex = 0;
        if (sourceDom == null) sourceDom = document;

        var dom = $(sourceDom).find(selector).get(domIndex);
        if (!dom) console.error("can't find dom, selector: " + selector + ", source: " + sourceDom);

        Helper.getInitValue(dom);

        if (parentDom != null) parentDom.appendChild(dom);

        return dom;
    };


    Helper.$extract = function (selector, sourceDom, parentDom, domIndex)
    {
        if (domIndex == null) domIndex = 0;
        if (sourceDom == null) sourceDom = document;

        var dom = $(sourceDom).find(selector).get(domIndex);
        if (!dom) console.error("can't find dom, selector: " + selector + ", source: " + sourceDom);

        Helper.getInitValue(dom);

        if (parentDom != null) parentDom.appendChild(dom);

        return $(dom);
    };

    Helper.pxToPercent = function (dom, parentWidth, parentHeight, styleDic, targetObj)
    {
        if(!styleDic) styleDic =
        {
            "w":true,
            "h":false,
            "l":true,
            "t":false,
            "r":true,
            "b":false
        };

        var $dom = $(dom);

        /*
        process("width", parentWidth);
        process("left", parentWidth);
        process("right", parentWidth);

        process("height", parentHeight);
        process("top", parentHeight);
        process("bottom", parentHeight);
        */

        var key;
        for(key in styleDic)
        {
            var value = (styleDic[key] == true)? parentWidth: parentHeight;

            process(key, value);
        }

        function process(key, pValue, rate)
        {
            if (rate == null) rate = 100;

            var cssName = Helper.styleDic[key];
            if(!cssName) cssName = key;

            var v = getValue($dom.css(cssName));

            var finalString = v / pValue * rate + "%";

            if(targetObj)
            {
                targetObj[key] = finalString;
            }
            else
            {
                if (v != 0) $dom.css(cssName, finalString);
            }
        }
    };


    Helper.clearStyles = function(dom)
    {
        $(dom).removeAttr("style");
    };



    Helper.getInitValue = function (dom, ignoreDefault, extraStyles, pxToPercentSetting, clearStyles, mode)
    {
        if(!dom.init) dom.init = {};
        if(!dom.geom) dom.geom = {};

        if(clearStyles) Helper.clearStyles(dom);


        var init, geom;

        if(mode)
        {
            init = dom.init[mode] = {};
            geom = dom.geom[mode] = {};
        }
        else
        {
            init = dom.init;
            geom = dom.geom;
        }


        if(!ignoreDefault)
        {
            if (dom.currentStyle)
            {
                geom.w = init.w = getValue(dom.currentStyle.width);
                geom.h = init.h = getValue(dom.currentStyle.height);
                geom.ml = init.ml = getValue(dom.currentStyle.marginLeft);
                geom.mt = init.mt = getValue(dom.currentStyle.marginTop);
                geom.mr = init.mr = getValue(dom.currentStyle.marginRight);
                geom.mb = init.mb = getValue(dom.currentStyle.marginBottom);
                geom.t = init.t = getValue(dom.currentStyle.top);
                geom.l = init.l = getValue(dom.currentStyle.left);
                geom.r = init.r = getValue(dom.currentStyle.right);
                geom.b = init.b = getValue(dom.currentStyle.bottom);
            }
            else
            {
                geom.w = init.w = $(dom).width();
                geom.h = init.h = $(dom).height();
                geom.ml = init.ml = getValue($(dom).css("margin-left"));
                geom.mt = init.mt = getValue($(dom).css("margin-top"));
                geom.mr = init.mr = getValue($(dom).css("margin-right"));
                geom.mb = init.mb = getValue($(dom).css("margin-bottom"));
                geom.t = init.t = getValue($(dom).css("top"));
                geom.l = init.l = getValue($(dom).css("left"));
                geom.r = init.r = getValue($(dom).css("right"));
                geom.b = init.b = getValue($(dom).css("bottom"));
            }
        }
        geom.scale = init.scale = 1;

        if(extraStyles)
        {
            for(var i=0;i<extraStyles.length;i++)
            {
                var key = extraStyles[i];

                init[key] = geom[key] = getValue($(dom).css(key));
            }
        }


        if(pxToPercentSetting)
        {
            var parentWidth, parentHeight, styleDic;

            parentWidth = pxToPercentSetting.width;
            parentHeight = pxToPercentSetting.height;
            styleDic = pxToPercentSetting.styleDic;

            Helper.pxToPercent(dom, parentWidth, parentHeight, styleDic, init);
        }

//        console.log("width = " + $(dom).css("width"));
        //console.log("width = " + dom.currentStyle.width);

    };

    function getValue(v)
    {
        var v2 = parseInt(v);
        if (isNaN(v2)) v2 = 0;
        return v2;
    }

    Helper.styleDic =
    {
        "l": "left",
        "r": "right",
        "t": "top",
        "b": "bottom",
        "ml": "margin-left",
        "mr": "margin-right",
        "mt": "margin-top",
        "mb": "margin-bottom",
        "w": "width",
        "h": "height"
    };

    Helper.applyTransform = function (dom, scaleRate, styleList, percentStyleList, plainApplyList, mode)
    {
        var init, geom;

        if(mode)
        {
            init = dom.init[mode];
            geom = dom.geom[mode];
        }
        else
        {
            init = dom.init;
            geom = dom.geom;
        }

        var rate = (scaleRate != null) ? init.scale * scaleRate : init.scale;

        var $dom = $(dom);

        var i, n, key, style;
        if (styleList)
        {
            n = styleList.length;
            for (i = 0; i < n; i++)
            {
                key = styleList[i];
                style = Helper.styleDic[key];
                if(!style) style = key;
                geom[key] = init[key] * rate;
                $dom.css(style, geom[key] + "px");
            }
        }

        if (percentStyleList)
        {
            n = percentStyleList.length;
            for (i = 0; i < n; i++)
            {
                key = percentStyleList[i];
                style = Helper.styleDic[key];
                geom[key] = init[key] * rate;
                $dom.css(style, geom[key] + "%");
            }
        }

        if(plainApplyList)
        {
            n = plainApplyList.length;
            for (i = 0; i < n; i++)
            {
                key = plainApplyList[i];
                style = Helper.styleDic[key];
                if(!style) style = key;

                $dom.css(style, init[key]);
            }
        }
    };

    Helper.transformDom = function (dom, scaleRate, applyPosition, applyMargin, applyScale)
    {
        var rate = (scaleRate != null) ? dom.init.scale * scaleRate : dom.init.scale;

        if (applyScale != false)
        {
            if (applyScale === true)
            {
                dom.geom.w = dom.init.w * rate;
                dom.geom.h = dom.init.h * rate;
                $(dom).css("width", dom.geom.w).css("height", dom.geom.h);
            }
            else
            {
                if (applyPosition.l)
                {
                    dom.geom.l = dom.init.l * rate;
                    $(dom).css("left", dom.geom.l);
                }
                if (applyPosition.t)
                {
                    dom.geom.t = dom.init.t * rate;
                    $(dom).css("top", dom.geom.t);
                }
            }
        }

        if (applyPosition != false)
        {
            if (applyPosition === true)
            {
                dom.geom.t = dom.init.t * rate;
                dom.geom.l = dom.init.l * rate;
                $(dom).css("top", dom.geom.t).css("left", dom.geom.l);
            }
            else
            {
                if (applyPosition.l)
                {
                    dom.geom.l = dom.init.l * rate;
                    $(dom).css("left", dom.geom.l);
                }
                if (applyPosition.t)
                {
                    dom.geom.t = dom.init.t * rate;
                    $(dom).css("top", dom.geom.t);
                }
                if (applyPosition.r)
                {
                    dom.geom.r = dom.init.r * rate;
                    $(dom).css("right", dom.geom.r);
                }
                if (applyPosition.b)
                {
                    dom.geom.b = dom.init.b * rate;
                    $(dom).css("bottom", dom.geom.b);
                }
            }
        }

        if (applyMargin != false)
        {
            if (applyMargin === true)
            {
                dom.geom.mt = dom.init.mt * rate;
                dom.geom.ml = dom.init.ml * rate;
                $(dom).css("margin-top", dom.geom.mt).css("margin-left", dom.geom.ml);
            }
            else
            {
                if (applyPosition.ml)
                {
                    dom.geom.ml = dom.init.ml * rate;
                    $(dom).css("margin-left", dom.geom.ml);
                }
                if (applyPosition.mt)
                {
                    dom.geom.mt = dom.init.mt * rate;
                    $(dom).css("margin-top", dom.geom.mt);
                }
                if (applyPosition.mr)
                {
                    dom.geom.mr = dom.init.mr * rate;
                    $(dom).css("margin-right", dom.geom.mr);
                }
                if (applyPosition.mb)
                {
                    dom.geom.mb = dom.init.mb * rate;
                    $(dom).css("margin-bottom", dom.geom.mb);
                }
            }
        }
    };


    Helper.downScaleImage = function(img, scale, offsetX, offsetY, targetWidth, targetHeight)
    {
        var imgCV = document.createElement('canvas');
        imgCV.width = img.width;
        imgCV.height = img.height;
        var imgCtx = imgCV.getContext('2d');
        imgCtx.drawImage(img, 0, 0);
        return Helper.downScaleCanvas(imgCV, scale, offsetX, offsetY, targetWidth, targetHeight);
    };

// scales the canvas by (float) scale < 1
// returns a new canvas containing the scaled image.
    Helper.downScaleCanvas = function(cv, scale, offsetX, offsetY, targetWidth, targetHeight)
    {
        if(!offsetX) offsetX = 0;
        if(!offsetY) offsetY = 0;

        if (!(scale < 1) || !(scale > 0)) throw ('scale must be a positive number <1 ');
        var sqScale = scale * scale; // square scale = area of source pixel within target
        var sw = cv.width; // source image width
        var sh = cv.height; // source image height
        var tw = Math.floor(sw * scale); // target image width
        var th = Math.floor(sh * scale); // target image height
        var sx = 0, sy = 0, sIndex = 0; // source x,y, index within source array
        var tx = 0, ty = 0, yIndex = 0, tIndex = 0; // target x,y, x,y index within target array
        var tX = 0, tY = 0; // rounded tx, ty
        var w = 0, nw = 0, wx = 0, nwx = 0, wy = 0, nwy = 0; // weight / next weight x / y
        // weight is weight of current source point within target.
        // next weight is weight of current source point within next target's point.
        var crossX = false; // does scaled px cross its current px right border ?
        var crossY = false; // does scaled px cross its current px bottom border ?
        var sBuffer = cv.getContext('2d').
            getImageData(0, 0, sw, sh).data; // source buffer 8 bit rgba
        var tBuffer = new Float32Array(3 * tw * th); // target buffer Float32 rgb
        var sR = 0, sG = 0,  sB = 0; // source's current point r,g,b
        /* untested !
         var sA = 0;  //source alpha  */

        for (sy = 0; sy < sh; sy++) {
            ty = sy * scale; // y src position within target
            tY = 0 | ty;     // rounded : target pixel's y
            yIndex = 3 * tY * tw;  // line index within target array
            crossY = (tY != (0 | ty + scale));
            if (crossY) { // if pixel is crossing botton target pixel
                wy = (tY + 1 - ty); // weight of point within target pixel
                nwy = (ty + scale - tY - 1); // ... within y+1 target pixel
            }
            for (sx = 0; sx < sw; sx++, sIndex += 4) {
                tx = sx * scale; // x src position within target
                tX = 0 |  tx;    // rounded : target pixel's x
                tIndex = yIndex + tX * 3; // target pixel index within target array
                crossX = (tX != (0 | tx + scale));
                if (crossX) { // if pixel is crossing target pixel's right
                    wx = (tX + 1 - tx); // weight of point within target pixel
                    nwx = (tx + scale - tX - 1); // ... within x+1 target pixel
                }
                sR = sBuffer[sIndex    ];   // retrieving r,g,b for curr src px.
                sG = sBuffer[sIndex + 1];
                sB = sBuffer[sIndex + 2];

                /* !! untested : handling alpha !!
                 sA = sBuffer[sIndex + 3];
                 if (!sA) continue;
                 if (sA != 0xFF) {
                 sR = (sR * sA) >> 8;  // or use /256 instead ??
                 sG = (sG * sA) >> 8;
                 sB = (sB * sA) >> 8;
                 }
                 */
                if (!crossX && !crossY) { // pixel does not cross
                    // just add components weighted by squared scale.
                    tBuffer[tIndex    ] += sR * sqScale;
                    tBuffer[tIndex + 1] += sG * sqScale;
                    tBuffer[tIndex + 2] += sB * sqScale;
                } else if (crossX && !crossY) { // cross on X only
                    w = wx * scale;
                    // add weighted component for current px
                    tBuffer[tIndex    ] += sR * w;
                    tBuffer[tIndex + 1] += sG * w;
                    tBuffer[tIndex + 2] += sB * w;
                    // add weighted component for next (tX+1) px
                    nw = nwx * scale
                    tBuffer[tIndex + 3] += sR * nw;
                    tBuffer[tIndex + 4] += sG * nw;
                    tBuffer[tIndex + 5] += sB * nw;
                } else if (crossY && !crossX) { // cross on Y only
                    w = wy * scale;
                    // add weighted component for current px
                    tBuffer[tIndex    ] += sR * w;
                    tBuffer[tIndex + 1] += sG * w;
                    tBuffer[tIndex + 2] += sB * w;
                    // add weighted component for next (tY+1) px
                    nw = nwy * scale
                    tBuffer[tIndex + 3 * tw    ] += sR * nw;
                    tBuffer[tIndex + 3 * tw + 1] += sG * nw;
                    tBuffer[tIndex + 3 * tw + 2] += sB * nw;
                } else { // crosses both x and y : four target points involved
                    // add weighted component for current px
                    w = wx * wy;
                    tBuffer[tIndex    ] += sR * w;
                    tBuffer[tIndex + 1] += sG * w;
                    tBuffer[tIndex + 2] += sB * w;
                    // for tX + 1; tY px
                    nw = nwx * wy;
                    tBuffer[tIndex + 3] += sR * nw;
                    tBuffer[tIndex + 4] += sG * nw;
                    tBuffer[tIndex + 5] += sB * nw;
                    // for tX ; tY + 1 px
                    nw = wx * nwy;
                    tBuffer[tIndex + 3 * tw    ] += sR * nw;
                    tBuffer[tIndex + 3 * tw + 1] += sG * nw;
                    tBuffer[tIndex + 3 * tw + 2] += sB * nw;
                    // for tX + 1 ; tY +1 px
                    nw = nwx * nwy;
                    tBuffer[tIndex + 3 * tw + 3] += sR * nw;
                    tBuffer[tIndex + 3 * tw + 4] += sG * nw;
                    tBuffer[tIndex + 3 * tw + 5] += sB * nw;
                }
            } // end for sx
        } // end for sy

        // create result canvas
        var resCV = document.createElement('canvas');
        resCV.width = targetWidth? targetWidth: tw;
        resCV.height = targetHeight? targetHeight: th;
        var resCtx = resCV.getContext('2d');
        var imgRes = resCtx.getImageData(0, 0, tw, th);
        var tByteBuffer = imgRes.data;
        // convert float32 array into a UInt8Clamped Array
        var pxIndex = 0; //
        for (sIndex = 0, tIndex = 0; pxIndex < tw * th; sIndex += 3, tIndex += 4, pxIndex++) {
            tByteBuffer[tIndex] = Math.ceil(tBuffer[sIndex]);
            tByteBuffer[tIndex + 1] = Math.ceil(tBuffer[sIndex + 1]);
            tByteBuffer[tIndex + 2] = Math.ceil(tBuffer[sIndex + 2]);
            tByteBuffer[tIndex + 3] = 255;
        }
        // writing result to canvas.
        resCtx.putImageData(imgRes, offsetX, offsetY);
        return resCV;
    }


}());