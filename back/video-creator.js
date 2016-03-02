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
                numImages: 465,
                keyword: "Orange",
                geom:
                [
                    {index: 0, startFrame:73, endFrame:145, offsetX:174, offsetY: 9, rotation:-4.1},
                    {index: 1, startFrame:177, endFrame:250, offsetX:-122, offsetY: 10, rotation:-1.8},
                    {index: 2, startFrame:291, endFrame:465, offsetX:97, offsetY: 0, rotation:3.5}
                ],
                text:
                    [
                        {start:73, end:145},
                        {start:177, end:250},
                        {start:291, end:465}
                    ]
            },
            v2:
            {
                numImages: 479,
                keyword: "Pink",
                geom:
                    [
                        {index: 0, startFrame:81, endFrame:136, offsetX:91, offsetY: -77, rotation:-5.5},
                        {index: 1, startFrame:161, endFrame:281, offsetX:-180, offsetY: -59, rotation:-9.8},
                        {index: 2, startFrame:321, endFrame:402, offsetX:188, offsetY: -4, rotation:3.7}
                    ],
                text:
                    [
                        {start:81, end:136},
                        {start:161, end:281},
                        {start:321, end:402}
                    ]
            },
            v3:
            {
                numImages: 431,
                keyword: "Red",
                geom:
                    [
                        {index: 0, startFrame:47, endFrame:115, offsetX:164, offsetY: -4, rotation:-2.4},
                        {index: 1, startFrame:139, endFrame:207, offsetX:-121, offsetY: -17, rotation:-4.4},
                        {index: 2, startFrame:231, endFrame:321, offsetX:169, offsetY: -4, rotation:-3.7}
                    ],
                text:
                    [
                        {start:47, end:115},
                        {start:139, end:207},
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

function streamCombine(id, videoIndex, textIndexArray, cbComplete, cbUpdate)
{
    console.log("stream combine start for: " + id + ", video: " + videoIndex + ", textIndex: " + JSON.stringify(textIndexArray));

    var isEnd = false,
        time = Date.now(),
        frameIndex = st.startIndex;

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
        if(frameIndex >= combineSetting.numImages)
        {
            encoder.stdin.end();

            //cb.call(null, true, timeCost);
        }
        else
        {
            update("image-compose", {index:frameIndex, num:combineSetting.numImages});



            var sObj = getComposeString(id, videoIndex, frameIndex, textIndexArray);
            var exeString = sObj.f0 + ' ' + sObj.userImage + sObj.f1 + '-quality 100 jpeg:-';
            //var exeString = getComposeString("u0", videoIndex, frameIndex);

            frameIndex++;

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

//getComposeString("u0", 1, 106);
function getComposeString(id, videoIndex, frameIndex, textIndexArray)
{
    var combineSetting = st.combineSetting["v" + videoIndex];

    var geomSetting = combineSetting.geom,
        textSetting = combineSetting.text,
        keyword = combineSetting.keyword,
        i, obj;

    var topExist = false,
        topIndex = null,
        textIndex = 0;


    for(i=0;i<textSetting.length;i++)
    {
        obj = textSetting[i];
        if(frameIndex>=obj.start && frameIndex <= obj.end)
        {
            topExist = true;
            topIndex = i+1;
            textIndex = textIndexArray[i];
            break;
        }
    }

    var serial = String(100000 + frameIndex).substr(1),

        topLayerKeyword = keyword + "_FG_"  + "0" + topIndex + "-" + textIndex,

        f0 = "./source/" + keyword + "/" + keyword + "_BG/" + keyword + "_BG_" + serial + ".jpg",
        f1 = topExist? './source/' + keyword + "/" + topLayerKeyword + "/" + topLayerKeyword + "_" + serial + ".png -composite ": "",

        userImage = '';

    //console.log("f0 = " + f0);
    //console.log("f1 = " + f1);


    for(i=0; i<geomSetting.length; i++)
    {
        obj = geomSetting[i];
        if(frameIndex>=obj.startFrame && frameIndex <= obj.endFrame)
        {
            userImage = '( -background transparent tmp/' + id + '/image_'+obj.index+'.jpg -geometry +'+obj.offsetX+'+'+obj.offsetY+' -rotate '+obj.rotation+' ) -gravity center -composite ';
            //userImage = '( -background transparent tmp/' + id + '/image_'+obj.index+'.jpg -distort SRT "0,0 1 10 10,10" ) -composite ';

            break;
        }
    }

    //console.log('userImage = ' + userImage);

    //var exeString = f0 + ' ' + userImage + f1 + '-quality 100 jpeg:-';
    //return exeString;

    return {f0: f0, f1: f1, userImage: userImage};

}

function testCombine(id, videoIndex, frameIndex, textIndexArray)
{
    var sObj = getComposeString("u0", videoIndex, frameIndex, textIndexArray);
    var exeString = sObj.f0 + ' ' + sObj.userImage + sObj.f1 + '-quality 100 ./out/out_' + videoIndex + "_" + frameIndex + ".jpg";

    //var exeString = getComposeString("u0", videoIndex, frameIndex, textIndexArray);

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
testVideoCombine(1, [1, 2, 3]);
testVideoCombine(2, [1, 2, 3]);
testVideoCombine(3, [1, 2, 3]);
function testVideoCombine(vi, textIndexArray)
{
    testCombine("u0", vi, st.combineSetting["v" + vi].geom[0].startFrame + 20, textIndexArray);
    testCombine("u0", vi, st.combineSetting["v" + vi].geom[1].startFrame + 20, textIndexArray);
    testCombine("u0", vi, st.combineSetting["v" + vi].geom[2].startFrame + 20, textIndexArray);
}
*/



/*
 var testId = "u0", testVideoIndex = 3;
 console.log("stream combine start for: " + testId + ", video index: " + testVideoIndex);
 streamCombine(testId, testVideoIndex, [1,2,1], function(err, data)
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

