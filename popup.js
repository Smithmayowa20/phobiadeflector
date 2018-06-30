$(function(){
	chrome.storage.sync.get('phobiaList',function(kept){
		var phobiaList = kept.phobiaList;
		if (phobiaList.indexOf(1) > -1) {
			$( "#checkbox1" ).prop( "checked", true );
		}
		if (phobiaList.indexOf(2) > -1) {
			$( "#checkbox2" ).prop( "checked", true );
		}
    });

	
	$('#phobia').click(function(){
		var filterArray = [];
		var nameArray = [];
		$(".filter:checked").each(function(){
			filterArray.push(parseInt($(this).val()));
			nameArray.push($(this).attr("name"));
		});
		
		if (nameArray.length == 2) {
			var message = "You are currently  filtering " + nameArray[0] + " and " + nameArray[1] + " Images.";
		}
		
		else if(nameArray.length == 1) {
			var message = "You are currently  filtering " + nameArray[0] + " Images.";
		}
		
		else if(nameArray.length == 0) {
			var message = "You are currently not filtering any Images.";
		}
		
		/* var selected = nameArray.join(';') ; */
		chrome.storage.sync.set({'phobiaList': filterArray});
           var notifOptions = {
                        type: "basic",
                        iconUrl: "pd_48.png",
                        title: "Phobia Filter List",
                        message: message
                };
           chrome.notifications.create('limitNotif', notifOptions);
	
		
	});
});
	
