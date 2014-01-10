/*global $:false */
/*global window */
/*global console */
/*global Modernizr */
/*global clearTimeout */
/*global setTimeout */
/*global bb:true */
var bb = bb ? bb : {};
$.extend(bb,{
	// watch media query changes	
	mq : {
		globalObj: null,
		$detector: $('#monitor-width'),
		detectorWidth: 0,
		// current break point of page
		currentBreakpoint: 0,
		previousBreakpoint: 0,
		monitorWidth: function() {
			var self = this;
			if (!self.$detector.length) {
				self.$detector = $('<div />', {
					id: '#monitor-width'
				});
				self.globalObj.settings.$body.append(self.$detector);
			}
			self.detectorWidth = self.$detector.width();
			if (self.detectorWidth !== self.currentBreakpoint) {
				//a change has occurred so update the comparison variable
				self.previousBreakpoint = self.currentBreakpoint;
				self.currentBreakpoint = self.detectorWidth;
			}
		}
	}
});