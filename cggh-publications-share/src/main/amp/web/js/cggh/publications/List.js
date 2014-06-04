define([ "dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin",
		"dojo/dom", "dojo/dom-construct", 
		"dojo/store/JsonRest","dojox/grid/DataGrid", "dojo/data/ObjectStore",
		"dojo/text!./List.html", "alfresco/core/Core" ], function(declare,
		_Widget, _Templated, dom, domConstruct, JsonRest, DataGrid, ObjectStore, template, Core) {
	return declare([ _Widget, _Templated, Core ], {
		cssRequirements : [ {
			cssFile : "./List.css",
			mediaType : "screen"
		},
		{
			cssFile : "/js/lib/dojo-1.9.0/dojox/grid/resources/claroGrid.css",
			mediaType : "screen"
		}],
		i18nScope : "PublicationsList",
		i18nRequirements : [ {
			i18nFile : "./List.properties"
		} ],
		templateString : template,
		buildRendering : function cggh_publications_List__buildRendering() {
			this.greeting = this.message("greeting.label");
			this.inherited(arguments);
		},
		postCreate : function cggh_publications_List_postCreate() {
			try {

				/*
				var button = domConstruct.create("button", {
					innerHTML : "push me"
				}, this.cggh_pub_table);
				*/

				var objectStore = new JsonRest({
					target : "/share/proxy/alfresco/cggh/publications",
					idProperty : "nodeRef"
				});

				//Need to convert from the new to the old
				var dataStore = ObjectStore({objectStore: objectStore});

				/*
				dataStore.comparatorMap = {};

				dataStore.comparatorMap["IncTotalValue"] = function(a, b) {
					a = parseFloat(a);
					b = parseFloat(b);
					return (a - b);
				};
*/
				var grid = new DataGrid({
					store : dataStore,
					structure : [ {
						name : "name",
						field : "name",
						width : "150px"
					}, {
						name : "title",
						field : "title"
					}, {
						name : "publicationStatus",
						field : "publicationStatus"
					} ]
				}, this.cggh_pub_table);
				grid.startup();

				this.inherited(arguments);
			} catch (err) {
				console.log(err);
			}

		}
	});
});