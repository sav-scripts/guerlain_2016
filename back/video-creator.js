var st =
{
    startIndex: 0,
    numImages: 450,
    videoWidth: 720,
    videoHeight: 405,
    combineSetting:
        {
            v1:
            {
                numImages: 450,
                keyword: "Sweet",
                geom:
                [
                    {index: 0, startFrame:89, endFrame:158, offsetX:20, offsetY: 20, rotation:10},
                    {index: 1, startFrame:191, endFrame:280, offsetX:300, offsetY: 60, rotation:-20},
                    {index: 2, startFrame:301, endFrame:376, offsetX:120, offsetY: 50, rotation:30}
                ],
                text:
                    [
                        {start:81, end:136},
                        {start:321, end:402}
                    ]
            },
            v2:
            {
                numImages: 450,
                keyword: "Pretty",
                geom:
                    [
                        {index: 0, startFrame:73, endFrame:145, offsetX:344, offsetY: 78, rotation:-2.7},
                        {index: 1, startFrame:177, endFrame:249, offsetX:50, offsetY: 80, rotation:-2.7},
                        {index: 2, startFrame:291, endFrame:363, offsetX:310, offsetY: 10, rotation:2.7}
                    ],
                text:
                    [
                        {start:73, end:145},
                        {start:177, end:268},
                        {start:291, end:396}
                    ]
            },
            v3:
            {
                numImages: 450,
                keyword: "Sexy",
                geom:
                    [
                        {index: 0, startFrame:89, endFrame:158, offsetX:20, offsetY: 20, rotation:10},
                        {index: 1, startFrame:191, endFrame:280, offsetX:300, offsetY: 60, rotation:-20},
                        {index: 2, startFrame:301, endFrame:376, offsetX:120, offsetY: 50, rotation:30}
                    ],
                text:
                    [
                        {start:47, end:115},
                        {start:139, end:208},
                        {start:231, end:321}
                    ]
            }
        }
};

var config = require("./config.json");


(function() {
    var childProcess = require("child_process");
    var oldSpawn = childProcess.spawn;
    function mySpawn() {
        //console.log('spawn called');
        //console.log(arguments);
        return oldSpawn.apply(this, arguments);
    }
    childProcess.spawn = mySpawn;
})();

var spawn = require("child_process").spawn,
    exec = require('child_process').exec,
    fs = require('fs');

module.exports = {
    streamCombine: streamCombine,
    settings: st
};

function streamCombine(id, videoIndex, cbComplete, cbUpdate)
{
    //console.log("stream combine start for: " + id);

    var isEnd = false,
        time = Date.now(),
        index = st.startIndex,
        textLayerIndex = 0;

    /** prepare video **/
    var combineSetting = st.combineSetting["v" + videoIndex];
    var fps = 30,
        duration = (combineSetting.numImages / fps) - .1;


    // yuv422p

    var rate = 450 / 540;
    var encodeString = '-y -f jpeg_pipe -s '+st.videoWidth+'x'+st.videoHeight+' -i pipe:0 -f mp4 -c:v libx264 -pix_fmt yuvj444p -filter:v setpts='+rate+'*PTS -r 30 ./tmp/'+id+'/video.mp4',
        encoder;

    //console.log("encode string = " + encodeString);

    encoder = spawn('ffmpeg', encodeString.split(' '));
    //encoder.stderr.pipe(process.stdout);

    encoder.on("error", encoderOnError);
    encoder.stdout.on("end", encoderOnEnd);

    encoder.stdout.on("data", function(data)
    {
       console.log("on data: " + data);
    });

    function encoderOnError()
    {
        encoder.removeAllListeners();
        encoder.stdout.removeAllListeners();
        end("ffmpeg execute fail");
    }

    function encoderOnEnd()
    {
        encoder.removeAllListeners();
        encoder.stdout.removeAllListeners();
        if(isEnd) return;

        /** combine with audio **/

        var audioPath = "./source/audio/v" + videoIndex + "_bgm.mp3";
        //var outPath = config.isServer? config.exposePath + 'v_' + id + '.mp4'  :'./tmp/'+id+'/out.mp4';
        var outPath = './tmp/'+id+'/out.mp4';
        var string = 'ffmpeg -y -i ./tmp/'+id+'/video.mp4 -i '+audioPath+' -c:v copy -c:a copy ' + outPath;

        /*
        var videoUrl = config.isServer?
                    "http://" + config.domain + outPath:
                    "http://" + config.domain + config.exposePath + "tmp/" + id + "/out.mp4";
                    */

        exec(string, function(err, data)
        {
            if(err)
            {
                end(err);
            }
            else
            {
                var timeCost = parseInt((Date.now() - time)/100)/10;
                end(null, timeCost);
            }
        });


    }

    /** combine images **/

    combineOneImage();

    function combineOneImage()
    {
        if(index >= combineSetting.numImages)
        {
            encoder.stdin.end();

            //cb.call(null, true, timeCost);
        }
        else
        {
            update("image-compose", {index:index, num:combineSetting.numImages});

            var geomSetting = combineSetting.geom,
                textSetting = combineSetting.text,
                keyword = combineSetting.keyword,
                i, obj;

            var layer0Path = "./source/video_" + videoIndex + "/BG/" + keyword + "_BG_";
            var layer1Path = "./source/video_" + videoIndex + "/FG/" + keyword + "_FG_";

            var textLayerExist = false;
            for(i=0;i<textSetting.length;i++)
            {
                obj = textSetting[i];
                if(index>=obj.start && index <= obj.end)
                {
                    textLayerExist = true;
                    break;
                }
            }

            var serial = String(100000 + index).substr(1),

                f0 = layer0Path + serial + ".jpg",
                f1 = textLayerExist? layer1Path + serial + ".png -composite ": "",

                userImage = '';

            for(i=0; i<geomSetting.length; i++)
            {
                obj = geomSetting[i];
                if(index>=obj.startFrame && index <= obj.endFrame)
                {
                    userImage = '( -background transparent tmp/' + id + '/image_'+obj.index+'.jpg -geometry +'+obj.offsetX+'+'+obj.offsetY+' -rotate '+obj.rotation+' ) -composite ';

                    break;
                }
            }

            index++;


            var exeString = f0 + ' ' + userImage + f1 + '-quality 100 jpeg:-';
            var args = exeString.split(' ');

            var proc = spawn("convert", args);

            proc.on("error", onProcErr);
            proc.stdout.on("end", onEnd);
            proc.stderr.on("data", onErr);

            proc.stdout.pipe(encoder.stdin, {end: false});
            //proc.stdout.pipe(encoder.stdout);

            proc.on("close", function()
            {
               console.log("on close");
            });

            function onEnd()
            {
                clearListeners();

                proc.stdout.unpipe(encoder.stdin);
                combineOneImage();
            }

            function onProcErr()
            {
                clearListeners();
                end("compose image execute error");
            }

            function onErr(err)
            {
                clearListeners();
                end("compose image error: " + err);
            }

            function clearListeners()
            {
                proc.removeAllListeners();
                proc.stdout.removeAllListeners();
            }
        }
    }

    function end(err, timeCost)
    {
        if(isEnd) return;

        isEnd = true;
        cbComplete.call(null, err, {timeCost: timeCost});
    }

    function update(status, data)
    {
        if(cbUpdate)
        {
            cbUpdate.call(null,
            {
                status: status,
                data: data
            });
        }
    }
}

function testCombine(id, videoIndex, frameIndex)
{
    var combineSetting = st.combineSetting["v" + videoIndex];
    var index = frameIndex;

    var geomSetting = combineSetting.geom,
        textSetting = combineSetting.text,
        keyword = combineSetting.keyword,
        i, obj;

    var layer0Path = "./source/video_" + videoIndex + "/BG/" + keyword + "_BG_";
    var layer1Path = "./source/video_" + videoIndex + "/FG/" + keyword + "_FG_";

    var textLayerExist = false;
    for(i=0;i<textSetting.length;i++)
    {
        obj = textSetting[i];
        if(index>=obj.start && index <= obj.end)
        {
            textLayerExist = true;
            break;
        }
    }

    var serial = String(100000 + index).substr(1),

        f0 = layer0Path + serial + ".jpg",
        f1 = textLayerExist? layer1Path + serial + ".png -composite ": "",

        userImage = '';

    for(i=0; i<geomSetting.length; i++)
    {
        obj = geomSetting[i];
        if(index>=obj.startFrame && index <= obj.endFrame)
        {
            userImage = '( -background transparent tmp/' + id + '/image_'+obj.index+'.jpg -geometry +'+obj.offsetX+'+'+obj.offsetY+' -rotate '+obj.rotation+' ) -composite ';

            break;
        }
    }

    var exeString = f0 + ' ' + userImage + f1 + '-quality 100 ./out/out_' + serial + ".jpg";
    exec("convert " + exeString, function(err, data)
    {
        if(!err)
        {
            console.log("test combine, id: " + id + ", video: " + videoIndex + ", frame: " + frameIndex + ", done.");
        }
        else
        {
            console.log("err = " + err);
        }
    });

}


/** tests **/

/*
testVideoCombine(2);
function testVideoCombine(vi)
{
    testCombine("u0", vi, st.combineSetting["v" + vi].geom[0].startFrame);
    testCombine("u0", vi, st.combineSetting["v" + vi].geom[1].startFrame);
    testCombine("u0", vi, st.combineSetting["v" + vi].geom[2].startFrame);
}
*/

/*
 var testId = "u0", testVideoIndex = 3;
 console.log("stream combine start for: " + testId + ", video index: " + testVideoIndex);
 streamCombine(testId, testVideoIndex, function(err, data)
 {
 if(err)
 {
 console.log("video create fail: " + err);
 }
 else
 {
 console.log("video created, total timeCost: " + data.timeCost + " sec");
 }
 });
 */

