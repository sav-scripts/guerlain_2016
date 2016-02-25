var _port = 3005;

var Facebook = require('facebook-node-sdk'),
    engine = require('engine.io'),
    server = engine.listen(_port),
    fs = require("fs"),
    exec = require('child_process').exec,
    mkdirp = require('mkdirp'),
    del = require('del'),
    utf8 = require('utf8'),
    vc = require("./video-creator");



var _serial = 0,
    _userDic = {};

var logger = console;

logger.info("video share service start at port: " + _port);

server.on('connection', function(socket)
{
    logger.info("on connect");

    var _fb = new Facebook({ appID: '1120712347979943', secret: '26d329129e9f1ec34b37bebd9cba943d', fileUpload: true }),
        _folderName,
        _fb_uid,
        userObj;


    socket.on('close', function ()
    {
        if(userObj)
        {
            delete _userDic[userObj.id];


            if(userObj.folderCreated)
            {
                del(['./tmp/' + userObj.id + "/"], {force:true}).then(function (paths)
                {
                    //logger.info("user folder: " + _folderName + " deleted");
                });
            }
        }
    });

    socket.on('message', function (data)
    {
        //logger.info("on message, data = " + data);
        var obj, params;

        try
        {
            obj = JSON.parse(data);
        }
        catch (e)
        {
            logger.info("got none JSON message: " + data);
            return;
        }

        params = obj.params;


        if (obj.cmd == "sendImages")
        {
            if(!params.accessToken || !params.fbUserId || !params.videoIndex ||
                (params.videoIndex != 1 && params.videoIndex != 2 && params.videoIndex != 3))
            {
                sendResponse(false, {error:"illegal params"});
            }
            else if(_userDic["u_" + params.fbUserId])
            {
                sendResponse(false, {error:"fb account already connected, please close extra connect"});
            }
            else if(!params.imageArray || params.imageArray.length != 3)
            {
                sendResponse(false, {error:"lack images"});
            }
            else
            {
                _fb_uid = params.fbUserId;

                if(!params.shareText) params.shareText = '';

                var id = "u_" + params.fbUserId;
                userObj = _userDic[id] =
                    {
                        id: id,
                        accessToken: params.accessToken,
                        fbUid: params.fbUserId,
                        folderCreated: false
                    };

                _fb.setAccessToken(userObj.accessToken);

                var folderPath = './tmp/' + userObj.id + "/";

                del([folderPath], {force:true}).then(function ()
                {
                    mkdirp(folderPath, function (err)
                    {
                        if (err)
                        {
                            logger.info(err);
                            sendResponse(false, {error:"fail when creating folder"});
                        }
                        else
                        {
                            userObj.folderCreated = true;

                            saveImages(params.imageArray, userObj.id, function(success)
                            {
                                if(success)
                                {
                                    //sendResponse();
                                    //sendEvent("create-progress", {status:"影片合成中..."});

                                    logger.log("creating video for: " + userObj.id);

                                    vc.streamCombine(userObj.id, params.videoIndex, function(err, data)
                                    {
                                        if(err)
                                        {
                                            sendResponse(false, {error: "video create fail: " + err});
                                        }
                                        else
                                        {
                                            var st = vc.settings,
                                                timeCost = data.timeCost;
                                            logger.log("video created for: " + userObj.id + ", time cost: " + data.timeCost);
                                            //sendEvent("create-complete", {id:userObj.id, width: st.videoWidth, height: st.videoHeight, timeCost: data.timeCost, numImages: st.numImages, videoUrl: data.videoUrl});

                                            sendEvent("create-progress", {status:"sharing"});

                                            uploadVideo(userObj.id, params.shareText, function(err, data)
                                            {
                                                if(err)
                                                {
                                                    sendResponse(false, {error:err});
                                                }
                                                else
                                                {
                                                    //sendEvent("create-complete", {id:userObj.id, width: st.videoWidth, height: st.videoHeight, timeCost: timeCost, numImages: st.numImages, videoId: data.videoId});

                                                    sendResponse(true, {id:userObj.id, width: st.videoWidth, height: st.videoHeight, timeCost: timeCost, numImages: st.numImages, videoId: data.videoId});

                                                    setTimeout(function()
                                                    {
                                                        socket.close();
                                                    }, 6000);
                                                }
                                            });
                                        }
                                    }, function(updateResponse)
                                    {
                                        sendEvent("create-progress", updateResponse);
                                    });


                                }
                                else
                                {
                                    sendResponse(false, {error:"save image fail"});
                                }
                            });
                        }
                    });

                });
            }
        }

        function uploadVideo(id, shareText, cb)
        {
            //var filePath = "@" + __dirname  + "\\tmp\\"+_folderName+"\\out.mp4";
            //var filePath = videoUrl;
            var filePath = "@" + __dirname + "/tmp/"+id+"/out.mp4";

            shareText = utf8.encode(shareText);


            //sendResponse(true, {id:"none"});
            //return;

            _fb.api("/me/videos", 'post', {
                source: filePath,
                description: shareText
            }, function(err, data)
            {
                if(err)
                {
                    logger.error("upload to facebook fail: " + err);
                    //sendResponse(false, {error:'fail on sharing video'});
                    cb.call(null, 'fail on uploading video');
                }
                else
                {
                    tagMe(data.id, cb);
                    //console.log("fb share complete");
                }
            });
        }

        function tagMe(videoId, cb)
        {
            //logger.info("tagging me");
            //logger.info(params.userId);
            //logger.info(params.friendId);

            _fb.api("/" + videoId + "/tags", "post", {
                tag_uid: userObj.fbUid
            }, function(err, data)
            {
                if(err)
                {
                    cb.call(null, 'fail on tagging');
                }
                else
                {
                    cb.call(null, null, {videoId: videoId});
                }

            });
        }


        function sendResponse(success, params)
        {
            if(success == null) success = true;
            if(!params) params = {};
            params.success = success;
            socket.send(getResponse(obj, params));
        }

        function sendEvent(cmd, params)
        {
            socket.send(JSON.stringify({cmd: cmd, type:"event", params:params}));
        }
    });
});

function createUser(fbid)
{
    /*
    var serial = _serial,
        id = "u" + serial;
    _userDic[id] =
    {
        id: id
    };

    _serial ++;
    */

    return _userDic[id];
}

function saveImages(imageArray, folderName, cb)
{
    var index = 0;

    execute();

    function execute()
    {
        if(index >= imageArray.length)
        {
            cb.call(null, true);
        }
        else
        {
            var file = "./tmp/"+folderName+"/image_"+index+".jpg";

            logger.log("saving file: " + file);

            fs.writeFile(file, imageArray[index], 'base64', function(err)
            {
                //logger.info("error = " + err);
                if(err)
                {
                    cb.call(null, false);
                }
                else
                {
                    index++;
                    execute();
                }
            });
        }
    }
}

// misc methods
function getResponse(obj, params)
{
    if(params == null) params = {success:true};
    return JSON.stringify({cmd: obj.cmd, timestamp: obj.timestamp, type:"response", params:params});
}



