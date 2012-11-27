   if (typeof Cggh == "undefined" || !Cggh)
   {
     var Cggh = {};
     Cggh.documentLibrary = {};
   }



(function()
{
	 if (Alfresco.DocumentList)
	 {
		 var $html = Alfresco.util.encodeHTML, $isValueSet = Alfresco.util.isValueSet;

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
		       getCollaboration: function Collaborations_getCollaboration (nodeName)
		       {
		    	   var collabs = this.collaborations;
		    	   var collab;
		           for (i = 0, numItems = collabs.length; i < numItems; i++)
		    	   {
		    			collab = collabs[i];
		    			if (collab.name === nodeName)
		    			{
		    				break;
		    			}
		    	   }
		           return collab;
		       }
		       
	});
	   
  
	   //Typically this would be done in the ftl for the page
	  new Cggh.documentLibrary.Collaborations(Alfresco.util.generateDomId()).setMessages(Alfresco.messages);
	  Cggh.documentLibrary.Collaborations.prototype.onReady();
	  
	  //This doesn't work as part of Cggh.documentLibrary.Collaborations
	  var renderLiaison = function cggh_renderLiaison(record, label)
      {
          var jsNode = record.jsNode,
             properties = jsNode.properties,
             id = Alfresco.util.generateDomId(),
             content = "";
          
          var nodeName = properties['cm:name'];
          var collab = Cggh.documentLibrary.Collaborations.prototype.getCollaboration(nodeName);
          if (collab.liaison)
          {
       	   content = collab.liaison.firstName + ' ' + collab.liaison.lastName;
          }
          return '<span id="' + id + '" class="item">' + label + content + '</span>';
       }
      YAHOO.Bubbling.fire("registerRenderer",
      {
         propertyName: "cggh_liaison",
         renderer: renderLiaison
      });
     
      var renderContacts = function cggh_renderContacts(record, label)
      {
          var jsNode = record.jsNode,
             properties = jsNode.properties,
             id = Alfresco.util.generateDomId(),
             content = "";
          
          var nodeValues = properties['cggh_contacts'];
          
          if (nodeValues)
          {
       	   content = nodeValues.join(', ');
          }
          return '<span id="' + id + '" class="item">' + label + content + '</span>';
       }
      YAHOO.Bubbling.fire("registerRenderer",
      {
         propertyName: "cggh_contacts",
         renderer: renderContacts
      });
      
      var renderCountries = function cggh_renderCountries(record, label)
      {
          var jsNode = record.jsNode,
             properties = jsNode.properties,
             id = Alfresco.util.generateDomId(),
             content = "";
          
          var nodeValues = properties['cggh_sampleCountry'];
          
          if (nodeValues)
          {
       	   content = nodeValues.join(', ');
          }
          return '<span id="' + id + '" class="item">' + label + content + '</span>';
       }
      YAHOO.Bubbling.fire("registerRenderer",
      {
         propertyName: "cggh_sampleCountry",
         renderer: renderCountries
      });
      
      
      var renderSpecies = function cggh_renderSpecies(record, label)
      {
          var jsNode = record.jsNode,
             properties = jsNode.properties,
             id = Alfresco.util.generateDomId(),
             content = "";
          
          var nodeValues = properties['cggh_species'];
          
          if (nodeValues)
          {
       	   content = nodeValues.join(', ');
          }
          return '<span id="' + id + '" class="item">' + label + content + '</span>';
       }
      YAHOO.Bubbling.fire("registerRenderer",
      {
         propertyName: "cggh_species",
         renderer: renderSpecies
      });
   }
})();