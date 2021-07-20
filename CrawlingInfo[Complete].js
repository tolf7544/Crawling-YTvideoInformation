
 
class CrawlingData {

    async crawlingData(axios, YoutubeVideoUrl) {
        var Time
        // YoutubeVideo=> 영상 시간

        var Yturl = YoutubeVideoUrl;
        // youtubeVideoUrl => 유튜브영상 링크
        console.log(Yturl)
        var Result
        //결과값
        var YTid
        /*__Get ID for the URL => 링크 ID 저장__*/
        if (Yturl.indexOf(`v=`) >= 0) { YTid = Yturl.replace(`https://www.youtube.com/watch?v=`, ``) } else { YTid = Yturl.replace(`https://youtu.be/`, ``) }
        Yturl = `https://youtu.be/` + YTid
        /*_______________*/


        const YTInfo = {
            ChannelThumbnail: undefined,
            Channelname: undefined,
            ChannelUrl: undefined,
            VideoTitle: undefined,
            LengthSeconds: undefined,
            VideoThumbnail: undefined,
            RecommendVideoListTitle: undefined,
            RecommendVideoUrlList: undefined,
        }

        /*______ Crawling YtUrl by {axios} => 크롤링______*/
        await getHTML(Yturl)
            .then((body, error) => {

                if (!error) {
                    body = body.data
                    /* Channel Img Url ____________________________________________*/
                    var channelThumbnail = body.match(/"url":\"https[^\"]*\","width":48,"height":48}/g)
                    channelThumbnail = channelThumbnail[0].replace(`","width":48,"height":48}`, ``); channelThumbnail = channelThumbnail.trim()

                    if (!channelThumbnail) {
                        channelThumbnail = body.match(/"url":\"https[^\"]*\","width":40,"height":40}/g)
                        channelThumbnail = channelThumbnail[0].replace(`","width":48,"height":48}`, ``); channelThumbnail = channelThumbnail.trim()
                    }

                    channelThumbnail = channelThumbnail.replace(`"url":"`, ``); channelThumbnail = channelThumbnail.trim();
                    /*__________________________________________________________*/



            /* ChannelName & URL ____________________________________________*/
            var channelname = body.match(/"ownerChannelName":\"[^\"]*\"/g)
            var channelUrl = body.match(/"ownerProfileUrl":\"[^\"]*\"/g)

            channelname = channelname[0].replace(`"ownerChannelName":"`, ``);
            channelname = channelname.trim(); channelname = channelname.replace(`"`, ``);
            channelname = channelname.trim()

            channelUrl = channelUrl[0].replace(`"ownerProfileUrl":"`, ``);
            channelUrl = channelUrl.trim();

            channelUrl = channelUrl.replace(`"`, ``);
            channelUrl = channelUrl.trim();
            /*__________________________________________________________*/


            /* Video Title _________________________________________*/
            var videoTitle = body.match(/"title":\"[^\"]*\","lengthSeconds"/g)
            console.log(videoTitle)
            videoTitle = videoTitle[0].replace(`"title":"`, ``);
            videoTitle = videoTitle.trim();

            videoTitle = videoTitle.replace(`","lengthSeconds"`, ``);
            videoTitle = videoTitle.trim();
            /*__________________________________________________________*/


            /* video timeStamp _________________________________________*/
            var lengthSeconds = body.match(/"lengthSeconds":\"[^\"]*\",/g)
            
            console.log(`lengthSeconds`)
            lengthSeconds = lengthSeconds[0].replace(`"lengthSeconds":"`, ``);
            lengthSeconds = lengthSeconds.trim();

            lengthSeconds = lengthSeconds.replace(`",`, ``);
            lengthSeconds = lengthSeconds.trim()
            
            lengthSeconds = TimeSet(Time, lengthSeconds)
            console.log(lengthSeconds)
            /*__________________________________________________________*/



                    /* video Thumbnail _____________________________________________*/
                    var videoThumbnail = body.match(/{"thumbnail":{"thumbnails":\[{"url":\"[^\"]*\"/g)
                    videoThumbnail = videoThumbnail[0].replace(`{"thumbnail":{"thumbnails":[{"url":`, ``);
                    videoThumbnail = videoThumbnail.trim();

                    videoThumbnail = videoThumbnail.replace(`"`, ``);
                    videoThumbnail = videoThumbnail.replace(`"`, ``);
                    videoThumbnail = videoThumbnail.trim()
                    /*__________________________________________________________*/


                    /* Recommend Video ________________________________________________*/
                    //Video Title______________________________________________________
                    var recommandVideoTitle = body.match(/}},"simpleText":\"[^\"]*\"},"longBylineText":{/g)
                    var rVideoListT = []
                    for (var i = 0; i < 5; i++) {
                        rVideoListT.push(recommandVideoTitle[i].replace(`}},"simpleText":"`, ``));
                        rVideoListT[i].trim();

                        rVideoListT[i] = rVideoListT[i].replace(`"},"longBylineText":{`, ``);
                        rVideoListT[i].trim()
                    }
                    //____________________________________________________________

                    //Recommend video ID => URL___________________________________________________
                    var recommandVideoUrl = body.match(/,"videoId":\"[^\"]*\","listType":"/g)

                    var recommendVideoUrlList = []
                    //recommendVideoListUrl Array => 추천영상Url 리스트

                    for (var i = 0; i < 5; i++) {
                        recommendVideoUrlList.push(recommandVideoUrl[i * 2].replace(`,"videoId":"`, ``));
                        recommendVideoUrlList[i].trim(); recommendVideoUrlList[i] = recommendVideoUrlList[i].replace(`","listType":"`, ``);
                        recommendVideoUrlList[i].trim();

                        recommendVideoUrlList[i] = `https://www.youtube.com/watch?v=` + recommendVideoUrlList[i]
                    }
                    /*______________________________________________________________*/

                    /* 출력 */
                    console.log(channelThumbnail)
                    YTInfo.ChannelThumbnail = channelThumbnail
                    //채널 썸네일

                    console.log(channelname)
                    YTInfo.Channelname = channelname
                    //채널 이름

                    console.log(channelUrl)
                    YTInfo.ChannelUrl = channelUrl
                    //채널 주소

                    var position = /\\u/.exec(videoTitle) // 영상 제목중 변환이 않된 특수문자 [\\uxxxx] 를 다른 특수문자로 변환
                    if (position != undefined) {
                        console.log(position)
                        videoTitle = videoTitle.replace(videoTitle.substr(position.index, position.index + 6), ` ` + `▣` + ` `)
                    }
                    YTInfo.VideoTitle = videoTitle
                    //VideoTitle 영상 제목

                    console.log(lengthSeconds)
                    YTInfo.LengthSeconds = lengthSeconds
                    //videoTimeStamp 영상 시간

                    console.log(videoThumbnail)
                    YTInfo.VideoThumbnail = videoThumbnail
                    //videoThumbail 영상 썸네일

                    console.log(rVideoListT)
                    YTInfo.RecommendVideoListTitle = rVideoListT
                    //recommendVideoTitle 추천영상 제목

                    console.log(recommendVideoUrlList)
                    YTInfo.RecommendVideoUrlList = recommendVideoUrlList
                    //recommendVideoURL 추천영상 링크

                    //유튜브 시간을 [시/분/초] 형식으로 바꾸기 => Set YoutubeTimeStamp length to  [H : M : S] format

                    /*
                    
                    1_
              
                    */
                    function TimeSet(Time, lengthSeconds) {
                        if (lengthSeconds * 1 < 60) {
                            Time = `${lengthSeconds}초`
                        } else if (lengthSeconds * 1 > 3600) {
                            var Sec = lengthSeconds * 1 % 60
                            var Min = (lengthSeconds * 1 - Sec * 1) / 60
                            var H = Min % 60
                            H = H - H / 60
                            Time = `${H}시간 ${Min - H * 60}분 ${Sec}초`
                        } else if (lengthSeconds * 1 > 60) {
                            var Sec = lengthSeconds * 1 % 60
                            var Min = (lengthSeconds * 1 - Sec * 1) / 60
                            Time = `${Min}분 ${Sec}초`
                        }
                     return Time;
                    }

                    /*______________*/

                } else { return Result = `error__ Url is undefined` }
            })
        // Youtube url로 HTML 가져오기
        async function getHTML(Yturl) {
            try {
                return await axios.get(Yturl);
            } catch (error) {
                console.error(error);
            }
        }


        if (Result != `error__ Url is undefined`) {
            Result = YTInfo
        }

        return Result
    }
}
module.exports = new CrawlingData()
/*
Result
[
const YTInfo={
    ChannelThumbnail:String,
    Channelname:String,
    ChannelUrl:String,
    VideoTitle:String,
    LengthSeconds:String,
    VideoThumbnail:String,
    RecommendVideoListTitle:Array,
    RecommendVideoUrlList:Array,
}
]
*/
