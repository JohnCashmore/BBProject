// Console-polyfill. MIT license.
// https://github.com/paulmillr/console-polyfill
// Make it safe to do console.log() always.
(function (con) {
  'use strict';
  var prop, method;
  var empty = {};
  var dummy = function() {};
  var properties = 'memory'.split(',');
  var methods = ('assert,count,debug,dir,dirxml,error,exception,group,' +
     'groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,' +
     'time,timeEnd,trace,warn').split(',');
  while (prop = properties.pop()) con[prop] = con[prop] || empty;
  while (method = methods.pop()) con[method] = con[method] || dummy;
})(window.console = window.console || {});
/*!
 * jQuery Validation Plugin 1.11.1
 *
 * http://bassistance.de/jquery-plugins/jquery-plugin-validation/
 * http://docs.jquery.com/Plugins/Validation
 *
 * Copyright 2013 Jörn Zaefferer
 * Released under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 */

(function($) {

$.extend($.fn, {
	// http://docs.jquery.com/Plugins/Validation/validate
	validate: function( options ) {

		// if nothing is selected, return nothing; can't chain anyway
		if ( !this.length ) {
			if ( options && options.debug && window.console ) {
				console.warn( "Nothing selected, can't validate, returning nothing." );
			}
			return;
		}

		// check if a validator for this form was already created
		var validator = $.data( this[0], "validator" );
		if ( validator ) {
			return validator;
		}

		// Add novalidate tag if HTML5.
		this.attr( "novalidate", "novalidate" );

		validator = new $.validator( options, this[0] );
		$.data( this[0], "validator", validator );

		if ( validator.settings.onsubmit ) {

			this.validateDelegate( ":submit", "click", function( event ) {
				if ( validator.settings.submitHandler ) {
					validator.submitButton = event.target;
				}
				// allow suppressing validation by adding a cancel class to the submit button
				if ( $(event.target).hasClass("cancel") ) {
					validator.cancelSubmit = true;
				}

				// allow suppressing validation by adding the html5 formnovalidate attribute to the submit button
				if ( $(event.target).attr("formnovalidate") !== undefined ) {
					validator.cancelSubmit = true;
				}
			});

			// validate the form on submit
			this.submit( function( event ) {
				if ( validator.settings.debug ) {
					// prevent form submit to be able to see console output
					event.preventDefault();
				}
				function handle() {
					var hidden;
					if ( validator.settings.submitHandler ) {
						if ( validator.submitButton ) {
							// insert a hidden input as a replacement for the missing submit button
							hidden = $("<input type='hidden'/>").attr("name", validator.submitButton.name).val( $(validator.submitButton).val() ).appendTo(validator.currentForm);
						}
						validator.settings.submitHandler.call( validator, validator.currentForm, event );
						if ( validator.submitButton ) {
							// and clean up afterwards; thanks to no-block-scope, hidden can be referenced
							hidden.remove();
						}
						return false;
					}
					return true;
				}

				// prevent submit for invalid forms or custom submit handlers
				if ( validator.cancelSubmit ) {
					validator.cancelSubmit = false;
					return handle();
				}
				if ( validator.form() ) {
					if ( validator.pendingRequest ) {
						validator.formSubmitted = true;
						return false;
					}
					return handle();
				} else {
					validator.focusInvalid();
					return false;
				}
			});
		}

		return validator;
	},
	// http://docs.jquery.com/Plugins/Validation/valid
	valid: function() {
		if ( $(this[0]).is("form")) {
			return this.validate().form();
		} else {
			var valid = true;
			var validator = $(this[0].form).validate();
			this.each(function() {
				valid = valid && validator.element(this);
			});
			return valid;
		}
	},
	// attributes: space seperated list of attributes to retrieve and remove
	removeAttrs: function( attributes ) {
		var result = {},
			$element = this;
		$.each(attributes.split(/\s/), function( index, value ) {
			result[value] = $element.attr(value);
			$element.removeAttr(value);
		});
		return result;
	},
	// http://docs.jquery.com/Plugins/Validation/rules
	rules: function( command, argument ) {
		var element = this[0];

		if ( command ) {
			var settings = $.data(element.form, "validator").settings;
			var staticRules = settings.rules;
			var existingRules = $.validator.staticRules(element);
			switch(command) {
			case "add":
				$.extend(existingRules, $.validator.normalizeRule(argument));
				// remove messages from rules, but allow them to be set separetely
				delete existingRules.messages;
				staticRules[element.name] = existingRules;
				if ( argument.messages ) {
					settings.messages[element.name] = $.extend( settings.messages[element.name], argument.messages );
				}
				break;
			case "remove":
				if ( !argument ) {
					delete staticRules[element.name];
					return existingRules;
				}
				var filtered = {};
				$.each(argument.split(/\s/), function( index, method ) {
					filtered[method] = existingRules[method];
					delete existingRules[method];
				});
				return filtered;
			}
		}

		var data = $.validator.normalizeRules(
		$.extend(
			{},
			$.validator.classRules(element),
			$.validator.attributeRules(element),
			$.validator.dataRules(element),
			$.validator.staticRules(element)
		), element);

		// make sure required is at front
		if ( data.required ) {
			var param = data.required;
			delete data.required;
			data = $.extend({required: param}, data);
		}

		return data;
	}
});

// Custom selectors
$.extend($.expr[":"], {
	// http://docs.jquery.com/Plugins/Validation/blank
	blank: function( a ) { return !$.trim("" + $(a).val()); },
	// http://docs.jquery.com/Plugins/Validation/filled
	filled: function( a ) { return !!$.trim("" + $(a).val()); },
	// http://docs.jquery.com/Plugins/Validation/unchecked
	unchecked: function( a ) { return !$(a).prop("checked"); }
});

// constructor for validator
$.validator = function( options, form ) {
	this.settings = $.extend( true, {}, $.validator.defaults, options );
	this.currentForm = form;
	this.init();
};

$.validator.format = function( source, params ) {
	if ( arguments.length === 1 ) {
		return function() {
			var args = $.makeArray(arguments);
			args.unshift(source);
			return $.validator.format.apply( this, args );
		};
	}
	if ( arguments.length > 2 && params.constructor !== Array  ) {
		params = $.makeArray(arguments).slice(1);
	}
	if ( params.constructor !== Array ) {
		params = [ params ];
	}
	$.each(params, function( i, n ) {
		source = source.replace( new RegExp("\\{" + i + "\\}", "g"), function() {
			return n;
		});
	});
	return source;
};

$.extend($.validator, {

	defaults: {
		messages: {},
		groups: {},
		rules: {},
		errorClass: "error",
		validClass: "valid",
		errorElement: "label",
		focusInvalid: true,
		errorContainer: $([]),
		errorLabelContainer: $([]),
		onsubmit: true,
		ignore: "",
		ignoreTitle: false,
		onfocusin: function( element, event ) {
			this.lastActive = element;

			// hide error label and remove error class on focus if enabled
			if ( this.settings.focusCleanup && !this.blockFocusCleanup ) {
				if ( this.settings.unhighlight ) {
					this.settings.unhighlight.call( this, element, this.settings.errorClass, this.settings.validClass );
				}
				this.addWrapper(this.errorsFor(element)).hide();
			}
		},
		onfocusout: function( element, event ) {
			if ( !this.checkable(element) && (element.name in this.submitted || !this.optional(element)) ) {
				this.element(element);
			}
		},
		onkeyup: function( element, event ) {
			if ( event.which === 9 && this.elementValue(element) === "" ) {
				return;
			} else if ( element.name in this.submitted || element === this.lastElement ) {
				this.element(element);
			}
		},
		onclick: function( element, event ) {
			// click on selects, radiobuttons and checkboxes
			if ( element.name in this.submitted ) {
				this.element(element);
			}
			// or option elements, check parent select in that case
			else if ( element.parentNode.name in this.submitted ) {
				this.element(element.parentNode);
			}
		},
		highlight: function( element, errorClass, validClass ) {
			if ( element.type === "radio" ) {
				this.findByName(element.name).addClass(errorClass).removeClass(validClass);
			} else {
				$(element).addClass(errorClass).removeClass(validClass);
			}
		},
		unhighlight: function( element, errorClass, validClass ) {
			if ( element.type === "radio" ) {
				this.findByName(element.name).removeClass(errorClass).addClass(validClass);
			} else {
				$(element).removeClass(errorClass).addClass(validClass);
			}
		}
	},

	// http://docs.jquery.com/Plugins/Validation/Validator/setDefaults
	setDefaults: function( settings ) {
		$.extend( $.validator.defaults, settings );
	},

	messages: {
		required: "This field is required.",
		remote: "Please fix this field.",
		email: "Please enter a valid email address.",
		url: "Please enter a valid URL.",
		date: "Please enter a valid date.",
		dateISO: "Please enter a valid date (ISO).",
		number: "Please enter a valid number.",
		digits: "Please enter only digits.",
		creditcard: "Please enter a valid credit card number.",
		equalTo: "Please enter the same value again.",
		maxlength: $.validator.format("Please enter no more than {0} characters."),
		minlength: $.validator.format("Please enter at least {0} characters."),
		rangelength: $.validator.format("Please enter a value between {0} and {1} characters long."),
		range: $.validator.format("Please enter a value between {0} and {1}."),
		max: $.validator.format("Please enter a value less than or equal to {0}."),
		min: $.validator.format("Please enter a value greater than or equal to {0}.")
	},

	autoCreateRanges: false,

	prototype: {

		init: function() {
			this.labelContainer = $(this.settings.errorLabelContainer);
			this.errorContext = this.labelContainer.length && this.labelContainer || $(this.currentForm);
			this.containers = $(this.settings.errorContainer).add( this.settings.errorLabelContainer );
			this.submitted = {};
			this.valueCache = {};
			this.pendingRequest = 0;
			this.pending = {};
			this.invalid = {};
			this.reset();

			var groups = (this.groups = {});
			$.each(this.settings.groups, function( key, value ) {
				if ( typeof value === "string" ) {
					value = value.split(/\s/);
				}
				$.each(value, function( index, name ) {
					groups[name] = key;
				});
			});
			var rules = this.settings.rules;
			$.each(rules, function( key, value ) {
				rules[key] = $.validator.normalizeRule(value);
			});

			function delegate(event) {
				var validator = $.data(this[0].form, "validator"),
					eventType = "on" + event.type.replace(/^validate/, "");
				if ( validator.settings[eventType] ) {
					validator.settings[eventType].call(validator, this[0], event);
				}
			}
			$(this.currentForm)
				.validateDelegate(":text, [type='password'], [type='file'], select, textarea, " +
					"[type='number'], [type='search'] ,[type='tel'], [type='url'], " +
					"[type='email'], [type='datetime'], [type='date'], [type='month'], " +
					"[type='week'], [type='time'], [type='datetime-local'], " +
					"[type='range'], [type='color'] ",
					"focusin focusout keyup", delegate)
				.validateDelegate("[type='radio'], [type='checkbox'], select, option", "click", delegate);

			if ( this.settings.invalidHandler ) {
				$(this.currentForm).bind("invalid-form.validate", this.settings.invalidHandler);
			}
		},

		// http://docs.jquery.com/Plugins/Validation/Validator/form
		form: function() {
			this.checkForm();
			$.extend(this.submitted, this.errorMap);
			this.invalid = $.extend({}, this.errorMap);
			if ( !this.valid() ) {
				$(this.currentForm).triggerHandler("invalid-form", [this]);
			}
			this.showErrors();
			return this.valid();
		},

		checkForm: function() {
			this.prepareForm();
			for ( var i = 0, elements = (this.currentElements = this.elements()); elements[i]; i++ ) {
				this.check( elements[i] );
			}
			return this.valid();
		},

		// http://docs.jquery.com/Plugins/Validation/Validator/element
		element: function( element ) {
			element = this.validationTargetFor( this.clean( element ) );
			this.lastElement = element;
			this.prepareElement( element );
			this.currentElements = $(element);
			var result = this.check( element ) !== false;
			if ( result ) {
				delete this.invalid[element.name];
			} else {
				this.invalid[element.name] = true;
			}
			if ( !this.numberOfInvalids() ) {
				// Hide error containers on last error
				this.toHide = this.toHide.add( this.containers );
			}
			this.showErrors();
			return result;
		},

		// http://docs.jquery.com/Plugins/Validation/Validator/showErrors
		showErrors: function( errors ) {
			if ( errors ) {
				// add items to error list and map
				$.extend( this.errorMap, errors );
				this.errorList = [];
				for ( var name in errors ) {
					this.errorList.push({
						message: errors[name],
						element: this.findByName(name)[0]
					});
				}
				// remove items from success list
				this.successList = $.grep( this.successList, function( element ) {
					return !(element.name in errors);
				});
			}
			if ( this.settings.showErrors ) {
				this.settings.showErrors.call( this, this.errorMap, this.errorList );
			} else {
				this.defaultShowErrors();
			}
		},

		// http://docs.jquery.com/Plugins/Validation/Validator/resetForm
		resetForm: function() {
			if ( $.fn.resetForm ) {
				$(this.currentForm).resetForm();
			}
			this.submitted = {};
			this.lastElement = null;
			this.prepareForm();
			this.hideErrors();
			this.elements().removeClass( this.settings.errorClass ).removeData( "previousValue" );
		},

		numberOfInvalids: function() {
			return this.objectLength(this.invalid);
		},

		objectLength: function( obj ) {
			var count = 0;
			for ( var i in obj ) {
				count++;
			}
			return count;
		},

		hideErrors: function() {
			this.addWrapper( this.toHide ).hide();
		},

		valid: function() {
			return this.size() === 0;
		},

		size: function() {
			return this.errorList.length;
		},

		focusInvalid: function() {
			if ( this.settings.focusInvalid ) {
				try {
					$(this.findLastActive() || this.errorList.length && this.errorList[0].element || [])
					.filter(":visible")
					.focus()
					// manually trigger focusin event; without it, focusin handler isn't called, findLastActive won't have anything to find
					.trigger("focusin");
				} catch(e) {
					// ignore IE throwing errors when focusing hidden elements
				}
			}
		},

		findLastActive: function() {
			var lastActive = this.lastActive;
			return lastActive && $.grep(this.errorList, function( n ) {
				return n.element.name === lastActive.name;
			}).length === 1 && lastActive;
		},

		elements: function() {
			var validator = this,
				rulesCache = {};

			// select all valid inputs inside the form (no submit or reset buttons)
			return $(this.currentForm)
			.find("input, select, textarea")
			.not(":submit, :reset, :image, [disabled]")
			.not( this.settings.ignore )
			.filter(function() {
				if ( !this.name && validator.settings.debug && window.console ) {
					console.error( "%o has no name assigned", this);
				}

				// select only the first element for each name, and only those with rules specified
				if ( this.name in rulesCache || !validator.objectLength($(this).rules()) ) {
					return false;
				}

				rulesCache[this.name] = true;
				return true;
			});
		},

		clean: function( selector ) {
			return $(selector)[0];
		},

		errors: function() {
			var errorClass = this.settings.errorClass.replace(" ", ".");
			return $(this.settings.errorElement + "." + errorClass, this.errorContext);
		},

		reset: function() {
			this.successList = [];
			this.errorList = [];
			this.errorMap = {};
			this.toShow = $([]);
			this.toHide = $([]);
			this.currentElements = $([]);
		},

		prepareForm: function() {
			this.reset();
			this.toHide = this.errors().add( this.containers );
		},

		prepareElement: function( element ) {
			this.reset();
			this.toHide = this.errorsFor(element);
		},

		elementValue: function( element ) {
			var type = $(element).attr("type"),
				val = $(element).val();

			if ( type === "radio" || type === "checkbox" ) {
				return $("input[name='" + $(element).attr("name") + "']:checked").val();
			}

			if ( typeof val === "string" ) {
				return val.replace(/\r/g, "");
			}
			return val;
		},

		check: function( element ) {
			element = this.validationTargetFor( this.clean( element ) );

			var rules = $(element).rules();
			var dependencyMismatch = false;
			var val = this.elementValue(element);
			var result;

			for (var method in rules ) {
				var rule = { method: method, parameters: rules[method] };
				try {

					result = $.validator.methods[method].call( this, val, element, rule.parameters );

					// if a method indicates that the field is optional and therefore valid,
					// don't mark it as valid when there are no other rules
					if ( result === "dependency-mismatch" ) {
						dependencyMismatch = true;
						continue;
					}
					dependencyMismatch = false;

					if ( result === "pending" ) {
						this.toHide = this.toHide.not( this.errorsFor(element) );
						return;
					}

					if ( !result ) {
						this.formatAndAdd( element, rule );
						return false;
					}
				} catch(e) {
					if ( this.settings.debug && window.console ) {
						console.log( "Exception occurred when checking element " + element.id + ", check the '" + rule.method + "' method.", e );
					}
					throw e;
				}
			}
			if ( dependencyMismatch ) {
				return;
			}
			if ( this.objectLength(rules) ) {
				this.successList.push(element);
			}
			return true;
		},

		// return the custom message for the given element and validation method
		// specified in the element's HTML5 data attribute
		customDataMessage: function( element, method ) {
			return $(element).data("msg-" + method.toLowerCase()) || (element.attributes && $(element).attr("data-msg-" + method.toLowerCase()));
		},

		// return the custom message for the given element name and validation method
		customMessage: function( name, method ) {
			var m = this.settings.messages[name];
			return m && (m.constructor === String ? m : m[method]);
		},

		// return the first defined argument, allowing empty strings
		findDefined: function() {
			for(var i = 0; i < arguments.length; i++) {
				if ( arguments[i] !== undefined ) {
					return arguments[i];
				}
			}
			return undefined;
		},

		defaultMessage: function( element, method ) {
			return this.findDefined(
				this.customMessage( element.name, method ),
				this.customDataMessage( element, method ),
				// title is never undefined, so handle empty string as undefined
				!this.settings.ignoreTitle && element.title || undefined,
				$.validator.messages[method],
				"<strong>Warning: No message defined for " + element.name + "</strong>"
			);
		},

		formatAndAdd: function( element, rule ) {
			var message = this.defaultMessage( element, rule.method ),
				theregex = /\$?\{(\d+)\}/g;
			if ( typeof message === "function" ) {
				message = message.call(this, rule.parameters, element);
			} else if (theregex.test(message)) {
				message = $.validator.format(message.replace(theregex, "{$1}"), rule.parameters);
			}
			this.errorList.push({
				message: message,
				element: element
			});

			this.errorMap[element.name] = message;
			this.submitted[element.name] = message;
		},

		addWrapper: function( toToggle ) {
			if ( this.settings.wrapper ) {
				toToggle = toToggle.add( toToggle.parent( this.settings.wrapper ) );
			}
			return toToggle;
		},

		defaultShowErrors: function() {
			var i, elements;
			for ( i = 0; this.errorList[i]; i++ ) {
				var error = this.errorList[i];
				if ( this.settings.highlight ) {
					this.settings.highlight.call( this, error.element, this.settings.errorClass, this.settings.validClass );
				}
				this.showLabel( error.element, error.message );
			}
			if ( this.errorList.length ) {
				this.toShow = this.toShow.add( this.containers );
			}
			if ( this.settings.success ) {
				for ( i = 0; this.successList[i]; i++ ) {
					this.showLabel( this.successList[i] );
				}
			}
			if ( this.settings.unhighlight ) {
				for ( i = 0, elements = this.validElements(); elements[i]; i++ ) {
					this.settings.unhighlight.call( this, elements[i], this.settings.errorClass, this.settings.validClass );
				}
			}
			this.toHide = this.toHide.not( this.toShow );
			this.hideErrors();
			this.addWrapper( this.toShow ).show();
		},

		validElements: function() {
			return this.currentElements.not(this.invalidElements());
		},

		invalidElements: function() {
			return $(this.errorList).map(function() {
				return this.element;
			});
		},

		showLabel: function( element, message ) {
			var label = this.errorsFor( element );
			if ( label.length ) {
				// refresh error/success class
				label.removeClass( this.settings.validClass ).addClass( this.settings.errorClass );
				// replace message on existing label
				label.html(message);
			} else {
				// create label
				label = $("<" + this.settings.errorElement + ">")
					.attr("for", this.idOrName(element))
					.addClass(this.settings.errorClass)
					.html(message || "");
				if ( this.settings.wrapper ) {
					// make sure the element is visible, even in IE
					// actually showing the wrapped element is handled elsewhere
					label = label.hide().show().wrap("<" + this.settings.wrapper + "/>").parent();
				}
				if ( !this.labelContainer.append(label).length ) {
					if ( this.settings.errorPlacement ) {
						this.settings.errorPlacement(label, $(element) );
					} else {
						label.insertAfter(element);
					}
				}
			}
			if ( !message && this.settings.success ) {
				label.text("");
				if ( typeof this.settings.success === "string" ) {
					label.addClass( this.settings.success );
				} else {
					this.settings.success( label, element );
				}
			}
			this.toShow = this.toShow.add(label);
		},

		errorsFor: function( element ) {
			var name = this.idOrName(element);
			return this.errors().filter(function() {
				return $(this).attr("for") === name;
			});
		},

		idOrName: function( element ) {
			return this.groups[element.name] || (this.checkable(element) ? element.name : element.id || element.name);
		},

		validationTargetFor: function( element ) {
			// if radio/checkbox, validate first element in group instead
			if ( this.checkable(element) ) {
				element = this.findByName( element.name ).not(this.settings.ignore)[0];
			}
			return element;
		},

		checkable: function( element ) {
			return (/radio|checkbox/i).test(element.type);
		},

		findByName: function( name ) {
			return $(this.currentForm).find("[name='" + name + "']");
		},

		getLength: function( value, element ) {
			switch( element.nodeName.toLowerCase() ) {
			case "select":
				return $("option:selected", element).length;
			case "input":
				if ( this.checkable( element) ) {
					return this.findByName(element.name).filter(":checked").length;
				}
			}
			return value.length;
		},

		depend: function( param, element ) {
			return this.dependTypes[typeof param] ? this.dependTypes[typeof param](param, element) : true;
		},

		dependTypes: {
			"boolean": function( param, element ) {
				return param;
			},
			"string": function( param, element ) {
				return !!$(param, element.form).length;
			},
			"function": function( param, element ) {
				return param(element);
			}
		},

		optional: function( element ) {
			var val = this.elementValue(element);
			return !$.validator.methods.required.call(this, val, element) && "dependency-mismatch";
		},

		startRequest: function( element ) {
			if ( !this.pending[element.name] ) {
				this.pendingRequest++;
				this.pending[element.name] = true;
			}
		},

		stopRequest: function( element, valid ) {
			this.pendingRequest--;
			// sometimes synchronization fails, make sure pendingRequest is never < 0
			if ( this.pendingRequest < 0 ) {
				this.pendingRequest = 0;
			}
			delete this.pending[element.name];
			if ( valid && this.pendingRequest === 0 && this.formSubmitted && this.form() ) {
				$(this.currentForm).submit();
				this.formSubmitted = false;
			} else if (!valid && this.pendingRequest === 0 && this.formSubmitted) {
				$(this.currentForm).triggerHandler("invalid-form", [this]);
				this.formSubmitted = false;
			}
		},

		previousValue: function( element ) {
			return $.data(element, "previousValue") || $.data(element, "previousValue", {
				old: null,
				valid: true,
				message: this.defaultMessage( element, "remote" )
			});
		}

	},

	classRuleSettings: {
		required: {required: true},
		email: {email: true},
		url: {url: true},
		date: {date: true},
		dateISO: {dateISO: true},
		number: {number: true},
		digits: {digits: true},
		creditcard: {creditcard: true}
	},

	addClassRules: function( className, rules ) {
		if ( className.constructor === String ) {
			this.classRuleSettings[className] = rules;
		} else {
			$.extend(this.classRuleSettings, className);
		}
	},

	classRules: function( element ) {
		var rules = {};
		var classes = $(element).attr("class");
		if ( classes ) {
			$.each(classes.split(" "), function() {
				if ( this in $.validator.classRuleSettings ) {
					$.extend(rules, $.validator.classRuleSettings[this]);
				}
			});
		}
		return rules;
	},

	attributeRules: function( element ) {
		var rules = {};
		var $element = $(element);
		var type = $element[0].getAttribute("type");

		for (var method in $.validator.methods) {
			var value;

			// support for <input required> in both html5 and older browsers
			if ( method === "required" ) {
				value = $element.get(0).getAttribute(method);
				// Some browsers return an empty string for the required attribute
				// and non-HTML5 browsers might have required="" markup
				if ( value === "" ) {
					value = true;
				}
				// force non-HTML5 browsers to return bool
				value = !!value;
			} else {
				value = $element.attr(method);
			}

			// convert the value to a number for number inputs, and for text for backwards compability
			// allows type="date" and others to be compared as strings
			if ( /min|max/.test( method ) && ( type === null || /number|range|text/.test( type ) ) ) {
				value = Number(value);
			}

			if ( value ) {
				rules[method] = value;
			} else if ( type === method && type !== 'range' ) {
				// exception: the jquery validate 'range' method
				// does not test for the html5 'range' type
				rules[method] = true;
			}
		}

		// maxlength may be returned as -1, 2147483647 (IE) and 524288 (safari) for text inputs
		if ( rules.maxlength && /-1|2147483647|524288/.test(rules.maxlength) ) {
			delete rules.maxlength;
		}

		return rules;
	},

	dataRules: function( element ) {
		var method, value,
			rules = {}, $element = $(element);
		for (method in $.validator.methods) {
			value = $element.data("rule-" + method.toLowerCase());
			if ( value !== undefined ) {
				rules[method] = value;
			}
		}
		return rules;
	},

	staticRules: function( element ) {
		var rules = {};
		var validator = $.data(element.form, "validator");
		if ( validator.settings.rules ) {
			rules = $.validator.normalizeRule(validator.settings.rules[element.name]) || {};
		}
		return rules;
	},

	normalizeRules: function( rules, element ) {
		// handle dependency check
		$.each(rules, function( prop, val ) {
			// ignore rule when param is explicitly false, eg. required:false
			if ( val === false ) {
				delete rules[prop];
				return;
			}
			if ( val.param || val.depends ) {
				var keepRule = true;
				switch (typeof val.depends) {
				case "string":
					keepRule = !!$(val.depends, element.form).length;
					break;
				case "function":
					keepRule = val.depends.call(element, element);
					break;
				}
				if ( keepRule ) {
					rules[prop] = val.param !== undefined ? val.param : true;
				} else {
					delete rules[prop];
				}
			}
		});

		// evaluate parameters
		$.each(rules, function( rule, parameter ) {
			rules[rule] = $.isFunction(parameter) ? parameter(element) : parameter;
		});

		// clean number parameters
		$.each(['minlength', 'maxlength'], function() {
			if ( rules[this] ) {
				rules[this] = Number(rules[this]);
			}
		});
		$.each(['rangelength', 'range'], function() {
			var parts;
			if ( rules[this] ) {
				if ( $.isArray(rules[this]) ) {
					rules[this] = [Number(rules[this][0]), Number(rules[this][1])];
				} else if ( typeof rules[this] === "string" ) {
					parts = rules[this].split(/[\s,]+/);
					rules[this] = [Number(parts[0]), Number(parts[1])];
				}
			}
		});

		if ( $.validator.autoCreateRanges ) {
			// auto-create ranges
			if ( rules.min && rules.max ) {
				rules.range = [rules.min, rules.max];
				delete rules.min;
				delete rules.max;
			}
			if ( rules.minlength && rules.maxlength ) {
				rules.rangelength = [rules.minlength, rules.maxlength];
				delete rules.minlength;
				delete rules.maxlength;
			}
		}

		return rules;
	},

	// Converts a simple string to a {string: true} rule, e.g., "required" to {required:true}
	normalizeRule: function( data ) {
		if ( typeof data === "string" ) {
			var transformed = {};
			$.each(data.split(/\s/), function() {
				transformed[this] = true;
			});
			data = transformed;
		}
		return data;
	},

	// http://docs.jquery.com/Plugins/Validation/Validator/addMethod
	addMethod: function( name, method, message ) {
		$.validator.methods[name] = method;
		$.validator.messages[name] = message !== undefined ? message : $.validator.messages[name];
		if ( method.length < 3 ) {
			$.validator.addClassRules(name, $.validator.normalizeRule(name));
		}
	},

	methods: {

		// http://docs.jquery.com/Plugins/Validation/Methods/required
		required: function( value, element, param ) {
			// check if dependency is met
			if ( !this.depend(param, element) ) {
				return "dependency-mismatch";
			}
			if ( element.nodeName.toLowerCase() === "select" ) {
				// could be an array for select-multiple or a string, both are fine this way
				var val = $(element).val();
				return val && val.length > 0;
			}
			if ( this.checkable(element) ) {
				return this.getLength(value, element) > 0;
			}
			return $.trim(value).length > 0;
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/email
		email: function( value, element ) {
			// contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
			return this.optional(element) || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(value);
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/url
		url: function( value, element ) {
			// contributed by Scott Gonzalez: http://projects.scottsplayground.com/iri/
			return this.optional(element) || /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/date
		date: function( value, element ) {
			return this.optional(element) || !/Invalid|NaN/.test(new Date(value).toString());
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/dateISO
		dateISO: function( value, element ) {
			return this.optional(element) || /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(value);
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/number
		number: function( value, element ) {
			return this.optional(element) || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/digits
		digits: function( value, element ) {
			return this.optional(element) || /^\d+$/.test(value);
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/creditcard
		// based on http://en.wikipedia.org/wiki/Luhn
		creditcard: function( value, element ) {
			if ( this.optional(element) ) {
				return "dependency-mismatch";
			}
			// accept only spaces, digits and dashes
			if ( /[^0-9 \-]+/.test(value) ) {
				return false;
			}
			var nCheck = 0,
				nDigit = 0,
				bEven = false;

			value = value.replace(/\D/g, "");

			for (var n = value.length - 1; n >= 0; n--) {
				var cDigit = value.charAt(n);
				nDigit = parseInt(cDigit, 10);
				if ( bEven ) {
					if ( (nDigit *= 2) > 9 ) {
						nDigit -= 9;
					}
				}
				nCheck += nDigit;
				bEven = !bEven;
			}

			return (nCheck % 10) === 0;
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/minlength
		minlength: function( value, element, param ) {
			var length = $.isArray( value ) ? value.length : this.getLength($.trim(value), element);
			return this.optional(element) || length >= param;
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/maxlength
		maxlength: function( value, element, param ) {
			var length = $.isArray( value ) ? value.length : this.getLength($.trim(value), element);
			return this.optional(element) || length <= param;
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/rangelength
		rangelength: function( value, element, param ) {
			var length = $.isArray( value ) ? value.length : this.getLength($.trim(value), element);
			return this.optional(element) || ( length >= param[0] && length <= param[1] );
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/min
		min: function( value, element, param ) {
			return this.optional(element) || value >= param;
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/max
		max: function( value, element, param ) {
			return this.optional(element) || value <= param;
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/range
		range: function( value, element, param ) {
			return this.optional(element) || ( value >= param[0] && value <= param[1] );
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/equalTo
		equalTo: function( value, element, param ) {
			// bind to the blur event of the target in order to revalidate whenever the target field is updated
			// TODO find a way to bind the event just once, avoiding the unbind-rebind overhead
			var target = $(param);
			if ( this.settings.onfocusout ) {
				target.unbind(".validate-equalTo").bind("blur.validate-equalTo", function() {
					$(element).valid();
				});
			}
			return value === target.val();
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/remote
		remote: function( value, element, param ) {
			if ( this.optional(element) ) {
				return "dependency-mismatch";
			}

			var previous = this.previousValue(element);
			if (!this.settings.messages[element.name] ) {
				this.settings.messages[element.name] = {};
			}
			previous.originalMessage = this.settings.messages[element.name].remote;
			this.settings.messages[element.name].remote = previous.message;

			param = typeof param === "string" && {url:param} || param;

			if ( previous.old === value ) {
				return previous.valid;
			}

			previous.old = value;
			var validator = this;
			this.startRequest(element);
			var data = {};
			data[element.name] = value;
			$.ajax($.extend(true, {
				url: param,
				mode: "abort",
				port: "validate" + element.name,
				dataType: "json",
				data: data,
				success: function( response ) {
					validator.settings.messages[element.name].remote = previous.originalMessage;
					var valid = response === true || response === "true";
					if ( valid ) {
						var submitted = validator.formSubmitted;
						validator.prepareElement(element);
						validator.formSubmitted = submitted;
						validator.successList.push(element);
						delete validator.invalid[element.name];
						validator.showErrors();
					} else {
						var errors = {};
						var message = response || validator.defaultMessage( element, "remote" );
						errors[element.name] = previous.message = $.isFunction(message) ? message(value) : message;
						validator.invalid[element.name] = true;
						validator.showErrors(errors);
					}
					previous.valid = valid;
					validator.stopRequest(element, valid);
				}
			}, param));
			return "pending";
		}

	}

});

// deprecated, use $.validator.format instead
$.format = $.validator.format;

}(jQuery));

// ajax mode: abort
// usage: $.ajax({ mode: "abort"[, port: "uniqueport"]});
// if mode:"abort" is used, the previous request on that port (port can be undefined) is aborted via XMLHttpRequest.abort()
(function($) {
	var pendingRequests = {};
	// Use a prefilter if available (1.5+)
	if ( $.ajaxPrefilter ) {
		$.ajaxPrefilter(function( settings, _, xhr ) {
			var port = settings.port;
			if ( settings.mode === "abort" ) {
				if ( pendingRequests[port] ) {
					pendingRequests[port].abort();
				}
				pendingRequests[port] = xhr;
			}
		});
	} else {
		// Proxy ajax
		var ajax = $.ajax;
		$.ajax = function( settings ) {
			var mode = ( "mode" in settings ? settings : $.ajaxSettings ).mode,
				port = ( "port" in settings ? settings : $.ajaxSettings ).port;
			if ( mode === "abort" ) {
				if ( pendingRequests[port] ) {
					pendingRequests[port].abort();
				}
				pendingRequests[port] = ajax.apply(this, arguments);
				return pendingRequests[port];
			}
			return ajax.apply(this, arguments);
		};
	}
}(jQuery));

// provides delegate(type: String, delegate: Selector, handler: Callback) plugin for easier event delegation
// handler is only called when $(event.target).is(delegate), in the scope of the jquery-object for event.target
(function($) {
	$.extend($.fn, {
		validateDelegate: function( delegate, type, handler ) {
			return this.bind(type, function( event ) {
				var target = $(event.target);
				if ( target.is(delegate) ) {
					return handler.apply(target, arguments);
				}
			});
		}
	});
}(jQuery));

(function($){

	// Default validator settings
	var settings = {
		// highlight and unhighlight elemnts with the sames 'name' attribute
		highlight: function( element, errorClass, validClass ) {
			$(element).closest('form').find("[name='" + element.name + "']").addClass(errorClass).removeClass(validClass);
		},
		unhighlight: function( element, errorClass, validClass ) {
			$(element).closest('form').find("[name='" + element.name + "']").removeClass(errorClass).addClass(validClass);
		}
	};

	if ($.validator) {
		$.validator.setDefaults(settings);
	}

	// 'required if' certain field has any value
	$.validator.addMethod('requiredif', function(value, element, parameters) {
	    var id = "#" + parameters["dependentupon"];

	    var control = $(id);

	    if (control.length == 0) {
	        control = $('input[name=' + parameters["dependentupon"] + ']');
	    }

	    if (control.length == 0) {
	        return false;
	    }

	    var controlType = control.eq(0).attr('type');
	    var dependentVal = null;

	    if (controlType == 'checkbox' && control.length > 1) {
	        dependentVal = control.is(':checked').val().toString();
	    } else if (controlType == 'checkbox' && control.length == 1) {
	        dependentVal = control.is(':checked').toString();
	    } else if (controlType == 'radio') {
	        dependentVal = control.filter(':checked').val().toString();
	    } else {
	        dependentVal = control.val();
	    }

	    if (dependentVal) {
	        return $.validator.methods.required.call(this, value, element, parameters);
	    }

	    return true;
	});

	// 'required if' certain field has a 'specific value'
	$.validator.addMethod('requiredifvalue', function(value, element, parameters) {
	    var id = "#" + parameters["dependentupon"];

	    var targetValue = parameters["targetvalue"];
	    targetValue = (targetValue == null ? '' : targetValue).toString();

	    var control = $(id);

	    if (control.length == 0) {
	        control = $('input[name=' + parameters["dependentupon"] + ']');
	    }

	    if (control.length == 0) {
	        return false;
	    }

	    var controlType = control.eq(0).attr('type');
	    var actualValue;

	    if (controlType == 'checkbox' && control.length > 1) {
	        actualValue = control.is(':checked').val().toString();
	    } else if (controlType == 'checkbox' && control.length == 1) {
	        actualValue = control.is(':checked').toString();
	    } else if (controlType == 'radio') {
	        actualValue = control.filter(':checked').val().toString();
	    } else {
	        actualValue = control.val();
	    }

	    if (targetValue === actualValue) {
	        return $.validator.methods.required.call(this, value, element, parameters);
	    }

	    return true;
	});

	// 'at least' certain amount of items picked
	$.validator.addMethod('atleast', function(value, element, minimum) {

		var $element = $(element),
			$elements = null,
			elementsName = $element.attr('name');

		if(minimum){
			minimum = parseInt(minimum); // -1 to 0 base int
		}else{
			minimum = 0;
		}

		if (elementsName) {
	        $elements = $('[name=' + elementsName + ']');
	    } else {
	    	return false;
	    }

	    var atleastLength = 0;
	    $elements.each(function () {
		    $input = $(this);

		    if( $input.is(':checkbox:not(:checked)') || $input.is(':radio:not(:checked)') ) {
			   return false;
		    } else if( $input.val().length === 0 ) {
			   return false;
		    }

		    atleastLength++;
	    });

    	if( atleastLength >= minimum ){
			return true;
		} else {
			return false;
		}
	});

	$.validator.addMethod("phone", function (value, element) {
		return this.optional(element) || /^[0-9 (+)]+$/.test(value);
	});

	$.validator.addMethod("multiemail", function (value, element) {

	    if (this.optional(element)) {
	        return true;
	    }

	    var emails = value.trim().replace(/\,$/, '').split(','),
	        valid = true;

	    for (var i = 0, limit = emails.length; i < limit; i++) {
	        value = $.trim(emails[i]);
	        valid = valid && $.validator.methods.email.call(this, value, element);
	    }

	    return valid;

	}, "Invalid email format: please use a comma to separate multiple email addresses.");

	$.validator.addMethod("time", function(value, element) {

		if (this.optional(element) && value.length < 1) {
	        return true;
	    }

	    var valid = true,
	    	timeTest = /^(([0-1]?[0-9])|([2][0-3])):([0-5]?[0-9])(:([0-5]?[0-9]))?$/i.test(value);

	    if(!timeTest) {
		    valid = false;
	    }

		return valid;

	}, "Please enter a valid time (hh:mm).");

	$.validator.addMethod("datetimerange", function(value, element) {

		var $element = $(element);

		var startDateInput = $element.siblings('.start-date');
		var startDate = startDateInput.val();

		if (startDate === '')
			return true;

		var startTimeInput = $element.siblings('.start-time');
		var startTime = startTimeInput.is(':hidden') ? '00:00' : startTimeInput.val();

		if (startTime === '')
			return true;

		var endDateInput = $element.siblings('.end-date');
		var endDate = endDateInput.val();

		if (endDate === '')
			return true;

		var endTimeInput = $element.siblings('.end-time');
		var endTime = endTimeInput.is(':hidden') ? '00:00' : endTimeInput.val();

		if (endTime === '')
			return true;

		var startDateTime = Date.parse(startDate + 'T' + startTime);
		var endDateTime = Date.parse(endDate + 'T' + endTime);

		return startDateTime <= endDateTime;

	}, "The end date/time must be after the start date/time.");

}(window.jQuery));
/// <reference path="jquery-1.4.4.js" />
/// <reference path="jquery.validate.js" />

/*!
** Unobtrusive validation support library for jQuery and jQuery Validate
** Copyright (C) Microsoft Corporation. All rights reserved.
*/

/*jslint white: true, browser: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: false */
/*global document: false, jQuery: false */

(function ($) {
    var $jQval = $.validator,
        adapters,
        data_validation = "unobtrusiveValidation";

    function setValidationValues(options, ruleName, value) {
        options.rules[ruleName] = value;
        if (options.message) {
            options.messages[ruleName] = options.message;
        }
    }

    function splitAndTrim(value) {
        return value.replace(/^\s+|\s+$/g, "").split(/\s*,\s*/g);
    }

    function getModelPrefix(fieldName) {
        return fieldName.substr(0, fieldName.lastIndexOf(".") + 1);
    }

    function appendModelPrefix(value, prefix) {
        if (value.indexOf("*.") === 0) {
            value = value.replace("*.", prefix);
        }
        return value;
    }

    function onError(error, inputElement) {  // 'this' is the form element
    	//BB EDIT: Allow messages to be displayed anywhere on the page ( instead of just form element )
        //var container = $(this).find("[data-valmsg-for='" + inputElement[0].name + "']"),
        var container = $("[data-valmsg-for='" + inputElement[0].name + "']"),
        	//BB EDIT: Fix https://connect.microsoft.com/VisualStudio/feedback/details/786650/jquery-validate-unobtrusive-js-broken-for-jquery-1-9-and-above
            //replace = $.parseJSON(container.attr("data-valmsg-replace")) !== false;
            replace = container.attr("data-valmsg-replace") && $.parseJSON(container.attr("data-valmsg-replace")) !== false;

        container.removeClass("field-validation-valid").addClass("field-validation-error");
        error.data("unobtrusiveContainer", container);

        if (replace) {
            container.empty();
            error.removeClass("input-validation-error").appendTo(container);
        }
        else {
            error.hide();
        }
    }

    function onErrors(form, validator) {  // 'this' is the form element
        var container = $(this).find("[data-valmsg-summary=true]"),
            list = container.find("ul");

        if (list && list.length && validator.errorList.length) {
            list.empty();
            container.addClass("validation-summary-errors").removeClass("validation-summary-valid");

            $.each(validator.errorList, function () {
                $("<li />").html(this.message).appendTo(list);
            });
        }
    }

    function onSuccess(error) {  // 'this' is the form element
        var container = error.data("unobtrusiveContainer"),
        	//BB EDIT: Fix https://connect.microsoft.com/VisualStudio/feedback/details/786650/jquery-validate-unobtrusive-js-broken-for-jquery-1-9-and-above
            //replace = $.parseJSON(container.attr("data-valmsg-replace"));
            replace = container.attr("data-valmsg-replace") && $.parseJSON(container.attr("data-valmsg-replace"));

        if (container) {
            container.addClass("field-validation-valid").removeClass("field-validation-error");
            error.removeData("unobtrusiveContainer");

            if (replace) {
                container.empty();
            }
        }
    }

    function validationInfo(form) {
        var $form = $(form),
            result = $form.data(data_validation);

        if (!result) {
            result = {
                options: {  // options structure passed to jQuery Validate's validate() method
                    errorClass: "input-validation-error",
                    errorElement: "span",
                    errorPlacement: $.proxy(onError, form),
                    invalidHandler: $.proxy(onErrors, form),
                    messages: {},
                    rules: {},
                    success: $.proxy(onSuccess, form)
                },
                attachValidation: function () {
                    $form.validate(this.options);
                },
                validate: function () {  // a validation function that is called by unobtrusive Ajax
                    $form.validate();
                    return $form.valid();
                }
            };
            $form.data(data_validation, result);
        }

        return result;
    }

    $jQval.unobtrusive = {
        adapters: [],

        parseElement: function (element, skipAttach) {
            /// <summary>
            /// Parses a single HTML element for unobtrusive validation attributes.
            /// </summary>
            /// <param name="element" domElement="true">The HTML element to be parsed.</param>
            /// <param name="skipAttach" type="Boolean">[Optional] true to skip attaching the
            /// validation to the form. If parsing just this single element, you should specify true.
            /// If parsing several elements, you should specify false, and manually attach the validation
            /// to the form when you are finished. The default is false.</param>
            var $element = $(element),
                form = $element.parents("form")[0],
                valInfo, rules, messages;

            if (!form) {  // Cannot do client-side validation without a form
                return;
            }

            valInfo = validationInfo(form);
            valInfo.options.rules[element.name] = rules = {};
            valInfo.options.messages[element.name] = messages = {};

            $.each(this.adapters, function () {
                var prefix = "data-val-" + this.name,
                    message = $element.attr(prefix),
                    paramValues = {};

                if (message !== undefined) {  // Compare against undefined, because an empty message is legal (and falsy)
                    prefix += "-";

                    $.each(this.params, function () {
                        paramValues[this] = $element.attr(prefix + this);
                    });

                    this.adapt({
                        element: element,
                        form: form,
                        message: message,
                        params: paramValues,
                        rules: rules,
                        messages: messages
                    });
                }
            });

            jQuery.extend(rules, { "__dummy__": true });

            if (!skipAttach) {
                valInfo.attachValidation();
            }
        },

        parse: function (selector) {
            /// <summary>
            /// Parses all the HTML elements in the specified selector. It looks for input elements decorated
            /// with the [data-val=true] attribute value and enables validation according to the data-val-*
            /// attribute values.
            /// </summary>
            /// <param name="selector" type="String">Any valid jQuery selector.</param>
            $(selector).find(":input[data-val=true]").each(function () {
                $jQval.unobtrusive.parseElement(this, true);
            });

            $("form").each(function () {
                var info = validationInfo(this);
                if (info) {
                    info.attachValidation();
                }
            });
        }
    };

    adapters = $jQval.unobtrusive.adapters;

    adapters.add = function (adapterName, params, fn) {
        /// <summary>Adds a new adapter to convert unobtrusive HTML into a jQuery Validate validation.</summary>
        /// <param name="adapterName" type="String">The name of the adapter to be added. This matches the name used
        /// in the data-val-nnnn HTML attribute (where nnnn is the adapter name).</param>
        /// <param name="params" type="Array" optional="true">[Optional] An array of parameter names (strings) that will
        /// be extracted from the data-val-nnnn-mmmm HTML attributes (where nnnn is the adapter name, and
        /// mmmm is the parameter name).</param>
        /// <param name="fn" type="Function">The function to call, which adapts the values from the HTML
        /// attributes into jQuery Validate rules and/or messages.</param>
        /// <returns type="jQuery.validator.unobtrusive.adapters" />
        if (!fn) {  // Called with no params, just a function
            fn = params;
            params = [];
        }
        this.push({ name: adapterName, params: params, adapt: fn });
        return this;
    };

    adapters.addBool = function (adapterName, ruleName) {
        /// <summary>Adds a new adapter to convert unobtrusive HTML into a jQuery Validate validation, where
        /// the jQuery Validate validation rule has no parameter values.</summary>
        /// <param name="adapterName" type="String">The name of the adapter to be added. This matches the name used
        /// in the data-val-nnnn HTML attribute (where nnnn is the adapter name).</param>
        /// <param name="ruleName" type="String" optional="true">[Optional] The name of the jQuery Validate rule. If not provided, the value
        /// of adapterName will be used instead.</param>
        /// <returns type="jQuery.validator.unobtrusive.adapters" />
        return this.add(adapterName, function (options) {
            setValidationValues(options, ruleName || adapterName, true);
        });
    };

    adapters.addMinMax = function (adapterName, minRuleName, maxRuleName, minMaxRuleName, minAttribute, maxAttribute) {
        /// <summary>Adds a new adapter to convert unobtrusive HTML into a jQuery Validate validation, where
        /// the jQuery Validate validation has three potential rules (one for min-only, one for max-only, and
        /// one for min-and-max). The HTML parameters are expected to be named -min and -max.</summary>
        /// <param name="adapterName" type="String">The name of the adapter to be added. This matches the name used
        /// in the data-val-nnnn HTML attribute (where nnnn is the adapter name).</param>
        /// <param name="minRuleName" type="String">The name of the jQuery Validate rule to be used when you only
        /// have a minimum value.</param>
        /// <param name="maxRuleName" type="String">The name of the jQuery Validate rule to be used when you only
        /// have a maximum value.</param>
        /// <param name="minMaxRuleName" type="String">The name of the jQuery Validate rule to be used when you
        /// have both a minimum and maximum value.</param>
        /// <param name="minAttribute" type="String" optional="true">[Optional] The name of the HTML attribute that
        /// contains the minimum value. The default is "min".</param>
        /// <param name="maxAttribute" type="String" optional="true">[Optional] The name of the HTML attribute that
        /// contains the maximum value. The default is "max".</param>
        /// <returns type="jQuery.validator.unobtrusive.adapters" />
        return this.add(adapterName, [minAttribute || "min", maxAttribute || "max"], function (options) {
            var min = options.params.min,
                max = options.params.max;

            if (min && max) {
                setValidationValues(options, minMaxRuleName, [min, max]);
            }
            else if (min) {
                setValidationValues(options, minRuleName, min);
            }
            else if (max) {
                setValidationValues(options, maxRuleName, max);
            }
        });
    };

    adapters.addSingleVal = function (adapterName, attribute, ruleName) {
        /// <summary>Adds a new adapter to convert unobtrusive HTML into a jQuery Validate validation, where
        /// the jQuery Validate validation rule has a single value.</summary>
        /// <param name="adapterName" type="String">The name of the adapter to be added. This matches the name used
        /// in the data-val-nnnn HTML attribute(where nnnn is the adapter name).</param>
        /// <param name="attribute" type="String">[Optional] The name of the HTML attribute that contains the value.
        /// The default is "val".</param>
        /// <param name="ruleName" type="String" optional="true">[Optional] The name of the jQuery Validate rule. If not provided, the value
        /// of adapterName will be used instead.</param>
        /// <returns type="jQuery.validator.unobtrusive.adapters" />
        return this.add(adapterName, [attribute || "val"], function (options) {
            setValidationValues(options, ruleName || adapterName, options.params[attribute]);
        });
    };

    $jQval.addMethod("__dummy__", function (value, element, params) {
        return true;
    });

    $jQval.addMethod("regex", function (value, element, params) {
        var match;
        if (this.optional(element)) {
            return true;
        }

        match = new RegExp(params).exec(value);
        return (match && (match.index === 0) && (match[0].length === value.length));
    });

    adapters.addSingleVal("accept", "exts").addSingleVal("regex", "pattern");
    adapters.addBool("creditcard").addBool("date").addBool("digits").addBool("email").addBool("number").addBool("url");
    adapters.addMinMax("length", "minlength", "maxlength", "rangelength").addMinMax("range", "min", "max", "range");
    adapters.add("equalto", ["other"], function (options) {
        var prefix = getModelPrefix(options.element.name),
            other = options.params.other,
            fullOtherName = appendModelPrefix(other, prefix),
            element = $(options.form).find(":input[name=" + fullOtherName + "]")[0];

        setValidationValues(options, "equalTo", element);
    });
    adapters.add("required", function (options) {
        // jQuery Validate equates "required" with "mandatory" for checkbox elements
        if (options.element.tagName.toUpperCase() !== "INPUT" || options.element.type.toUpperCase() !== "CHECKBOX") {
            setValidationValues(options, "required", true);
        }
    });
    adapters.add("remote", ["url", "type", "additionalfields"], function (options) {
        var value = {
            url: options.params.url,
            type: options.params.type || "GET",
            data: {}
        },
            prefix = getModelPrefix(options.element.name);

        $.each(splitAndTrim(options.params.additionalfields || options.element.name), function (i, fieldName) {
            var paramName = appendModelPrefix(fieldName, prefix);
            value.data[paramName] = function () {
                return $(options.form).find(":input[name='" + paramName + "']").val();
            };
        });

        setValidationValues(options, "remote", value);
    });

    $(function () {
        $jQval.unobtrusive.parse(document);
    });
}(jQuery));
// Additional methods in jquery.validate.methods.js

(function($){

	$.validator.unobtrusive.adapters.addBool('mandatory', 'required');

	$.validator.unobtrusive.adapters.add(
		'requiredif',
		['dependentupon'],
		function(options) {
	        options.rules['requiredif'] = {
	            dependentupon: options.params['dependentupon']
	        };
	        options.messages['requiredif'] = options.message;
		}
	);

	$.validator.unobtrusive.adapters.add(
		'requiredifvalue',
		['dependentupon', 'targetvalue'],
		function(options) {
	        options.rules['requiredif'] = {
	            dependentupon: options.params['dependentupon'],
	            targetvalue: options.params['targetvalue']
	        };
	        options.messages['requiredif'] = options.message;
		}
	);

	$.validator.unobtrusive.adapters.add(
		'atleast',
		['minimum'],
		function(options) {
	        options.rules['atleast'] = options.params['minimum'],
	        options.messages['atleast'] = options.message;
		}
	);

	$.validator.unobtrusive.adapters.addBool('phone');

	$.validator.unobtrusive.adapters.add(
		'multiemail',
		function(options) {
			options.rules['multiemail'] = {},
	        options.messages['multiemail'] = options.message;
		}
	);

	$.validator.unobtrusive.adapters.add(
		'datetimerange',
		function(options) {
			options.rules['datetimerange'] = {},
			options.messages['datetimerange'] = options.message;
		}
	);

	$.validator.unobtrusive.adapters.add(
		'time',
		function(options) {
			options.rules['time'] = {},
	        options.messages['time'] = options.message;
		}
	);

}(window.jQuery));
jQuery.fn.quickOuterWidth = function(includeMargin) {
	var elem = this.get(0),
		width = elem.offsetWidth;
	if (includeMargin && window.getComputedStyle) {
		var computedStyle = window.getComputedStyle(elem, null);
		width = width + (parseInt(computedStyle.getPropertyValue('margin-left'), 10) || 0) + (parseInt(computedStyle.getPropertyValue('margin-right'), 10) || 0);
	} else if (includeMargin) {
		width = width + (parseInt(elem.currentStyle["marginLeft"]) || 0) + (parseInt(elem.currentStyle["marginRight"]) || 0);
	}
	return width;
};
(function($) {

    $.fn.removeStyle = function(properties) {

        return this.each( function() {
        
        	if(properties) {
        		// turn properties into array
	        	var propertiesArray = properties.split(',');
	        	// remove each property
	        	for (var i = 0; i < propertiesArray.length; i++) {
	        		this.removeProperty( properties[i] );
				}
        	}else{
				this.removeAttribute('style');
			}
        });

    }

}(jQuery));
jQuery.fn.reverse = [].reverse;
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
		self.settings.urlParams = self.getUrlParams(window.location.search);
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
	lastComponent : {
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
	setGlobalObj: function() {
		var self = this;
		self.mq.globalObj = self;
		self.lastComponent.globalObj = self;
		self.resize.globalObj = self;
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
			// e.g self.myFunction();
		});
	},
	// reusable site resize function
	resize: {
		globalObj: null,
		resizeTimer: null,
		init: function() {
			var self = this;
			self.globalObj.settings.$window.on('resize.bbResize', function() {
				self.clearResizeTimer();
				self.resizeTimer = setTimeout(self.resizeFinished, 200);
			});
		},
		clearResizeTimer: function() {
			var self = this;
			if(self.resizeTimer) {
				clearTimeout(self.resizeTimer);
			}
		},
		resizeFinished: function() {
			var self = this;
			bb.lastComponent.startProcessing(true);
			bb.resize.clearResizeTimer();
		}
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
};
// jQuery onReady
$(bb.ready());