   if (typeof Cggh == "undefined" || !Cggh)
   {
     var Cggh = {};
     Cggh.documentLibrary = {};
   }



(function()
{
   var $html = Alfresco.util.encodeHTML,
      $isValueSet = Alfresco.util.isValueSet;

   Cggh.documentLibrary.Collaborations = function Cggh_documentLibrary_Collaborations_constructor(htmlId)
   {
	      Cggh.documentLibrary.Collaborations.superclass.constructor.call(this, "Cggh.documentLibrary.Collaborations", htmlId, []);

	      /**
	       * Register this component
	       */
	      Alfresco.util.ComponentManager.register(this);
	      this.collaborations = [];

	      return this;
	   };

	   YAHOO.extend(Cggh.documentLibrary.Collaborations, Alfresco.component.Base,
	   {
		     /**
		       * Fired by YUI when parent element is available for scripting
		       * @method onReady
		       */
		      onReady: function Collaborations_onReady()
		      {
		    	  // Load collaborations & preferences
		          this.loadCollaborations();
		       },
		       loadCollaborations: function Collaborations_loadCollaborations()
		       {
		          // Load collaborations
		          Alfresco.util.Ajax.request(
		          {
		             //url: Alfresco.constants.PROXY_URI + "api/people/" + encodeURIComponent(Alfresco.constants.USERNAME) + "/sites?roles=user&size=" + this.options.listSize,
		         	 url: Alfresco.constants.PROXY_URI +  "cggh/collaborations",
		             successCallback:
		             {
		                fn: this.onCollaborationsLoaded,
		                scope: this
		             }
		          });
		       },
		       onCollaborationsLoaded: function Collaborations_onCollaborationsLoaded(p_response)
		       {
		    	   this.collaborations = p_response.json.collaborationNodes;  
		       },
		       renderLiaison: function liaison_renderer(record, label)
		       {
		           var jsNode = record.jsNode,
		              properties = jsNode.properties,
		              id = Alfresco.util.generateDomId(),
		              content = "";
		           
		           var nodeName = properties['cm:name'];
		           var collabs = Cggh.documentLibrary.Collaborations.prototype.collaborations;
		           for (i = 0, numItems = collabs.length; i < numItems; i++)
		    	   {
		    			var collab = collabs[i];
		    			if (collab.name === nodeName)
		    			{
		    				if (collab.liaison)
		    				{
			    			    content = collab.liaison.firstName + ' ' + collab.liaison.lastName;
		    				}	
		    			}
		    	   }
		           return '<span id="' + id + '" class="item">' + label + content + '</span>';
		        }
	});
	   
   if (Alfresco.DocumentList)
   {
	   //Typically this would be done in the ftl for the page
	  new Cggh.documentLibrary.Collaborations(Alfresco.util.generateDomId()).setMessages(Alfresco.messages);
	  Cggh.documentLibrary.Collaborations.prototype.onReady();
	  
      YAHOO.Bubbling.fire("registerRenderer",
      {
         propertyName: "cggh_liaison",
         renderer: Cggh.documentLibrary.Collaborations.prototype.renderLiaison
      });
     
   }
})();