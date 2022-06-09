
    var jsonParser = {

        category: ((data) => {
            // You can get a video category. There are 11 categories such as music, games, movies, etc.
            // 영상 카테고리를 가져올수있습니다. 음악,게임,영화..등 11개의 카테고리 종류가 있습니다.
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
            //get videoData | 영상 카테고리를 가져온 다음 리턴
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

                    time: setTime(content.videoDetails.lengthSeconds), //

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

/*
INPUT | video-url
search("https://youtu.be/ECm3ndmW9UE").then((data) => {
    console.log(data)
})


OUTPUT | category,video-data,recommend-video-data

{
  status: 1,
  id: 'ECm3ndmW9UE',
  category: 'Music',
  videoData: {
    title: 'Butter',
    time: '2분 44초',
    timeS: '164',
    keywords: [ '방탄소년단 (BTS) Butter (Hotter', 'Sweeter', 'Cooler) Butter BTS' ],
    Description: "Provided to YouTube by 'BigHit Entertainment'\n" +
      '\n' +
      'Butter · 방탄소년단 (BTS)\n' +
      '\n' +
      'Butter (Hotter, Sweeter, Cooler)\n' +
      '\n' +
      'Released on: 2021-06-04\n' +
      '\n' +
      'Auto-generated by YouTube.',
    thumbnail: 'https://i.ytimg.com/vi/ECm3ndmW9UE/hqdefault.jpg?sqp=-oaymwEjCNACELwBSFryq4qpAxUIARUAAAAAGAElAADIQj0AgKJDeAE=&rs=AOn4CLDulFE-RZqm9b9rN9NbiRR-tF55jg',
    ChannelUrl: 'https://www.youtube.com/channel/UCLkAepWjdylmXSltofFvsYQ',
    Channelname: 'BANGTANTV',
    ChannelThumbnail: 'https://yt3.ggpht.com/NDWZM_aZQZJ81KRMyctZ5WYJbMIeDXLXBbAYfudK9idNpn7jIiamnj4-_3XIvCvKr1fEU7551A=s176-c-k-c0x00ffffff-no-rj',
    officialChannel: true
  },
  recommendVideoData: Map(19) {
    'HaEYUJ2aRHs' => {
      title: 'Dynamite',
      description: '제작자:BANGTANTV | 시간[3:20]',
      videoId: 'HaEYUJ2aRHs',
      url: 'https://www.youtube.com/watch?v=HaEYUJ2aRHs',
      thumbnail: 'https://i.ytimg.com/vi/HaEYUJ2aRHs/hqdefault.jpg?sqp=-oaymwEjCNACELwBSFryq4qpAxUIARUAAAAAGAElAADIQj0AgKJDeAE=&rs=AOn4CLDcLaCkaJ5QRqq8D7S9jFKCWtNS2Q',
      time: '3분 20초',
      timeS: 200,
      channelName: 'BANGTANTV',
      channelUrl: 'https://www.youtube.com/channel/UCLkAepWjdylmXSltofFvsYQ',
      ChannelThumbnail: 'https://yt3.ggpht.com/NDWZM_aZQZJ81KRMyctZ5WYJbMIeDXLXBbAYfudK9idNpn7jIiamnj4-_3XIvCvKr1fEU7551A=s88-c-k-c0x00ffffff-no-rj'
    },
    'W_MUcyXz3r4' => {
      title: '[playlist] 들으면 기분 좋아지는 디즈니/픽사 ost 모음 🏰✨',
      description: '제작자:슈바미 | 시간[42:32]',
      videoId: 'W_MUcyXz3r4',
      url: 'https://www.youtube.com/watch?v=W_MUcyXz3r4',
      thumbnail: 'https://i.ytimg.com/vi/W_MUcyXz3r4/hqdefault.jpg?sqp=-oaymwEjCNACELwBSFryq4qpAxUIARUAAAAAGAElAADIQj0AgKJDeAE=&rs=AOn4CLDgnWFi7eMcjrnNI0GFnTD3MEjKiA',
      time: '42분 32초',
      timeS: 2552,
      channelName: '슈바미',
      channelUrl: 'https://www.youtube.com/channel/UCVUH4YfinErRE44BkKiq2YQ',
      ChannelThumbnail: 'https://yt3.ggpht.com/qFhYr4cw9LQ6u14dDamkz94KqUG7yOuAwuAlF7SF8AWYXIks4nUMZFBpkKEtI3DX-tcB2yp3Ew=s68-c-k-c0x00ffffff-no-rj'
    },
    '9MbXeqCbS4Q' => {
      title: "마지막처럼 (As If It's Your Last)",
      description: '제작자:BLACKPINK | 시간[3:34]',
      videoId: '9MbXeqCbS4Q',
      url: 'https://www.youtube.com/watch?v=9MbXeqCbS4Q',
      thumbnail: 'https://i.ytimg.com/vi/9MbXeqCbS4Q/hqdefault.jpg?sqp=-oaymwEjCNACELwBSFryq4qpAxUIARUAAAAAGAElAADIQj0AgKJDeAE=&rs=AOn4CLClMl11pb3_HxJfMQbhdmqz3qAH7Q',
      time: '3분 34초',
      timeS: 214,
      channelName: 'BLACKPINK',
      channelUrl: 'https://www.youtube.com/channel/UCOmHUn--16B90oW2L6FRR3A',
      ChannelThumbnail: 'https://yt3.ggpht.com/ytc/AKedOLTyoe1McP_IhmAA09N0JCVZCx_naUBUUQCs5F_0Ug=s88-c-k-c0x00ffffff-no-rj'
    },
    'ZbWo60LyvXc' => {
      title: '불타오르네 (FIRE)',
      description: '제작자:BANGTANTV | 시간[3:24]',
      videoId: 'ZbWo60LyvXc',
      url: 'https://www.youtube.com/watch?v=ZbWo60LyvXc',
      thumbnail: 'https://i.ytimg.com/vi/ZbWo60LyvXc/hqdefault.jpg?sqp=-oaymwEjCNACELwBSFryq4qpAxUIARUAAAAAGAElAADIQj0AgKJDeAE=&rs=AOn4CLCjrHWtZEJtIiVUm2UnYM4cv9FHhw',
      time: '3분 24초',
      timeS: 204,
      channelName: 'BANGTANTV',
      channelUrl: 'https://www.youtube.com/channel/UCLkAepWjdylmXSltofFvsYQ',
      ChannelThumbnail: 'https://yt3.ggpht.com/NDWZM_aZQZJ81KRMyctZ5WYJbMIeDXLXBbAYfudK9idNpn7jIiamnj4-_3XIvCvKr1fEU7551A=s88-c-k-c0x00ffffff-no-rj'
    },
    'qvu4nPMyl3U' => {
      title: "BTS (방탄소년단) 'Savage Love' (Laxed – Siren Beat) [BTS Remix] Lyric Video",
      description: '제작자:BANGTANTV | 시간[3:06]',
      videoId: 'qvu4nPMyl3U',
      url: 'https://www.youtube.com/watch?v=qvu4nPMyl3U',
      thumbnail: 'https://i.ytimg.com/vi/qvu4nPMyl3U/hqdefault.jpg?sqp=-oaymwEjCNACELwBSFryq4qpAxUIARUAAAAAGAElAADIQj0AgKJDeAE=&rs=AOn4CLDRMyFQMmT6ZlnU5hIOgE-7BjwiLg',
      time: '3분 6초',
      timeS: 186,
      channelName: 'BANGTANTV',
      channelUrl: 'https://www.youtube.com/channel/UCLkAepWjdylmXSltofFvsYQ',
      ChannelThumbnail: 'https://yt3.ggpht.com/NDWZM_aZQZJ81KRMyctZ5WYJbMIeDXLXBbAYfudK9idNpn7jIiamnj4-_3XIvCvKr1fEU7551A=s88-c-k-c0x00ffffff-no-rj'
    },
    'Q-erYa8cwnc' => {
      title: '작은 것들을 위한 시 (Boy with Luv) feat. Halsey',
      description: '제작자:BANGTANTV | 시간[3:50]',
      videoId: 'Q-erYa8cwnc',
      url: 'https://www.youtube.com/watch?v=Q-erYa8cwnc',
      thumbnail: 'https://i.ytimg.com/vi/Q-erYa8cwnc/hqdefault.jpg?sqp=-oaymwEjCNACELwBSFryq4qpAxUIARUAAAAAGAElAADIQj0AgKJDeAE=&rs=AOn4CLC6zwyn0_7SMZ34eJxxG4PSjsNU5g',
      time: '3분 50초',
      timeS: 230,
      channelName: 'BANGTANTV',
      channelUrl: 'https://www.youtube.com/channel/UCLkAepWjdylmXSltofFvsYQ',
      ChannelThumbnail: 'https://yt3.ggpht.com/NDWZM_aZQZJ81KRMyctZ5WYJbMIeDXLXBbAYfudK9idNpn7jIiamnj4-_3XIvCvKr1fEU7551A=s88-c-k-c0x00ffffff-no-rj'
    },
    'jwqlKCZIPd8' => {
      title: 'BTS (방탄소년단) - Butter┃Cover by Raon Lee',
      description: '제작자:Raon | 시간[3:22]',
      videoId: 'jwqlKCZIPd8',
      url: 'https://www.youtube.com/watch?v=jwqlKCZIPd8',
      thumbnail: 'https://i.ytimg.com/vi/jwqlKCZIPd8/hqdefault.jpg?sqp=-oaymwEjCNACELwBSFryq4qpAxUIARUAAAAAGAElAADIQj0AgKJDeAE=&rs=AOn4CLBOc3nHbQqvHgWGKUkFPun2QquqGw',
      time: '3분 22초',
      timeS: 202,
      channelName: 'Raon',
      channelUrl: 'https://www.youtube.com/channel/UCQn1FqrR2OCjSe6Nl4GlVHw',
      ChannelThumbnail: 'https://yt3.ggpht.com/NJmmO6ci7uqAl2plBoiekw5QOIXCEZsEc7qMqTW349eQxfCKTsL2CL9Llf2c075_VYWcw78u=s88-c-k-c0x00ffffff-no-rj'
    },
    '0D28qd--kRE' => {
      title: 'Euphoria',
      description: '제작자:BANGTANTV | 시간[3:49]',
      videoId: '0D28qd--kRE',
      url: 'https://www.youtube.com/watch?v=0D28qd--kRE',
      thumbnail: 'https://i.ytimg.com/vi/0D28qd--kRE/hqdefault.jpg?sqp=-oaymwEjCNACELwBSFryq4qpAxUIARUAAAAAGAElAADIQj0AgKJDeAE=&rs=AOn4CLAczD4JlB3YEG4WKcfqUAblcwQbjw',
      time: '3분 49초',
      timeS: 229,
      channelName: 'BANGTANTV',
      channelUrl: 'https://www.youtube.com/channel/UCLkAepWjdylmXSltofFvsYQ',
      ChannelThumbnail: 'https://yt3.ggpht.com/NDWZM_aZQZJ81KRMyctZ5WYJbMIeDXLXBbAYfudK9idNpn7jIiamnj4-_3XIvCvKr1fEU7551A=s88-c-k-c0x00ffffff-no-rj'
    },
    'WMweEpGlu_U' => {
      title: "BTS (방탄소년단) 'Butter' Official MV",
      description: '제작자:HYBE LABELS | 시간[3:03]',
      videoId: 'WMweEpGlu_U',
      url: 'https://www.youtube.com/watch?v=WMweEpGlu_U',
      thumbnail: 'https://i.ytimg.com/vi/WMweEpGlu_U/hqdefault.jpg?sqp=-oaymwEjCNACELwBSFryq4qpAxUIARUAAAAAGAElAADIQj0AgKJDeAE=&rs=AOn4CLB2Lm5bClYkbMPZY-s6Kd4fTvuw4Q',
      time: '3분 3초',
      timeS: 183,
      channelName: 'HYBE LABELS',
      channelUrl: 'https://www.youtube.com/channel/UC3IZKseVpdzPSBaWxBxundA',
      ChannelThumbnail: 'https://yt3.ggpht.com/ytc/AKedOLRuEm1fSRSlS0jm7WxfGHZQfrIwBs71BY-izF11WA=s68-c-k-c0x00ffffff-no-rj'
    },
    'ymaIzkXY8nQ' => {
      title: "BTS (방탄소년단) 'Butter (feat. Megan Thee Stallion)' Official Visualizer",
      description: '제작자:HYBE LABELS | 시간[2:47]',
      videoId: 'ymaIzkXY8nQ',
      url: 'https://www.youtube.com/watch?v=ymaIzkXY8nQ',
      thumbnail: 'https://i.ytimg.com/vi/ymaIzkXY8nQ/hqdefault.jpg?sqp=-oaymwEjCNACELwBSFryq4qpAxUIARUAAAAAGAElAADIQj0AgKJDeAE=&rs=AOn4CLAwHA2uwuWv0ki2WfWzAJBwkC0jbw',
      time: '2분 47초',
      timeS: 167,
      channelName: 'HYBE LABELS',
      channelUrl: 'https://www.youtube.com/channel/UC3IZKseVpdzPSBaWxBxundA',
      ChannelThumbnail: 'https://yt3.ggpht.com/ytc/AKedOLRuEm1fSRSlS0jm7WxfGHZQfrIwBs71BY-izF11WA=s68-c-k-c0x00ffffff-no-rj'
    },
    'TaZkqPK0sbw' => {
      title: 'My Universe',
      description: '제작자:Coldplay | 시간[3:49]',
      videoId: 'TaZkqPK0sbw',
      url: 'https://www.youtube.com/watch?v=TaZkqPK0sbw',
      thumbnail: 'https://i.ytimg.com/vi/TaZkqPK0sbw/hqdefault.jpg?sqp=-oaymwEjCNACELwBSFryq4qpAxUIARUAAAAAGAElAADIQj0AgKJDeAE=&rs=AOn4CLD9CZ8xa_iUb__uEOe6OrE7yaA1-Q',
      time: '3분 49초',
      timeS: 229,
      channelName: 'Coldplay',
      channelUrl: 'https://www.youtube.com/channel/UCDPM_n1atn2ijUwHd0NNRQw',
      ChannelThumbnail: 'https://yt3.ggpht.com/nCMHKdzJCDlE5uX_9HplknQdYgrKEs3yZMSQNx2yYs8gRA05NJAZQAe8TMNpna_EEIaKx6FR=s88-c-k-c0x00ffffff-no-rj'
    },
    'DbXMjAYSa68' => {
      title: "[CHOREOGRAPHY] BTS (방탄소년단) 'Butter' Special Performance Video",
      description: '제작자:BANGTANTV | 시간[2:57]',
      videoId: 'DbXMjAYSa68',
      url: 'https://www.youtube.com/watch?v=DbXMjAYSa68',
      thumbnail: 'https://i.ytimg.com/vi/DbXMjAYSa68/hqdefault.jpg?sqp=-oaymwEjCNACELwBSFryq4qpAxUIARUAAAAAGAElAADIQj0AgKJDeAE=&rs=AOn4CLAEhHToCEuQcHdHQg62nVCmiIOmcQ',
      time: '2분 57초',
      timeS: 177,
      channelName: 'BANGTANTV',
      channelUrl: 'https://www.youtube.com/channel/UCLkAepWjdylmXSltofFvsYQ',
      ChannelThumbnail: 'https://yt3.ggpht.com/NDWZM_aZQZJ81KRMyctZ5WYJbMIeDXLXBbAYfudK9idNpn7jIiamnj4-_3XIvCvKr1fEU7551A=s88-c-k-c0x00ffffff-no-rj'
    },
    'FrEDny55ch8' => {
      title: "Rollin'",
      description: '제작자:Brave Girls 브레이브걸스 | 시간[3:18]',
      videoId: 'FrEDny55ch8',
      url: 'https://www.youtube.com/watch?v=FrEDny55ch8',
      thumbnail: 'https://i.ytimg.com/vi/FrEDny55ch8/hqdefault.jpg?sqp=-oaymwEjCNACELwBSFryq4qpAxUIARUAAAAAGAElAADIQj0AgKJDeAE=&rs=AOn4CLDctHSCiUxp4pDNCOemyBWTDNgw7Q',
      time: '3분 18초',
      timeS: 198,
      channelName: 'Brave Girls 브레이브걸스',
      channelUrl: 'https://www.youtube.com/channel/UCx_kYu6Wp1yxZP_KtrW52EQ',
      ChannelThumbnail: 'https://yt3.ggpht.com/YC-9r2EoPRKe4tpDGJGT21C8zlpb7H6FVfFGyFyv49cvY6P7ijHql1xnlS4AlPrA27aTtEbxRnk=s88-c-k-c0x00ffffff-no-rj'
    },
    'kjLUM7eNukg' => {
      title: 'That That (prod. & feat. SUGA of BTS)',
      description: '제작자:officialpsy | 시간[2:55]',
      videoId: 'kjLUM7eNukg',
      url: 'https://www.youtube.com/watch?v=kjLUM7eNukg',
      thumbnail: 'https://i.ytimg.com/vi/kjLUM7eNukg/hqdefault.jpg?sqp=-oaymwEjCNACELwBSFryq4qpAxUIARUAAAAAGAElAADIQj0AgKJDeAE=&rs=AOn4CLBzOvPCF5GfAnBmLhO-KDfH1-C0pw',
      time: '2분 55초',
      timeS: 175,
      channelName: 'officialpsy',
      channelUrl: 'https://www.youtube.com/channel/UCrDkAvwZum-UTjHmzDI2iIw',
      ChannelThumbnail: 'https://yt3.ggpht.com/VXVR9IKCRGRAtjdXcul8EcB2MoT1ZC7d8YMlkzVfB8Iuulf3WK5HA_h6BihPBe-OnpS4Fufrag=s88-c-k-c0x00ffffff-no-rj'
    },
    '9Ibf10h9U0c' => {
      title: 'Traffic light (신호등)',
      description: '제작자:Lee Mujin - Topic | 시간[3:52]',
      videoId: '9Ibf10h9U0c',
      url: 'https://www.youtube.com/watch?v=9Ibf10h9U0c',
      thumbnail: 'https://i.ytimg.com/vi/9Ibf10h9U0c/hqdefault.jpg?sqp=-oaymwEjCNACELwBSFryq4qpAxUIARUAAAAAGAElAADIQj0AgKJDeAE=&rs=AOn4CLA5ZOKPtmyGgAmbwzfBE9WT78HJ_w',
      time: '3분 52초',
      timeS: 232,
      channelName: 'Lee Mujin - Topic',
      channelUrl: 'https://www.youtube.com/channel/UC9oI67iPQVLVshSxQE-xsyg',
      ChannelThumbnail: 'https://yt3.ggpht.com/tV-BXaGRptvKpfT8f8PHLMgYOkJT5hMCGTrLVYFfLn1qasrT69AG9uEk57qrY4ZNxu7G9WZ19tA=s68-c-k-c0x00ffffff-no-rj'
    },
    'EBf6lwkChnQ' => {
      title: 'Anpanman',
      description: '제작자:BANGTANTV | 시간[3:53]',
      videoId: 'EBf6lwkChnQ',
      url: 'https://www.youtube.com/watch?v=EBf6lwkChnQ',
      thumbnail: 'https://i.ytimg.com/vi/EBf6lwkChnQ/hqdefault.jpg?sqp=-oaymwEjCNACELwBSFryq4qpAxUIARUAAAAAGAElAADIQj0AgKJDeAE=&rs=AOn4CLCPNDE88-K_rcJkqNn1w4Ti4dnRdQ',
      time: '3분 53초',
      timeS: 233,
      channelName: 'BANGTANTV',
      channelUrl: 'https://www.youtube.com/channel/UCLkAepWjdylmXSltofFvsYQ',
      ChannelThumbnail: 'https://yt3.ggpht.com/NDWZM_aZQZJ81KRMyctZ5WYJbMIeDXLXBbAYfudK9idNpn7jIiamnj4-_3XIvCvKr1fEU7551A=s88-c-k-c0x00ffffff-no-rj'
    },
    'RDCLAK5uy_k27uu-EtQ_b5U2r26DNDZOmNqGdccUIGQ' => {
      playlistId: 'RDCLAK5uy_k27uu-EtQ_b5U2r26DNDZOmNqGdccUIGQ',
      playlistTitle: 'K.iNG',
      playlistThumbnail: 'https://i.ytimg.com/vi/nDAsYqVyJzM/hqdefault.jpg?sqp=-oaymwEXCNACELwBSFryq4qpAwkIARUAAIhCGAE',
      playlistVideoCount: '124',
      playlistArtist: ''
    },
    'LCpjdohpuEE' => {
      title: 'Permission to Dance',
      description: '제작자:BANGTANTV | 시간[3:08]',
      videoId: 'LCpjdohpuEE',
      url: 'https://www.youtube.com/watch?v=LCpjdohpuEE',
      thumbnail: 'https://i.ytimg.com/vi/LCpjdohpuEE/hqdefault.jpg?sqp=-oaymwEjCNACELwBSFryq4qpAxUIARUAAAAAGAElAADIQj0AgKJDeAE=&rs=AOn4CLBBwM2GskK8_Ssv-S7lK-p4vZ38YQ',
      time: '3분 8초',
      timeS: 188,
      channelName: 'BANGTANTV',
      channelUrl: 'https://www.youtube.com/channel/UCLkAepWjdylmXSltofFvsYQ',
      ChannelThumbnail: 'https://yt3.ggpht.com/NDWZM_aZQZJ81KRMyctZ5WYJbMIeDXLXBbAYfudK9idNpn7jIiamnj4-_3XIvCvKr1fEU7551A=s88-c-k-c0x00ffffff-no-rj'
    },
    'NvK9APEhcdk' => {
      title: 'Dynamite',
      description: '제작자:BANGTANTV | 시간[3:20]',
      videoId: 'NvK9APEhcdk',
      url: 'https://www.youtube.com/watch?v=NvK9APEhcdk',
      thumbnail: 'https://i.ytimg.com/vi/NvK9APEhcdk/hqdefault.jpg?sqp=-oaymwEjCNACELwBSFryq4qpAxUIARUAAAAAGAElAADIQj0AgKJDeAE=&rs=AOn4CLA7j8oTW2P5zWlMK2syS5-8psg-xg',
      time: '3분 20초',
      timeS: 200,
      channelName: 'BANGTANTV',
      channelUrl: 'https://www.youtube.com/channel/UCLkAepWjdylmXSltofFvsYQ',
      ChannelThumbnail: 'https://yt3.ggpht.com/NDWZM_aZQZJ81KRMyctZ5WYJbMIeDXLXBbAYfudK9idNpn7jIiamnj4-_3XIvCvKr1fEU7551A=s88-c-k-c0x00ffffff-no-rj'
    }
  }
}

*/
