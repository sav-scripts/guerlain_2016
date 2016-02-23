(function(){




    var _p = window.FBHelper = {};

    var _appId;
    var _defaultScope = ["public_profile"];

    _p.uid = null;
    _p.uname = null;

    _p.init = function(setting, cb, logLoginStatus)
    {
        if(typeof(setting) == "string")
        {
            setting =
            {
                appId: setting,
                cookie: true,
                xfbml: true,
                version: "v2.4"
            };
        }

        _appId = setting.appId;

        window.fbAsyncInit = function()
        {
            FB.init(setting);

            if(logLoginStatus)
            {
                FB.getLoginStatus(function(response) {
                    statusChangeCallback(response);
                });
            }

            if(cb) cb.apply();
        };

        (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/zh_TW/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    };

    // This is called with the results from from FB.getLoginStatus().
    function statusChangeCallback(response)
    {
        console.log('statusChangeCallback');
        console.log(response);
        if (response.status === 'connected') {
            console.log("connected");
        } else if (response.status === 'not_authorized') {
            console.log("not authorized");
        } else {
            console.log("not login");
        }
    }

    _p.login = function(scope, cb_yes, cb_no)
    {
        if(!scope) scope = _defaultScope;
        FB.login(function (response)
        {
            if (response.authResponse)
            {
                _p.uid = response.authResponse.userID;

                if(response.status == "connected")
                {
                    if(cb_yes != null) cb_yes.apply(null, [response]);
                }
                else
                {
                    if(cb_no != null) cb_no.apply(null, [{action:"login", response:response, type:response.status, message:"not connected"}]);
                }
            } else {
                if(cb_no != null) cb_no.apply(null, [{action:"login", response:response, type:response.status, message:"user cancel login"}]);
            }
        }, {
            scope: scope
        });
    };

    _p.getPublicProfile = function(cb)
    {
        FB.api('/me', function(response)
        {
            _p.uname = response.name;
            cb.apply(null, [response]);
        });
    };



    window.FBData = FBData;
    function FBData(api, apiParams, cbFetchComplete)
    {
        this.api = api;
        this.apiParams = apiParams;
        this.after = null;
        this.dataList = [];
        this.thereIsMore = true;
        this.cbFetchComplete = cbFetchComplete;
        this.lastFetchIndex = 0;
    }

    FBData.prototype.fetch = function()
    {
        var parent = this;

        if(!parent.thereIsMore)
        {
            console.log("warning: trying to fetch data where there is no more.");
            parent.cbFetchComplete.call(parent, parent.dataList);
        }

        parent.lastFetchIndex = parent.dataList.length;

        FB.api(parent.api, 'GET', parent.apiParams, function(response)
        {
            if(response.error)
            {
                console.error(response.error);
            }
            else
            {
                parent.dataList = parent.dataList.concat(response.data);

                parent.apiParams.after = Boolean(response.paging && response.paging.next)? response.paging.cursors.after: null;
                if(!parent.apiParams.after)
                {
                    delete parent.apiParams.after;
                    parent.thereIsMore = false;
                }
                else
                {
                    parent.thereIsMore = true;
                }

                parent.cbFetchComplete.call(parent, parent.dataList);
            }
        });

        return this;
    }

}());








