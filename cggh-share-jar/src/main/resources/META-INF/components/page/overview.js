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
 * Dashboard Overview component.
 *
 * @namespace Cggh.dashlet
 * @class Cggh.dashlet.Overview
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
   var PREFERENCES_OVERVIEW = "org.cggh.share.collaborations",
      PREFERENCES_OVERVIEW_DASHLET_FILTER = PREFERENCES_OVERVIEW + ".dashlet.filter";

   var FAVOURITE_OVERVIEW = PREFERENCES_OVERVIEW + ".favourites";
   var IMAP_FAVOURITE_OVERVIEW = PREFERENCES_OVERVIEW + ".imapFavourites";
  
   /**
    * Dashboard Overview constructor.
    *
    * @param {String} htmlId The HTML id of the parent element
    * @return {Cggh.dashlet.Overview} The new component instance
    * @constructor
    */
   Cggh.dashlet.Overview = function Overview_constructor(htmlId)
   {
      Cggh.dashlet.Overview.superclass.constructor.call(this, "Cggh.dashlet.Overview", htmlId, ["datasource", "datatable", "animation"]);

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

   YAHOO.extend(Cggh.dashlet.Overview, Alfresco.component.Base,
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
         imapEnabled: false,
         
         /**
          * Result list size maximum
          *
          * @property listSize
          * @type integer
          * @default 100
          */
         listSize: 100
      },

      /**
       * Fired by YUI when parent element is available for scripting
       * @method onReady
       */
      onReady: function Overview_onReady()
      {
         var me = this;

      this.widgets.lookseq = Alfresco.util.createYUIButton(this, "lookseq", this.onLookSeqFilterChanged,
         {
             type: "checkbox",
         });
         this.widgets.lookseq.value = false;
         
         // DataSource definition
         this.widgets.dataSource = new YAHOO.util.DataSource(this.collaborations,
         {
            responseType: YAHOO.util.DataSource.TYPE_JSARRAY
         });

         // DataTable column defintions
         var columnDefinitions =
         [
            { key: "name", label: this.msg("cggh.label.name"), sortable: true, formatter: this.bind(this.renderCellName) }
            ];
         var lsCols = 
         [
            { key: "sTitle", label: this.msg("cggh.external.solaris.title"), hidden: true, sortable: false, formatter: this.bind(this.renderCellSolarisTitle) },
            { key: "sPi", label: this.msg("cggh.external.solaris.pi"), hidden: true, sortable: false, formatter: this.bind(this.renderCellSolarisPI) },
            { key: "sOther", label: this.msg("cggh.external.solaris.otherPeople"), hidden: true, sortable: false, formatter: this.bind(this.renderCellSolarisOtherPeople) }
         ];

        
        var cols = columnDefinitions.concat(lsCols);
        columnDefinitions = cols;
       
        this.widgets.panel = new YAHOO.widget.Panel(this.id + "-overview", { 
                      width: '100%', 
                      underlay: 'none', 
                      close: false 
                  }); 
    
        this.widgets.panel.setBody('<div id="layout"></div>'); 
        this.widgets.panel.beforeRenderEvent.subscribe(function() { 
                      Event.onAvailable('layout', function() { 
                          me.widgets.layout = new YAHOO.widget.Layout('layout', { 
                              height: 643, 
                              width: 1600,
                              units: [ 
                                  { position: 'left', width: 474, body: '', gutter: '0 5 0 2' }, 
                                  { position: 'center', width: 1113, body: 'Select a study', gutter: '0 2 0 0' } 
                              ] 
                          }); 
                          
                          me.widgets.layout.on('render', function() {
                              var l = me.widgets.layout.getUnitByPosition('left'); 
                              var el = document.createElement('div'); 
                              l.body.appendChild(el);
                              // DataTable definition
                              me.widgets.dataTable = new YAHOO.widget.ScrollingDataTable(el, columnDefinitions, me.widgets.dataSource,
                              {
                                 MSG_EMPTY: me.msg("message.datatable.loading"),
                                 draggableColumns: true,
                               //  paginator: YAHOO.widget.Paginator,
                                 width: "464px",
                                 height: "620px"
                              });

                              // Override abstract function within DataTable to set custom empty message
                              me.widgets.dataTable.doBeforeLoadData = function Overview_doBeforeLoadData(sRequest, oResponse, oPayload)
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

                              // Enable row highlighting
                              me.widgets.dataTable.subscribe("rowMouseoverEvent", me.widgets.dataTable.onEventHighlightRow);
                              me.widgets.dataTable.subscribe("rowMouseoutEvent", me.widgets.dataTable.onEventUnhighlightRow);

                              me.widgets.dataTable.subscribe("rowClickEvent", me.widgets.dataTable.onEventSelectRow); 
                              me.widgets.dataTable.subscribe("rowSelectEvent", function() { 
                                   
                                  var data = this.getRecordSet().getRecord(this.getSelectedRows()[0])._oData; 
                                  var unit = me.widgets.layout.getUnitByPosition('center');
                                  me.renderStudyDetails(unit, data);
                                   
                                  }, me.widgets.dataTable, true); 
                          });
                          
                          me.widgets.layout.render();
                      });
        });
                   
         this.widgets.panel.render();
       



         /**
          * Hook favourite collaboration events
          */
         var registerEventHandler = function Overview_onReady_registerEventHandler(cssClass, fnHandler)
         {
            var fnEventHandler = function Overview_onReady_fnEventHandler(layer, args)
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
      onTypeFilterChanged: function Overview_onTypeFilterChanged(p_sType, p_aArgs)
      {
         var menuItem = p_aArgs[1];
         if (menuItem)
         {
            this.widgets.type.set("label", menuItem.cfg.getProperty("text"));
            this.widgets.type.value = menuItem.value;

            // Save preferences and load collaborations afterwards
            this.services.preferences.set(PREFERENCES_OVERVIEW_DASHLET_FILTER, menuItem.value,
            {
               successCallback:
               {
                  fn: this.loadCollaborations,
                  scope: this
               }
            });
         }
      },

      onStatusFilterChanged: function Overview_onStatusFilterChanged(p_sType, p_aArgs)
      {
         var menuItem = p_aArgs[1];
         if (menuItem)
         {
            this.widgets.status.set("label", menuItem.cfg.getProperty("text"));
            this.widgets.status.value = menuItem.value;

          
            this.loadCollaborations();
          
         }
      },
      
      onEnquiryFilterChanged: function Overview_onEnquiryFilterChanged(p_sType, p_aArgs)
      {
         var menuItem = p_aArgs[1];
         if (menuItem)
         {
            this.widgets.enquiry.set("label", menuItem.cfg.getProperty("text"));
            this.widgets.enquiry.value = menuItem.value;

          
            this.loadCollaborations();
          
         }
      },
      
      onSpeciesFilterChanged: function Overview_onSpeciesFilterChanged(p_sType, p_aArgs)
      {
         var menuItem = p_aArgs[1];
         if (menuItem)
         {
            this.widgets.species.set("label", menuItem.cfg.getProperty("text"));
            this.widgets.species.value = menuItem.value;

          
            this.loadCollaborations();
          
         }
      },
      
      onLookSeqFilterChanged: function Overview_onLookSeqFilterChanged(p_sType, p_aArgs)
      {
         
         this.widgets.lookseq.value = p_sType.newValue;
                   
         if (this.widgets.lookseq.value) {
             this.widgets.dataTable.showColumn("sTitle");
             this.widgets.dataTable.showColumn("sPi");
             this.widgets.dataTable.showColumn("sOther");
         } else {
             this.widgets.dataTable.hideColumn("sTitle");
             this.widgets.dataTable.hideColumn("sPi");
             this.widgets.dataTable.hideColumn("sOther");
         }
         this.loadCollaborations();
         
      },
      /**
       * Load collaborations list
       *
       * @method loadCollaborations
       */
      loadCollaborations: function Overview_loadCollaborations()
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

     
      loadSolaris: function Overview_loadSolaris(p_items)
      {
          if (this.widgets.lookseq.value) {
         // Load collaborations
         Alfresco.util.Ajax.request(
         {
            //url: Alfresco.constants.PROXY_URI + "api/people/" + encodeURIComponent(Alfresco.constants.USERNAME) + "/sites?roles=user&size=" + this.options.listSize,
             //Requires a proxy to https://lookseq.sanger.ac.uk/cgi-bin/pipeline_status/mystudies.pl?query=get_details
             //Due to cross site scripting security
             url: '/pipeline_status/mystudies.pl',
             requestContentType: Alfresco.util.Ajax.JSON, // Set to JSON if json should be used
             responseContentType: Alfresco.util.Ajax.JSON, // Set to JSON if json should be used
             dataObj: { query: 'get_details'},
             method: Alfresco.util.Ajax.GET,
             successCallback:
            {
               fn: this.onSolarisLoaded,
               obj: p_items,
               scope: this
            },
            failureCallback: {
                fn: this.onSolarisLoaded,
                obj: p_items,
                scope: this
            }
         });
          } else {
              this.onSolarisLoaded(null, p_items);
          }
      },
      /**
       * Retrieve user preferences after collaborations data has loaded
       *
       * @method onCollaborationsLoaded
       * @param p_response {object} Response from "api/people/{userId}/collaborations" query
       */
      onSolarisLoaded: function Overview_onSolarisLoaded(p_response, p_items)
      {
          //Alfresco studies
          var items = p_items.collaborationNodes;

          var newItems = [];
          //Solaris projects - ignore if connection failed
        if (p_response && p_response.json) {
          var projects = p_response.json.data.projects;
          for (var key in projects)
          {
              var project = projects[key];
              var found = false;

              for (i = 0, numItems = items.length; i < numItems; i++)
              {
                var item = items[i];
                var words = item.name.split(" ");
                if (words.length > 1)
                {
                var item_code = words[1];
                    if (item_code == project.project_code) 
                    {
                      found = true;
                      item.solaris_people = project.people;
                      item.solaris_title = project.title;
                      break;
                    }
                }
              }
              if (!found) {
                  var newItem = {
                          "solaris_people": "project.people",
                          "solaris_title":  "project.title"
                  };
                  newItems.push(newItem);
              }
          }
        }
          //Could merge items and newItems if you want to see projects in Solaris
          //but not in Alfresco
         // Load preferences (after which the appropriate collaborations will be displayed)
         this.services.preferences.request(PREFERENCES_OVERVIEW,
         {
            successCallback:
            {
               fn: this.onPreferencesLoaded,
               scope: this,
               obj: items
            }
         });
      },
      /**
       * Retrieve user preferences after collaborations data has loaded
       *
       * @method onCollaborationsLoaded
       * @param p_response {object} Response from "api/people/{userId}/collaborations" query
       */
      onCollaborationsLoaded: function Overview_onCollaborationsLoaded(p_response)
      {
          this.loadSolaris(p_response.json);
      },

      /**
       * Process response from collaborations and preferences queries
       *
       * @method onPreferencesLoaded
       * @param p_response {object} Response from "api/people/{userId}/preferences" query
       * @param p_items {object} Response from "api/people/{userId}/collaborations" query
       */
      onPreferencesLoaded: function Overview_onPreferencesLoaded(p_response, p_items)
      {
         var favs = {},
            imapfavs = {},
            i, j, k, l,
            ii = 0;

         // Save preferences
         if (p_response.json.org)
         {
      
         }

         // Select the preferred filter in the ui
         var filter = Alfresco.util.findValueByDotNotation(p_response.json, PREFERENCES_OVERVIEW_DASHLET_FILTER, "all");
         filter = this.options.validFilters.hasOwnProperty(filter) ? filter : "all";
         
         // Display the toolbar now that we have selected the filter
         Dom.removeClass(Selector.query(".toolbar div", this.id, true), "hidden");

      
         this.collaborations = [];
         for (i = 0, j = p_items.length; i < j; i++)
         {
            var collaboration = YAHOO.lang.merge({}, p_items[i]);

               this.collaborations[ii] = collaboration;
               ii++;
      
         }

         this.collaborations.sort(function(a, b)
         {
            if (a.webTitle == '')
                title1 = a.name;
            else
                title1 = a.webTitle;
            if (b.webTitle == '')
                title2 = b.name;
            else
                title2 = b.webTitle;
            var name1 = title1.toLowerCase(),
                name2 = title2.toLowerCase();
            return (name1 > name2) ? 1 : (name1 < name2) ? -1 : 0;
         });

         var successHandler = function Overview_onCollaborationsUpdate_success(sRequest, oResponse, oPayload)
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
       * Generate "Favourite" UI
       *
       * @method generateFavourite
       * @param record {object} DataTable record
       * @return {string} HTML mark-up for Favourite UI
       */
      generateFavourite: function Overview_generateFavourite(record)
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
      generateIMAPFavourite: function Overview_generateIMAPFavourite(record)
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

    
      renderStudyDetails: function Overview_renderStudyDetails(area, collaboration)
      {
        var objectId = collaboration.nodeRef,
        title = collaboration.name;
         
         var desc = '<div>';
         desc += '<a href="' + Alfresco.constants.URL_PAGECONTEXT + 'edit-metadata?nodeRef=' + objectId + '" class="theme-color-1">' + this.msg("cggh.action.edit") + '</a></div>';
         desc += '<div class="study-title">';
         desc += title;
         desc += '</div>';
         desc += '<div class="web-title">';
         desc += '<h2>' + this.msg("cggh.metadata.webTitle") + '</h2>';
         desc += '<h2>' + collaboration.webTitle + '</h2>';
         desc += '</div>';
         desc += '<div class="description">';
         desc += '<h2>' + this.msg("cggh.label.description") + '</h2>';
         desc += collaboration.description;
         desc += '</div>';
         desc += '<div class="countries">';
         desc += '<h2>' + this.msg("cggh.metadata.sampleCountry") + '</h2>';
         desc += collaboration.countries.join(', ');
         desc += '</div>';
         
         desc += '<div class="primaryContacts">';
         desc += '<h2>' + this.msg("cggh.metadata.primaryContacts") + '</h2>';
         
         if (collaboration.primaryContacts) {
            for(i = 0, j = collaboration.primaryContacts.length;i < j; i++) {
                var person = collaboration.primaryContacts[i];
                desc += person.firstName + ' ' + person.lastName + '<br/>' ;
                desc += person.company + '<br/>' ;
                desc += person.email + '<br/>' ;
            }
         }
        
         desc += '</div>';
         
         desc += '<div class="contacts">';
         desc += '<h2>' + this.msg("cggh.metadata.contacts") + '</h2>';
         if (collaboration.contacts) {
            for(i = 0, j = collaboration.contacts.length;i < j; i++) {
                var person = collaboration.contacts[i];
                desc += person.firstName + ' ' + person.lastName + '<br/>' ;
                desc += person.company + '<br/>' ;
                desc += person.email + '<br/>' ;
            }
         }
         
         desc += '</div>';
         desc += '</div>';
         

         area.set('body',desc);
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
      renderCellName: function Overview_renderCellName(elCell, oRecord, oColumn, oData)
      {
         Dom.setStyle(elCell, "width", oColumn.width + "px");
         Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");
         
         var collaboration = oRecord.getData();
         
        var objectId = collaboration.nodeRef,
        title = collaboration.name;
         
         var desc = '<div class="study-title">';
         if (collaboration.webTitle != '') {
             desc += collaboration.webTitle;
         } else {
             desc += title;
         }
         desc += '</div>';
         //    '<a href="' + Alfresco.constants.URL_PAGECONTEXT + 'folder-details?nodeRef=' + objectId + '" class="theme-color-1">' + $html(title) + '</a></div>';
         elCell.innerHTML = desc;
      },

      
      renderCellSolarisTitle: function Overview_renderCellSolarisTitle(elCell, oRecord, oColumn, oData)
      {
         Dom.setStyle(elCell, "width", oColumn.width + "px");
         Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");

         var collaboration = oRecord.getData();

         if (collaboration.solaris_title) {
             elCell.innerHTML = collaboration.solaris_title;
         }
      },
      renderCellSolarisPI: function Overview_renderCellSolarisPI(elCell, oRecord, oColumn, oData)
      {
         Dom.setStyle(elCell, "width", oColumn.width + "px");
         Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");

         var collaboration = oRecord.getData();
         var output = [];
         
         if (collaboration.solaris_people) {
             for(i = 0, j = collaboration.solaris_people.length;i < j; i++) {
                 var person = collaboration.solaris_people[i];
                 if (person.is_pi == 1) {
                     output.push(person.fullname);
                 }
             }
         }
        
         elCell.innerHTML = output;
      },
      renderCellSolarisOtherPeople: function Overview_renderCellSolarisOtherPeople(elCell, oRecord, oColumn, oData)
      {
         Dom.setStyle(elCell, "width", oColumn.width + "px");
         Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");

         var collaboration = oRecord.getData();
         var output = [];
         
         if (collaboration.solaris_people) {
             for(i = 0, j = collaboration.solaris_people.length;i < j; i++) {
                 var person = collaboration.solaris_people[i];
                 if (person.is_pi == 0) {
                     output.push(person.fullname);
                 }
             }
         }
         elCell.innerHTML = output;
      }
      
      
   });
})();