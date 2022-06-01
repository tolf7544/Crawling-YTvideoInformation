module.exports = {
	isObject,
	setTime,
	filterMusic,
}

function setTime(timeS) {
	var Time = '';
	var Sec = 0;
	var Min = 0;
	if (timeS * 1 < 60) {

		Time = timeS + `초`

	} else if (timeS * 1 > 3600) {

		var H = Math.floor(timeS * 1 / 3600)
		Sec = (timeS * 1 - H * 3600) % 60
		Min = ((timeS * 1 - H * 3600) - Sec) / 60
		Time = `${H}시간 ${Min}분 ${Sec}초`

	} else if (timeS * 1 > 60) {

		Sec = timeS * 1 % 60
		Min = (timeS * 1 - Sec) / 60
		Time = `${Min}분 ${Sec}초`

	}
	return Time;
}

function filterMusic(list) {
	return new Promise(function (resolve, reject) {
		const { search } = require(`../streamData.js`);
		try {
			var count = 0;

			[...list].map(async (rvData) => {
				if (count === list.size) {
					resolve(list)
				}
				if (rvData[0].match(/[0-9A-Za-z_-]{10}[048AEIMQUYcgkosw]/g) !== null && rvData[0].match(/[0-9A-Za-z_-]{10}[048AEIMQUYcgkosw]/g).length === 1) {

					search(`https://youtu.be/${rvData[0]}&hl=ko`, { category: true }).then((data) => {
						if (data.category !== `Music`) {
							list.delete(data.id)
						}
						if (count === list.size) {
							resolve(list)
						} else {
							count += 1
						}
					})
				}
			})
		} catch (e) {
			console.log(e)
			reject(null)
		}
	})
}
