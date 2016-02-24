/**
 * Created by sav on 2015/12/6.
 */
(function(){


    var _isInit = false,
        _isHiding = true,
        _container,
        _text,
        _loopProgress = .0,
        _progress = .0,
        _progressText = null,
        _loopSpeed = .015,
        _segmentIndex = 0,
        _timeout,
        _lines = [];

    var _size = 40,
        _tickness = 1;

    var _p = window.SquareLoading =
    {
        show: function()
        {
            if(!_isInit) init();

            if(!_isHiding) return;
            _isHiding = false;

            //console.log(document.getElementsByTagName("body")[0]);
            if(_timeout !== null) update();
            document.body.appendChild(_container);

            return _p;
        },
        hide: function()
        {
            if(!_isInit) init();

            if(_isHiding) return;
            _isHiding = true;

            if(_container.parentNode) _container.parentNode.removeChild(_container);
            clearTimeout(_timeout);

            return _p;
        },
        progress: function(progress)
        {
            if(!_isInit) init();

            if((typeof progress) == "number")
            {
                _progress = progress;
                _progressText = null;
            }
            else
            {
                _progress = 0;
                _progressText = progress;
            }

            var i;

            if(_progressText === null)
            {
                for(i=0;i<10;i++)
                {
                    _lines[i].style.display = "block";
                }
                _text.innerHTML = parseInt(_progress * 100);
            }
            else
            {
                for(i=0;i<10;i++)
                {
                    _lines[i].style.display = "none";
                }
                _text.innerHTML = _progressText;
            }

            return _p;
        }
    };


    function init()
    {
        if(_isInit) return;
        _isInit = true;

        var s, i, dom;

        _container = document.createElement("div");
        _container.id = "square-loading";
        s = _container.style;
        s.position = "fixed";
        s.top = "0px";
        s.left = "0px";
        s.width = "100%";
        s.height = "100%";
        s.zIndex = "8000";
        try{
            s.backgroundColor = "rgba(0,0,0,.8)";
        }catch(e)
        {
            s.backgroundColor = "#000";
        }

        _text = document.createElement("div");
        s = _text.style;
        s.position = "absolute";
        s.top = "50%";
        s.left = "50%";
        s.width = "300px";
        s.height = "12px";
        s.fontSize = "12px";
        s.marginLeft = "-151px";
        s.marginTop = "-7px";
        s.textAlign = "center";
        s.color = "white";
        s.fontWeight = "bold";
        s.letterSpacing = "1px";

        for(i=0;i<10;i++)
        {
            dom = _lines[i] = document.createElement("div");
            s = dom.style;
            s.position = "absolute";
            s.backgroundColor = "white";
            s.left = "50%";
            s.top = "50%";
        }

        //_container.appendChild(_square);
        _container.appendChild(_text);

    }

    function update()
    {
        var i, dom;

        if(_progressText !== null)
        {
            //_text.innerHTML = _progressText;
        }
        else
        {
            _text.innerHTML = parseInt(_progress * 100);

            for(i=0;i<_lines.length;i++)
            {
                dom = _lines[i];
                if(dom.parentNode) dom.parentNode.removeChild(dom);
            }

            _segmentIndex = 0;

            //var segmentStart = _loopProgress,
            //    unHandled = _progress,
            //    segmentEnd,
            //    d;

            var segmentStart = _loopProgress,
                unHandled = .5 + _progress * .5,
                segmentEnd,
                d;

            if(_progress >= 1)
            {
                drawSegment(0, .25);
                drawSegment(.25, .5);
                drawSegment(.5, .75);
                drawSegment(.75, 1);
            }
            else if(unHandled > 0)
            {
                while(unHandled)
                {
                    segmentEnd = Math.ceil(segmentStart/.25) * .25;
                    if(segmentEnd === segmentStart) segmentEnd += .25;
                    d = segmentEnd - segmentStart;
                    if(d >= unHandled)
                    {
                        segmentEnd = segmentStart + unHandled;
                        unHandled = 0;
                    }
                    else
                    {
                        unHandled -= d;
                    }

                    drawSegment(segmentStart, segmentEnd);
                    segmentStart = segmentEnd;
                }
            }

            _loopProgress += _loopSpeed;
            if(_loopProgress >= 1) _loopProgress = 0;
        }

        _timeout = setTimeout(update, 33);
    }

    function drawSegment(start, end)
    {
        drawSegment_e(start, end, _size);
        drawSegment_e(start, end, _size+_tickness*4, -1);
    }

    function drawSegment_e(start, end, size, direction)
    {
        var width = size,
            height = size;
        if(direction == null) direction = 1;

        var dom = _lines[_segmentIndex];
        if(!dom)
        {
            console.error("num segment exceed!");
            return;
        }

        var lineStart, lineLength, d, side, s = dom.style;

        d = end - start;
        start = start % 1;

        side = parseInt(start / .25);

        lineLength = d / .25 * size;
        lineStart = (start%.25) / .25 * size;

        if(side == 0)
        {
            s.width = lineLength + "px";
            s.height = _tickness + "px";

            s.marginTop = direction == 1? -height*.5 + "px": height*.5 - _tickness + "px";
            s.marginLeft = direction == 1? -width*.5 + lineStart + "px": width*.5 - lineStart - lineLength + "px";
        }
        else if(side == 1)
        {
            s.height = lineLength + "px";
            s.width = _tickness + "px";

            s.marginLeft = direction == 1? width*.5 - _tickness + "px": -width*.5 + "px";

            s.marginTop = direction == 1? -height*.5 + lineStart + "px": height*.5 - lineStart - lineLength + "px";
        }
        else if(side == 2)
        {
            s.width = lineLength + "px";
            s.height = _tickness + "px";

            s.marginTop = direction == -1? -height*.5 + "px": height*.5 - _tickness + "px";

            s.marginLeft = direction == -1? -width*.5 + lineStart + "px": width*.5 - lineStart - lineLength + "px";
        }
        else if(side == 3)
        {
            s.height = lineLength + "px";
            s.width = _tickness + "px";

            s.marginLeft = direction == -1? width*.5 - _tickness + "px": -width*.5 + "px";

            s.marginTop = direction == -1? -height*.5 + lineStart + "px": height*.5 - lineStart - lineLength + "px";
        }
        else if(side == 4)
        {
            console.error("unexpected error");
        }

        _container.appendChild(dom);
        _segmentIndex ++;
    }

}());