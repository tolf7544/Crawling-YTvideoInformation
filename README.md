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
string형식을 json으로 파싱하는 과정이다.

- 이 과정은 예시이외에 모든 문자열에서
특정 문자열을 오차없이 파싱할수 있으며
아래 예시에서는 정규표현식을 사용하여
정교하게 파싱하는 방법을 알려준다.

### 해당 구문은 videoData를 정규표현식으로 추출하는 소스코드이며 위쪽의 예시에서 아랫 부분만 변경하여 사용함

```javascript

//data = html.data

const regex = /<script nonce="(.+?)">var ytInitialPlayerResponse =/g; // (.+?) 은 <script nonce=" 다양한 형태의 문자열을 지정할수있다.

const searchStart = (data.match(regex))[0] //data에서 regex를 추출하여 searchStart에 저장 (검색할려는 문자열의 시작부분)

const searchEnd = ';</script><div id="player" class="skeleton flexy">'; //검색할려는 문자열의 끝부분
```

- 해당 소스코드는 윗 부분의 소스코드에서 regex부분이 추가되었고 나머지는 기존 변수에서 변경하면 된다.
- regex를 응용하며 추출할수있으며 매우 효율적이다.
#
- 위와 같은 방법으로 영상정보,추천영상,영상 아티스트 정보,영상카테고리 까지 모두 가져올수있다.
- 하지만 이것을 혼자 구현하기에는 시간이 너무 걸릴 뿐더러 유튜브 html 데이터를 3번 이상 정독 해야기에(대충 10만줄이상..) 추천 하지 않는다.
- 대부분은 ytdl-core의 getinfo 함수를 사용하거 가져오는것을 추천한다.
# 빠른 속도를 원하거나 더 많은 정보를 가지고 오고싶다면 스스로 만드는 방법도 나쁘지 않다.
