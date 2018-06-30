var imageMeta = {};

const snakeList = new Set([52,53,54,55,56,57,58,59,60,61,62,63,64,65,67,68]);
const spiderList = new Set([72,73,74,75,76,77]);


const check = (obj,phobiaList) => {
	return phobiaList.indexOf(obj) > -1;
};


function parsePredictions(phobiaList,numberList) {
	var numberList = new Set(numberList);
	
	if (check(1,phobiaList) || check(2,phobiaList)) {
		var intersection = new Set([...numberList].filter(x => snakeList.has(x)))
		if (intersection.size > 0) {
			return true;
		}
		
		var intersection2 = new Set([...numberList].filter(x => spiderList.has(x)))
		if (intersection2.size > 0) {
			return true;
		}
	}
	
	return false;
}


function setImageTitles(phobiaList,numberList) {
  const images = document.getElementsByTagName('img');
  const keys = Object.keys(imageMeta);
  for(u = 0; u < keys.length; u++) {
    var url = keys[u];
    var meta = imageMeta[url];
    for (i = 0; i < images.length; i++) {
      var img = images[i];
      if (img.src === meta.url) { 
		var block = parsePredictions(phobiaList,numberList);
		if (block) {
			img.src = "";
		}
		/* console.log(numberList);
        img.title = img.src + `:\n\n${img.title}\n\n` + JSON.stringify(meta.predictions); */
        delete keys[u];
        delete imageMeta[url];
      }
    }
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.payload && message.phobialist && message.numberlist && message.action === 'IMAGE_PROCESSED') {
    var phobiaList = message.phobialist;
	var numberList = message.numberlist;
	const { payload } = message;
    if (payload && payload.url) {
      imageMeta[payload.url] = payload;
      setImageTitles(phobiaList,numberList);
    }
  }
});

window.addEventListener('load', setImageTitles, false);

 
/* var imageMeta = {};

const setImageTitles = () => {
  const images = document.getElementsByTagName('img');
  const keys = Object.keys(imageMeta);
  for(u = 0; u < keys.length; u++) {
    var url = keys[u];
    var meta = imageMeta[url];
    for (i = 0; i < images.length; i++) {
      var img = images[i];
      if (img.src === meta.url) {
        img.title = img.src + `:\n\n${img.title}\n\n` + JSON.stringify(meta.predictions);
        delete keys[u];
        delete imageMeta[url];
		console.log(9);
      }
    }
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.payload && message.action === 'IMAGE_PROCESSED') {
    const { payload } = message;
    if (payload && payload.url) {
      imageMeta[payload.url] = payload;
      setImageTitles();
    }
  }
});

window.addEventListener('load', setImageTitles, false); */
