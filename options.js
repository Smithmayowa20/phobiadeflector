$(function(){
	
	var filterArray = [];
	$("input:checkbox[name=filter]:checked").each(function(){
		filterArray.push($(this).val());
	});
	
	chrome.storage.sync.set({'phobiaList': filterArray}, function(){
                close();
            });
	
});
	