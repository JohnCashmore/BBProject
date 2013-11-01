/*global $:false */
/*global window */
/*global console */
/*global Modernizr */
/*global clearTimeout */
/*global setTimeout */
// global object for site-wide functions and utilities
var bb = {
	// language variables for translation (e.g Next, Previous, Close)
	language: {},
	// site wide settings
	settings: {
		// cache some common variables
		$window: $(window),
		$html: $('html'),
		$body: $('body'),
		$htmlbody: $('html,body'),
		$page: $('#page'),
		$header: $('#header'),
		$main: $('#main'),
		$footer: $('#footer'),
		// stored URL params (empty to begin with)
		urlParams: {},
		// class to use on
		processedClass: 'processed',
		browserPrefix: null,
		transitionEnd: null,
		animationEnd: null,
		transitionAnimationEnd: null,
		// store processing of last component globally
		processinglastComponent: false,
		// breakpoint variables (should match variables.less)
		breakPointA: 320,
		breakPointB: 480,
		breakPointC: 600,
		breakPointD: 768,
		breakPointE: 1024,
		breakPointF: 1200
	},
	// watch media query changes	
	mq: {
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
	},
	urlParams: {},
	getUrlParams: function(queryString) {
		if (queryString) {
			var params = {},
				queryStringArray = queryString.split('&');
			for (var index in queryStringArray) {
				var query = queryStringArray[index].split('=');
				params[decodeURIComponent(query[0])] = decodeURIComponent(query[1]);
			}
			return params;
		}
	},
	setUrlParams: function() {
		var self = this;
		self.urlParams = self.getUrlParams(window.location.search);
	},
	// use for debugging/logging
	log: function(content) {
		if (typeof(console) !== "undefined") {
			console.log(content);
		}
	},
	htmlEncode: function(value) {
		if (value) {
			return $('<div />').text(value).html();
		} else {
			return '';
		}
	},
	htmlDecode: function(value) {
		if (value) {
			return $('<div />').html(value).text();
		} else {
			return '';
		}
	},
	// get IE version from classname (acceptable values: 10,9,8 or 7)
	ltIE: function(version) {
		var self = this;
		if (self.settings.$html.hasClass('lt-ie' + version)) {
			return true;
		} else {
			return false;
		}
	},
	browserPrefix: function() {
		var self = this,
			styles = window.getComputedStyle(window.document.documentElement, ''),
			prefix = (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o']))[1],
			dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + prefix + ')', 'i'))[1];
		self.settings.browserPrefix = '-' + prefix + '-';
	},
	transitionAnimationEndEvent: function() {
		var self = this,
			transition, transitions, animation, animations, element = window.document.createElement('transitionAnimationElement');
		transitions = {
			'WebkitTransition': 'webkitTransitionEnd',
			'MozTransition': 'transitionend',
			'MSTransition': 'msTransitionEnd',
			'OTransition': 'oTransitionEnd',
			'transition': 'transitionend'
		};
		animations = {
			'WebkitAnimation': 'webkitAnimationEnd',
			'MozAnimation': 'animationend',
			'MSAnimation': 'msAnimationEnd',
			'OAnimation': 'oAnimationEnd',
			'animation': 'animationend'
		};
		for (transition in transitions) {
			if (element.style[transition] !== undefined) {
				self.settings.transitionEnd = transitions[transition];
			}
		}
		// is it null?
		if (self.settings.transitionEnd === null) {
			self.settings.transitionEnd = 'noTransitionEnd';
		}
		for (animation in animations) {
			if (element.style[animation] !== undefined) {
				self.settings.animationEnd = animations[animation];
			}
		}
		// is it null?
		if (self.settings.animationEnd === null) {
			self.settings.animationEnd = 'noAnimationEnd';
		}
		self.settings.transitionAnimationEnd = (self.settings.transitionEnd + ' ' + self.settings.animationEnd).toString();
	},
	// last component in a row
	lastComponent: {
		globalObj: null,
		$moduleContainers: null,
		moduleSelector: '.block',
		lastClass: 'block-last',
		ieLastClass: 'block-last-clear',
		$currentModuleContainer: null,
		processing: false,
		roundingOffset: 3,
		init: function() {
			var self = this;
			self.$moduleContainers = $('.region-inner');
			if (!self.$moduleContainers) {
				return false;
			}
			self.startProcessing(false);
		},
		stopProcessing: function() {
			var self = this;
			console.timeEnd('Processing last components');
			self.processing = false;
			return false;
		},
		startProcessing: function(forceBuild) {
			var self = this;
			console.time('Processing last components');
			self.processing = true;
			if (self.processing || self.$moduleContainers.length < 1) {
				self.stopProcessing();
			}
			if (forceBuild) {
				$(self.moduleSelector).removeClass(self.lastClass);
				if (self.globalObj.ltIE(8)) {
					$('.' + self.ieLastClass).remove();
				}
			}
			self.$moduleContainers.each(function(i) {
				var $moduleContainer = $(this),
					$modules = $moduleContainer.find(self.moduleSelector),
					//$modules = $(),
					modulesLength = $modules.length,
					moduleContainerWidth = null;
				if (modulesLength < 1) {
					self.stopProcessing();
				}
				moduleContainerWidth = ($moduleContainer.width() - self.roundingOffset);
				self.processModules($modules, moduleContainerWidth);
			});
		},
		processModules: function($modules, moduleContainerWidth) {
			var self = this;
			if (!$modules || !moduleContainerWidth) {
				self.stopProcessing();
			}
			$modules.each(function(i) {
				var $module = $(this);
				if ($module.hasClass('pull-right')) {
					return true;
				}
				var outerWidth = parseInt($module.quickOuterWidth(true), 10);
				if (outerWidth >= moduleContainerWidth) {
					self.setLastModule($module);
					return true;
				}
				var positionLeft = parseInt($module.position().left, 10),
					positionRight = Math.round(moduleContainerWidth - parseInt(positionLeft + outerWidth, 10));
				if (positionRight > self.roundingOffset) {
					return true;
				}
				self.setLastModule($module);
			});
			self.stopProcessing();
		},
		setLastModule: function($module) {
			var self = this;
			if (!$module) {
				return false;
			}
			$module.addClass(self.lastClass);
			if (self.globalObj.ltIE(8)) {
				$module.after('<div />', {
					'class': self.ieLastClass
				});
			}
		}
	},
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
			// e.g self.lastComponent.startProcessing(true);
		});
	},
	// reusable site resize function
	resize: {
		globalObj : this,
		resizeTimerID : null,
		init : function () {
			var self = this;
			self.globalObj.settings.$window.on('resize.bbResize', function() {
				clearTimeout(self.resizeTimerID);
				self.resizeTimerID = setTimeout(self.resizeFinished, 200);
			});
		},
		resizeFinished : function () {
			var self = this;
			self.globalObj.lastComponent.startProcessing(true);
			clearTimeout(self.resizeTimerID);
		}
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
		// init resize
		self.resize.init();
		// init loaded
		self.loaded();
	}
};
// jQuery onReady
$(bb.ready());