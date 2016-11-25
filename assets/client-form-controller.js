var FormController = FormController || {};

FormController.getFormDefinition = function(formDefinitionName) {
	return findObjInArray(_formDefinitions, 'type', formDefinitionName);
};

var PopupForm = function(formDefinition, object, isNewObject) {
	this.formDefinition = formDefinition;
	this.object = object;
	this.isNewObject = isNewObject;
	this.popupContainer = null;
	this.saveCallback = null;
	this.options = $.extend({
		nestedLevel: 0,
		popupWidth: 600,
		popupHeight: 500
	}, formDefinition.popupFormOptions);
}

PopupForm.prototype.show = function(saveCallback) {
	var popupForm = this;
	popupForm.saveCallback = saveCallback;
	if ((popupForm.formDefinition.onCanShowForm != null) && !popupForm.formDefinition.onCanShowForm(popupForm.object, popupForm.isNewObject)) return;
	
	var popupContainer = loadPopup(createGuid(), null, popupForm.options.nestedLevel+1000, 100, popupForm.options.popupWidth, popupForm.options.popupHeight);
	this.popupContainer = popupContainer;
	this.renderTitle(popupContainer);
	this.renderForm(popupContainer);
	this.renderButtons(popupContainer);
	
	if (popupForm.formDefinition.onShowForm != null)
		popupForm.formDefinition.onShowForm(popupForm);
	return popupForm;
};

PopupForm.prototype.renderTitle = function(placeHolder) {
	var titleObj = $('<h2/>').text(getLocalizedText(this.formDefinition.title));
	placeHolder.append(titleObj);
	return titleObj;
};

PopupForm.prototype.renderForm = function(placeHolder) {
	var popupForm = this;
	var formContainer = $('<div/>').addClass('fieldContainer').addClass(popupForm.formDefinition.type+'Form');
	$.each(popupForm.formDefinition.fields, function(i, field){ popupForm.renderField(field, formContainer); });
	placeHolder.append(formContainer);
	return formContainer;
};

PopupForm.prototype.renderField = function(field, placeHolder) {
	var popupForm = this;
	var fieldContainer = $('<div/>').addClass('popupFormField').addClass(field.property+'Field').data('field', field);
	
	var fieldLabel = $('<label/>').text(getLocalizedText(field.title));
	fieldContainer.append(fieldLabel);
	
	var tooltipText = getLocalizedText(field.tooltip);
	if ((tooltipText != null) && (tooltipText.length > 0)) {
		var tooltipContainer = $('<div/>').addClass('tooltip');
		tooltipContainer.append($('<div/>').addClass('icon').text('i'));
		tooltipContainer.append($('<div/>').addClass('content').text(tooltipText));
		fieldContainer.append(tooltipContainer);
	}
	
	var editControlContainer = $('<div/>').addClass('editControlContainer');
	var fieldDefinition = FieldController.getFieldDefinition(field.fieldDefinition);
	var editControl = FieldController.renderEditControl(fieldDefinition, popupForm.object, field.property, editControlContainer);
	fieldContainer.append(editControlContainer);
	
	if ((editControl != null) && (editControl.attr('id') != null) && (editControl.attr('id').length > 0))
		fieldLabel.attr('for', editControl.attr('id'));
	
	placeHolder.append(fieldContainer);
	return fieldContainer;
};

PopupForm.prototype.renderButtons = function(placeHolder) {
	var popupForm = this;
	var bottomBar = $('<div/>').addClass('bottomButtonBar');
	bottomBar.append($('<button/>').addClass('floatRight').text('Bewaren').click(function(e) {
		e.preventDefault();
		
		var errorMessages = [];
		if (popupForm.formDefinition.onSaveObject == null)
			errorMessages[errorMessages.length] = 'Cannot save object, no OnSaveObject method is declared for this form.';
		$.each(popupForm.formDefinition.fields, function(i, field){
			var fieldDefinition = FieldController.getFieldDefinition(field.fieldDefinition);
			if ((fieldDefinition != null) && (fieldDefinition.onValidateValue != null)) {
				var editControl = FieldController.getEditControlByProperty(popupForm, field.property);
				var fieldValue = FieldController.getValueFromEditControl(fieldDefinition, editControl);
				
				var errorMessage = fieldDefinition.onValidateValue(field, fieldValue);
				if ((errorMessage != null) && (errorMessage.length > 0))
					errorMessages[errorMessages.length] = errorMessage;
			}
		});
		if (errorMessages.length > 0) {
			showErrorMessages(errorMessages);
			return;
		}
		
		var updatedObject = {};
		popupForm.saveFieldsToObject(popupForm.formDefinition, updatedObject);
		if (popupForm.formDefinition.onSaveObject(popupForm, popupForm.object, updatedObject, popupForm.isNewObject)) {
			placeHolder.closePopup();
			if (popupForm.saveCallback != null)
				popupForm.saveCallback();
		}
	}));
	bottomBar.append($('<button/>').addClass('floatRight').text('Annuleer').click(function(e) {
		e.preventDefault();
		placeHolder.closePopup();
	}));
	placeHolder.append(bottomBar);
	return bottomBar;
};

PopupForm.prototype.saveFieldsToObject = function(formDefinition, destinationObject) {
	var popupForm = this;
	$.each(popupForm.formDefinition.fields, function(i, field){
		var fieldDefinition = FieldController.getFieldDefinition(field.fieldDefinition);
		var editControl = FieldController.getEditControlByProperty(popupForm, field.property);
		var fieldValue = FieldController.getValueFromEditControl(fieldDefinition, editControl);
		
		destinationObject[field.property] = fieldValue;
	});
};