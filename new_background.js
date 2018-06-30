'use strict';

const IMAGE_SIZE = 224;
const MOBILENET_MODEL_PATH = 'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json';
const TOPK_PREDICTIONS = 10;

class BackgroundProcessing {

  constructor() {
    this.imageRequests = {};
    this.addListeners();
    this.loadModel();
  }
  
  
  

  addListeners() {
	chrome.storage.sync.set({'phobiaList': [1,2]}, function(){
		});
		
    chrome.webRequest.onBeforeRequest.addListener(req => {
      if (req && req.tabId > 0) {
        this.imageRequests[req.url] = this.imageRequests[req.url] || req;
        this.analyzeImage(req.url);
      }
    }, { urls: ["<all_urls>"], types: ["image", "object"] });
  }
  
  
  

  async loadModel() {
    console.log('Loading model...');
    const startTime = performance.now();
    this.model = await tf.loadModel(MOBILENET_MODEL_PATH);
    this.model.predict(tf.zeros([1, IMAGE_SIZE, IMAGE_SIZE, 3])).dispose();

    const totalTime = Math.floor(performance.now() - startTime);
    console.log(`Model loaded and initialized in ${totalTime}ms...`);
  }
  
  

  
  async loadImage(src) {
    return new Promise(resolve => {
      var img = document.createElement('img');
      img.onerror = function(e) {
        resolve(null);
      };
      img.onload = function(e) {
        if ((img.height && img.height > 128) || (img.width && img.width > 128)) {
          // Set image size for tf!
          img.width = IMAGE_SIZE;
          img.height = IMAGE_SIZE;
          resolve(img);
        }
        // Let's skip all tiny images
        resolve(null);
      }
      img.src = src;
    });
  }
  
  
  

  async getTopKClasses(logits, topK) {
    const values = await logits.data();
    const valuesAndIndices = [];
    for (let i = 0; i < values.length; i++) {
      valuesAndIndices.push({value: values[i], index: i});
    }
    valuesAndIndices.sort((a, b) => {
      return b.value - a.value;
    });
    const topkValues = new Float32Array(topK);
    const topkIndices = new Int32Array(topK);
    for (let i = 0; i < topK; i++) {
      topkValues[i] = valuesAndIndices[i].value;
      topkIndices[i] = valuesAndIndices[i].index;
    }

    const topClassesAndProbs = [];
    for (let i = 0; i < topkIndices.length; i++) {
      topClassesAndProbs.push({
        /* className: IMAGENET_CLASSES[topkIndices[i]], */
		number: topkIndices[i],
        probability: topkValues[i]
      })
    }
    return topClassesAndProbs;
  }

  

  
  async predict(imgElement) {
    console.log('Predicting...');
    const startTime = performance.now();
    const logits = tf.tidy(() => {
      const img = tf.fromPixels(imgElement).toFloat();
      const offset = tf.scalar(127.5);
      const normalized = img.sub(offset).div(offset);
      const batched = normalized.reshape([1, IMAGE_SIZE, IMAGE_SIZE, 3]);
      return this.model.predict(batched);
    });

    // Convert logits to probabilities and class names.
    const predictions = await this.getTopKClasses(logits, TOPK_PREDICTIONS);
    const totalTime = Math.floor(performance.now() - startTime);
    // console.log(`Prediction done in ${totalTime}ms:`, predictions); 
    return predictions;
  }

  
  
  
  async analyzeImage(src) {

    if (!this.model) {
      console.log('Model not loaded yet, delaying...');
      setTimeout(() => { this.analyzeImage(src) }, 5000);
      return;
    }
	
	chrome.storage.sync.get('phobiaList', function(kept) {
		document.getElementById("phobialist").value = kept.phobiaList.toString();
	});
	
    var meta = this.imageRequests[src];
    if (meta && meta.tabId) {
      if (!meta.predictions) {
        const img = await this.loadImage(src);
        if (img) {
          meta.predictions = await this.predict(img);
        }
      }

      if (meta.predictions) {
		var numberList = [];
		for (var i = 0; i < meta.predictions.length; i++) {
			var number = meta.predictions[i].number;
			numberList.push(number);
		}
        chrome.tabs.sendMessage(meta.tabId, {
          action: 'IMAGE_PROCESSED',
          payload: meta,
		  phobialist: document.getElementById("phobialist").value,
		  numberlist: numberList,
        });
      }
    }
  }
}




var bg = new BackgroundProcessing();