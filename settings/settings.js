var _appInfo = {};
var _context = {};
var _buttonsList = null;
var _labelsList = null;

$(document).ready(function(){
	_buttonsList = new List(_context, ListController.getListDefinition('buttons'), $('#buttonsContainer'));
	_labelsList = new List(_context, ListController.getListDefinition('labels'), $('#labelsContainer'));
});

function onHomeyReady(){
	// Get app's settings from our own API
	Homey.api('GET', '/get-info/', function(err, result){
		if (err || ((result != null) && !result.successful || (result.appInfo == null))) alert('Settings could not be loaded, sorry. Please try again.');
		else {
			_appInfo = result.appInfo;
			_buttonsList.render();
			_labelsList.render();
		}
	});
	Homey.ready();
};

// Save settings to Homey
function saveSettings() {
	var settings = {
		buttons: _appInfo.buttons,
		labels: _appInfo.labels
	};
	Homey.api('POST', '/save-settings/', settings, function(err, result){
		if (err) console.log('Error during saving of your settings. Please try again.');
	});
};

function getStateControlSectionById(sectionId) {
	return findObjInArray(_appInfo.installedApps.stateControl.sections, 'id', sectionId);
};

function getStateControlFlowActionById(flowActionId) {
	return findObjInArray(_appInfo.installedApps.stateControl.flowActions, 'id', flowActionId);
};

function getStateControlStateById(stateId) {
	return findObjInArray(_appInfo.installedApps.stateControl.states, 'id', stateId);
};