/**
 * Document Browse and Details page email actions
 *
 * @author ecmstuff.blogspot.com
 */
(function() {
    /**
     * Send email with document as attachment by calling Web Script
     *
     * @method onActionSendEmail
     * @param file the file to be sent with email (Object Literal)
     */
    YAHOO.Bubbling.fire("registerAction",
    {
        actionName: "onActionSendAsEmail",
        fn: function cggh_onActionSendAsEmail(file) {
            this.modules.actions.genericAction(
            {
                success:
                {
                    message: this.msg("message.sendAsEmail.success", file.displayName, Alfresco.constants.USERNAME)
                },
                failure:
                {
                    message: this.msg("message.sendAsEmail.failure", file.displayName, Alfresco.constants.USERNAME)
                },
                webscript:
                {
                    name: "cggh/sendDocInEmail?nodeRef={nodeRef}&userName={userName}",
                    stem: Alfresco.constants.PROXY_URI,
                    method: Alfresco.util.Ajax.GET,
                    params:
                    {
                        nodeRef: file.nodeRef,
                        userName: Alfresco.constants.USERNAME
                    }
                },
                config:
                {
                }

            });
        }
    });
})();