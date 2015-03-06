/*
 * core.js v1.0.0
 */

var touch = {
	addE: function(){
		$('.touchable').on('mousedown touchstart',function(){
			$('.touched').removeClass('touched');
			$(this).addClass('touched');
		});
		$('.touchable').on('mouseup touchend touchcancel',function(){
			$('.touched').removeClass('touched');
		});
	},
	remE: function(){
		$('.touchable').off('mousedown touchstart');
		$('.touchable').off('mouseup touchend touchcancel');
	},
	initialize: function(){
		touch.addE();
	},
	reset: function(){
		touch.remE();
		touch.initialize();
	}
};

var app = {
	initialize: function() {
		//bind events necessary on mobile
		app.bindEvents();
		views.initialize();
		touch.initialize();
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

$(function(){
	app.initialize();
});
