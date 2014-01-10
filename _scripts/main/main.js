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
	// reusable site resize function
	resize: {
		globalObj: null,
		resizeTimeout: null,
		init: function() {
			var self = this;
			self.globalObj.settings.$window.on('resize.bbResize', function() {
				self.clearResizeTimeout();
				self.resizeTimeout = setTimeout(function(){
					self.resizeFinished();
				}, 500);
			});
		},
		clearResizeTimeout: function() {
			var self = this;
			if(self.resizeTimeout) {
				clearTimeout(self.resizeTimeout);
			}
		},
		resizeFinished: function() {
			var self = this;
			self.globalObj.lastComponent.startProcessing(true);
			self.clearResizeTimeout();
		}
	},
	// reusable site loaded function
	loaded: function() {
		var self = this;
		self.settings.$window.on('load', function() {
			// init custom
			// e.g self.myFunction();
		});
	},
	setGlobalObj: function() {
		var self = this;
		self.mq.globalObj = self;
		self.lastComponent.globalObj = self;
		self.resize.globalObj = self;
	},
	// reusable site ready function
	ready: function() {
		var self = this;
		// site global objects first
		self.setGlobalObj();
		// init required
		self.mq.monitorWidth();
		self.browserPrefix();
		self.transitionAnimationEndEvent();
		self.setUrlParams();
		// init custom
		self.lastComponent.init();
		// init loaded
		self.loaded();
		// init resize
		self.resize.init();
	}
});
$(bb.ready());