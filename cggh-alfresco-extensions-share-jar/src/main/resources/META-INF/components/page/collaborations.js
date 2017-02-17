/**
 * Copyright (C) 2005-2010 Alfresco Software Limited.
 *
 * This file is part of Alfresco
 *
 * Alfresco is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Alfresco is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Alfresco. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Dashboard Collaborations component.
 *
 * @namespace Cggh.dashlet
 * @class Cggh.dashlet.Collaborations
 */
   if (typeof Cggh == "undefined" || !Cggh)
   {
     var Cggh = {};
     Cggh.dashlet = {};
   }

(function()
{
   /**
    * YUI Library aliases
    */
   var Dom = YAHOO.util.Dom,
      Event = YAHOO.util.Event,
      Selector = YAHOO.util.Selector,
      $msg = Alfresco.util.message;

   /**
    * Alfresco Slingshot aliases
    */
   var $html = Alfresco.util.encodeHTML,
      $links = Alfresco.util.activateLinks;

   /**
    * Use the getDomId function to get some unique names for global event handling
    */
   var FAV_EVENTCLASS = Alfresco.util.generateDomId(null, "fav-collaboration"),
      IMAP_EVENTCLASS = Alfresco.util.generateDomId(null, "imap-collaboration");

   /**
    * Preferences
    */
   var PREFERENCES_COLLABORATIONS = "org.cggh.share.collaborations",
      PREFERENCES_COLLABORATIONS_DASHLET_FILTER_FAV = PREFERENCES_COLLABORATIONS + ".dashlet.filter.fav",
      PREFERENCES_COLLABORATIONS_DASHLET_FILTER_STATUS = PREFERENCES_COLLABORATIONS + ".dashlet.filter.sstatus",
      PREFERENCES_COLLABORATIONS_DASHLET_FILTER_ENQUIRY = PREFERENCES_COLLABORATIONS + ".dashlet.filter.estatus",
      PREFERENCES_COLLABORATIONS_DASHLET_FILTER_SPECIES = PREFERENCES_COLLABORATIONS + ".dashlet.filter.species",
      PREFERENCES_COLLABORATIONS_DASHLET_FILTER_RAG = PREFERENCES_COLLABORATIONS + ".dashlet.filter.rstatus";

   var FAVOURITE_COLLABORATIONS = PREFERENCES_COLLABORATIONS + ".favourites";
   var IMAP_FAVOURITE_COLLABORATIONS = PREFERENCES_COLLABORATIONS + ".imapFavourites";
  
   /**
    * Dashboard Collaborations constructor.
    *
    * @param {String} htmlId The HTML id of the parent element
    * @return {Cggh.dashlet.Collaborations} The new component instance
    * @constructor
    */
   Cggh.dashlet.Collaborations = function Collaborations_constructor(htmlId)
   {
      Cggh.dashlet.Collaborations.superclass.constructor.call(this, "Cggh.dashlet.Collaborations", htmlId, ["datasource", "datatable", "animation"]);

      /**
       * Register this component
       */
      Alfresco.util.ComponentManager.register(this);
      /**
       * Load YUI Components
       */
      Alfresco.util.YUILoaderHelper.require(["button", "container",
        "datasource", "datatable", "paginator", "json", "history",
        "tabview"], this.onComponentsLoaded, this);

      // Initialise prototype properties
      this.collaborations = [];

      // Services
      this.services.preferences = new Alfresco.service.Preferences();

      return this;
   };

   YAHOO.extend(Cggh.dashlet.Collaborations, Alfresco.component.Base,
   {
      /**
       * Collaboration data
       *
       * @property collaborations
       * @type array
       */
      collaborations: null,

      /**
       * Object container for initialization options
       *
       * @property options
       * @type object
       */
      options:
      {
         /**
          * List of valid filters
          *
          * @property validFilters
          * @type object
          */
         validFilters:
         {
            "all": true,
            "favs": true
         },
          
         /**
          * Flag if IMAP server is enabled
          *
          * @property imapEnabled
          * @type boolean
          * @default false
          */
         imapEnabled: true,
         
         /**
          * Result list size maximum
          *
          * @property listSize
          * @type integer
          * @default 100
          */
         listSize: 10
      },

      /**
       * Fired by YUI when parent element is available for scripting
       * @method onReady
       */
      onReady: function Collaborations_onReady()
      {
         var me = this;

         if (! this.widgets.type) {
         // Create Dropdown filter
         this.widgets.type = Alfresco.util.createYUIButton(this, "type", this.onTypeFilterChanged,
         {
            type: "menu",
            menu: "type-menu",
            lazyloadmenu: false
         });

         this.widgets.status = Alfresco.util.createYUIButton(this, "status", this.onStatusFilterChanged,
         {
            type: "menu",
            menu: "status-menu",
            lazyloadmenu: false
         });

         this.widgets.enquiry = Alfresco.util.createYUIButton(this, "enquiry", this.onEnquiryFilterChanged,
                 {
                    type: "menu",
                    menu: "enquiry-menu",
                    lazyloadmenu: false
                 });

         this.widgets.species = Alfresco.util.createYUIButton(this, "species", this.onSpeciesFilterChanged,
                 {
                    type: "menu",
                    menu: "species-menu",
                    lazyloadmenu: false
                 });
         this.widgets.rag = Alfresco.util.createYUIButton(this, "rag", this.onRagFilterChanged,
                 {
                    type: "menu",
                    menu: "rag-menu",
                    lazyloadmenu: false
                 });
         }      
         // DataSource definition
         this.widgets.dataSource = new YAHOO.util.DataSource(this.collaborations,
         {
            responseType: YAHOO.util.DataSource.TYPE_JSARRAY
         });

         // DataTable column defintions
         var columnDefinitions =
         [
            { key: "name", label: this.msg("cggh.label.name"), resizeable: true, sortable: true, formatter: this.bind(this.renderCellName) },
            { key: "species", label: this.msg("cggh.metadata.species"), resizeable: true, sortable: false, formatter: this.bind(this.renderCellSpecies) },
            { key: "title", label: this.msg("cggh.label.title"), resizeable: true, sortable: false, formatter: this.bind(this.renderCellTitle) },
            { key: "projStatus", label: this.msg("cggh.metadata.collaborationStatus"), resizeable: true, sortable: true, sortOptions:{sortFunction:this.sortCollaborationStatus}, formatter: this.bind(this.renderCellProjectStatus) },
            { key: "enqStatus", label: this.msg("cggh.metadata.enquiryStatus"), resizeable: true, sortable: true, sortOptions:{sortFunction:this.sortEnquiryStatus},formatter: this.bind(this.renderCellEnquiryStatus) },
            { key: "notes", label: this.msg("cggh.metadata.notes"), resizeable: true, sortable: false, formatter: this.bind(this.renderCellNotes) },
            { key: "ragStatus", label: this.msg("cggh.metadata.ragStatus"), resizeable: true, sortable: true, formatter: this.bind(this.renderCellRagStatus) },
            { key: "nextReview", label: this.msg("cggh.metadata.nextReview"), resizeable: true, sortable: true, sortOptions:{sortFunction:this.sortReview},formatter: this.bind(this.renderCellReview) },
            { key: "liaision", label: this.msg("cggh.metadata.liaison"), resizeable: true, sortable: true, sortOptions:{sortFunction:this.sortLiaison},formatter: this.bind(this.renderCellLiaison) },
            { key: "mainContact", label: this.msg("cggh.metadata.pi"), resizeable: true, sortable: true, sortOptions:{sortFunction:this.sortPI},formatter: this.bind(this.renderCellPI) },
            { key: "numSamples", label: this.msg("cggh.metadata.samplesExpected"), resizeable: true, sortable: false, formatter: this.bind(this.renderCellSamplesExpected) },
            { key: "samplesProcessed", label: this.msg("cggh.metadata.samplesProcessed"), resizeable: true, sortable: false, formatter: this.bind(this.renderCellSamplesProcessed) },
            { key: "samplesProcessed", label: this.msg("cggh.metadata.samplesSequenced"), resizeable: true, sortable: false, formatter: this.bind(this.renderCellSamplesSequenced) },
            { key: "firstSample", label: this.msg("cggh.metadata.firstSample"), resizeable: true, sortable: true, sortOptions:{sortFunction:this.sortFirstSampleExpected},formatter: this.bind(this.renderCellFirstSampleExpected) },
            { key: "lastSample", label: this.msg("cggh.metadata.lastSample"), resizeable: true, sortable: true, sortOptions:{sortFunction:this.sortLastSampleExpected},formatter: this.bind(this.renderCellLastSampleExpected) },
            { key: "collaborationDoc", label: this.msg("cggh.metadata.collabDoc"), resizeable: true, sortable: false, formatter: this.bind(this.renderCellCollaborationDoc) },
            { key: "projectsdl", label: this.msg("cggh.metadata.projects"), resizeable: true, sortable: false, formatter: this.bind(this.renderCellProjects) },
            /*
            { key: "detail", label: this.msg("cggh.label.description"), sortable: false, formatter: this.bind(this.renderCellDetail) },
            { key: "intDescrip", label: this.msg("cggh.metadata.intDescrip"), sortable: false, formatter: this.bind(this.renderCellIntDescrip) },
            { key: "strategicNature", label: this.msg("cggh.metadata.strategicNature"), sortable: false, formatter: this.bind(this.renderCellStrategicNature) },
            { key: "contacts", label: this.msg("cggh.metadata.contacts"), sortable: true, sortOptions:{sortFunction:this.sortContacts},formatter: this.bind(this.renderCellContact) },
            { key: "country", label: this.msg("cggh.metadata.sampleCountry"), sortable: false, formatter: this.bind(this.renderCellCountries), width: 100 },
            */
            ];
      
         // DataTable definition
         this.widgets.dataTable = new YAHOO.widget.ScrollingDataTable(this.id + "-collaborations", columnDefinitions, this.widgets.dataSource,
         {
            MSG_EMPTY: this.msg("message.datatable.loading"),
            draggableColumns: true,
            paginator: YAHOO.widget.Paginator,
            width: "100%"
         });

         // Override abstract function within DataTable to set custom empty message
         this.widgets.dataTable.doBeforeLoadData = function Collaborations_doBeforeLoadData(sRequest, oResponse, oPayload)
         {
            if ((oResponse.results.length === 0) || (oResponse.results.length === 1 && oResponse.results[0].shortName === "swsdp"))
            {
               oResponse.results.unshift(
               {
                  isInfo: true,
                  title: me.msg("empty.title"),
                  description: me.msg("empty.description") + (oResponse.results.length === 1 ? "<p>" + me.msg("empty.description.sample-collaboration") + "</p>" : "")
               });
            }
            return true;
         };


         /**
          * Hook favourite collaboration events
          */
         var registerEventHandler = function Collaborations_onReady_registerEventHandler(cssClass, fnHandler)
         {
            var fnEventHandler = function Collaborations_onReady_fnEventHandler(layer, args)
            {
               var owner = YAHOO.Bubbling.getOwnerByTagName(args[1].anchor, "div");
               if (owner !== null)
               {
                  fnHandler.call(me, args[1].target.offsetParent, owner);
               }

               return true;
            };
            YAHOO.Bubbling.addDefaultAction(cssClass, fnEventHandler);
         };

         registerEventHandler(FAV_EVENTCLASS, this.onFavouriteCollaboration);
         registerEventHandler(IMAP_EVENTCLASS, this.onImapFavouriteCollaboration);

         // Enable row highlighting
         this.widgets.dataTable.subscribe("rowMouseoverEvent", this.widgets.dataTable.onEventHighlightRow);
         this.widgets.dataTable.subscribe("rowMouseoutEvent", this.widgets.dataTable.onEventUnhighlightRow);

         // Load collaborations & preferences
         this.loadCollaborations();
      },

      /**
       * Date drop-down changed event handler
       *
       * @method onTypeFilterChanged
       * @param p_sType {string} The event
       * @param p_aArgs {array}
       */
      onTypeFilterChanged: function Collaborations_onTypeFilterChanged(p_sType, p_aArgs)
      {
         var menuItem = p_aArgs[1];
         if (menuItem)
         {
            this.widgets.type.set("label", menuItem.cfg.getProperty("text"));
            this.widgets.type.value = menuItem.value;

            // Save preferences and load collaborations afterwards
            this.services.preferences.set(PREFERENCES_COLLABORATIONS_DASHLET_FILTER_FAV, menuItem.value,
            {
               successCallback:
               {
                  fn: this.loadCollaborations,
                  scope: this
               }
            });
         }
      },

      onStatusFilterChanged: function Collaborations_onStatusFilterChanged(p_sType, p_aArgs)
      {
         var menuItem = p_aArgs[1];
         if (menuItem)
         {
            this.widgets.status.set("label", menuItem.cfg.getProperty("text"));
            this.widgets.status.value = menuItem.value;

         // Save preferences and load collaborations afterwards
            this.services.preferences.set(PREFERENCES_COLLABORATIONS_DASHLET_FILTER_STATUS, menuItem.value,
            {
               successCallback:
               {
                  fn: this.loadCollaborations,
                  scope: this
               }
            });
         }
      },
      
      onEnquiryFilterChanged: function Collaborations_onEnquiryFilterChanged(p_sType, p_aArgs)
      {
         var menuItem = p_aArgs[1];
         if (menuItem)
         {
            this.widgets.enquiry.set("label", menuItem.cfg.getProperty("text"));
            this.widgets.enquiry.value = menuItem.value;

         // Save preferences and load collaborations afterwards
            this.services.preferences.set(PREFERENCES_COLLABORATIONS_DASHLET_FILTER_ENQUIRY, menuItem.value,
            {
               successCallback:
               {
                  fn: this.loadCollaborations,
                  scope: this
               }
            });
         }
      },
      
      onSpeciesFilterChanged: function Collaborations_onSpeciesFilterChanged(p_sType, p_aArgs)
      {
         var menuItem = p_aArgs[1];
         if (menuItem)
         {
            this.widgets.species.set("label", menuItem.cfg.getProperty("text"));
            this.widgets.species.value = menuItem.value;

         // Save preferences and load collaborations afterwards
            this.services.preferences.set(PREFERENCES_COLLABORATIONS_DASHLET_FILTER_SPECIES, menuItem.value,
            {
               successCallback:
               {
                  fn: this.loadCollaborations,
                  scope: this
               }
            });
          
         }
      },
      onRagFilterChanged: function Collaborations_onRagFilterChanged(p_sType, p_aArgs)
      {
         var menuItem = p_aArgs[1];
         if (menuItem)
         {
            this.widgets.rag.set("label", menuItem.cfg.getProperty("text"));
            this.widgets.rag.value = menuItem.value;

         // Save preferences and load collaborations afterwards
            this.services.preferences.set(PREFERENCES_COLLABORATIONS_DASHLET_FILTER_RAG, menuItem.value,
            {
               successCallback:
               {
                  fn: this.loadCollaborations,
                  scope: this
               }
            });
          
         }
      },
      
      /**
       * Load collaborations list
       *
       * @method loadCollaborations
       */
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

      /**
       * Retrieve user preferences after collaborations data has loaded
       *
       * @method onCollaborationsLoaded
       * @param p_response {object} Response from "cggh/collaborations" query
       */
      onCollaborationsLoaded: function Collaborations_onCollaborationsLoaded(p_response)
      {
	      var items = null;
	      
	      if (p_response.json) {
	    	  items = p_response.json.collaborationNodes;
	      
	    	  this.services.preferences.request(PREFERENCES_COLLABORATIONS,
	    			  {
	    		  successCallback:
	    		  {
	    			  fn: this.onPreferencesLoaded,
	    			  scope: this,
	    			  obj: items
	    		  }
	    			  });
	      } else {
	    	  console.log("No valid json response from cggh/collaborations")
	      }
      },

      /**
       * Process response from collaborations and preferences queries
       *
       * @method onPreferencesLoaded
       * @param p_response {object} Response from "api/people/{userId}/preferences" query
       * @param p_items {object} Response from "api/people/{userId}/collaborations" query
       */
      onPreferencesLoaded: function Collaborations_onPreferencesLoaded(p_response, p_items)
      {
         var favs = {},
            imapfavs = {},
            i, j, k, l,
            ii = 0;

         // Save preferences
         if (p_response.json.org)
         {
            favs = p_response.json.org.cggh.share.collaborations.favourites;
            if (typeof(favs) === "undefined")
            {
               favs = {};
            } 
            imapfavs = p_response.json.org.cggh.share.collaborations.imapFavourites;
         }

         // Select the preferred filter in the ui
         var filter = Alfresco.util.findValueByDotNotation(p_response.json, PREFERENCES_COLLABORATIONS_DASHLET_FILTER_FAV, "all");
         filter = this.options.validFilters.hasOwnProperty(filter) ? filter : "all";
         this.widgets.type.set("label", this.msg("filter." + filter.replace(/ /g, '')));
         this.widgets.type.value = filter;
         
         filter = Alfresco.util.findValueByDotNotation(p_response.json, PREFERENCES_COLLABORATIONS_DASHLET_FILTER_STATUS, "all");
         this.widgets.status.set("label", this.msg("filter.status." + filter.replace(/ /g, '')));
         this.widgets.status.value = filter;

         filter = Alfresco.util.findValueByDotNotation(p_response.json, PREFERENCES_COLLABORATIONS_DASHLET_FILTER_ENQUIRY, "all");
         this.widgets.enquiry.set("label", this.msg("filter.enquiry." + filter.replace(/ /g, '')));
         this.widgets.enquiry.value = filter;
         
         filter = Alfresco.util.findValueByDotNotation(p_response.json, PREFERENCES_COLLABORATIONS_DASHLET_FILTER_SPECIES, "all");
         this.widgets.species.set("label", this.msg("filter.species." + filter.replace(/ /g, '')));
         this.widgets.species.value = filter;
         
         filter = Alfresco.util.findValueByDotNotation(p_response.json, PREFERENCES_COLLABORATIONS_DASHLET_FILTER_RAG, "all");
         this.widgets.rag.set("label", this.msg("filter.rag." + filter.replace(/ /g, '')));
         this.widgets.rag.value = filter;
         
         
         // Display the toolbar now that we have selected the filter
         Dom.removeClass(Selector.query(".toolbar div", this.id, true), "hidden");

         for (i = 0, j = p_items.length; i < j; i++)
         {
            p_items[i].isFavourite = typeof(favs[p_items[i].nodeRef]) == "undefined" ? false : favs[p_items[i].nodeRef];
            if (imapfavs)
            {
               p_items[i].isIMAPFavourite = typeof(imapfavs[p_items[i].nodeRef]) == "undefined" ? false : imapfavs[p_items[i].nodeRef];
            }
         }

         this.collaborations = [];
         for (i = 0, j = p_items.length; i < j; i++)
         {
            var collaboration = YAHOO.lang.merge({}, p_items[i]);

            if (this.filterAccept(this.widgets.type.value, this.widgets.status.value, this.widgets.enquiry.value, this.widgets.species.value, this.widgets.rag.value,
            		collaboration))
            {
               this.collaborations[ii] = collaboration;
               ii++;
            }
         }

         this.collaborations.sort(function(a, b)
         {
            var name1 = a.name.toLowerCase(),
                name2 = b.name.toLowerCase();
            return (name1 < name2) ? 1 : (name1 > name2) ? -1 : 0;
         });

         var successHandler = function Collaborations_onCollaborationsUpdate_success(sRequest, oResponse, oPayload)
         {
            oResponse.results=this.collaborations;
            this.widgets.dataTable.set("MSG_EMPTY", "");
            this.widgets.dataTable.onDataReturnInitializeTable.call(this.widgets.dataTable, sRequest, oResponse, oPayload);
         };

         this.widgets.dataSource.sendRequest(this.collaborations,
         {
            success: successHandler,
            scope: this
         });
      },

      /**
       * Determine whether a given collaboration should be displayed or not depending on the current filter selection
       * @method filterAccept
       * @param filter {string} Filter to set
       * @param collaboration {object} Collaboration object literal
       * @return {boolean}
       */
      filterAccept: function Collaborations_filterAccept(filter, statusFilter, enquiryFilter, speciesFilter, ragFilter, collaboration)
      {
    	  var ret = false;
         switch (filter)
         {
            case "all":
               ret = true;
               break;
            case "favs":
               ret = (collaboration.isFavourite || (this.options.imapEnabled && collaboration.isIMAPFavourite));
               break;
         }
         switch (statusFilter)
         {
            case "all":
              //leave unchanged
               break;
            default:
               ret = ret && (collaboration.collaborationStatus === statusFilter);
               break;
         }
         switch (enquiryFilter)
         {
            case "all":
              //leave unchanged
               break;
            default:
               ret = ret && (collaboration.enquiryStatus === enquiryFilter);
               break;
         }
         switch (ragFilter)
         {
            case "all":
              //leave unchanged
               break;
            default:
               ret = ret && (collaboration.ragStatus === ragFilter);
               break;
         }
         switch (speciesFilter)
         {
            case "all":
              //leave unchanged
               break;
            default:
            	var matched = false;
            	var length = collaboration.species.length;
           
            	for (var i = 0; i < length; i++) {
            		var speciesVal = collaboration.species[i];
            		var matchThis = (speciesFilter === speciesVal);
            		if (speciesFilter === 'P. all' && speciesVal.substring(0,3) ==='P. ') {
            			matchThis = true;
            		} 
            		matched = matched || matchThis;
            	}
            	
               ret = ret && matched;
               break;
         }
         return ret;
      },

      /**
       * Generate "Favourite" UI
       *
       * @method generateFavourite
       * @param record {object} DataTable record
       * @return {string} HTML mark-up for Favourite UI
       */
      generateFavourite: function Collaborations_generateFavourite(record)
      {
         var html = "";

         if (record.getData("isFavourite"))
         {
            html = '<a class="favourite-action ' + FAV_EVENTCLASS + ' enabled" title="' + this.msg("favourite.collaboration.remove.tip") + '" tabindex="0"></a>';
         }
         else
         {
            html = '<a class="favourite-action ' + FAV_EVENTCLASS + '" title="' + this.msg("favourite.collaboration.add.tip") + '" tabindex="0">' + this.msg("favourite.collaboration.add.label") + '</a>';
         }

         return html;
      },

      /**
       * Generate "IMAP Favourite" UI
       *
       * @method generateIMAPFavourite
       * @param record {object} DataTable record
       * @return {string} HTML mark-up for Favourite UI
       */
      generateIMAPFavourite: function Collaborations_generateIMAPFavourite(record)
      {
         var html = "";

         if (record.getData("isIMAPFavourite"))
         {
            html = '<a class="favourite-action favourite-imap ' + IMAP_EVENTCLASS + ' enabled" title="' + this.msg("favourite.imap-collaboration.remove.tip") + '" tabindex="0"></a>';
         }
         else
         {
            html = '<a class="favourite-imap ' + IMAP_EVENTCLASS + '" title="' + this.msg("favourite.imap-collaboration.add.tip") + '" tabindex="0">' + this.msg("favourite.imap-collaboration.add.label") + '</a>';
         }

         return html;
      },

    

      /**
       * Icon custom datacell formatter
       *
       * @method renderCellName
       * @param elCell {object}
       * @param oRecord {object}
       * @param oColumn {object}
       * @param oData {object|string}
       */
      renderCellName: function Collaborations_renderCellName(elCell, oRecord, oColumn, oData)
      {
         Dom.setStyle(elCell, "width", oColumn.width + "px");
         Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");
         
         var collaboration = oRecord.getData();
         
      	var objectId = collaboration.nodeRef,
      	title = collaboration.name;
         var desc = '<div class="study-title"><a href="' + Alfresco.constants.URL_PAGECONTEXT + 'folder-details?nodeRef=' + objectId + '" class="theme-color-1">' + $html(title) + '</a></div>';
         /* Favourite / IMAP / (Likes) */
         
         desc += '<div class="detail detail-social">';
         desc +=    '<span class="item item-social">' + this.generateFavourite(oRecord) + '</span>';
         if (this.options.imapEnabled)
         {
            desc +=    '<br/><span class="item item-social item-separator">' + this.generateIMAPFavourite(oRecord) + '</span>';
         }
         
         desc += '</div>';
         
         elCell.innerHTML = desc;
      },

      /**
       * Name & description custom datacell formatter
       */
      renderCellTitle: function MS_oR_renderCellTitle(elCell, oRecord, oColumn, oData)
      {
    	  var collaboration = oRecord.getData();
         var desc = "";
         
         desc += '<h3 class="collaboration-title"><a href="' + Alfresco.constants.URL_PAGECONTEXT + 'site/sequencing/documentlibrary#filter=path|/Collaborations/' + collaboration.name + '" class="theme-color-1">' + $html(collaboration.title) + '</a></h3>';
         
        
         elCell.innerHTML = desc;
      },
      
      /**
       * Name & description custom datacell formatter
       *
       * @method renderCellDetail
       * @param elCell {object}
       * @param oRecord {object}
       * @param oColumn {object}
       * @param oData {object|string}
       */
      renderCellDetail: function Collaborations_renderCellDetail(elCell, oRecord, oColumn, oData)
      {
         var collaboration = oRecord.getData(),
            description = '<span class="faded">' + this.msg("details.description.none") + '</span>',
            desc = "";

         if (collaboration.isInfo)
         {
           
            desc += '<span>' + collaboration.description + '</span></div>';
         }
         else
         {
            // Description non-blank?
            if (collaboration.description && collaboration.description !== "")
            {
               description = $links($html(collaboration.description));
            }

            
            desc += '<div class="detail"><span>' + description + '</span></div>';

          
         }

         elCell.innerHTML = desc;
      },


      /**
       * Actions custom datacell formatter
       *
       * @method renderCellProjectStatus
       * @param elCell {object}
       * @param oRecord {object}
       * @param oColumn {object}
       * @param oData {object|string}
       */
      renderCellProjectStatus: function Collaborations_renderCellProjectStatus(elCell, oRecord, oColumn, oData)
      {
         Dom.setStyle(elCell, "width", oColumn.width + "px");
         Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");

         var collaboration = oRecord.getData();

        
         elCell.innerHTML = collaboration.collaborationStatus;
      },

      sortCollaborationStatus: function Collaborations_sortCollaborationStatus(rec1, rec2, desc) {
    	  var a = rec1.getData();
    	  var b = rec2.getData();
    	  var name1 = a.collaborationStatus ? a.collaborationStatus : '',
                  name2 = b.collaborationStatus ? b.collaborationStatus : '';
    	  var ret = YAHOO.util.Sort.compare(name1, name2, desc);
    	  if (ret == 0) {
    		  ret = YAHOO.util.Sort.compare(a.name, b.name, desc);
    	  }
    	  return (ret);
      },
      /**
       * Actions custom datacell formatter
       *
       * @method renderCellEnquiryStatus
       * @param elCell {object}
       * @param oRecord {object}
       * @param oColumn {object}
       * @param oData {object|string}
       */
      renderCellEnquiryStatus: function Collaborations_renderCellEnquiryStatus(elCell, oRecord, oColumn, oData)
      {
         Dom.setStyle(elCell, "width", oColumn.width + "px");
         Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");

         var collaboration = oRecord.getData();

         var out = ''; 
         if (collaboration.enquiryStatus) {
        	 this.msg("filter.enquiry." + collaboration.enquiryStatus.replace(/ /g, ''));
         }
         elCell.innerHTML = out; 
      },

      sortEnquiryStatus: function Collaborations_sortEnquiryStatus(rec1, rec2, desc) {
    	  var a = rec1.getData();
    	  var b = rec2.getData();
    	  var name1 = a.collaborationStatus + a.enquiryStatus ? a.enquiryStatus : '',
                  name2 = b.collaborationStatus + b.enquiryStatus ? b.enquiryStatus : '';
    	  var ret = YAHOO.util.Sort.compare(name1, name2, desc);
    	  if (ret == 0) {
    		  ret = YAHOO.util.Sort.compare(a.name, b.name, desc);
    	  }
    	  return (ret);
      },
      /**
       * Actions custom datacell formatter
       *
       * @method renderCellPI
       * @param elCell {object}
       * @param oRecord {object}
       * @param oColumn {object}
       * @param oData {object|string}
       */
      renderCellPI: function Collaborations_renderCellPI(elCell, oRecord, oColumn, oData)
      {
         Dom.setStyle(elCell, "width", oColumn.width + "px");
         Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");

         var collaboration = oRecord.getData();

         var output = [];
         
         if (collaboration.groupPI) {
        	for(i = 0, j = collaboration.groupPI.length;i < j; i++) {
    		 	var person = collaboration.groupPI[i];
    		 	output.push(person.firstName + ' ' + person.lastName);
    	 	}
         }
        
         elCell.innerHTML = output.join(', ');
      },
      
      sortPI: function Collaborations_sortPI(rec1, rec2, desc) {
    	  var a = rec1.getData();
    	  var b = rec2.getData();
    	  var fname1 = '', fname2 = '';
    	  var lname1 = '', lname2 = '';
    	  if (a.groupPI && a.groupPI.length > 0) {
    		  fname1 = a.groupPI[0].firstName;
    		  lname1 = a.groupPI[0].lastName;
    	  }
    	  if (b.groupPI && b.groupPI.length > 0) {
    		  fname2 = b.groupPI[0].firstName;
    		  lname2 = b.groupPI[0].lastName;
    	  }
    	  
    	  var ret = YAHOO.util.Sort.compare(fname1, fname2, desc);
    	  if (ret == 0) {
    		  ret = YAHOO.util.Sort.compare(lname1, lname2, desc);
    	  }
    	  return (ret);
      },
      /**
       * Actions custom datacell formatter
       *
       * @method renderCellContact
       * @param elCell {object}
       * @param oRecord {object}
       * @param oColumn {object}
       * @param oData {object|string}
       */
      renderCellContact: function Collaborations_renderCellContact(elCell, oRecord, oColumn, oData)
      {
         Dom.setStyle(elCell, "width", oColumn.width + "px");
         Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");

         var collaboration = oRecord.getData();

         var output = [];
         
         if (collaboration.groupContact) {
            for(i = 0, j = collaboration.groupContact.length;i < j; i++) {
                var person = collaboration.groupContact[i];
                output.push(person.firstName + ' ' + person.lastName);
            }
         }
        
         elCell.innerHTML = output.join(', ');
      },
      
      sortContacts: function Collaborations_sortContacts(rec1, rec2, desc) {
          var a = rec1.getData();
          var b = rec2.getData();
          var fname1 = '', fname2 = '';
          var lname1 = '', lname2 = '';
          if (a.groupContact && a.groupContact.length > 0) {
              fname1 = a.groupContact[0].firstName;
              lname1 = a.groupContact[0].lastName;
          }
          if (b.groupContact && b.groupContact.length > 0) {
              fname2 = b.groupContact[0].firstName;
              lname2 = b.groupContact[0].lastName;
          }
          
          var ret = YAHOO.util.Sort.compare(fname1, fname2, desc);
          if (ret == 0) {
              ret = YAHOO.util.Sort.compare(lname1, lname2, desc);
          }
          return (ret);
      },
      /**
       * Actions custom datacell formatter
       *
       * @method renderCellLiaison
       * @param elCell {object}
       * @param oRecord {object}
       * @param oColumn {object}
       * @param oData {object|string}
       */
      renderCellLiaison: function Collaborations_renderCellLiaison(elCell, oRecord, oColumn, oData)
      {
         Dom.setStyle(elCell, "width", oColumn.width + "px");
         Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");

         var collaboration = oRecord.getData();

         if (collaboration.liaison) {
        	 var liaison = collaboration.liaison.firstName + " " + collaboration.liaison.lastName;
        
        	 elCell.innerHTML = liaison;
         }
      },
      sortLiaison: function Collaborations_sortLiaison(rec1, rec2, desc) {
    	  var a = rec1.getData();
    	  var b = rec2.getData();
    	  var name1 = '', name2 = '';
    	  if (a.liaison) {
    		  name1 = a.liaison.lastName;
    	  }
    	  if (b.liaison) {
    		  name2 = b.liaison.lastName;
    	  }
    	  
    	  var ret = YAHOO.util.Sort.compare(name1, name2, desc);
    	  if (ret == 0) {
    		  ret = YAHOO.util.Sort.compare(a.name, b.name, desc);
    	  }
    	  return (ret);
      },
      /**
       * Actions custom datacell formatter
       *
       * @method renderCellSpecies
       * @param elCell {object}
       * @param oRecord {object}
       * @param oColumn {object}
       * @param oData {object|string}
       */
      renderCellSpecies: function Collaborations_renderCellSpecies(elCell, oRecord, oColumn, oData)
      {
         Dom.setStyle(elCell, "width", oColumn.width + "px");
         Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");

         var collaboration = oRecord.getData();

        
         elCell.innerHTML = collaboration.species;
      },
      /**
       * Actions custom datacell formatter
       *
       * @method renderCellCountries
       * @param elCell {object}
       * @param oRecord {object}
       * @param oColumn {object}
       * @param oData {object|string}
       */
      renderCellCountries: function Collaborations_renderCellCountries(elCell, oRecord, oColumn, oData)
      {
         Dom.setStyle(elCell, "width", oColumn.width + "px");
         Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");

         var collaboration = oRecord.getData();

        
         elCell.innerHTML = collaboration.countries.join(', ');
      },
      /**
       * Actions custom datacell formatter
       *
       * @method renderCellNotes
       * @param elCell {object}
       * @param oRecord {object}
       * @param oColumn {object}
       * @param oData {object|string}
       */
      renderCellNotes: function Collaborations_renderCellNotes(elCell, oRecord, oColumn, oData)
      {
         Dom.setStyle(elCell, "width", oColumn.width + "px");
         Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");

         var collaboration = oRecord.getData();

        
         elCell.innerHTML = collaboration.notes;
      },
      renderCellSamplesExpected: function Collaborations_renderCellSamplesExpected(elCell, oRecord, oColumn, oData)
      {
         Dom.setStyle(elCell, "width", oColumn.width + "px");
         Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");

         var collaboration = oRecord.getData();
         var render = '';
         if (collaboration.samplesExpected) {
        	 render = collaboration.samplesExpected;
         }
         elCell.innerHTML = render;
      },
      renderCellSamplesProcessed: function Collaborations_renderCellSamplesProcessed(elCell, oRecord, oColumn, oData)
      {
         Dom.setStyle(elCell, "width", oColumn.width + "px");
         Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");

         var collaboration = oRecord.getData();
         var render = '';
         if (collaboration.samplesProcessed) {
        	 render = collaboration.samplesProcessed;
         }
         elCell.innerHTML = render;
      },
      renderCellSamplesSequenced: function Collaborations_renderCellSamplesSequenced(elCell, oRecord, oColumn, oData)
      {
         Dom.setStyle(elCell, "width", oColumn.width + "px");
         Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");

         var collaboration = oRecord.getData();
         var render = '';
         if (collaboration.samplesSequenced) {
        	 render = collaboration.samplesSequenced;
         }
         elCell.innerHTML = render;
      },

      renderCellStrategicNature: function Collaborations_renderCellStrategicNature(elCell, oRecord, oColumn, oData)
      {
         Dom.setStyle(elCell, "width", oColumn.width + "px");
         Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");

         var collaboration = oRecord.getData();
         var render = '';
         if (collaboration.strategicNature) {
        	 render = collaboration.strategicNature;
         }
         elCell.innerHTML = render;
      },
      renderCellIntDescrip: function Collaborations_renderCellIntDescrip(elCell, oRecord, oColumn, oData)
      {
         Dom.setStyle(elCell, "width", oColumn.width + "px");
         Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");

         var collaboration = oRecord.getData();

         var render = '';
         if (collaboration.intDescrip) {
        	 render = collaboration.intDescrip;
         }
         elCell.innerHTML = render;
      },
      renderCellProjects: function Collaborations_renderCellProjects(elCell, oRecord, oColumn, oData)
      {
         Dom.setStyle(elCell, "width", oColumn.width + "px");
         Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");

         var collaboration = oRecord.getData();

         if (collaboration.projects) {
        	 var output = [];
        	 for(i = 0, j = collaboration.projects.length;i < j; i++) {
        		 var proj = collaboration.projects[i];
        		 output.push(proj.name);
        		 
        	 }
        	 elCell.innerHTML = output;
         }
      },
      renderCellRagStatus: function Collaborations_renderCellRagStatus(elCell, oRecord, oColumn, oData)
      {
         Dom.setStyle(elCell, "width", oColumn.width + "px");
         Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");

         var collaboration = oRecord.getData();
         
         
         if (collaboration.ragStatus) {
        	 var out = '';
        	 if (collaboration.ragStatus === "red") {
        	     out = '<font color="#FF0000"><strong>Red</strong></font>';
        	 } else if (collaboration.ragStatus === "amber") {
        	     out = '<font color="#FF9900"><strong>Amber</strong></font>';
        	 } else if (collaboration.ragStatus === "green") {
        	     out = '<font color="#339966"><strong>Green</strong></font>';
        	 } else if (collaboration.ragStatus === "inactive") {
                     out = '<font color="grey">Inactive</font>';
                 }
        	 elCell.innerHTML = out;
         }
        
      },
      renderCellCollaborationDoc: function Collaborations_renderCellCollaborationDoc(elCell, oRecord, oColumn, oData)
      {
         Dom.setStyle(elCell, "width", oColumn.width + "px");
         Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");

         var collaboration = oRecord.getData();
         var output = [];
         
         if (collaboration.collaborationDoc) {
        	 for(i = 0, j = collaboration.collaborationDoc.length;i < j; i++) {
        		 var cdoc = collaboration.collaborationDoc[i];
        		 output.push('<a href="' + Alfresco.constants.URL_PAGECONTEXT + 'document-details?nodeRef=' + cdoc.nodeRef + '">' + cdoc.name + '</a>');
        	 }
         }
         elCell.innerHTML = output;
      },
      
      dateCompare: function Collaborations_dateCompare(date1s, date2s, desc) {
          var ret = 0;
          
          if (!date1s) {
              ret = 1;
          }
          
          if (!date2s) {
              ret = -1;
          }
          
          if (!date1s && !date2s) {
              return 0;
          }
          
          if (ret != 0) {
              if (!desc) {
                  ret = ret * -1;
              }
              return (ret);
              
          }
          var date1Parts = date2s.split("-");

          if (date1Parts.length == 2) {
              date1Parts.unshift("1");
          }
          var date1 = new Date(date1Parts[2], (date1Parts[1] - 1), date1Parts[0]);

          var date2Parts = date1s.split("-");

          if (date2Parts.length == 2) {
              date2Parts.unshift("1");
          }
          
          var date2 = new Date(date2Parts[2], (date2Parts[1] - 1), date2Parts[0]);
          
          var t1 = date1.getTime();
          var t2 = date2.getTime();
          
          if (t1 < t2) {
              ret = 1;
          } else if (t1 > t2) {
              ret = -1;
          }

          if (ret != 0) {
              if (!desc) {
                  ret = ret * -1;
              }   
          }
          return (ret);
      },
      renderCellReview: function Collaborations_renderCellReviewed(elCell, oRecord, oColumn, oData)
      {
         Dom.setStyle(elCell, "width", oColumn.width + "px");
         Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");

         var collaboration = oRecord.getData();

         if (collaboration.nextReview) {
             elCell.innerHTML = collaboration.nextReview;
         }
         
      },

      sortReview: function Collaborations_sortReview(rec1, rec2, desc) {
          var a = rec1.getData();
          var b = rec2.getData();
          var date1s = a.nextReview;
          var date2s = b.nextReview;
          
          ret = this.Cggh.dashlet.Collaborations.prototype.dateCompare(date1s, date2s, desc);
          
          return (ret);
      },
      renderCellFirstSampleExpected: function Collaborations_renderCellFirstSampleExpected(elCell, oRecord, oColumn, oData)
      {
         Dom.setStyle(elCell, "width", oColumn.width + "px");
         Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");

         var collaboration = oRecord.getData();

         if (collaboration.firstSampleDate) {
             elCell.innerHTML = collaboration.firstSampleDate;
         }
      },

      sortFirstSampleExpected: function Collaborations_sortFirstSampleExpected(rec1, rec2, desc) {
          var a = rec1.getData();
          var b = rec2.getData();
          var date1s = a.firstSampleDate;
          var date2s = b.firstSampleDate;
 
          ret = this.Cggh.dashlet.Collaborations.prototype.dateCompare(date1s, date2s, desc);
          
          return (ret);
      },
      renderCellLastSampleExpected: function Collaborations_renderCellLastSampleExpected(elCell, oRecord, oColumn, oData)
      {
         Dom.setStyle(elCell, "width", oColumn.width + "px");
         Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");

         var collaboration = oRecord.getData();

        
         if (collaboration.lastSampleDate) {
             elCell.innerHTML = collaboration.lastSampleDate;
         }
      },

      sortLastSampleExpected: function Collaborations_sortLastSampleExpected(rec1, rec2, desc) {
          var a = rec1.getData();
          var b = rec2.getData();
        
          var date1s = a.lastSampleDate;
          var date2s = b.lastSampleDate;
          
          ret = this.Cggh.dashlet.Collaborations.prototype.dateCompare(date1s, date2s, desc);
          
          return (ret);
      },
      /**
       * Adds an event handler that adds or removes the collaboration as favourite collaboration
       *
       * @method onFavouriteCollaboration
       * @param row {object} DataTable row representing collaboration to be actioned
       */
      onFavouriteCollaboration: function Collaborations_onFavouriteCollaboration(row)
      {
         var record = this.widgets.dataTable.getRecord(row),
            collaboration = record.getData(),
            collaborationId = collaboration.nodeRef;

         collaboration.isFavourite = !collaboration.isFavourite;

         this.widgets.dataTable.updateRow(record, collaboration);

         // Assume the call will succeed, but register a failure handler to replace the UI state on failure
         var responseConfig =
         {
            failureCallback:
            {
               fn: function Collaborations_onFavouriteCollaboration_failure(event, obj)
               {
                  // Reset the flag to it's previous state
                  var record = obj.record,
                     collaboration = record.getData();

                  collaboration.isFavourite = !collaboration.isFavourite;
                  this.widgets.dataTable.updateRow(record, collaboration);
                  Alfresco.util.PopupManager.displayPrompt(
                  {
                     text: this.msg("message.save.failure")
                  });
               },
               scope: this,
               obj:
               {
                  record: record
               }
            },
            successCallback:
            {
               fn: function Collaborations_onFavouriteCollaboration_success(event, obj)
               {
                  var record = obj.record,
                     collaboration = record.getData();

                  YAHOO.Bubbling.fire(collaboration.isFavourite ? "favouriteCollaborationAdded" : "favouriteCollaborationRemoved", collaboration);
               },
               scope: this,
               obj:
               {
                  record: record
               }
            }
         };

         this.services.preferences.set(FAVOURITE_COLLABORATIONS + "." + collaborationId, collaboration.isFavourite, responseConfig);
      },

      /**
       * Adds an event handler that adds or removes the collaboration as favourite collaboration
       *
       * @method onImapFavouriteCollaboration
       * @param row {object} DataTable row representing collaboration to be actioned
       */
      onImapFavouriteCollaboration: function Collaborations_onImapFavouriteCollaboration(row)
      {
         var record = this.widgets.dataTable.getRecord(row),
            collaboration = record.getData(),
            collaborationId = collaboration.nodeRef;

         collaboration.isIMAPFavourite = !collaboration.isIMAPFavourite;

         this.widgets.dataTable.updateRow(record, collaboration);

         // Assume the call will succeed, but register a failure handler to replace the UI state on failure
         var responseConfig =
         {
            failureCallback:
            {
               fn: function Collaborations_onImapFavouriteCollaboration_failure(event, obj)
               {
                  // Reset the flag to it's previous state
                  var record = obj.record,
                     collaboration = record.getData();

                  collaboration.isIMAPFavourite = !collaboration.isIMAPFavourite;
                  this.widgets.dataTable.updateRow(record, collaboration);
                  Alfresco.util.PopupManager.displayPrompt(
                  {
                     text: this.msg("message.save.failure")
                  });
               },
               scope: this,
               obj:
               {
                  record: record
               }
            }
         };

         this.services.preferences.set(IMAP_FAVOURITE_COLLABORATIONS + "." + collaborationId, collaboration.isIMAPFavourite, responseConfig);
      },

 
      /**
       * Searches the current recordSet for a record with the given parameter value
       *
       * @method _findRecordByParameter
       * @param p_value {string} Value to find
       * @param p_parameter {string} Parameter to look for the value in
       */
      _findRecordByParameter: function Collaborations__findRecordByParameter(p_value, p_parameter)
      {
        var recordSet = this.widgets.dataTable.getRecordSet();
        for (var i = 0, j = recordSet.getLength(); i < j; i++)
        {
           if (recordSet.getRecord(i).getData(p_parameter) === p_value)
           {
              return recordSet.getRecord(i);
           }
        }
        return null;
      }
   });
})();
