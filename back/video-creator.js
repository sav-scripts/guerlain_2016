var st =
{
    numImages: 450,
    videoWidth: 720,
    videoHeight: 405,
    combineSetting:
    [
        {index: 0, startFrame:89, endFrame:158, offsetX:20, offsetY: 20, rotation:10},
        {index: 1, startFrame:191, endFrame:280, offsetX:300, offsetY: 60, rotation:-20},
        {index: 2, startFrame:301, endFrame:376, offsetX:120, offsetY: 50, rotation:30}
    ]
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

/*
var testId = "u0";
console.log("stream combine start for: " + testId);
streamCombine(testId, function(err, data)
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

function streamCombine(id, cbComplete)
{
    //console.log("stream combine start for: " + id);

    var isEnd = false,
        time = Date.now(),
        index = 0;

    /** prepare video **/
    var fps = 30,
        duration = st.numImages / fps - .1;


    var encodeString = '-y -f jpeg_pipe -r 30 -s '+st.videoWidth+'x'+st.videoHeight+' -i - -f mp4 -c:v libx264 -pix_fmt yuv422p ./tmp/'+id+'/video.mp4',
        encoder;

    //console.log("encode string = " + encodeString);

    encoder = spawn('ffmpeg', encodeString.split(' '));
    //encoder.stderr.pipe(process.stdout);

    encoder.on("error", encoderOnError);
    encoder.stdout.on("end", encoderOnEnd);

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

        var outPath = config.isServer? config.videoOutPath + 'v_' + id + '.mp4'  :'./tmp/'+id+'/out.mp4';
        var string = 'ffmpeg -y -i ./tmp/'+id+'/video.mp4 -i bgm.mp3 -c:v copy -c:a copy -t '+duration+' ' + outPath;

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
        if(index >= st.numImages)
        {
            encoder.stdin.end();

            //cb.call(null, true, timeCost);
        }
        else
        {
            var serial = String(100000 + index).substr(1),

                f0 = config.layer0Path + '720x405_JPEG_5__' + serial + ".jpg",
                f1 = config.layer1Path + 'TITLE_' + serial + ".png -composite ",

                i,
                userImage = '',
                obj;

            for(i=0; i<st.combineSetting.length; i++)
            {
                obj = st.combineSetting[i];
                if(index>=obj.startFrame && index <= obj.endFrame)
                {
                    //combine = obj;
                    //'( top3.jpg -rotate 10 -geometry +100+100 ) -composite';
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
}


