/*global $:false */
/*global window */
/*global console */
/*global Modernizr */
/*global clearTimeout */
/*global setTimeout */

// watch media query changes
var mq = {

	$body: $('body'),
	$detector: $('#monitor-width'),
	// current break point of page
	currentBreakpoint: 0,
	previousBrekpoint: 0,
	// breakpoint variables (should match variables.less)
	breakPointA: 320,
	breakPointB: 480,
	breakPointC: 600,
	breakPointD: 768,
	breakPointE: 980,

	monitorWidth: function () {
		var self = this;

		if (!self.$detector.length) {
			self.$body.append('<div id="monitor-width"></div>');
			self.$detector = $('#monitor-width');
		}
		var detectorWidth = self.$detector.width();

		if (detectorWidth !== mq.currentBreakpoint) {
			//a change has occurred so update the comparison variable
			self.previousBrekpoint = self.currentBreakpoint;
			self.currentBreakpoint = detectorWidth;
		}
	}
};

// site-wide object for site-wide functions and utilities
var site = {

	// language variables for translation (e.g Next, Previous, Close)
	language: {

	},

	// extend language in plugins (e.g jQuery.validate)
	extendLanguages: function () {

	},

	// site wide settings
	settings: {
		// cache some common variables
		$window: $(window),
		$html: $('html'),
		// store processing of last component globally
		processinglastComponent: false
	},

	urlParams: {},

	getUrlParams: function () {
		var self = this,
			match,
			pl = /\+/g, // Regex for replacing addition symbol with a space
			search = /([^&=]+)=?([^&]*)/g,
			decode = function (s) {
				return decodeURIComponent(s.replace(pl, " "));
			},
			query = window.location.search.substring(1);

		while (match = search.exec(query)) {
			self.urlParams[decode(match[1])] = decode(match[2]);
		}
	},

	// use for debugging/logging
	log: function (content) {
		if (typeof (console) !== "undefined") {
			console.log(content);
		}
	},

	// get IE version from classname (acceptable values: 10,9,8 or 7)
	ltIE : function(version) {
		var self = this;

		if(self.settings.$html.hasClass('lt-ie'+version)) {
			return true;
		}else{
			return false;
		}
	},

	// placeholder polyfill
	placeholders: function () {
		var self = this;

		if (!Modernizr.input.placeholder) {
			$('[placeholder]:not([type=password])').focus(function () {
				var $input = $(this);
				if ($input.val() === $input.attr('placeholder')) {
					$input.val('');
					$input.removeClass('placeholder');
				}
			}).blur(function () {
				var $input = $(this);
				if ($input.val() === '' || $input.val() === $input.attr('placeholder')) {
					$input.addClass('placeholder');
					$input.val($input.attr('placeholder'));
				}
			}).blur().parents('form').submit(function () {
				var $input = $(this);
				$input.find('[placeholder]').each(function () {
					if ($input.val() === $input.attr('placeholder')) {
						$input.val('');
					}
				});
			});
		}
	},

	// last component in a row
	lastComponent: function (forceBuild) {
		var self = this;

		var options = {
			moduleContainerInner: '.body', //class name of scope
			module: '[class^="span-"],[class*=" span-"]',
			lastClass: 'last',
			ieMarkup: '<div class="clearfloats"></div>'
		};

		var $moduleContainer = $(options.moduleContainerInner);

		// if we find a container run code
		if ($moduleContainer.length > 0 && !self.settings.processinglastComponent) {

			self.settings.processinglastComponent = true;

			if (forceBuild === true) {
				$(options.module).removeClass(options.lastClass);
			}

			// handle them uniquely via "each" for more than one set of managed module containers on the page
			$moduleContainer.each(function (index) {

				// ref current container we're going to deal with
				var $thisModuleContainer = $(this);
				// get the width of the inner div. So we can parse the space our lastComponent need to occupy
				var moduleContainerWidth = parseFloat($thisModuleContainer.width()).toFixed();

				// jQuery object of the lastComponent within this particular module container
				var $lastComponent = $(options.module, $thisModuleContainer);

				// init smallest Module variable (start by making it the widdest I can be - sounds odd but you'll see)
				var smallestModule = moduleContainerWidth;

				// init the module OuterWidth storage var
				var outerWidth;

				// We need to do this loop of all the lastComponent first to establish which is the smallest
				$lastComponent.each(function (index) {
					var $currentModule = $(this);
					// get current module from the loop's width and store it
					outerWidth = parseFloat($currentModule.outerWidth(true)).toFixed();
					if (outerWidth < smallestModule) {
						smallestModule = Math.floor(outerWidth - 2); // - 2 is a bit of tollerance for percentage blunders in browser
					}
				});

				$lastComponent.each(function (index) {

					// ref the current module
					var $currentModule = $(this);

					// get its outerwidth
					outerWidth = parseFloat($currentModule.outerWidth(true)).toFixed();

					// webkit returns percentage for the margin, so correct outerWidth to pixels
					var marginRight = $currentModule.css('margin-right');
					if (marginRight.substr(marginRight.length - 1, 1) === '%') {
						var marginRightPercentage = marginRight.substr(0, marginRight.length - 2);
						//convert to pixels
						var marginRightPixels = parseInt(Math.floor((moduleContainerWidth * marginRightPercentage) / 100), 10).toFixed();
						// add margin and width together
						outerWidth = $currentModule.outerWidth() + parseInt(marginRightPixels, 10);
					}

					// get position right of the current group
					var positionRight = moduleContainerWidth - Math.floor(parseInt($currentModule.position().left, 10) + parseInt(outerWidth, 10));

					// if current group is positioned at 0 pixels inside our parent, add class of 'last'
					// if less than 2 for complications with percentages
					if (positionRight <= smallestModule) {
						$currentModule.addClass(options.lastClass);

						if (self.settings.ltIE9) {
							$currentModule.after(options.ieMarkup);
						}
					}

					if (index === ($lastComponent.length - 1)) {
						self.settings.processinglastComponent = false;
					}

				});

			});

		} // end existence check
	},

	// reusable site resize function
	resize: function () {
		var self = this;

		var resizeTimerID;
		self.settings.$window.on('resize', function () {
			clearTimeout(resizeTimerID);
			resizeTimerID = setTimeout(resizeFinished, 200);
		});

		// functions to run after resizing

		function resizeFinished() {

			mq.monitorWidth();
			self.lastComponent(true); // reforce a recalculation of the "last" component

		}
	},

	// reusable site loaded function
	loaded: function () {
		var self = this;

		// loaded functions
		self.placeholders();
	},

	// reusable site ready function
	ready: function () {
		var self = this;

		// init functions
		self.getUrlParams();
		self.lastComponent();
		self.resize();

		// window onLoad jQuery function
		self.settings.$window.on('load', function () {
			site.loaded();
		});
	}
};

// onReady jQuery function
$(function () {
	mq.monitorWidth();
	site.ready();
});
