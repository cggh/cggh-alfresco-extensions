define([
        "dojo/_base/declare", "dojo/_base/lang", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/dom", "dojo/dom-construct",
        "cggh/cmis/store/CmisStore", "dgrid/OnDemandGrid", "dojo/text!./List.html", "alfresco/core/Core"
], function(declare, lang, _Widget, _Templated, dom, domConstruct, CmisStore, dgrid, template, Core) {
    return declare([
            _Widget, _Templated, Core
    ], {
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
        postCreate : function cggh_publications_List_postCreate() {
            try {

                var targetRoot;
                targetRoot = "https://localhost/alfresco/api/-default-/public/cmis/versions/1.1/browser",
                        this.testFolder = '/Sites/pct/documentLibrary/Draft';
                //                targetRoot = "https://alfresco4.cggh.org:8443/alfresco/api/-default-/public/cmis/versions/1.1/browser",

                this.cmisStore = new CmisStore({
                    base : targetRoot,
                    succinct : true
                });

               
                /*
                dataStore.comparatorMap = {};

                dataStore.comparatorMap["IncTotalValue"] = function(a, b) {
                        a = parseFloat(a);
                        b = parseFloat(b);
                        return (a - b);
                };
                */

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
                                return '<a href="' + Alfresco.constants.URL_PAGECONTEXT + 'edit-metadata?nodeRef=' + data['alfcmis:nodeRef'] + '">' + text + '</a>';
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
                this.grid = new dgrid({
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
                            }, {
                                label : this.message("pub.type"),
                                field : "p.cgghPub:type",
                                formatter : formatFunction
                            }, {
                                label : this.message("pub.lead"),
                                field : "p.cgghPub:lead",
                                formatter : formatFunction
                            }, {
                                label : this.message("pub.category"),
                                field : "p.cgghPub:category",
                                formatter : formatFunction
                            }, {
                                label : this.message("pub.schedule"),
                                field : "p.cgghPub:onProdSchedule",
                                formatter : formatFunction
                            }, {
                                label : this.message("pub.title"),
                                field : "t.cm:title",
                                formatter : formatFunction
                            },
                            /** Requires 4.3?
                            {
                                label : this.message("pub.contact"),
                                field : "p.cgghPub:leadContact",
                                formatter : formatFunction
                            }, */
                            {
                                label : this.message("pub.funding"),
                                field : "p.cgghPub:fundingCodes",
                                formatter : formatFunction
                            }, {
                                label : this.message("pub.review"),
                                field : "p.cgghPub:submittedPubComm",
                                formatter : formatFunction
                            }, {
                                label : this.message("pub.review-dk"),
                                field : "p.cgghPub:reviewedDK",
                                formatter : formatFunction
                            }, {
                                label : this.message("pub.submitted.journal"),
                                field : "p.cgghPub:submittedJournal",
                                formatter : formatFunction
                            }, {
                                label : this.message("pub.submitted.date"),
                                field : "p.cgghPub:submittedDate",
                                formatter : formatFunction
                            }, {
                                label : this.message("pub.status"),
                                field : "p.cgghPub:publicationStatus",
                                formatter : formatFunction
                            }, {
                                label : this.message("pub.pmc"),
                                field : "p.cgghPub:depositedPMC",
                                formatter : formatFunction
                            }
                    ]
                }, this.cggh_pub_table);
                this.grid.startup();

                this.inherited(arguments);
            } catch (err) {
                //console.log(err);
            }

        }
    });
});
