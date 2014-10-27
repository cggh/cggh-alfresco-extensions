define(
        [
                "dojo/_base/array", // array.forEach
                "dojo/_base/declare", "dojo/_base/lang", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/dom", "dojo/dom-construct",
                "cggh/cmis/store/CmisStore", "dgrid/OnDemandGrid", "dgrid/editor", "dijit/form/MultiSelect", "dijit/form/Select",
                "dijit/form/DateTextBox", "dojo/text!./List.html", "alfresco/core/Core"
        ],
        function(array, declare, lang, _Widget, _Templated, dom, domConstruct, CmisStore, dgrid, editor, MultiSelect, Select, DateTextBox,
                template, Core) {
            return declare(
                    [
                            _Widget, _Templated, Core
                    ],
                    {
                        cssRequirements : [
                                {
                                    cssFile : "./List.css",
                                    mediaType : "screen"
                                }, {
                                    cssFile : "/js/lib/dojo-1.9.0/dojox/grid/resources/claroGrid.css",
                                    mediaType : "screen"
                                }
                        ],
                        i18nScope : "PublicationsList",
                        i18nRequirements : [
                            {
                                i18nFile : "./List.properties"
                            }
                        ],
                        templateString : template,
                        buildRendering : function cggh_publications_List__buildRendering() {
                            this.inherited(arguments);
                        },
                        alf_ticket: '',
                        postCreate : function cggh_publications_List_postCreate() {
                            try {

                            	
                            	Alfresco.util.Ajax.jsonGet(
                    					{
                    						url: Alfresco.constants.PROXY_URI + "auth/get-ticket",
                    						successCallback:
                    						{
                    							fn: function(response)
                    							{
                    								try {
                    									var json = JSON.parse(response.serverResponse.responseText);
                    									this.alf_ticket = json["ticket"];
                    									
                    									 var targetRoot;
                    		                                targetRoot = "/alfresco/api/-default-/public/cmis/versions/1.1/browser";
                    		                                        
                    		                                //targetRoot = "https://localhost:8443/alfresco/api/-default-/public/cmis/versions/1.1/browser",
                    		                            
                    		                                this.cmisStore = new CmisStore({
                    		                                    base : targetRoot,
                    		                                    succinct : true,
                    		                                    ticket: this.alf_ticket
                    		                                });

                    		                                //t.cm:title is the value used
                    		                                this.cmisStore.excludeProperties.push('cm:title');
                    		                                this.cmisStore.excludeProperties.push('cmis:description');
                    		                                this.cmisStore.excludeProperties.push('cm:description');
                    		                                this.cmisStore.excludeProperties.push('cgghPub:contactsText');
                    		                                
                    		                                declare("CategoryMultiSelect", MultiSelect, {
                    		                                    size : 2,
                    		                                    postCreate : function() {
                    		                                        /*
                    		                                        domConstruct.create('option', {
                    		                                            innerHTML : this.message('pub.banner1'),
                    		                                            value : 'banner'
                    		                                        }, this.domNode);
                    		                                        domConstruct.create('option', {
                    		                                            innerHTML : ('pub.overarching'),
                    		                                            value : 'overarching'
                    		                                        }, this.domNode);
                    		                                        domConstruct.create('option', {
                    		                                            innerHTML : this.message('pub.selective'),
                    		                                            value : 'selective'
                    		                                        }, this.domNode);
                    		                                        */
                    		                                        array.forEach(this.options, function(child) {
                    		                                            domConstruct.create('option', {
                    		                                                innerHTML : child.label,
                    		                                                value : child.value
                    		                                            }, this.domNode);

                    		                                        }, this);
                    		                                        this.inherited(arguments);
                    		                                    }
                    		                                });

                    		                                var formatFunction = function(data) {

                    		                                    if (data != null) {
                    		                                        if (typeof data === "undefined" || typeof data.value === "undefined") {
                    		                                            return data;
                    		                                        } else {
                    		                                            return data.value;
                    		                                        }
                    		                                    } else {
                    		                                        return "";
                    		                                    }
                    		                                };

                    		                                var formatLinkFunction = function(text, data) {

                    		                                    if (text != null) {
                    		                                        if (typeof text === "undefined" || typeof text.value === "undefined") {
                    		                                            if (data['alfcmis:nodeRef']) {
                    		                                                //https://localhost:8444/share/page/site/pf3k/folder-details?nodeRef=workspace://SpacesStore/37f82a52-55cf-4588-bf9f-8d11db8fce43
                    		                                                return '<a href="' + Alfresco.constants.URL_PAGECONTEXT + 'edit-metadata?nodeRef='
                    		                                                        + data['alfcmis:nodeRef'] + '">' + text + '</a>';
                    		                                            } else {
                    		                                                return text;
                    		                                            }

                    		                                        } else {
                    		                                            return text.value;
                    		                                        }
                    		                                    } else {
                    		                                        return "";
                    		                                    }
                    		                                };
                    		                                this.grid = new dgrid(
                    		                                        {
                    		                                            store : this.cmisStore,
                    		                                            query : {
                    		                                                //Looks like 4.3 will be required to get relationships to people
                    		                                                //http://ecmarchitect.com/archives/2014/04/28/3703
                    		                                                'statement' : 'SELECT * FROM cgghPub:publicationFolder join cgghPub:publication as p on cmis:objectId = p.cmis:objectId join cm:titled as t on cmis:objectId = t.cmis:objectId',
                    		                                            },
                    		                                            //                                       query: this.query,
                    		                                            columns : [
                    		                                                    {
                    		                                                        label : this.message("pub.id"),
                    		                                                        field : "cmis:name",
                    		                                                        formatter : formatLinkFunction
                    		                                                    }, editor({
                    		                                                        label : this.message("pub.type"),
                    		                                                        field : "p.cgghPub:type",
                    		                                                        autoSave : true,
                    		                                                        editorArgs : {
                    		                                                            options : [
                    		                                                                    {
                    		                                                                        label : this.message("pub.plasmodium"),
                    		                                                                        value : "Plasmodium"
                    		                                                                    }, {
                    		                                                                        label : this.message("pub.anophales"),
                    		                                                                        value : "Anophales"
                    		                                                                    }, {
                    		                                                                        label : this.message("pub.human"),
                    		                                                                        value : "Human"
                    		                                                                    }, {
                    		                                                                        label : this.message("pub.ethics"),
                    		                                                                        value : "Ethics"
                    		                                                                    }, {
                    		                                                                        label : this.message("pub.other"),
                    		                                                                        value : "Other"
                    		                                                                    }
                    		                                                            ]
                    		                                                        }
                    		                                                    }, Select), editor({
                    		                                                        label : this.message("pub.lead"),
                    		                                                        field : "p.cgghPub:lead",
                    		                                                        autoSave : true,
                    		                                                        editorArgs : {
                    		                                                            options : [
                    		                                                                    {
                    		                                                                        label : this.message("pub.partner"),
                    		                                                                        value : "Partner"
                    		                                                                    }, {
                    		                                                                        label : this.message("pub.team"),
                    		                                                                        value : "Team"
                    		                                                                    }
                    		                                                            ]
                    		                                                        }
                    		                                                    }, Select), editor({
                    		                                                        label : this.message("pub.category"),
                    		                                                        field : "p.cgghPub:category",
                    		                                                        autoSave : true,
                    		                                                        editorArgs : {
                    		                                                            options : [
                    		                                                                    {
                    		                                                                        label : this.message("pub.banner"),
                    		                                                                        value : "banner"
                    		                                                                    }, {
                    		                                                                        label : this.message("pub.overarching"),
                    		                                                                        value : "overarching"
                    		                                                                    }, {
                    		                                                                        label : this.message("pub.selective"),
                    		                                                                        value : "selective"
                    		                                                                    }
                    		                                                            ]
                    		                                                        }
                    		                                                    }, CategoryMultiSelect), editor({
                    		                                                        label : this.message("pub.schedule"),
                    		                                                        field : "p.cgghPub:onProdSchedule",
                    		                                                        autoSave : true,
                    		                                                        editor : "checkbox",
                    		                                                        get : function(rowData) {
                    		                                                            var d1 = rowData["p.cgghPub:depositedPMC"];
                    		                                                            if (d1 == null) {
                    		                                                                return false;
                    		                                                            }
                    		                                                            var date1 = d1[0];
                    		                                                            return (date1);
                    		                                                        }
                    		                                                    }), editor({
                    		                                                        label : this.message("pub.title"),
                    		                                                        field : "t.cm:title",
                    		                                                        autoSave : true,
                    		                                                        formatter : formatFunction,
                    		                                                        editor : "text"
                    		                                                    }),
                    		                                                    /** Requires 4.3?
                    		                                                    {
                    		                                                        label : this.message("pub.contact"),
                    		                                                        field : "p.cgghPub:leadContact",
                    		                                                        formatter : formatFunction
                    		                                                    }, */
                    		                                                    editor({
                    		                                                        label : this.message("pub.funding"),
                    		                                                        field : "p.cgghPub:fundingCodes",
                    		                                                        autoSave : true,
                    		                                                        formatter : formatFunction,
                    		                                                        editor : "text"
                    		                                                    }), editor({
                    		                                                        label : this.message("pub.review"),
                    		                                                        field : "p.cgghPub:submittedPubComm",
                    		                                                        autoSave : true,
                    		                                                        editorArgs : {
                    		                                                            options : [
                    		                                                                    {
                    		                                                                        label : this.message("pub.no"),
                    		                                                                        value : "no"
                    		                                                                    }, {
                    		                                                                        label : this.message("pub.yes"),
                    		                                                                        value : "yes"
                    		                                                                    }, {
                    		                                                                        label : this.message("pub.notMalariaGEN"),
                    		                                                                        value : "not MalariaGEN"
                    		                                                                    }
                    		                                                            ]
                    		                                                        }
                    		                                                    }), editor({
                    		                                                        label : this.message("pub.review-dk"),
                    		                                                        field : "p.cgghPub:reviewedDK",
                    		                                                        autoSave : true,
                    		                                                        editorArgs : {
                    		                                                            options : [
                    		                                                                    {
                    		                                                                        label : this.message("pub.no"),
                    		                                                                        value : "no"
                    		                                                                    }, {
                    		                                                                        label : this.message("pub.yes"),
                    		                                                                        value : "yes"
                    		                                                                    }, {
                    		                                                                        label : this.message("pub.notMalariaGEN"),
                    		                                                                        value : "not MalariaGEN"
                    		                                                                    }
                    		                                                            ]
                    		                                                        }
                    		                                                    }), editor({
                    		                                                        label : this.message("pub.submitted.journal"),
                    		                                                        field : "p.cgghPub:submittedJournal",
                    		                                                        autoSave : true,
                    		                                                        formatter : formatFunction
                    		                                                    }), editor({
                    		                                                        field : this.message('pub.submitted.date'),
                    		                                                        autoSave : true,
                    		                                                        get : function(rowData) {
                    		                                                            var d1 = rowData["p.cgghPub:submittedDate"];
                    		                                                            if (d1 == null) {
                    		                                                                return null;
                    		                                                            }
                    		                                                            var date1 = new Date(d1[0]);
                    		                                                            return (date1);
                    		                                                        },
                    		                                                        set : function(rowData) {
                    		                                                            var d1 = rowData["p.cgghPub:submittedDate"];
                    		                                                            if (d1) {
                    		                                                                return d1.getTime();
                    		                                                            } else {
                    		                                                                return null;
                    		                                                            }
                    		                                                        }
                    		                                                    }, DateTextBox), editor({
                    		                                                        label : this.message("pub.status"),
                    		                                                        field : "p.cgghPub:publicationStatus",
                    		                                                        autoSave : true,
                    		                                                        editorArgs : {
                    		                                                            options : [
                    		                                                                    {
                    		                                                                        label : this.message("pub.analysis"),
                    		                                                                        value : "analysis"
                    		                                                                    }, {
                    		                                                                        label : this.message("pub.draft"),
                    		                                                                        value : "draft"
                    		                                                                    }, {
                    		                                                                        label : this.message("pub.underDiscussion"),
                    		                                                                        value : "under discussion"
                    		                                                                    }, {
                    		                                                                        label : this.message("pub.submitted"),
                    		                                                                        value : "submitted"
                    		                                                                    }, {
                    		                                                                        label : this.message("pub.re-draft"),
                    		                                                                        value : "re-draft"
                    		                                                                    }, {
                    		                                                                        label : this.message("pub.rejected"),
                    		                                                                        value : "rejected"
                    		                                                                    }, {
                    		                                                                        label : this.message("pub.re-submitted"),
                    		                                                                        value : "re-submitted"
                    		                                                                    }, {
                    		                                                                        label : this.message("pub.stalled"),
                    		                                                                        value : "stalled"
                    		                                                                    }
                    		                                                            ]
                    		                                                        }
                    		                                                    }, Select), editor({
                    		                                                        label : this.message("pub.pmc"),
                    		                                                        field : "p.cgghPub:depositedPMC",
                    		                                                        autoSave : true,
                    		                                                        editor : "checkbox",
                    		                                                        get : function(rowData) {
                    		                                                            var d1 = rowData["p.cgghPub:depositedPMC"];
                    		                                                            if (d1 == null) {
                    		                                                                return false;
                    		                                                            }
                    		                                                            var date1 = d1[0];
                    		                                                            return (date1);
                    		                                                        }
                    		                                                    })
                    		                                            ]
                    		                                        }, this.cggh_pub_table);
                    		                                this.grid.startup();
                    								} catch (e) {
                    								}                     
                    							},
                    							scope: this
                    						},
                     
                    						failureCallback:
                    						{
                    							fn: function(response)
                    							{
                    							},
                    							scope: this
                    						}
                    					});
                               

                                /*
                                dataStore.comparatorMap = {};

                                dataStore.comparatorMap["IncTotalValue"] = function(a, b) {
                                        a = parseFloat(a);
                                        b = parseFloat(b);
                                        return (a - b);
                                };
                                */

                            

                                this.inherited(arguments);
                            } catch (err) {
                                //console.log(err);
                            }

                        }
                    });
        });
