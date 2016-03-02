/**
 * Created by sav on 2016/2/16.
 */
(function(){

    var _socket,
        _isActive = false;

    window.ServerProxy =
    {
        start: function(videoIndex, imageArray, textIndexArray, shareText, cb)
        {
            if(_isActive) return;
            _isActive = true;

            Loading.progress("上傳圖片中...").show();

            var socketUrl = Main.settings.socketUrl;
            _socket = new SocketHandler(socketUrl, function()
            {
                _socket.on("create-progress", function(eventData)
                {
                    if(eventData.status == "image-compose")
                    {
                        Loading.progress("影片合成中 ... " + eventData.data.index + "/" + eventData.data.num);
                    }
                    else if(eventData.status == "sharing")
                    {
                        Loading.progress("分享至 Facebook 中");
                    }
                });

                _socket.send("sendImages",
                {
                    videoIndex: videoIndex,
                    imageArray: imageArray,
                    textIndexArray: textIndexArray,
                    shareText: shareText,
                    fbUserId: Main.settings.fbUid,
                    accessToken: Main.settings.fbToken
                }, function(response)
                {
                    if(response.success)
                    {
                        alert("影片分享成功, 請稍候至您的 Facebook 塗鴉牆觀看");
                        Loading.hide();

                        _isActive = false;


                        _socket.close();

                        cb.call(null, true);
                    }
                    else
                    {
                        alert(response.error);
                        _isActive = false;

                        _socket.close();

                        cb.call(null, false);
                    }
                });
            });

        }
    };

}());