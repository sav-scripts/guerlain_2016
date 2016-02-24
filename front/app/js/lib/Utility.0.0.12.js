/** Utility **/
(function(){

    var _p = window.Utility = {};

    //var _hash = window.location.hash.replace("#", "");




    var _oldConsoleMethod = {};
    var _consoleMethods = {};
    _consoleMethods["log"] = "log";
    _consoleMethods["warn"] = "warn";
    _consoleMethods["error"] = "error";
    _consoleMethods["debug"] = "debug";
    _consoleMethods["info"] = "info";

    Utility.setConsoleMethod = function(methodName/*string*/, enableIt/*boolean*/)
    {
        (enableIt == true) ? console[methodName] = _oldConsoleMethod[methodName] : console[methodName] = function(){};
    };

    Utility.disableAllConsoleMethods = function()
    {
        for(var key in _consoleMethods) this.setConsoleMethod(key, false);
    };

    Utility.enableAllConsoleMethods = function()
    {
        for(var key in _consoleMethods) this.setConsoleMethod(key, true);
    };

    (function()	{
        /** fix console methods for some browser which don't support it **/
        if(!window.console){
            window.console = {};
            for(var key in _consoleMethods){ console[_consoleMethods[key]] = function(){}; }
        }

        // store old console methods
        for(var key in _consoleMethods){ _oldConsoleMethod[_consoleMethods[key]] = console[_consoleMethods[key]]; }

        /** fix Array indexOf method **/
        if (!window.Array.prototype.indexOf)
        {
            window.Array.prototype.indexOf = function(elt /*, from*/)
            {
                var len = this.length >>> 0;

                var from = Number(arguments[1]) || 0;
                from = (from < 0)
                    ? Math.ceil(from)
                    : Math.floor(from);
                if (from < 0)
                    from += len;

                for (; from < len; from++)
                {
                    if (from in this &&
                        this[from] === elt)
                        return from;
                }
                return -1;
            };
        }
    }());

    var _testedUrls = {};
    Utility.analyzeURL = function(url)
    {
        if(!_testedUrls[url])
        {
            var pattern = /^((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/;
            _testedUrls[url] = url.match(pattern);
        }

        return _testedUrls[url];
    };

    Utility.getPath = function(url)
    {
        if(!url) url = window.location.href;

        var string = url.indexOf('?') == -1? url: url.substr(0, url.indexOf('?'));

        if(string.indexOf('#') !== -1)
        {
            string = string.substr(0, string.indexOf('#'));
        }


        var array = string.split("/");
        var lastPart = array[array.length-1];
        if(lastPart.indexOf(".") !== -1) array.pop();

        string = array.join("/");


        while(string.length && string.charAt(string.length-1) == "/")
        {
            string = string.slice(0, string.length - 1);
        }
        //console.log(string.charAt(string.length-1));

        string += "/";



        return string;

    };

    Utility.getProtocol = function(url)
    {
        if(!url) url = window.location.href;
        return Utility.analyzeURL(url)[2];
    };

    Utility.urlParams = (function()
    {
        var url = decodeURIComponent(window.location.href);
        var paramString = url.split("?")[1];
        if(!paramString) { return {}; }
        paramString = paramString.split("#")[0];
        var urlParams = {};
        var array = paramString.split("&");

        for(var i=0;i<array.length;i++)
        {
            var array2 = array[i].split("=");
            urlParams[array2[0]] = array2[1];
        }
        return urlParams;
    }());

    Utility.isLocalhost = (function()
    {
        var address = window.location.toString().split("/")[2];
        return (address == "localhost" || address.split(".")[0] == "192");
    }());

    Utility.preloadImages = function(urlList, cb, cbUpdateProgress, allowError)
    {
        if(allowError == null) allowError = true;
        if(!urlList || urlList.length == 0){ if(cb) cb.apply(); return; }

        var i = 0;
        loadUrl();
        function loadUrl()
        {
            if(cbUpdateProgress) cbUpdateProgress.apply(null, [(i/urlList.length*100)<<0]);
            if(i >= urlList.length) { if(cb)cb.apply(); return; }

            var url = urlList[i];
            var setting = null;

            if(!(typeof url === "string"))
            {
                setting = url;
                url = setting.url;
            }

            i++;
            var imageDom = new Image();
            imageDom.onload = toNext;
            if(allowError) imageDom.onerror = function(){ console.error("load image error: ["+url+"]"); toNext(); };
            imageDom.src = url;

            function toNext()
            {
                if(setting != null) setting.collector[setting.name] = imageDom;
                imageDom.onerror = null; imageDom.onload = null; loadUrl();
            }
        }
    };

    Utility.shuffleArray = function (o)
    {
        for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    };

}());

/** PatternSamples **/
(function(){

var PatternSamples = window.PatternSamples = {};
PatternSamples["email"] = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
PatternSamples["phone"] = /^(09)[0-9]{8}$/;
PatternSamples["number"] = /[0-9]/g;
PatternSamples["nonNumber"] = /[^0-9]/g;
PatternSamples["onlySpace"] = /^\s*$/;
PatternSamples["localPhone"] = /^(0)\d{1,3}(-)\d{5,8}$/;
PatternSamples["personId"] = /^[A-Z]{1}[1-2]{1}[0-9]{8}$/;

}());