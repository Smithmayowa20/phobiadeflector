var loadedModel;

chrome.runtime.onInstalled.addListener(async function() {
		var img = document.getElementById('cat');
		console.log(img);
		mobilenet.load().then(model => {
			
			console.log("mobile STAGE reached");
			loadedModel = model;
			
			model.classify(img).then(predictions => {
				console.log('Predictions: ');
				console.log(predictions);
				var notifModel = {
                        type: "basic",
                        iconUrl: "icon48.png",
                        title: "Model Status",
                        message: "Model has been created and stored."
                    };
                chrome.notifications.create('ModelNotif', notifModel);
			});
			

		});
		
});
