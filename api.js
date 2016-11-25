"use strict";

module.exports = [
	{
		description:			'Get settings',
		method:					'GET',
		path:					'/get-settings/',
		fn: function(callback, args) {
			var result = {
				successful: false,
				errorMessage: '',
				settings: null,
			};
			try {
				result.settings = Homey.app.getSettings();
				result.successful = true;
				callback(null, result);
			} catch(exception) {
				result.errorMessage = exception.message;
				callback(null, result);
			}
		}
	},
	{
		description:			'Save settings',
		method:					'POST',
		path:					'/save-settings/',
		fn: function(callback, args) {
			var result = {
				successful: false,
				errorMessage: ''
			};
			try {
				Homey.app.saveSettings(args.body);
			} catch(exception) {
				result.errorMessage = exception.message;
				callback(null, result);
			}
		}
	},
	{
		description:			'Get info',
		method:					'GET',
		path:					'/get-info/',
		fn: function(callback, args) {
			var result = {
				successful: false,
				errorMessage: '',
				appInfo: null,
			};
			try {
				Homey.app.getAppInfo(function(appInfo){
					result.appInfo = appInfo;
					result.successful = true;
					callback(null, result);
				});
				
			} catch(exception) {
				result.errorMessage = exception.message;
				callback(null, result);
			}
		}
	}
];