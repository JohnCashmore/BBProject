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
	
		if(minimum){
			minimum = parseInt(minimum); // -1 to 0 base int
		}else{
			minimum = 0;
		}
		
		var $element = $(element),
			$elements = null,
			elementsName = $element.attr('name');
	
		if (elementsName) {
	        $elements = $('input[name=' + elementsName + ']');
	    } else {
	    	return false;
	    }
	    
    	if( $elements.filter(':checked').length >= minimum ){
			return true;
		} else {
			return false;
		}
	});
	
	$.validator.addMethod("multiemail", function (value, element) {
	
	    if (this.optional(element)) {
	        return true;
	    }
	
	    var emails = value.split(','),
	        valid = true;
	
	    for (var i = 0, limit = emails.length; i < limit; i++) {
	        value =$.trim(emails[i]);
	        valid = valid && $.validator.methods.email.call(this, value, element);
	    }
	
	    return valid;
	}, "Invalid email format: please use a comma to separate multiple email addresses.");

}(window.jQuery));