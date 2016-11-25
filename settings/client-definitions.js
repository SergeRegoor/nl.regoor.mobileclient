// Definition of list types
var _listDefinitions = [
	{
		type: 'buttons',
		formDefinition: 'button',
		addButton: 'Toevoegen',
		onGetItems: function(context) { return _appInfo.buttons; },
		columns: [
			{ buttonType: 'edit' },
			{ buttonType: 'delete' },
			{ buttonType: 'move' },
			{ property: 'title', fieldDefinition: 'mandatoryText', title: 'Knop tekst' },
			{ property: 'sectionId', fieldDefinition: 'stateControlSection', title: 'Sectie' },
			{ property: 'flowActionId', fieldDefinition: 'stateControlFlowAction', title: 'Flow actie' },
			{ property: 'delaySeconds', fieldDefinition: 'notNegativeInteger', title: 'Vertr' },
			{ property: 'stateIds', fieldDefinition: 'stateControlStateSelectionList', title: 'States' }
		],
		onDeleteObject: function(context, button) {
			if (!confirm('Weet je zeker dat je de knop "'+button.title+'" wilt verwijderen?')) return false;
			var indexOfObject = findIndexOfObjInArray(_appInfo.buttons, 'id', button.id);
			_appInfo.buttons.splice(indexOfObject, 1);
			saveSettings();
			return true;
		}
	},
	{
		type: 'labels',
		formDefinition: 'label',
		addButton: 'Toevoegen',
		onGetItems: function(context) { return _appInfo.labels; },
		columns: [
			{ buttonType: 'edit' },
			{ buttonType: 'delete' },
			{ buttonType: 'move' },
			{ property: 'title', fieldDefinition: 'mandatoryText', title: 'Label tekst' },
			{ property: 'sectionId', fieldDefinition: 'stateControlSection', title: 'Sectie' }
		],
		onDeleteObject: function(context, label) {
			if (!confirm('Weet je zeker dat je het label "'+label.title+'" wilt verwijderen?')) return false;
			var indexOfObject = findIndexOfObjInArray(_appInfo.labels, 'id', label.id);
			_appInfo.labels.splice(indexOfObject, 1);
			saveSettings();
			return true;
		}
	}
];




// Definition of form types
var _formDefinitions = [
	{
		type: 'button',
		title: 'Wijzig knop',
		fields: [
			{ property: 'title', fieldDefinition: 'mandatoryText', title: 'Knop tekst' },
			{ property: 'sectionId', fieldDefinition: 'stateControlSection', title: 'Sectie' },
			{ property: 'flowActionId', fieldDefinition: 'stateControlFlowAction', title: 'Voer flow actie uit' },
			{ property: 'delaySeconds', fieldDefinition: 'notNegativeInteger', title: 'Vertraging in seconden' },
			{ property: 'stateIds', fieldDefinition: 'stateControlStateSelectionList', title: 'Van toepassing op states' }
		],
		popupFormOptions: {
			popupHeight:350
		},
		onNewObject: function(context) { return { id:createGuid() }; },
		onShowForm: function(popupForm) {
			// Get the form edit controls
			var sectionDropDown = FieldController.getEditControlByProperty(popupForm, 'sectionId');
			var flowActionDropDown = FieldController.getEditControlByProperty(popupForm, 'flowActionId');
			var statesCheckBoxList = FieldController.getEditControlByProperty(popupForm, 'stateIds');
			
			// Function to execute to (re)set the edit control's values
			function setEditControls(){
				// Get the selected section
				var section = getStateControlSectionById(sectionDropDown.val());
				
				// Hide all flow action options, and show the ones which belong to the same group as the selected section
				flowActionDropDown.find('option').addClass('disabled');
				if (flowActionDropDown.find('option').eq(0).val().length == 0)
					flowActionDropDown.find('option').eq(0).removeClass('disabled');
				$.each(_appInfo.installedApps.stateControl.flowActions, function(i, flowAction){
					if (flowAction.groupId == section.groupId)
						flowActionDropDown.find('option[value="'+flowAction.id+'"]').removeClass('disabled');
				});
				
				// Hide all state check box items, and show the ones which belong to the same group as the selected section
				statesCheckBoxList.find('.checkBoxItem').hide();
				$.each(_appInfo.installedApps.stateControl.states, function(i, state){
					if (state.groupId == section.groupId)
						statesCheckBoxList.find('.checkBoxItem[rel-value="'+state.id+'"]').show();
				});
			}
			
			// Function to initialize flow action dropdown
			function setFlowActionValue() {
				var selectedValue = flowActionDropDown.val();
				if ((selectedValue != null) && (selectedValue.length > 0)) {
					if (flowActionDropDown.find('option[value="'+selectedValue+'"]').hasClass('disabled'))
						selectedValue = '';
				}
				flowActionDropDown.val(selectedValue);
			}
			
			// If the section selection changes, reset the edit controls
			sectionDropDown.change(function(){ setEditControls(); setFlowActionValue(); });
			
			// Set the edit controls initially
			sectionDropDown.trigger('change');
		},
		onSaveObject: function(popupForm, originalObject, updatedObject, isNewObject) {
			console.log('originalObject.id:'+originalObject.id);
			var indexOfObj = findIndexOfObjInArray(_appInfo.buttons, 'id', originalObject.id);
			if (indexOfObj < 0) {
				_appInfo.buttons[_appInfo.buttons.length] = originalObject;
				indexOfObj = _appInfo.buttons.length-1;
			}
			popupForm.saveFieldsToObject(popupForm.formDefinition, _appInfo.buttons[indexOfObj]);
			console.log(_appInfo.buttons[indexOfObj]);
			saveSettings();
			return true;
		}
	},
	{
		type: 'label',
		title: 'Wijzig label',
		fields: [
			{ property: 'title', fieldDefinition: 'mandatoryText', title: 'Label tekst' },
			{ property: 'sectionId', fieldDefinition: 'stateControlSection', title: 'Sectie' }
		],
		popupFormOptions: {
			popupHeight:200
		},
		onNewObject: function(context) { return { id:createGuid() }; },
		onSaveObject: function(popupForm, originalObject, updatedObject, isNewObject) {
			var indexOfObj = findIndexOfObjInArray(_appInfo.labels, 'id', originalObject.id);
			if (indexOfObj < 0) {
				_appInfo.labels[_appInfo.labels.length] = originalObject;
				indexOfObj = _appInfo.labels.length-1;
			}
			popupForm.saveFieldsToObject(popupForm.formDefinition, _appInfo.labels[indexOfObj]);
			saveSettings();
			return true;
		}
	}
];




// Definition of field types
var _fieldDefinitions = [
	{
		type: 'generic',
		editControlType: 'text'
	},
	{
		type: 'notNegativeInteger',
		editControlType: 'text',
		onValidateValue: function(field, value) { return (value != null) && isNotNegativeInteger(value.toString()) ? null : getLocalizedText(field.title)+' is geen geldig getal.'; }
	},
	{
		type: 'mandatoryText',
		editControlType: 'text',
		onValidateValue: function(field, value) { return (value != null) && (value.length > 0) ? null : getLocalizedText(field.title)+' is verplicht.'; }
	},
	{
		type: 'boolean',
		editControlType: 'checkbox'
	},
	{
		type: 'stateControlSection',
		editControlType: 'dropdown',
		onGetReadOnlyValue: function(object, property) { return getProperty(getStateControlSectionById(object[property]), 'description', ''); },
		onGetSelectionValues: function(object, property) {
			var values = [];
			$.each(_appInfo.installedApps.stateControl.sections, function(i, item){
				values[values.length] = { value:item.id, text:item.description };
			});
			return values;
		}
	},
	{
		type: 'stateControlFlowAction',
		editControlType: 'dropdown',
		onGetReadOnlyValue: function(object, property) { return getProperty(getStateControlFlowActionById(object[property]), 'description', ''); },
		onGetSelectionValues: function(object, property) {
			var values = [];
			values[values.length] = {};
			$.each(_appInfo.installedApps.stateControl.flowActions, function(i, item){
				values[values.length] = { value:item.id, text:item.description };
			});
			return values;
		}
	},
	{
		type: 'stateControlStateSelectionList',
		editControlType: 'checkboxlist',
		onGetReadOnlyValue: function(object, property) {
			var descriptions = '';
			if ((object[property] != null) && (object[property].length > 0))
				$.each(object[property], function(i, stateId){
					var state = getStateControlStateById(stateId);
					if (state != null)
						descriptions += (descriptions.length > 0 ? ', ' : '') + getProperty(state, 'description', '');
				});
			return descriptions;
		},
		onGetSelectionValues: function(object, property) {
			var values = [];
			$.each(_appInfo.installedApps.stateControl.states, function(i, item){
				var containsState = false;
				if ((object != null) && (property != null) && (object[property] != null) && (object[property].length > 0)) {
					$.each(object[property], function(j, itm){
						if (itm == item.id)
							containsState = true;
					});
				}
				values[values.length] = { value:item.id, text:item.description, object:item, isSelected:containsState };
			});
			return values;
		}
	}
];

// Definition of list buttons
var _listButtonDefinitions = [
	{
		type: 'edit',
		cssClass: 'editButton',
		onClick: function(list, object) {
			var formDefinition = FormController.getFormDefinition(list.listDefinition.formDefinition);
			var popupForm = new PopupForm(formDefinition, object, false);
			popupForm.show(function(){
				list.render();
			});
		}
	},
	{
		type: 'delete',
		cssClass: 'deleteButton',
		onClick: function(list, object) {
			if (list.deleteObject(object))
				list.render();
		}
	},
	{
		type: 'move',
		cssClass: 'moveButton'
	}
];