/*global $:false */
/*global window */
/*global console */
/*global Modernizr */
/*global clearTimeout */
/*global setTimeout */
/*global bb:true */
// global object for site-wide functions and utilities
var bb = bb ? bb : {};
$.extend(bb,{
	// functions to run again when ajax content is loaded
	ajaxLoaded: function() {
		var self = this;
		// init custom
		self.lastComponent.startProcessing(true);
	},
	// reusable site loaded function
	loaded: function() {
		var self = this;
		self.settings.$window.on('load', function() {
			// init custom
			// e.g self.myFunction();
			$.publish('pageLoad');
		});
	},
	setGlobalObj: function() {
		var self = this;
		$.publish('setGlobal', self);
	},
	// reusable site ready function
	ready: function() {
		var self = this;

		// site global objects first
		self.setGlobalObj();	
		// init loaded
		self.loaded();

		$.publish('pageReady');
	}
});


$(function () {
	
	bb.ready();
});