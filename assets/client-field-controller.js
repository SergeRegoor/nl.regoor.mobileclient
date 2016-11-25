var FieldController = FieldController || {};

// Search for a field type within the definitions in client-field-definitions.js
FieldController.getFieldDefinition = function(fieldDefinitionName) {
	return findObjInArray(_fieldDefinitions, 'type', fieldDefinitionName);
};

// Render the read-only value of an object's property, based on the field type definition
FieldController.renderReadOnly = function(fieldDefinition, object, property, placeHolder) {
	if (fieldDefinition.onRenderReadOnly != null) // First priority, render the read-only value manually if the field desires to
		fieldDefinition.onRenderReadOnly(object, property, placeHolder);
	else if (fieldDefinition.onGetReadOnlyValue != null) // Second priority, get the read-only value manually and render it
		placeHolder.append($('<span/>').text(fieldDefinition.onGetReadOnlyValue(object, property)));
	else // If no custom rendering or custom value is needed, simply render the read-only value to the place holder
		placeHolder.append($('<span/>').text(object[property]));
};

// Render the editable control of an object's property
FieldController.renderEditControl = function(fieldDefinition, object, property, placeHolder) {
	var editControl = null;
	var editControlId = 'fieldFor' + property;
	if (fieldDefinition.editControlType == 'dropdown')
		editControl = FieldController.renderDropDown(fieldDefinition, object, property, editControlId, placeHolder);
	else if (fieldDefinition.editControlType == 'checkboxlist')
		editControl = FieldController.renderCheckBoxList(fieldDefinition, object, property, editControlId, placeHolder);
	else if (fieldDefinition.editControlType == 'checkbox')
		editControl = FieldController.renderCheckBox(fieldDefinition, object, property, editControlId, placeHolder);
	else
		editControl = FieldController.renderTextBox(fieldDefinition, object, property, editControlId, placeHolder);
	if (editControl != null) {
		editControl.attr('id', editControlId);
		placeHolder.append(editControl);
	}
	return editControl;
};

// Render a text box
FieldController.renderTextBox = function(fieldDefinition, object, property, editControlId, placeHolder) {
	var textBox = $('<input/>').attr('type', 'text').val(object[property]);
	return textBox;
};

// Render a drop down
FieldController.renderDropDown = function(fieldDefinition, object, property, editControlId, placeHolder) {
	var dropDown = $('<select/>');
	if (fieldDefinition.onGetSelectionValues != null) {
		var selectionValues = fieldDefinition.onGetSelectionValues();
		$.each(selectionValues, function(i, item) {
			var option = $('<option/>');
			if ((item != null) && (item.text != null))
				option.text(item.text);
			if ((item != null) && (item.value != null)) {
				option.val(item.value);
				if (item.value == object[property])
					option.attr('selected', 'selected');
			}
			dropDown.append(option);
		});
	}
	return dropDown;
};

// Render a checkbox list
FieldController.renderCheckBoxList = function(fieldDefinition, object, property, editControlId, placeHolder) {
	var checkBoxListContainer = $('<div/>').addClass('checkBoxList');
	if (fieldDefinition.onGetSelectionValues != null) {
		var selectionValues = fieldDefinition.onGetSelectionValues(object, property);
		$.each(selectionValues, function(i, item) {
			var checkBoxContainer = $('<div/>').addClass('checkBoxItem');
			var checkBox = $('<input/>').attr('type', 'checkbox').attr('id', editControlId+'CheckBox'+i);
			var label = $('<label/>').attr('for', editControlId+'CheckBox'+i);
			checkBoxContainer.append(checkBox);
			checkBoxContainer.append(label);
	
			if ((item != null) && (item.text != null))
				label.text(item.text);
			if ((item != null) && (item.value != null)) {
				checkBox.val(item.value);
				checkBoxContainer.attr('rel-value', item.value);
				if ((item.isSelected != null) && item.isSelected)
					checkBox.attr('checked', 'checked');
			}
			if ((item != null) && (item.object != null))
				checkBox.data('object', item.object);
			checkBoxListContainer.append(checkBoxContainer);
		});
		checkBoxListContainer.append($('<br/>').addClass('clear'));
	}
	return checkBoxListContainer;
};

// Render a checkbox
FieldController.renderCheckBox = function(fieldDefinition, object, property, editControlId, placeHolder) {
	var checkBox = $('<input/>').attr('type', 'checkbox').attr('id', editControlId+'CheckBox');
	if (object[property])
		checkBox.attr('checked', 'checked');
	return checkBox;
};

// Get an edit control based on the field's property
FieldController.getEditControlByProperty = function(popupForm, property) {
	return popupForm.popupContainer.find('#fieldFor'+property);
};

// Get value from edit control
FieldController.getValueFromEditControl = function(fieldDefinition, editControl) {
	if (fieldDefinition.editControlType == 'dropdown')
		return editControl.val();
	else if (fieldDefinition.editControlType == 'checkboxlist') {
		var resultArray = [];
		editControl.find('input[type="checkbox"]:visible:checked').each(function(){
			resultArray[resultArray.length] = $(this).val();
		});
		return resultArray;
	} else if (fieldDefinition.editControlType == 'checkbox')
		return editControl.is(':checked');
	else
		return editControl.val();
};