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
            if(params.imageArray && params.imageArray.length == 3)
            {
                var userObj = createUser(),
                    folderPath = './tmp/' + userObj.id + "/";

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
                            saveImages(params.imageArray, userObj.id, function(success)
                            {
                                if(success)
                                {
                                    //sendResponse();
                                    sendEvent("create-progress", {status:"影片合成中..."});

                                    logger.log("creating video for: " + userObj.id);

                                    vc.streamCombine(userObj.id, function(err, data)
                                    {

                                        if(err)
                                        {
                                            //sendEvent("create-progress", {status:"影片失敗, 錯誤原因: " + err});
                                            sendResponse(false, {error: "video create fail: " + err});
                                        }
                                        else
                                        {
                                            var st = vc.settings;
                                            logger.log("video created for: " + userObj.id + ", time cost: " + data.timeCost);
                                            sendEvent("create-complete", {id:userObj.id, width: st.videoWidth, height: st.videoHeight, timeCost: data.timeCost, numImages: st.numImages});
                                        }
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
            else
            {
                sendResponse(false, {error:"lacking parameters"});

            }
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

function createUser()
{
    var serial = _serial,
        id = "u" + serial;
    _userDic[id] =
    {
        id: id
    };

    _serial ++;

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



