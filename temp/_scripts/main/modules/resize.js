/*global $:false */
/*global window */
/*global console */
/*global Modernizr */
/*global clearTimeout */
/*global setTimeout */
/*global bb:true */
var bb = bb ? bb : {};
$.extend(bb,{
	// reusable site resize function
	resize: {
		globalObj: null,
		resizeTimeout: null,
		setGlobal: function (globalObj) {
			var self = this;
			self.globalObj = globalObj;
		},
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
			
			self.clearResizeTimeout();
			$.publish('resizeFinish');
		}
	}
});
$.subscribe('setGlobal', function (e, globalObj) {	
	bb.resize.setGlobal(globalObj);
});
$.subscribe('pageReady', function () {	
	bb.resize.init();
});
