"use strict";

var _apps = {
	stateControl: {
		isInstalled: false,
		api: null
	},
	wirelessKeypad: {
		isInstalled: false,
		api: null
	}
};

module.exports.init = function() {
	var homeyApi = Homey.manager('api');
	var stateControlApi = new homeyApi.App('nl.regoor.statecontrol');
	var wirelessKeypadApi = new homeyApi.App('nl.regoor.wirelesskeypad');
	
	stateControlApi.isInstalled(function(err, isInstalled){
		if (!err && isInstalled) {
			_apps.stateControl.isInstalled = true;
			_apps.stateControl.api = stateControlApi;
		}
	});
	
	wirelessKeypadApi.isInstalled(function(err, isInstalled){
		if (!err && isInstalled) {
			_apps.wirelessKeypad.isInstalled = true;
			_apps.wirelessKeypad.api = wirelessKeypadApi;
		}
	});
};

module.exports.getSettings = function() {
	var settings = Homey.manager('settings').get('mobileclient-settings');
	if (settings == null)
		settings = {};
	if (settings.buttons == null)
		settings.buttons = [];
	if (settings.labels == null)
		settings.labels = [];
	return settings;
}

module.exports.saveSettings = function(settings) {
	if (settings == null) throw new Error('Settings object cannot be null.');
	if (settings.buttons == null) throw new Error('Buttons list cannot be null.');
	if (settings.labels == null) throw new Error('Labels list cannot be null.');
	Homey.manager('settings').set('mobileclient-settings', settings);
}

module.exports.getAppInfo = function(callback) {
	var appInfo = {
		buttons: [],
		labels: [],
		installedApps: {
			wirelessKeypad: {
				isInstalled: false
			},
			stateControl: {
				isInstalled: false,
				sections: [],
				states: [],
				flowActions: [],
				sectionStates: []
			}
		}
	};
	
	var settings = module.exports.getSettings();
	appInfo.buttons = settings.buttons;
	appInfo.labels = settings.labels;
	appInfo.installedApps.wirelessKeypad.isInstalled = _apps.wirelessKeypad.isInstalled;
	appInfo.installedApps.stateControl.isInstalled = _apps.stateControl.isInstalled;
	
	if (_apps.stateControl.isInstalled) {
		_apps.stateControl.api.get('/get-settings/', function(err, settingsResult) {
			if (!err) {
				appInfo.installedApps.stateControl.sections = settingsResult.settings.sections;
				appInfo.installedApps.stateControl.states = settingsResult.settings.states;
				appInfo.installedApps.stateControl.flowActions = settingsResult.settings.flowActions;
				
				_apps.stateControl.api.get('/section-states/', function(err, sectionStatesResult) {
					if (!err) {
						appInfo.installedApps.stateControl.sectionStates = sectionStatesResult.sectionStates;
					}
					callback(appInfo);
				});
			}
		});
	} else
		callback(appInfo);
}