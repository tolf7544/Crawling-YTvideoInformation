/********************JSON Parsing********************/

    var JSONParser = {

        category: ((data) => {
            try {
                const searchStart = '"category":"';
                const searchEnd = '"';

                const indexS = data.indexOf(searchStart);

                if (indexS < 0) return `Error`

                var content = data.slice(indexS + searchStart.length);

                const indexE = content.indexOf(searchEnd);
                content = content.slice(0, indexE);

                return content
            } catch (e) {
                if (e) {
                    console.log(e)
                    return null
                }
            }
        }),

        videoData: ((data, opt) => {
            try {
                var channlData = getChannelData(data)
                const regex = /<script nonce="(.+?)">var ytInitialPlayerResponse =/g;
                const searchStart = (data.match(regex))[0]
                const searchEnd = ';</script><div id="player" class="skeleton flexy">';
                const indexS = data.indexOf(searchStart)

                if (indexS < 0) return

                var content = data.slice(indexS + searchStart.length);
                const indexE = content.indexOf(searchEnd);

                content = JSON.parse(content.slice(0, indexE))
                if (opt === `keywords`) {
                    return {
                        keywords: content.videoDetails.hasOwnProperty('keywords') ? content.videoDetails.keywords : channlData.channelName ? channlData.channelName : null
                    }
                }
                return {

                    title: content.videoDetails.title,

                    time: setTime(content.videoDetails.lengthSeconds),

                    timeS: content.videoDetails.lengthSeconds,

                    keywords: content.videoDetails.hasOwnProperty('keywords') ? content.videoDetails.keywords : channlData.channelName ? channlData.channelName : null,

                    Description: content.videoDetails.shortDescription.substring(0, 1900),

                    thumbnail: content.videoDetails.thumbnail.thumbnails.pop().url,

                    ChannelUrl: channlData.channelUrl,

                    Channelname: channlData.channelName,

                    ChannelThumbnail: channlData.channelThumbnail,

                    officialChannel: channlData.officialArtist,
                }
            } catch (e) {
                console.log(e)
                return {
                    title: null,

                    time: null,

                    timeS: null,

                    keywords: null,

                    Description: null,

                    thumbnail: null,

                    ChannelUrl: channlData.channelUrl,

                    Channelname: channlData.channelName,

                    ChannelThumbnail: channlData.channelThumbnail,

                    officialChannel: channlData.officialArtist,
                }
            }
        }),

        recommendVideoData: (async (data) => {
            const regex = /var ytInitialData =/g;
            const searchStart = (data.match(regex))[0]
            const searchEnd = ';</script>';
            const indexS = data.indexOf(searchStart)
            if (indexS < 0) return { status: 2, category: null, videoData: null, recommendVideoData: null }

            var content = data.slice(indexS + searchStart.length);
            const indexE = content.indexOf(searchEnd);
            content = JSON.parse(content.slice(0, indexE))

            const rcVideoData = new Map();

            var videofilter = ((res) => { return res.compactPlaylistRenderer !== undefined || res.compactRadioRenderer !== undefined || res.compactVideoRenderer !== undefined })

            var videoList = content.contents.twoColumnWatchNextResults.secondaryResults.secondaryResults.results.filter(videofilter)
            try {
                videoList = videoList.slice(0, -1)
                videoList = videoList.reverse();

                videoList.map(async (data) => {

                    if (data.compactVideoRenderer !== undefined) {
                        var timeStamp = {
                            timeNum: 0,
                            timeStr: ``,
                            timeSim: ``
                        }

                        if (!data.compactVideoRenderer.hasOwnProperty(`lengthText`)) {
                            timeStamp.timeNum = 0;
                            timeStamp.timeStr = '실시간 스트리밍중입니다!'
                            timeStamp.timeSim = '∞'
                        } else {

                            timeStamp.timeStr = data.compactVideoRenderer.lengthText.accessibility.accessibilityData.label

                            if (timeStamp.timeStr.match(/([0-9]?[0-9])시간/g) !== null) { timeStamp.timeNum += parseInt(timeStamp.timeStr.match(/([0-9]?[0-9])시간/g)[0].replace(`시간`)) * 3600 }
                            if (timeStamp.timeStr.match(/([0-9]?[0-9])분/g) !== null) { timeStamp.timeNum += parseInt(timeStamp.timeStr.match(/([0-9]?[0-9])분/g)[0].replace(`분`)) * 60 }
                            if (timeStamp.timeStr.match(/([0-9]?[0-9])초/g) !== null) { timeStamp.timeNum += parseInt(timeStamp.timeStr.match(/([0-9]?[0-9])초/g)[0].replace(`초`)) }

                            timeStamp.timeSim = data.compactVideoRenderer.lengthText.simpleText
                        }




                        var description = ``;
                        var thumbnailUrl = `;`
                        description = "제작자:" + data.compactVideoRenderer.shortBylineText.runs[0].text + " | 시간[" + timeStamp.timeSim + ']'

                        rcVideoData.set(data.compactVideoRenderer.videoId, {
                            title: data.compactVideoRenderer.title.simpleText,
                            description: description,
                            videoId: data.compactVideoRenderer.videoId,
                            url: `https://www.youtube.com/watch?v=` + data.compactVideoRenderer.videoId,
                            thumbnail: data.compactVideoRenderer.thumbnail.thumbnails.pop().url,
                            time: timeStamp.timeStr,
                            timeS: timeStamp.timeNum,
                            channelName: data.compactVideoRenderer.shortBylineText.runs[0].text,
                            channelUrl: 'https://www.youtube.com/channel/' + data.compactVideoRenderer.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.browseId,
                            ChannelThumbnail: data.compactVideoRenderer.channelThumbnail.thumbnails.pop().url
                        })

                    }
                    if (data.compactPlaylistRenderer !== undefined) {

                        thumbnailUrl = data.compactPlaylistRenderer.thumbnail.thumbnails.pop().url.match(/https:\/\/i\.ytimg\.com\/(.+?)hqdefault\.jpg\?(.+?)&/g)

                        if (thumbnailUrl !== null) {
                            thumbnailUrl = thumbnailUrl[0].replace(`=&`, ``)
                        } else {
                            thumbnailUrl = data.compactPlaylistRenderer.thumbnail.thumbnails.pop().url
                        }

                        rcVideoData.set(data.compactPlaylistRenderer.playlistId,
                            {
                                playlistId: data.compactPlaylistRenderer.playlistId,
                                playlistTitle: data.compactPlaylistRenderer.title.simpleText,
                                playlistThumbnail: thumbnailUrl,
                                playlistVideoCount: data.compactPlaylistRenderer.videoCountShortText.simpleText,
                                playlistArtist: data.compactPlaylistRenderer.shortBylineText.hasOwnProperty(`run`)? data.compactPlaylistRenderer.shortBylineText.runs[0].text:""
                            }
                        )
                    }

                    if (data.compactRadioRenderer !== undefined) {

                        thumbnailUrl = data.compactRadioRenderer.thumbnail.thumbnails.pop().url.match(/https:\/\/i\.ytimg\.com\/(.+?)hqdefault\.jpg\?(.+?)&/g)

                        if (thumbnailUrl !== null) {
                            thumbnailUrl = thumbnailUrl[0].replace(`=&`, ``)
                        } else {
                            thumbnailUrl = data.compactRadioRenderer.thumbnail.thumbnails.pop().url
                        }

                        rcVideoData.set(data.compactRadioRenderer.playlistId,
                            {
                                playlistUrl: `https://www.youtube.com/watch?v=${data.compactRadioRenderer.secondaryNavigationEndpoint.watchEndpoint.videoId}&list=${data.compactRadioRenderer.playlistId}&start_radio=1`,
                                playlistTitle: data.compactRadioRenderer.title.simpleText,
                                playlistThumbnail: thumbnailUrl,
                                playlistArtist: 'YOUTUBE MIX'
                            }
                        )
                    }
                })

                return rcVideoData
            } catch (e) {
                console.log(e)
                return null
            }
        })
    }
    
        function getChannelData(data) {
        const regex = /<script nonce="(.+?)">var ytInitialData = /g;
        const searchStart = (data.match(regex))[0]
        const searchEnd = ';</script>';
        const indexS = data.indexOf(searchStart)

        if (indexS < 0) return null

        var content = data.slice(indexS + searchStart.length);
        const indexE = content.indexOf(searchEnd);
        content = content.slice(0, indexE);
        try {
            var opt = ((res) => { return res.hasOwnProperty('videoSecondaryInfoRenderer') })
         
            var channelInfo = JSON.parse(content).contents.twoColumnWatchNextResults.results.results.contents.filter(opt)[0].videoSecondaryInfoRenderer.owner.videoOwnerRenderer

            return {
                channelThumbnail: channelInfo.thumbnail.thumbnails.pop().url,
                channelName: channelInfo.title.runs[0].text,
                channelUrl: 'https://www.youtube.com/channel/' + channelInfo.navigationEndpoint.browseEndpoint.browseId,
                officialArtist: channelInfo.hasOwnProperty('badges') ? true : false
            }
        } catch (e) {
 
            return {
                channelThumbnail: null,
                channelName: null,
                channelUrl: null,
                officialArtist: null
            }
        }
    }
