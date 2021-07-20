# Crawling-YTvideoInformation
Crawiling Youtube Video Url Information by using axios and regular expressions


**axios를 이용하여 html 가져온 후 정규표현식으로 원하는 데이터를 크롤링**


# 예시 [Yturl = video url]
```javascript
await getHTML(Yturl)
  .then((body,error) => {
    if (!error) {
      var videoTitle = body.match(/"title":\"[^\"]*\","lengthSeconds"/g)
      videoTitle = videoTitle[0].replace(`"title":"`, ``);
      videoTitle = videoTitle.trim();
      videoTitle = videoTitle.replace(`","lengthSeconds"`, ``);
      videoTitle = videoTitle.trim();

      console.log(videoTitle)
      /*
      result => String
      */
    }
  }
```

```javascript
async function getHTML(Yturl) {
  try {
    return await axios.get(Yturl);
  } catch (error) {
    console.error(error);
  }
}
```
