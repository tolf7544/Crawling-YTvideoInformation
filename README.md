# youtube video data crawling by axios
## crawiling
- video url(https://youtu.be/[id]) 를 axios을 활용하여 html 데이터를 가져옴
- 가져온 데이터에서 유튜브 영상 관련 정보들을 jsonParsing 함
## 얻을수 있는 데이터들
- 해당 id 영상 정보 (ex. artist information , video data, thumbnail , title , LIKE number , playTime, recommendVideoData, description . . . )
- 추천 영상 정보 (playTime,artist information, title,description,videoId,url,thumbnail,playTime(second) . . . )

## how to get specific string from html data | 특정문자열을 html 데이터에서 가져오는 법

```javascript
 const searchStart = '"category":"'; //start of the string | 문자열의 시작부분
 const searchEnd = '"'; //end of the string | 문자열의 끝부분

 const indexS = data.indexOf(searchStart); //searchStart location (Number) | searchStart 의 위치 (Number)

 if (indexS < 0) return `Error` //if indexS is not found, it returns `Error` | searchStart 의 위치를 찾지 못한다면 `Error` 리턴 

 var content = data.slice(indexS + searchStart.length); // remove from data to indexS | data를 indexS 만큼 제거

 const indexE = content.indexOf(searchEnd); //searchEnd location (Number) | searchEnd 위치 (Number)
 content = content.slice(0, indexE); // remove strings out of range from 0 to indexE in content | content에서 0번째와 indexE번째까지 문자열 이외에 것을 제거함
 
 return JSON.parse(content)
```
- 즉 "category":" 로 시작하고 " 로 끝나는 부분을
axios로 가져온 html.data에서 검색하여 추출한
string형식을 json형식으로 파싱하는 과정이다.

- 이 과정은 예시이외에 모든 문자열에서
특정 문자열을 오차없이 파싱할수 있으며
아래 예시에서는 정규표현식을 사용하여
정교하게 파싱하는 방법을 알려준다.
