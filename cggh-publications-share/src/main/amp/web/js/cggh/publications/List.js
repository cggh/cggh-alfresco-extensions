define(["dojo/_base/declare",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dojo/text!./List.html",
        "alfresco/core/Core"], function(declare, _Widget, _Templated, template, Core) {
   return declare([_Widget, _Templated, Core], {
      cssRequirements: [{cssFile:"./List.css",mediaType:"screen"}],
      i18nScope: "PublicationsList",
      i18nRequirements: [{i18nFile: "./List.properties"}],
      templateString: template,
      buildRendering: function cggh_publications_List__buildRendering() {
         this.greeting = this.message("greeting.label");
         this.inherited(arguments);
      }
   });
});