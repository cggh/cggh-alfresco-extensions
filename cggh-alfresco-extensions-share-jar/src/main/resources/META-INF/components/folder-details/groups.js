/**
 * FolderGroups
 *
 * @namespace Cggh
 * @class Cggh.FolderGroups
 */
   if (typeof Cggh == "undefined" || !Cggh)
   {
     var Cggh = {};
   }
(function() {
    /**
     * YUI Library aliases
     */
    var Dom = YAHOO.util.Dom, Event = YAHOO.util.Event;

    /**
     * FolderGroups constructor.
     *
     * @param {String} htmlId The HTML id of the parent element
     * @return {Cggh.FolderGroups} The new FolderGroups instance
     * @constructor
     */
    Cggh.FolderGroups = function FolderGroups_constructor(htmlId) {
        Cggh.FolderGroups.superclass.constructor.call(this, "Cggh.FolderGroups", htmlId);

        // Decoupled event listeners
        YAHOO.Bubbling.on("metadataRefresh", this.doRefresh, this);

        return this;
    };
    YAHOO.extend(Cggh.FolderGroups, Alfresco.component.Base, {

        /**
         * Object container for initialization options
         *
         * @property options
         * @type object
         */
        options : {
            /**
             * The nodeRefs to load the form for.
             *
             * @property nodeRef
             * @type string
             * @required
             */
            nodeRef : null,

            /**
             * The current site (if any)
             *
             * @property site
             * @type string
             */
            site : null,

            /**
             * The form id for the form to use.
             *
             * @property destination
             * @type string
             */
            formId : null
        },
        /**
         * Fired by YUI when parent element is available for scripting.
         * Template initialisation, including instantiation of YUI widgets and event listener binding.
         *
         * @method onReady
         */
        onReady : function FolderGroups_onReady() {
            // Load the form
            Alfresco.util.Ajax.jsonGet({
                url : Alfresco.constants.PROXY_URI + "cggh/collaborations",
                dataObj : {
                    nodeRef : this.options.nodeRef
                },
                successCallback : {
                    fn : this.onFormLoaded,
                    scope : this
                },
                failureMessage : this.msg("message.failure"),
                scope : this,
                execScripts : true
            });
        },
        /**
         * Called when a workflow form has been loaded.
         * Will insert the form in the Dom.
         *
         * @method onFormLoaded
         * @param response {Object}
         */
        onFormLoaded : function FolderGroups_onFormLoaded(response) {
            var items = ["PI", "Contact", "Public", "Mail", "Data", "NotPublic"];
            var collab = response.json.collaborationNodes[0];
            for (var i = 0; i < items.length; i++) {
                var formEl = Dom.get(this.id + "-" + items[i] + "Container");
                var peeps = collab["group" + items[i]];
                var out = '';
                for (var j=0;j< peeps.length; j++) {
                    out += peeps[j].firstName + ' ' + peeps[j].lastName + ',' + peeps[j].email + '<br/>';  
                }
                formEl.innerHTML += out;
            }
            
        },

        /**
         * Refresh component in response to metadataRefresh event
         *
         * @method doRefresh
         */
        doRefresh : function FolderGroups_doRefresh() {
            YAHOO.Bubbling.unsubscribe("metadataRefresh", this.doRefresh, this);
            this.refresh('components/folder-details/groups?nodeRef={nodeRef}' + (this.options.site ? '&site={site}' : '')
                    + (this.options.formId ? '&formId={formId}' : ''));
        }
    });

})();
