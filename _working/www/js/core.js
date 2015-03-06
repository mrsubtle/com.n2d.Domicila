/*
 * core.js v1.0.0
 */
var app = {
	initialize: function() {
		//bind events necessary on mobile
		app.bindEvents();
		views.initialize();
	},
	bindEvents: function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
	},
	onDeviceReady: function() {
		console.log('Device is ready');
	}
};

var views = {
	initialize: function() {
		console.log('View inits');
	}
};