var ListController = ListController || {};

ListController.getListDefinition = function(listDefinitionName) {
	return findObjInArray(_listDefinitions, 'type', listDefinitionName);
};

// Constructor of List
var List = function(context, listDefinition, placeHolder) {
	this.context = context;
	this.listDefinition = listDefinition;
	this.placeHolder = placeHolder;
}

// Render the list to HTML using jQuery
List.prototype.render = function() {
	var list = this;
	
	// Retrieve the source items for the list
	var sourceItems = null;
	if (this.listDefinition.onGetItems != null)
		sourceItems = this.listDefinition.onGetItems(this.context);
	if (sourceItems == null)
		sourceItems = [];
	
	// Clear list's placeholder
	this.placeHolder.empty();
	
	// Render the list
	if (sourceItems.length > 0) {
		this.renderHeader(this.placeHolder);
		var listContainer = this.renderContainer(this.placeHolder);
		$.each(sourceItems, function(i, object){ list.renderRow(listContainer, object); });
	}
	
	// Render add button
	this.renderAddButton(this.placeHolder);
	return this;
};

// Delete an object from the list
List.prototype.deleteObject = function(object) {
	if (object == null) return false;
	if (this.listDefinition.onDeleteObject == null) return false;
	return this.listDefinition.onDeleteObject(this.context, object);
};

// Render the header and its columns
List.prototype.renderHeader = function(placeHolder) {
	var headerRow = $('<div/>').addClass('listHeader listColumns').addClass(this.listDefinition.type);
	$.each(this.listDefinition.columns, function(i, column){
		headerRow.append($('<div/>').addClass('cell').applyText(column.title));
	});
	placeHolder.append(headerRow);
	return headerRow;
};

// Render the container which will contain the rows
List.prototype.renderContainer = function(placeHolder) {
	var listContainer = $('<div/>').addClass('list listColumns').addClass(this.listDefinition.type);
	placeHolder.append(listContainer);
	return listContainer;
};

// Render a row
List.prototype.renderRow = function(placeHolder, object) {
	var list = this;
	var row = $('<div/>').addClass('row').data('object', object);
	$.each(this.listDefinition.columns, function(i, column){
		// Render a cell
		var cell = $('<div/>').addClass('cell');
		if (column.buttonType != null) {
			// Render a button based on its definition
			var listButtonDefinition = findObjInArray(_listButtonDefinitions, 'type', column.buttonType);
			var button = $('<button/>').addClass(listButtonDefinition.cssClass).data('object', object);
			if (listButtonDefinition.onClick != null)
				button.click(function(e){
					e.preventDefault();
					listButtonDefinition.onClick(list, $(this).data('object'));
				});
			cell.append(button);
		} else // Use the FieldController to render the cell's contents
			FieldController.renderReadOnly(FieldController.getFieldDefinition(column.fieldDefinition), object, column.property, cell);
		row.append(cell);
	});
	placeHolder.append(row);
	return row;
};

// Render the add button
List.prototype.renderAddButton = function(placeHolder) {
	var list = this;
	if (list.listDefinition.addButton == null) return;
	var addButton = $('<button/>').addClass('addButton').applyText(list.listDefinition.addButton);
	addButton.click(function(e){
		e.preventDefault();
		var formDefinition = FormController.getFormDefinition(list.listDefinition.formDefinition);
		var newObject = null;
		if (formDefinition.onNewObject != null)
			newObject = formDefinition.onNewObject(list.context);
		if (newObject == null)
			newObject = {};
		var popupForm = new PopupForm(formDefinition, newObject, true);
		popupForm.show(function(){
			list.render();
		});
	});
	placeHolder.append(addButton);
};