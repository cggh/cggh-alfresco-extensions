if (typeof Cggh == "undefined" || !Cggh)
{
    var Cggh =
    {};
    Cggh.documentLibrary =
    {};
}

(function()
{
    if (Alfresco.DocumentList)
    {
        var $html = Alfresco.util.encodeHTML, $isValueSet = Alfresco.util.isValueSet;

        Cggh.documentLibrary.Collaborations = function Cggh_documentLibrary_Collaborations_constructor(htmlId)
        {
            Cggh.documentLibrary.Collaborations.superclass.constructor.call(this,
                    "Cggh.documentLibrary.Collaborations", htmlId, []);

            /**
             * Register this component
             */
            Alfresco.util.ComponentManager.register(this);
            YAHOO.Bubbling.subscribe("collaborationsUpdated", this.updateLiaison, this);
            YAHOO.Bubbling.subscribe("complete", this.onFolderChanged, this);
            YAHOO.Bubbling.subscribe("folderRenamed", this.onFolderChanged, this);
            // Hack to make me go first
            var subs = YAHOO.Bubbling.bubble["folderRenamed"].subscribers;
            var me = subs.pop();
            subs.unshift(me);
            YAHOO.Bubbling.bubble["folderRenamed"].subscribers = subs;

            this.collaborations = [];
            this.nodesToUpdate = [];
            this.reloading = false;

            return this;
        };

        YAHOO.extend(Cggh.documentLibrary.Collaborations, Alfresco.component.Base,
        {
            /**
             * Fired by YUI when parent element is available for scripting
             * 
             * @method onReady
             */
            onReady : function Collaborations_onReady()
            {
                // Load collaborations & preferences
                this.loadCollaborations();
            },
            /**
             * File or folder renamed event handler
             * 
             * @method onFileRenamed
             * @param layer
             *            {object} Event fired
             * @param args
             *            {array} Event parameters (depends on event type)
             */
            onFolderChanged : function Collaborations_onFolderChanged(layer, args)
            {
                // Load collaborations & preferences
                this.reloading = true;
                this.loadCollaborations();
            },
            isInLookup : function Collaborations_isLookup()
            {
                return this.reloading;
            },
            updateLiaison : function Collaborations_updateLiaison(layer, args)
            {
                var nodeToUpdate;
                while ((nodeToUpdate = this.nodesToUpdate.pop()))
                {   
                    var collab = this.getCollaboration(nodeToUpdate.nodeName);
                    var content = '';
                    if (collab.liaison)
                    {
                        content = collab.liaison.firstName + ' ' + collab.liaison.lastName;
                    }
                    var node = YAHOO.util.Dom.get(nodeToUpdate.id);
                    if (node != null) {
                        var newNode = new YAHOO.util.Element(content);
                        node.appendChild(document.createTextNode(content));
                    }
                }
            },
            loadCollaborations : function Collaborations_loadCollaborations()
            {
                // Load collaborations
                Alfresco.util.Ajax.request(
                {
                    // url: Alfresco.constants.PROXY_URI + "api/people/" +
                    // encodeURIComponent(Alfresco.constants.USERNAME) +
                    // "/sites?roles=user&size=" + this.options.listSize,
                    url : Alfresco.constants.PROXY_URI + "cggh/collaborations",
                    successCallback :
                    {
                        fn : this.onCollaborationsLoaded,
                        scope : this
                    }
                });
            },
            onCollaborationsLoaded : function Collaborations_onCollaborationsLoaded(p_response)
            {
                this.collaborations = p_response.json.collaborationNodes;
                this.reloading = false;
                //Now we can redraw the nodes that were drawn while we were loading
                YAHOO.Bubbling.fire("collaborationsUpdated");
            },
            getCollaboration : function Collaborations_getCollaboration(nodeName)
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
            },
            setLiaisonRefresh : function Collaborations_setLiaisonRefresh(nodeName, id, label)
            {
                var update =
                {
                    'nodeName' : nodeName,
                    'id' : id,
                    'label' : label
                };
                this.nodesToUpdate.push(update);
            },

        });

        // Typically this would be done in the ftl for the page
        var cggh_collab = new Cggh.documentLibrary.Collaborations(Alfresco.util.generateDomId())
                .setMessages(Alfresco.messages);
        cggh_collab.onReady();

        // This doesn't work as part of Cggh.documentLibrary.Collaborations
        var renderLiaison = function cggh_renderLiaison(record, label)
        {
            var jsNode = record.jsNode, properties = jsNode.properties, id = Alfresco.util.generateDomId(), content = "";

            var nodeName = properties['cm:name'];
            if (!cggh_collab.isInLookup())
            {
                var collab = cggh_collab.getCollaboration(nodeName);
                if (collab.liaison)
                {
                    content = collab.liaison.firstName + ' ' + collab.liaison.lastName;
                }
            } else
            {
                cggh_collab.setLiaisonRefresh(nodeName, id, label);
            }
            return '<span id="' + id + '" class="item">' + label + content + '</span>';
        }
        YAHOO.Bubbling.fire("registerRenderer",
        {
            propertyName : "cggh_liaison",
            renderer : renderLiaison
        });

        var renderContacts = function cggh_renderContacts(record, label)
        {
            var jsNode = record.jsNode, properties = jsNode.properties, id = Alfresco.util.generateDomId(), content = "";

            var nodeValues = properties['cggh_contacts'];

            if (nodeValues)
            {
                content = nodeValues.join(', ');
            }
            return '<span id="' + id + '" class="item">' + label + content + '</span>';
        }
        YAHOO.Bubbling.fire("registerRenderer",
        {
            propertyName : "cggh_contacts",
            renderer : renderContacts
        });

        var renderCountries = function cggh_renderCountries(record, label)
        {
            var jsNode = record.jsNode, properties = jsNode.properties, id = Alfresco.util.generateDomId(), content = "";

            var nodeValues = properties['cggh_sampleCountry'];

            if (nodeValues)
            {
                content = nodeValues.join(', ');
            }
            return '<span id="' + id + '" class="item">' + label + content + '</span>';
        }
        YAHOO.Bubbling.fire("registerRenderer",
        {
            propertyName : "cggh_sampleCountry",
            renderer : renderCountries
        });

        var renderSpecies = function cggh_renderSpecies(record, label)
        {
            var jsNode = record.jsNode, properties = jsNode.properties, id = Alfresco.util.generateDomId(), content = "";

            var nodeValues = properties['cggh_species'];

            if (nodeValues)
            {
                content = nodeValues.join(', ');
            }
            return '<span id="' + id + '" class="item">' + label + content + '</span>';
        }
        YAHOO.Bubbling.fire("registerRenderer",
        {
            propertyName : "cggh_species",
            renderer : renderSpecies
        });
        // YAHOO.widget.Logger.enableBrowserConsole();

        /*
         * var myConfigs = { width: "250px", right: "10em", top: "10%",
         * fontSize: "80%" }; var myContainer = null; var myLogReader = new
         * YAHOO.widget.LogReader(myContainer, myConfigs);
         * myLogReader.hideSource("LogReader");
         * myLogReader.hideSource("global"); myLogReader.hideSource("Dom");
         * myLogReader.hideSource("Config");
         * myLogReader.hideSource("DragDropMgr"); myLogReader.hideSource("DD");
         */
    }
})();