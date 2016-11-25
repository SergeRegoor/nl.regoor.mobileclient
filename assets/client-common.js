$(document).ready(function(){
});

$.fn.applyText = function(setting) {
	return $(this).text(getLocalizedText(setting));
}

function getLocalizedText(setting) {
	if (setting == null) return '';
	if ((setting.localizedText == null) || (setting.localizedText.length == 0))  {
		if ((setting != null) && (setting.length > 0))
			return setting;
		return $(this);
	}
	return __(setting.localizedText);
}

// Create unique GUID
function createGuid() { 
	var s4 = function() { return (((1+Math.random())*0x10000)|0).toString(16).substring(1); };
	return (s4() + s4() + "-" + s4() + "-4" + s4().substr(0,3) + "-" + s4() + "-" + s4() + s4() + s4()).toLowerCase();
};

function findObjInArray(arr, prop, val) {
	if ((arr == null) || (arr.length == 0)) return null;
	var items = $.grep(arr, function(item){ return item[prop] == val; });
	if (items.length > 0)
		return items[0];
	return null;
}

function findIndexOfObjInArray(arr, prop, val) {
	if ((arr == null) || (arr.length == 0)) return -1;
	var resultIdx = -1;
	$.each(arr, function(idx, item) {
		if (item[prop] == val)
			resultIdx = idx;
	});
	return resultIdx;
}

function getProperty(object, property, defaultValue) {
	if (object == null) return defaultValue;
	if (object[property] == null) return defaultValue;
	return object[property];
}

$.fn.insert = function(index, obj) {
	if (index == 0)
		$(this).prepend(obj);
	else
		$(this).children().eq(index - 1).after(obj);
	return $(this);
}

function repeatFunction(milliSeconds, callback) {
	setTimeout(function() {
		if (callback())
			repeatFunction(milliSeconds, callback);
	}, milliSeconds);
}

function isNotNegativeInteger(str) {
	var n = ~~Number(str);
	return (String(n) === str) && (n >= 0);
}

// Load & show popup
function loadPopup(id, selector, zIndex, positionTop, width, height){
	$('body').css('overflow','hidden');
	var popupBackground = $('<div>').addClass('popupBackground').attr('id', id+'Background').css('height', $('body').height());
	popupBackground.css('z-index', zIndex-1);
	var popupContainer = $('<div>').addClass('popupContainer').attr('id', id);
	if (selector != null)
		popupContainer.html(selector.html());
	popupContainer.find('.closePopup').click(function(){ popupContainer.closePopup(); });
	popupContainer.css('z-index', zIndex);
	popupContainer.css('top', positionTop + 'px');
	popupContainer.css('width', 'calc('+width+'px - 40px)');
	popupContainer.css('height', 'calc('+height+'px - 40px)');
	popupContainer.css('margin', '0 0 0 -'+(width/2)+'px');
	$('body').append(popupBackground);
	$('body').append(popupContainer);
	return popupContainer;
};

// Close a popup
$.fn.closePopup = function(){
	var popupContainer = $(this);
	var popupId = popupContainer.attr('id');
	var popupBackground = $('#'+popupId+'Background');
	popupContainer.remove();
	popupBackground.remove();
	$('body').css('overflow','auto');
};

function showErrorMessages(errorMessages) {
	var popupContainer = loadPopup(createGuid(), null, 9999, 100, 300, 200);
	var errorContainer = $('<div/>');
	if (errorMessages.length == 1)
		errorContainer.append($('<p/>').addClass('errorMessages').text(errorMessages[0]));
	else {
		errorList = $('<ul/>').addClass('errorMessages');
		$.each(errorMessages, function(i, errorMessage) {
			errorList.append($('<li/>').text(errorMessage));
		});
		errorContainer.append(errorList);
	}
	popupContainer.append(errorContainer);
	var bottomBar = $('<div/>').addClass('bottomButtonBar');
	bottomBar.append($('<button/>').addClass('floatRight').text('Sluiten').click(function(e) {
		e.preventDefault();
		popupContainer.closePopup();
	}));
	popupContainer.append(bottomBar);
}