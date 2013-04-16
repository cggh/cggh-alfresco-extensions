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
 * Document Library Actions module
 *
 * @namespace Alfresco.doclib
 * @class Alfresco.doclib.Actions
 */
(function()
{
   /**
    * Alfresco Slingshot aliases
    */
   var $html = Alfresco.util.encodeHTML,
      $combine = Alfresco.util.combinePaths,
      $siteURL = Alfresco.util.siteURL,
      $isValueSet = Alfresco.util.isValueSet;

   /**
    * Alfresco.doclib.Actions implementation
    */
   Alfresco.doclib.Actions = {};
   Alfresco.doclib.Actions.prototype =
   {
      /**
       * Current actions view type: set by owning class to "browse" or "details".
       *
       * @property actionsView
       * @type string
       */
      actionsView: null,

      /**
       * Register a Document Library action via Bubbling event
       *
       * @method onRegisterAction
       * @param layer {object} Event fired (unused)
       * @param args {array} Event parameters (actionName, fn)
       */
      onRegisterAction: function dlA_onRegisterAction(layer, args)
      {
         var obj = args[1];
         if (obj && $isValueSet(obj.actionName) && $isValueSet(obj.fn))
         {
            this.registerAction(obj.actionName, obj.fn);
         }
         else
         {
            Alfresco.logger.error("DL_onRegisterAction: Custom action registion invalid: " + obj);
         }
      },

      /**
       * Register a Document Library action
       *
       * @method registerAction
       * @param actionName {string} Action name
       * @param fn {function} Handler function
       * @return {boolean} Success status of registration
       */
      registerAction: function DL_registerAction(actionName, fn)
      {
         if ($isValueSet(actionName) && $isValueSet(fn))
         {
            this.constructor.prototype[actionName] = fn;
            return true;
         }
         return false;
      },

      /**
       * Renders a single action for a given record.
       * Callers should then use
       * <pre>
       *    YAHOO.lang.substitute(actionHTML, this.getActionUrls(record))
       * </pre>
       * on the final concatenated HTML for multiple actions to populate placeholder URLs.
       *
       * @method renderAction
       * @param p_action {object} Object literal representing the node
       * @param p_record {string} Optional siteId override for site-based locations
       * @return {string} HTML containing action markup
       */
      renderAction: function dlA_renderAction(p_action, p_record)
      {
         var urlContext = Alfresco.constants.URL_RESCONTEXT + "components/documentlibrary/actions/",
           iconStyle = 'style="background-image:url(' + urlContext + '{icon}-16.png)" ',
           actionTypeMarkup =
           {
              "link": '<div class="{id}"><a title="{label}" class="simple-link" href="{href}" ' + iconStyle + '{target}><span>{label}</span></a></div>',
              "pagelink": '<div class="{id}"><a title="{label}" class="simple-link" href="{pageUrl}" ' + iconStyle + '><span>{label}</span></a></div>',
              "javascript": '<div class="{id}" title="{jsfunction}"><a title="{label}" class="action-link" href="#"' + iconStyle + '><span>{label}</span></a></div>'
           };
      
         // Store quick look-up for client-side actions
         p_record.actionParams[p_action.id] = p_action.params;
         
         var markupParams =
         {
            "id": p_action.id,
            "icon": p_action.icon,
            "label": Alfresco.util.substituteDotNotation(this.msg(p_action.label), p_record)
         };
         
         // Parameter substitution for each action type
         if (p_action.type === "link")
         {
            if (p_action.params.href)
            {
               markupParams.href = Alfresco.util.substituteDotNotation(p_action.params.href, p_record);
               markupParams.target = p_action.params.target ? "target=\"" + p_action.params.target + "\"" : "";
            }
            else
            {
               Alfresco.logger.warn("Action configuration error: Missing 'href' parameter for actionId: ", p_action.id);
            }
         }
         else if (p_action.type === "pagelink")
         {
            if (p_action.params.page)
            {
               var recordSiteName = $isValueSet(p_record.location.site) ? p_record.location.site.name : null;
               markupParams.pageUrl = $siteURL(Alfresco.util.substituteDotNotation(p_action.params.page, p_record),
               {
                  site: recordSiteName
               });
            }
            else
            {
               Alfresco.logger.warn("Action configuration error: Missing 'page' parameter for actionId: ", p_action.id);
            }
         }
         else if (p_action.type === "javascript")
         {
            if (p_action.params["function"])
            {
               markupParams.jsfunction = p_action.params["function"];
            }
            else
            {
               Alfresco.logger.warn("Action configuration error: Missing 'function' parameter for actionId: ", p_action.id);
            }
         }

         return YAHOO.lang.substitute(actionTypeMarkup[p_action.type], markupParams);
      },

      /**
       * The urls to be used when creating links in the action cell
       *
       * @method getActionUrls
       * @param recordData {object} Object literal representing the node
       * @param siteId {string} Optional siteId override for site-based locations
       * @return {object} Object literal containing URLs to be substituted in action placeholders
       */
      getActionUrls: function dlA_getActionUrls(record, siteId)
      {
         var jsNode = record.jsNode,
            nodeRef = jsNode.isLink ? jsNode.linkedNode.nodeRef : jsNode.nodeRef,
            strNodeRef = nodeRef.toString(),
            nodeRefUri = nodeRef.uri,
            contentUrl = jsNode.contentURL,
            workingCopy = record.workingCopy || {},
            recordSiteId = $isValueSet(record.location.site) ? record.location.site.name : null,
            fnPageURL = Alfresco.util.bind(function(page)
            {
               return Alfresco.util.siteURL(page,
               {
                  site: YAHOO.lang.isString(siteId) ? siteId : recordSiteId
               });
            }, this),
            actionUrls =
            {
               downloadUrl: $combine(Alfresco.constants.PROXY_URI, contentUrl) + "?a=true",
               viewUrl:  $combine(Alfresco.constants.PROXY_URI, contentUrl) + "\" target=\"_blank",
               documentDetailsUrl: fnPageURL("document-details?nodeRef=" + strNodeRef),
               folderDetailsUrl: fnPageURL("folder-details?nodeRef=" + strNodeRef),
               editMetadataUrl: fnPageURL("edit-metadata?nodeRef=" + strNodeRef),
               inlineEditUrl: fnPageURL("inline-edit?nodeRef=" + strNodeRef),
               managePermissionsUrl: fnPageURL("manage-permissions?nodeRef=" + strNodeRef),
               manageTranslationsUrl: fnPageURL("manage-translations?nodeRef=" + strNodeRef),
               workingCopyUrl: fnPageURL("document-details?nodeRef=" + (workingCopy.workingCopyNodeRef || strNodeRef)),
               workingCopySourceUrl: fnPageURL("document-details?nodeRef=" + (workingCopy.sourceNodeRef || strNodeRef)),
               viewGoogleDocUrl: workingCopy.googleDocUrl + "\" target=\"_blank",
               explorerViewUrl: $combine(this.options.repositoryUrl, "/n/showSpaceDetails/", nodeRefUri) + "\" target=\"_blank"
            };
         
         actionUrls.sourceRepositoryUrl = this.viewInSourceRepositoryURL(record, actionUrls) + "\" target=\"_blank";

         return actionUrls;
      },


      /**
       * Helper for actions of type "javascript" to get the node's action descriptor with params resolved (unless resolve is set to false).
       *
       * @method getAction
       * @param record {object} Object literal representing one file or folder to be actioned
       * @param owner {HTMLElement} The action html element
       * @param resolve {Boolean} (Optional) Set to false if the action param's {} shouldn't get resolved
       */
      getAction: function dlA_getAction(record, owner, resolve)
      {
         var actionId = owner.className,
            action = Alfresco.util.findInArray(record.actions, actionId, "id") || {};

         if (resolve === false)
         {
            // Return action without resolved parameters
            return action;
         }
         else
         {
            // Resolve action's parameters before returning them
            action = Alfresco.util.deepCopy(action);
            var params = action.params || {};
            for (var key in params)
            {
               params[key] = YAHOO.lang.substitute(params[key], record, function getActionParams_substitute(p_key, p_value, p_meta)
               {
                  return Alfresco.util.findValueByDotNotation(record, p_key);
               });
            }
            return action;
         }
      },

      /**
       * Tries to get a common parent nodeRef for an action that requires one.
       *
       * @method getParentNodeRef
       * @param record {object} Object literal representing one file or folder to be actioned
       * @return {string|null} Parent nodeRef or null
       */
      getParentNodeRef: function dlA_getParentNodeRef(record)
      {
         var nodeRef = null;

         if (YAHOO.lang.isArray(record))
         {
            try
            {
               nodeRef = this.doclistMetadata.parent.nodeRef;
            }
            catch (e)
            {
               nodeRef = null;
            }

            if (nodeRef === null)
            {
               for (var i = 1, j = record.length, sameParent = true; i < j && sameParent; i++)
               {
                  sameParent = (record[i].parent.nodeRef == record[i - 1].parent.nodeRef)
               }

               nodeRef = sameParent ? record[0].parent.nodeRef : this.doclistMetadata.container;
            }
         }
         else
         {
            nodeRef = record.parent.nodeRef;
         }

         return nodeRef;
      },

      /**
       * Record metadata.
       *
       * @override
       * @method onActionDetails
       * @param record {object} Object literal representing one file or folder to be actioned
       */
      onActionDetails: function dlA_onActionDetails(record)
      {
         var scope = this,
            nodeRef = record.nodeRef,
            jsNode = record.jsNode;

         // Intercept before dialog show
         var doBeforeDialogShow = function dlA_onActionDetails_doBeforeDialogShow(p_form, p_dialog)
         {
            // Dialog title
            var fileSpan = '<span class="light">' + $html(record.displayName) + '</span>';

            Alfresco.util.populateHTML(
               [ p_dialog.id + "-dialogTitle", scope.msg("edit-details.title", fileSpan) ]
            );

            // Edit metadata link button
            this.widgets.editMetadata = Alfresco.util.createYUIButton(p_dialog, "editMetadata", null,
            {
               type: "link",
               label: scope.msg("edit-details.label.edit-metadata"),
               href: $siteURL("edit-metadata?nodeRef=" + nodeRef)
            });
         };

         var templateUrl = YAHOO.lang.substitute(Alfresco.constants.URL_SERVICECONTEXT + "components/form?itemKind={itemKind}&itemId={itemId}&destination={destination}&mode={mode}&submitType={submitType}&formId={formId}&showCancelButton=true",
         {
            itemKind: "node",
            itemId: nodeRef,
            mode: "edit",
            submitType: "json",
            formId: "doclib-simple-metadata"
         });

         // Using Forms Service, so always create new instance
         var editDetails = new Alfresco.module.SimpleDialog(this.id + "-editDetails-" + Alfresco.util.generateDomId());

         editDetails.setOptions(
         {
            width: "40em",
            templateUrl: templateUrl,
            actionUrl: null,
            destroyOnHide: true,
            doBeforeDialogShow:
            {
               fn: doBeforeDialogShow,
               scope: this
            },
            onSuccess:
            {
               fn: function dlA_onActionDetails_success(response)
               {
                  // Reload the node's metadata
                  Alfresco.util.Ajax.request(
                  {
                     url: $combine(Alfresco.constants.URL_SERVICECONTEXT, "components/documentlibrary/data/node/", jsNode.nodeRef.uri) + "?view=" + this.actionsView,
                     successCallback:
                     {
                        fn: function dlA_onActionDetails_refreshSuccess(response)
                        {
                           var record = response.json.item
                           record.jsNode = new Alfresco.util.Node(response.json.item.node);

                           // Fire "renamed" event
                           YAHOO.Bubbling.fire(record.node.isContainer ? "folderRenamed" : "fileRenamed",
                           {
                              file: record
                           });

                           // Fire "tagRefresh" event
                           YAHOO.Bubbling.fire("tagRefresh");

                           // Display success message
                           Alfresco.util.PopupManager.displayMessage(
                           {
                              text: this.msg("message.details.success")
                           });
                        },
                        scope: this
                     },
                     failureCallback:
                     {
                        fn: function dlA_onActionDetails_refreshFailure(response)
                        {
                           Alfresco.util.PopupManager.displayMessage(
                           {
                              text: this.msg("message.details.failure")
                           });
                        },
                        scope: this
                     }
                  });
               },
               scope: this
            },
            onFailure:
            {
               fn: function dLA_onActionDetails_failure(response)
               {
                  Alfresco.util.PopupManager.displayMessage(
                  {
                     text: this.msg("message.details.failure")
                  });
               },
               scope: this
            }
         }).show();
      },

      /**
       * Locate record.
       *
       * @method onActionLocate
       * @param record {object} Object literal representing one file or folder to be actioned
       */
      onActionLocate: function dlA_onActionLocate(record)
      {
         var jsNode = record.jsNode,
            path = record.location.path,
            file = jsNode.isLink ? jsNode.linkedNode.properties.name : record.displayName,
            recordSiteName = $isValueSet(record.location.site) ? record.location.site.name : null;
         
         if ($isValueSet(this.options.siteId) && recordSiteName !== this.options.siteId)
         {
            window.location = $siteURL((recordSiteName === null ? "repository" : "documentlibrary") + "?file=" + encodeURIComponent(file) + "&path=" + encodeURIComponent(path),
            {
               site: recordSiteName
            });
         }
         else
         {
            this.options.highlightFile = file;
            
            // Change active filter to path
            YAHOO.Bubbling.fire("changeFilter",
            {
               filterId: "path",
               filterData: path
            });
         }
      },

      /**
       * Delete record.
       *
       * @method onActionDelete
       * @param record {object} Object literal representing the file or folder to be actioned
       */
      onActionDelete: function dlA_onActionDelete(record)
      {
         var me = this,
            jsNode = record.jsNode;

         Alfresco.util.PopupManager.displayPrompt(
         {
            title: this.msg("actions." + (jsNode.isContainer ? "folder" : "document") + ".delete"),
            text: this.msg("message.confirm.delete", record.displayName),
            buttons: [
            {
               text: this.msg("button.delete"),
               handler: function dlA_onActionDelete_delete()
               {
                  this.destroy();
                  me._onActionDeleteConfirm.call(me, record);
               }
            },
            {
               text: this.msg("button.cancel"),
               handler: function dlA_onActionDelete_cancel()
               {
                  this.destroy();
               },
               isDefault: true
            }]
         });
      },

      /**
       * Delete record confirmed.
       *
       * @method _onActionDeleteConfirm
       * @param record {object} Object literal representing the file or folder to be actioned
       * @private
       */
      _onActionDeleteConfirm: function dlA__onActionDeleteConfirm(record)
      {
         var jsNode = record.jsNode,
            path = record.location.path,
            fileName = record.location.file,
            filePath = $combine(path, fileName),
            displayName = record.displayName,
            nodeRef = jsNode.nodeRef;

         this.modules.actions.genericAction(
         {
            success:
            {
               activity:
               {
                  siteId: this.options.siteId,
                  activityType: "file-deleted",
                  page: "documentlibrary",
                  activityData:
                  {
                     fileName: fileName,
                     path: path,
                     nodeRef: nodeRef.toString()
                  }
               },
               event:
               {
                  name: jsNode.isContainer ? "folderDeleted" : "fileDeleted",
                  obj:
                  {
                     path: filePath
                  }
               },
               message: this.msg("message.delete.success", displayName)
            },
            failure:
            {
               message: this.msg("message.delete.failure", displayName)
            },
            webscript:
            {
               method: Alfresco.util.Ajax.DELETE,
               name: "file/node/{nodeRef}",
               params:
               {
                  nodeRef: nodeRef.uri
               }
            }
         });
      },

      /**
       * Edit Offline.
       * NOTE: Placeholder only, clients MUST implement their own editOffline action
       *
       * @method onActionEditOffline
       * @param record {object} Object literal representing the file or folder to be actioned
       */
      onActionEditOffline: function dlA_onActionEditOffline(record)
      {
         Alfresco.logger.error("onActionEditOffline", "Abstract implementation not overridden");
      },

      /**
       * Valid online edit mimetypes, mapped to application ProgID.
       * Currently allowed are Microsoft Office 2003 and 2007 mimetypes for Excel, PowerPoint and Word only
       *
       * @property onlineEditMimetypes
       * @type object
       */
      onlineEditMimetypes:
      {
         "application/vnd.ms-excel": "Excel.Sheet",
         "application/vnd.ms-powerpoint": "PowerPoint.Slide",
         "application/msword": "Word.Document",
         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel.Sheet",
         "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PowerPoint.Slide",
         "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word.Document"
      },

      /**
       * Edit Online.
       *
       * @method onActionEditOnline
       * @param record {object} Object literal representing file or folder to be actioned
       */
      onActionEditOnline: function dlA_onActionEditOnline(record)
      {
         if (this._launchOnlineEditor(record))
         {
            YAHOO.Bubbling.fire("metadataRefresh");
         }
      },

      /**
       * Opens the appropriate Microsoft Office application for online editing.
       * Supports: Microsoft Office 2003, 2007 & 2010.
       *
       * @method Alfresco.util.sharePointOpenDocument
       * @param record {object} Object literal representing file or folder to be actioned
       * @return {boolean} True if the action was completed successfully, false otherwise.
       */
      _launchOnlineEditor: function dlA__launchOnlineEditor(record)
      {
         var controlProgID = "SharePoint.OpenDocuments",
            jsNode = record.jsNode,
            loc = record.location,
            mimetype = jsNode.mimetype,
            appProgID = null,
            activeXControl = null,
            extensionMap =
            {
               xls: "application/vnd.ms-excel",
               ppt: "application/vnd.ms-powerpoint",
               doc: "application/msword",
               xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
               pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
               docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            };

         // Try to resolve the record to an application ProgID; by mimetype first, then file extension.
         if (this.onlineEditMimetypes.hasOwnProperty(mimetype))
         {
            appProgID = this.onlineEditMimetypes[mimetype];
         }
         else
         {
            var extn = Alfresco.util.getFileExtension(record.location.file);
            if (extn !== null)
            {
               extn = extn.toLowerCase();
               if (extensionMap.hasOwnProperty(extn))
               {
                  mimetype = extensionMap[extn];
                  if (this.onlineEditMimetypes.hasOwnProperty(mimetype))
                  {
                     appProgID = this.onlineEditMimetypes[mimetype];
                  }
               }
            }
         }

         if (appProgID !== null)
         {
            // Ensure we have the record's onlineEditUrl populated
            if (!$isValueSet(record.onlineEditUrl))
            {
               var onlineEditUrl = this.doclistMetadata.custom.vtiServer.host + ":" +
                     this.doclistMetadata.custom.vtiServer.port + "/" +
                     $combine("alfresco", loc.site.name, loc.container.name, loc.path, loc.file);

               if (!(/^(http|https):\/\//).test(onlineEditUrl))
               {
                  // VTI server now supports HTTPS directly http://issues.alfresco.com/jira/browse/DOC-227
                  onlineEditUrl = window.location.protocol + "//" + onlineEditUrl;
               }
               record.onlineEditUrl = onlineEditUrl;
            }

            if (YAHOO.env.ua.ie > 0)
            {
               return this._launchOnlineEditorIE(controlProgID, record, appProgID);
            }
            
            if (Alfresco.util.isSharePointPluginInstalled())
            {
               return this._launchOnlineEditorPlugin(record, appProgID);
            }
            else
            {
               Alfresco.util.PopupManager.displayPrompt(
               {
                  text: this.msg("actions.editOnline.failure", loc.file)
               });
               return false;
            }
         }

         // No success in launching application via ActiveX control; launch the WebDAV URL anyway
         return window.open(record.onlineEditUrl, "_blank");
      },

      /**
       * Opens the appropriate Microsoft Office application for online editing.
       * Supports: Microsoft Office 2003, 2007 & 2010.
       *
       * @method Alfresco.util.sharePointOpenDocument
       * @param record {object} Object literal representing file or folder to be actioned
       * @return {boolean} True if the action was completed successfully, false otherwise.
       */
      _launchOnlineEditorIE: function dlA__launchOnlineEditorIE(controlProgID, record, appProgID)
      {
         // Try each version of the SharePoint control in turn, newest first
         try
         {
            activeXControl = new ActiveXObject(controlProgID + ".3");
            return activeXControl.EditDocument3(window, record.onlineEditUrl, true, appProgID);
         }
         catch(e)
         {
            try
            {
               activeXControl = new ActiveXObject(controlProgID + ".2");
               return activeXControl.EditDocument2(window, record.onlineEditUrl, appProgID);
            }
            catch(e1)
            {
               try
               {
                  activeXControl = new ActiveXObject(controlProgID + ".1");
                  return activeXControl.EditDocument(record.onlineEditUrl, appProgID);
               }
               catch(e2)
               {
                  // Do nothing
               }
            }
         }
         return false;
      },

      /**
       * Opens the appropriate Microsoft Office application for online editing.
       * Supports: Microsoft Office 2010 & 2011 for Mac.
       *
       * @method Alfresco.util.sharePointOpenDocument
       * @param record {object} Object literal representing file or folder to be actioned
       * @return {boolean} True if the action was completed successfully, false otherwise.
       */
      _launchOnlineEditorPlugin: function dlA__launchOnlineEditorPlugin(record, appProgID)
      {
         var plugin = document.getElementById("SharePointPlugin");
         if (plugin == null && Alfresco.util.isSharePointPluginInstalled())
         {
            var pluginMimeType = null;
            if (YAHOO.env.ua.webkit && Alfresco.util.isBrowserPluginInstalled("application/x-sharepoint-webkit"))
               pluginMimeType = "application/x-sharepoint-webkit";
            else
               pluginMimeType = "application/x-sharepoint";
            var pluginNode = document.createElement("object");
            pluginNode.id = "SharePointPlugin";
            pluginNode.type = pluginMimeType;
            pluginNode.width = 0;
            pluginNode.height = 0;
            pluginNode.style.setProperty("visibility", "hidden", "");
            document.body.appendChild(pluginNode);
            plugin = document.getElementById("SharePointPlugin");
            
            if (!plugin)
            {
               return false;
            }
         }
         
         try
         {
            return plugin.EditDocument3(window, record.onlineEditUrl, true, appProgID);
         }
         catch(e)
         {
            try
            {
               return plugin.EditDocument2(window, record.onlineEditUrl, appProgID);
            }
            catch(e1)
            {
               try
               {
                  return plugin.EditDocument(record.onlineEditUrl, appProgID);
               }
               catch(e2)
               {
                  return false;
               }
            }
         }
      },

      /**
       * Checkout to Google Docs.
       * NOTE: Placeholder only, clients MUST implement their own checkoutToGoogleDocs action
       *
       * @method onActionCheckoutToGoogleDocs
       * @param record {object} Object literal representing the file or folder to be actioned
       */
      onActionCheckoutToGoogleDocs: function dlA_onActionCheckoutToGoogleDocs(record)
      {
         Alfresco.logger.error("onActionCheckoutToGoogleDocs", "Abstract implementation not overridden");
      },

      /**
       * Check in a new version from Google Docs.
       * NOTE: Placeholder only, clients MUST implement their own checkinFromGoogleDocs action
       *
       * @method onActionCheckinFromGoogleDocs
       * @param record {object} Object literal representing the file or folder to be actioned
       */
      onActionCheckinFromGoogleDocs: function dlA_onActionCheckinFromGoogleDocs(record)
      {
         Alfresco.logger.error("onActionCheckinFromGoogleDocs", "Abstract implementation not overridden");
      },

      /**
       * Simple Repo Action.
       *
       * Accepts the following <param> declarations from the <action> config:
       *
       * action - The name of  the repo action (i.e. extract-metadata)
       * success - The name of the callback function
       * successMessage - The msg key to use when the repo action succeded (i.e. message.extract-metadata.success)
       * failure - The name of the callback function
       * failureMessage - The msg key to use when the repo action failed (i.e. message.extract-metadata.failure)
       *
       * @method onActionSimpleRepoAction
       * @param record {object} Object literal representing the file or folder to be actioned
       */
      onActionSimpleRepoAction: function dlA_onActionSimpleRepoAction(record, owner)
      {
         // Get action params
         var params = this.getAction(record, owner).params,
            displayName = record.displayName;

         // Prepare genericAction config
         var config =
         {
            success:
            {
               event:
               {
                  name: "metadataRefresh",
                  obj: record
               }
            },
            failure:
            {
               message: this.msg(params.failureMessage, displayName)
            },
            webscript:
            {
               method: Alfresco.util.Ajax.POST,
               stem: Alfresco.constants.PROXY_URI + "api/",
               name: "actionQueue"
            },
            config:
            {
               requestContentType: Alfresco.util.Ajax.JSON,
               dataObj:
               {
                  actionedUponNode: record.nodeRef,
                  actionDefinitionName: params.action
               }
            }
         };

         // Add configured success callbacks and messages if provided
         if (YAHOO.lang.isFunction(this[params.success]))
         {
            config.success.callback =
            {
               fn: this[params.success],
               obj: record,
               scope: this
            };
         }
         if (params.successMessage)
         {
            config.success.message = this.msg(params.successMessage, displayName);
         }

         // Acd configured failure callback and message if provided
         if (YAHOO.lang.isFunction(this[params.failure]))
         {
            config.failure.callback =
            {
               fn: this[params.failure],
               obj: record,
               scope: this
            };
         }
         if (params.failureMessage)
         {
            config.failure.message = this.msg(params.failureMessage, displayName);
         }

         // Execute the repo action
         this.modules.actions.genericAction(config);
      },

      /**
       * Form Dialog Action.
       *
       * Accepts <param name=""></param> declarations in share config xml for the following names:
       * success - The name of the callback function
       * successMessage - The msg key to use when the repo action succeded (i.e. message.extract-metadata.success)
       * failure - The name of the callback function
       * failureMessage - The msg key to use when the repo action failed (i.e. message.extract-metadata.failure)
       * ...and any other parameter mathing the properties for GET /service/components/form webscript
       * i.e itemid, itemkind, mode etc...
       *
       * @method onActionFormDialog
       * @param record {object} Object literal representing the file or folder to be actioned
       */
      onActionFormDialog: function dlA_onActionFormDialog(record, owner)
      {
         // Get action & params and start create the config for displayForm
         var action = this.getAction(record, owner),
            params = action.params,
            config =
            {
               title: this.msg(action.label)
            },
            displayName = record.displayName;

         // Make sure we don't pass the function as a form parameter
         delete params["function"];

         // Add configured success callback
         var success = params["success"];
         delete params["success"];
         config.success =
         {
            fn: function(response, obj)
            {
               // Invoke callback if configured and available
               if (YAHOO.lang.isFunction(this[success]))
               {
                  this[success].call(this, response, obj);
               }

               // Fire metadataRefresh so other components may update themselves
               YAHOO.Bubbling.fire("metadataRefresh", obj);
            },
            obj: record,
            scope: this
         };

         // Add configure success message
         if (params.successMessage)
         {
            config.successMessage = this.msg(params.successMessage, displayName);
            delete params["successMessage"];
         }

         // Add configured failure callback
         if (YAHOO.lang.isFunction(this[params.failure]))
         {
            config.failure =
            {
               fn: this[params.failure],
               obj: record,
               scope: this
            };
            delete params["failure"];
         }
         // Add configure success message
         if (params.failureMessage)
         {
            config.failureMessage = this.msg(params.failureMessage, displayName);
            delete params["failureMessage"];
         }

         // Use the remaining properties as form properties
         config.properties = params;

         // Finally display form as dialog
         Alfresco.util.PopupManager.displayForm(config);
      },

      /**
       * Upload new version.
       *
       * @method onActionUploadNewVersion
       * @param record {object} Object literal representing the file or folder to be actioned
       */
      onActionUploadNewVersion: function dlA_onActionUploadNewVersion(record)
      {
         var jsNode = record.jsNode,
            displayName = record.displayName,
            nodeRef = jsNode.nodeRef,
            version = record.version;

         if (!this.fileUpload)
         {
            this.fileUpload = Alfresco.getFileUploadInstance();
         }

         // Show uploader for multiple files
         var description = this.msg("label.filter-description", displayName),
            extensions = "*";

         if (displayName && new RegExp(/[^\.]+\.[^\.]+/).exec(displayName))
         {
            // Only add a filtering extension if filename contains a name and a suffix
            extensions = "*" + displayName.substring(displayName.lastIndexOf("."));
         }

         if (record.workingCopy && record.workingCopy.workingCopyVersion)
         {
            version = record.workingCopy.workingCopyVersion;
         }

         var singleUpdateConfig =
         {
            updateNodeRef: nodeRef.toString(),
            updateFilename: displayName,
            updateVersion: version,
            overwrite: true,
            filter: [
            {
               description: description,
               extensions: extensions
            }],
            mode: this.fileUpload.MODE_SINGLE_UPDATE,
            onFileUploadComplete:
            {
               fn: this.onNewVersionUploadComplete,
               scope: this
            }
         };
         if ($isValueSet(this.options.siteId))
         {
            singleUpdateConfig.siteId = this.options.siteId;
            singleUpdateConfig.containerId = this.options.containerId;
         }
         this.fileUpload.show(singleUpdateConfig);
      },

      /**
       * Handles creating activity events after file upload completion
       *
       * @method _uploadComplete
       * @protected
       * @param complete {object} Object literal containing details of successful and failed uploads
       * @param uploadType {String} Either "added" or "updated" depending on the file action
       */
      _uploadComplete: function dlA__uploadComplete(complete, uploadType)
      {
         var success = complete.successful.length, activityData, file;
         if (success > 0)
         {
            if (success < (this.options.groupActivitiesAt || 5))
            {
               // Below cutoff for grouping Activities into one
               for (var i = 0; i < success; i++)
               {
                  file = complete.successful[i];
                  activityData =
                  {
                     fileName: file.fileName,
                     nodeRef: file.nodeRef
                  };
                  this.modules.actions.postActivity(this.options.siteId, "file-" + uploadType, "document-details", activityData);
               }
            }
            else
            {
               // grouped into one message
               activityData =
               {
                  fileCount: success,
                  path: this.currentPath,
                  parentNodeRef: this.doclistMetadata.parent.nodeRef
               };
               this.modules.actions.postActivity(this.options.siteId, "files-" + uploadType, "documentlibrary", activityData);
            }
         }
      },

      /**
       * Called from the uploader component after one or more files have been uploaded.
       *
       * @method onFileUploadComplete
       * @param complete {object} Object literal containing details of successful and failed uploads
       */
      onFileUploadComplete: function dlA_onFileUploadComplete(complete)
      {
         this._uploadComplete(complete, "added");
      },

      /**
       * Called from the uploader component after one or more files have been updated.
       *
       * @method onNewVersionUploadComplete
       * @param complete {object} Object literal containing details of successful and failed uploads
       */
      onNewVersionUploadComplete: function dlA_onNewVersionUploadComplete(complete)
      {
         this._uploadComplete(complete, "updated");
      },

      /**
       * Cancel editing.
       *
       * @method onActionCancelEditing
       * @param record {object} Object literal representing the file or folder to be actioned
       */
      onActionCancelEditing: function dlA_onActionCancelEditing(record)
      {
         var displayName = record.displayName;

         this.modules.actions.genericAction(
         {
            success:
            {
               event:
               {
                  name: "metadataRefresh"
               },
               message: this.msg("message.edit-cancel.success", displayName)
            },
            failure:
            {
               message: this.msg("message.edit-cancel.failure", displayName)
            },
            webscript:
            {
               method: Alfresco.util.Ajax.POST,
               name: "cancel-checkout/node/{nodeRef}",
               params:
               {
                  nodeRef: record.jsNode.nodeRef.uri
               }
            }
         });
      },

      /**
       * Copy single document or folder.
       *
       * @method onActionCopyTo
       * @param record {object} Object literal representing the file or folder to be actioned
       */
      onActionCopyTo: function dlA_onActionCopyTo(record)
      {
         this._copyMoveTo("copy", record);
      },

      /**
       * Move single document or folder.
       *
       * @method onActionMoveTo
       * @param record {object} Object literal representing the file or folder to be actioned
       */
      onActionMoveTo: function dlA_onActionMoveTo(record)
      {
         this._copyMoveTo("move", record);
      },

      /**
       * Copy/Move To implementation.
       *
       * @method _copyMoveTo
       * @param mode {String} Operation mode: copy|move
       * @param record {object} Object literal representing the file or folder to be actioned
       * @private
       */
      _copyMoveTo: function dlA__copyMoveTo(mode, record)
      {
         // Check mode is an allowed one
         if (!mode in
            {
               copy: true,
               move: true
            })
         {
            throw new Error("'" + mode + "' is not a valid Copy/Move to mode.");
         }

         if (!this.modules.copyMoveTo)
         {
            this.modules.copyMoveTo = new Alfresco.module.DoclibCopyMoveTo(this.id + "-copyMoveTo");
         }

         var allowedViewModes =
         [
            Alfresco.module.DoclibGlobalFolder.VIEW_MODE_SITE
         ];
         if (this.options.repositoryBrowsing === true)
         {
            allowedViewModes.push(Alfresco.module.DoclibGlobalFolder.VIEW_MODE_REPOSITORY, Alfresco.module.DoclibGlobalFolder.VIEW_MODE_USERHOME);
         }

         this.modules.copyMoveTo.setOptions(
         {
            allowedViewModes: allowedViewModes,
            mode: mode,
            siteId: this.options.siteId,
            containerId: this.options.containerId,
            path: this.currentPath,
            files: record,
            rootNode: this.options.rootNode,
            parentId: this.getParentNodeRef(record)
         }).showDialog();
      },

      /**
       * Assign workflow.
       *
       * @method onActionAssignWorkflow
       * @param record {object} Object literal representing the file or folder to be actioned
       */
      onActionAssignWorkflow: function dlA_onActionAssignWorkflow(record)
      {
         var nodeRefs = "",
            destination = this.getParentNodeRef(record);

         if (YAHOO.lang.isArray(record))
         {
            for (var i = 0, il = record.length; i < il; i++)
            {
               nodeRefs += (i === 0 ? "" : ",") + record[i].nodeRef;
            }
         }
         else
         {
            nodeRefs = record.nodeRef;
         }
         var postBody =
         {
            selectedItems: nodeRefs
         };
         if (destination)
         {
            postBody.destination = destination;
         }
         Alfresco.util.navigateTo($siteURL("start-workflow"), "POST", postBody);
      },

      /**
       * Set permissions on a single document or folder.
       *
       * @method onActionManagePermissions
       * @param record {object} Object literal representing the file or folder to be actioned
       */
      onActionManagePermissions: function dlA_onActionManagePermissions(record)
      {
         if (!this.modules.permissions)
         {
            this.modules.permissions = new Alfresco.module.DoclibPermissions(this.id + "-permissions");
         }

         this.modules.permissions.setOptions(
         {
            siteId: this.options.siteId,
            containerId: this.options.containerId,
            path: this.currentPath,
            files: record
         }).showDialog();
      },

      /**
       * Manage aspects.
       *
       * @method onActionManageAspects
       * @param record {object} Object literal representing the file or folder to be actioned
       */
      onActionManageAspects: function dlA_onActionManageAspects(record)
      {
         if (!this.modules.aspects)
         {
            this.modules.aspects = new Alfresco.module.DoclibAspects(this.id + "-aspects");
         }

         this.modules.aspects.setOptions(
         {
            file: record
         }).show();
      },

      /**
       * Change Type
       *
       * @method onActionChangeType
       * @param record {object} Object literal representing the file or folder to be actioned
       */
      onActionChangeType: function dlA_onActionChangeType(record)
      {
         var jsNode = record.jsNode,
            currentType = jsNode.type,
            displayName = record.displayName,
            actionUrl = Alfresco.constants.PROXY_URI + $combine("slingshot/doclib/type/node", jsNode.nodeRef.uri);

         var doSetupFormsValidation = function dlA_oACT_doSetupFormsValidation(p_form)
         {
            // Validation
            p_form.addValidation(this.id + "-changeType-type", function fnValidateType(field, args, event, form, silent, message)
            {
               return field.options[field.selectedIndex].value !== "-";
            }, null, "change");
            p_form.setShowSubmitStateDynamically(true, false);
         };

         // Always create a new instance
         this.modules.changeType = new Alfresco.module.SimpleDialog(this.id + "-changeType").setOptions(
         {
            width: "30em",
            templateUrl: Alfresco.constants.URL_SERVICECONTEXT + "modules/documentlibrary/change-type?currentType=" + encodeURIComponent(currentType),
            actionUrl: actionUrl,
            doSetupFormsValidation:
            {
               fn: doSetupFormsValidation,
               scope: this
            },
            firstFocus: this.id + "-changeType-type",
            onSuccess:
            {
               fn: function dlA_onActionChangeType_success(response)
               {
                  YAHOO.Bubbling.fire("metadataRefresh",
                  {
                     highlightFile: displayName
                  });
                  Alfresco.util.PopupManager.displayMessage(
                  {
                     text: this.msg("message.change-type.success", displayName)
                  });
               },
               scope: this
            },
            onFailure:
            {
               fn: function dlA_onActionChangeType_failure(response)
               {
                  Alfresco.util.PopupManager.displayMessage(
                  {
                     text: this.msg("message.change-type.failure", displayName)
                  });
               },
               scope: this
            }
         });
         this.modules.changeType.show();
      },

      /**
       * View in source Repository URL helper
       *
       * @method viewInSourceRepositoryURL
       * @param record {object} Object literal representing the file or folder to be actioned
       * @param actionUrls {object} Action urls for this record
       */
      viewInSourceRepositoryURL: function dlA_viewInSourceRepositoryURL(record, actionUrls)
      {
         var node = record.node,
            repoId = record.location.repositoryId,
            urlMapping = this.options.replicationUrlMapping,
            siteUrl;

         if (!repoId || !urlMapping || !urlMapping[repoId])
         {
            return "#";
         }

         // Generate a URL to the relevant details page
         siteUrl = node.isContainer ? actionUrls.folderDetailsUrl : actionUrls.documentDetailsUrl;
         // Strip off this webapp's context as the mapped one might be different
         siteUrl = siteUrl.substring(Alfresco.constants.URL_CONTEXT.length);

         return $combine(urlMapping[repoId], "/", siteUrl);
      },

      /**
       * Social Publishing
       * 
       * @method onActionPublish
       * @param record {object} Object literal representing the file or folder to be actioned
       */
      onActionPublish: function dlA_onActionPublish(record)
      {
         // Call the Social Publishing Module
         Alfresco.module.getSocialPublishingInstance().show(
         {
            nodeRef: record.nodeRef,
            filename: record.fileName
         });
      }
   };
})();
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
 * SimpleDialog module.
 * 
 * @namespace Alfresco.module
 * @class Alfresco.module.SimpleDialog
 */
(function()
{
   var Dom = YAHOO.util.Dom,
      Selector = YAHOO.util.Selector,
      KeyListener = YAHOO.util.KeyListener;
   
   Alfresco.module.SimpleDialog = function(htmlId, components)
   {
      components = YAHOO.lang.isArray(components) ? components : [];
      
      this.isFormOwner = false;

      if (htmlId !== "null")
      {
         /* Defer showing dialog when in Forms Service mode */
         this.formsServiceDeferred = new Alfresco.util.Deferred(["onTemplateLoaded", "onBeforeFormRuntimeInit"],
         {
            fn: this._showDialog,
            scope: this
         });

         YAHOO.Bubbling.on("beforeFormRuntimeInit", this.onBeforeFormRuntimeInit, this);
      }
      
      return Alfresco.module.SimpleDialog.superclass.constructor.call(
         this,
         "Alfresco.module.SimpleDialog",
         htmlId,
         ["button", "container", "connection", "json", "selector"].concat(components));
   };

   YAHOO.extend(Alfresco.module.SimpleDialog, Alfresco.component.Base,
   {
      /**
       * Dialog instance.
       * 
       * @property dialog
       * @type YAHOO.widget.Dialog
       */
      dialog: null,

      /**
       * Form instance.
       * 
       * @property form
       * @type Alfresco.forms.Form
       */
      form: null,
      
      /**
       * Whether form instance is our own, or created from FormUI component
       *
       * @property isFormOwner
       * @type Boolean
       */
      isFormOwner: null,

       /**
        * Object container for initialization options
        */
       options:
       {
          /**
           * URL which will return template body HTML
           *
           * @property templateUrl
           * @type string
           * @default null
           */
          templateUrl: null,

          /**
           * URL of the form action
           *
           * @property actionUrl
           * @type string
           * @default null
           */
          actionUrl: null,

          /**
           * ID of form element to receive focus on show
           *
           * @property firstFocus
           * @type string
           * @default null
           */
          firstFocus: null,

          /**
           * Object literal representing callback upon successful operation.
           *   fn: function, // The handler to call when the event fires.
           *   obj: object, // An object to pass back to the handler.
           *   scope: object // The object to use for the scope of the handler.
           *
           * @property onSuccess
           * @type object
           * @default null
           */
          onSuccess:
          {
             fn: null,
             obj: null,
             scope: window
          },

          /**
           * Message to display on successful operation
           *
           * @property onSuccessMessage
           * @type string
           * @default ""
           */
          onSuccessMessage: "",
          
          /**
           * Object literal representing callback upon failed operation.
           *   fn: function, // The handler to call when the event fires.
           *   obj: object, // An object to pass back to the handler.
           *   scope: object // The object to use for the scope of the handler.
           *
           * @property onFailure
           * @type object
           * @default null
           */
          onFailure:
          {
             fn: null,
             obj: null,
             scope: window
          },

          /**
           * Message to display on failed operation
           *
           * @property onFailureMessage
           * @type string
           * @default ""
           */
          onFailureMessage: "",
          
          /**
           * Object literal representing function to intercept dialog just before shown.
           *   fn: function(formsRuntime, Alfresco.module.SimpleDialog), // The handler to call when the event fires.
           *   obj: object, // An object to pass back to the handler.
           *   scope: object // The object to use for the scope of the handler. SimpleDialog instance if unset.
           *
           * @property doBeforeDialogShow
           * @type object
           * @default null
           */
          doBeforeDialogShow:
          {
             fn: null,
             obj: null,
             scope: null
          },
          
          /**
           * Object literal representing function to set forms validation.
           *   fn: function, // The handler to call when the event fires.
           *   obj: object, // An object to pass back to the handler.
           *   scope: object // The object to use for the scope of the handler. SimpleDialog instance if unset.
           *
           * @property doSetupFormsValidation
           * @type object
           * @default null
           */
          doSetupFormsValidation:
          {
             fn: null,
             obj: null,
             scope: null
          },
          
          /**
           * Object literal representing function to intercept form before submit.
           *   fn: function, // The override function.
           *   obj: object, // An object to pass back to the function.
           *   scope: object // The object to use for the scope of the function.
           *
           * @property doBeforeFormSubmit
           * @type object
           * @default null
           */
          doBeforeFormSubmit:
          {
             fn: null,
             obj: null,
             scope: window
          },
          
          /**
           * Object literal containing the abstract function for intercepting AJAX form submission.
           *   fn: function, // The override function.
           *   obj: object, // An object to pass back to the function.
           *   scope: object // The object to use for the scope of the function.
           * 
           * @property doBeforeAjaxRequest
           * @type object
           * @default null
           */
          doBeforeAjaxRequest:
          {
             fn: null,
             obj: null,
             scope: window
          },
          
          /**
           * Width for the dialog
           *
           * @property width
           * @type integer
           * @default 30em
           */
          width: "30em",
          
          /**
           * Clear the form before showing it?
           *
           * @property: clearForm
           * @type: boolean
           * @default: false
           */
          clearForm: false,
          
          /**
           * Destroy the dialog instead of hiding it?
           *
           * @property destroyOnHide
           * @type boolean
           * @default false
           */
          destroyOnHide: false
       },

      /**
       * Main entrypoint to show the dialog
       *
       * @method show
       */
      show: function AmSD_show()
      {
         if (this.dialog)
         {
            this._showDialog();
         }
         else
         {
            var data =
            {
               htmlid: this.id
            };
            if (this.options.templateRequestParams)
            {
                data = YAHOO.lang.merge(this.options.templateRequestParams, data);
            }
            Alfresco.util.Ajax.request(
            {
               url: this.options.templateUrl,
               dataObj:data,
               successCallback:
               {
                  fn: this.onTemplateLoaded,
                  scope: this
               },
               failureMessage: "Could not load dialog template from '" + this.options.templateUrl + "'.",
               scope: this,
               execScripts: true
            });
         }
         return this;
      },
      
      /**
       * Show the dialog and set focus to the first text field
       *
       * @method _showDialog
       * @private
       */
      _showDialog: function AmSD__showDialog()
      {
         var form = Dom.get(this.id + "-form");
         
         // Make sure forms without Share-specific templates render roughly ok
         Dom.addClass(form, "bd");

         // Custom forms validation setup interest registered?
         var doSetupFormsValidation = this.options.doSetupFormsValidation;
         if (typeof doSetupFormsValidation.fn == "function")
         {
            doSetupFormsValidation.fn.call(doSetupFormsValidation.scope || this, this.form, doSetupFormsValidation.obj);
         }
         
         // Custom forms before-submit interest registered?
         var doBeforeFormSubmit = this.options.doBeforeFormSubmit;
         if (typeof doBeforeFormSubmit.fn == "function")
         {
            this.form.doBeforeFormSubmit = doBeforeFormSubmit;
         }
         else
         {
            // If no specific handler disable buttons before submit to avoid double submits
            this.form.doBeforeFormSubmit =
            {
               fn: function AmSD__defaultDoBeforeSubmit()
               {
                  this.widgets.okButton.set("disabled", true);
                  this.widgets.cancelButton.set("disabled", true);
               },
               scope: this
            };
         }

         // Custom ajax before-request interest registered?
         var doBeforeAjaxRequest = this.options.doBeforeAjaxRequest;
         if (typeof doBeforeAjaxRequest.fn == "function")
         {
            this.form.doBeforeAjaxRequest = doBeforeAjaxRequest;
         }

         if (this.options.actionUrl !== null)
         {
            form.attributes.action.nodeValue = this.options.actionUrl;
         }
         
         if (this.options.clearForm)
         {
            var inputs = Selector.query("input", form),
                  input;
            inputs = inputs.concat(Selector.query("textarea", form));
            for (var i = 0, j = inputs.length; i < j; i++)
            {
               input = inputs[i];
               if(input.getAttribute("type") != "radio" && input.getAttribute("type") != "checkbox" && input.getAttribute("type") != "hidden")
               {
                  input.value = "";                  
               }
            }
         }
         // Custom before show event interest registered?
         var doBeforeDialogShow = this.options.doBeforeDialogShow;
         if (doBeforeDialogShow && typeof doBeforeDialogShow.fn == "function")
         {
             doBeforeDialogShow.fn.call(doBeforeDialogShow.scope || this, this.form, this, doBeforeDialogShow.obj);
         }
         
         // Make sure ok button is in the correct state if dialog is reused  
         if (this.isFormOwner)
         {
            this.widgets.okButton.set("disabled", false);
            this.widgets.cancelButton.set("disabled", false);
         }
         this.form.updateSubmitElements();

         this.dialog.show();

         // Fix Firefox caret issue
         Alfresco.util.caretFix(form);
         
         // We're in a popup, so need the tabbing fix
         this.form.applyTabFix();
         
         // Register the ESC key to close the dialog
         this.widgets.escapeListener = new KeyListener(document,
         {
            keys: KeyListener.KEY.ESCAPE
         },
         {
            fn: function(id, keyEvent)
            {
               this.hide();
            },
            scope: this,
            correctScope: true
         });
         this.widgets.escapeListener.enable();

         // Set focus if required
         if (this.options.firstFocus !== null)
         {
            Dom.get(this.options.firstFocus).focus();
         }
      },

      /**
       * Hide the dialog
       *
       * @method hide
       */
      hide: function AmSD_hide()
      {
         if (this.dialog)
         {
            this.dialog.hide();
         }
      },

      /**
       * Hide the dialog, removing the caret-fix patch
       *
       * @method _hideDialog
       * @private
       */
      _hideDialog: function AmSD__hideDialog()
      {
         // Unhook close button
         this.dialog.hideEvent.unsubscribe(this.onHideEvent, null, this);

         if (this.widgets.escapeListener)
         {
            this.widgets.escapeListener.disable();
         }
         var form = Dom.get(this.id + "-form");

         // Undo Firefox caret issue
         Alfresco.util.undoCaretFix(form);

         if (this.options.destroyOnHide)
         {
            YAHOO.Bubbling.fire("formContainerDestroyed");
            YAHOO.Bubbling.unsubscribe("beforeFormRuntimeInit", this.onBeforeFormRuntimeInit, this);
            this.dialog.destroy();
            delete this.dialog;
            delete this.widgets;
            if (this.isFormOwner)
            {
               delete this.form;
            }
         }
      },
      
      /**
       * Event handler for container "hide" event.
       * Defer until the dialog itself has processed the hide event so we can safely destroy it later.
       *
       * @method onHideEvent
       * @param e {object} Event type
       * @param obj {object} Object passed back from subscribe method
       */
      onHideEvent: function AmSD_onHideEvent(e, obj)
      {
         YAHOO.lang.later(0, this, this._hideDialog);
      },
      
      /**
       * Event callback when dialog template has been loaded
       *
       * @method onTemplateLoaded
       * @param response {object} Server response from load template XHR request
       */
      onTemplateLoaded: function AmSD_onTemplateLoaded(response)
      {
         // Inject the template from the XHR request into a new DIV element
         var containerDiv = document.createElement("div");
         containerDiv.innerHTML = response.serverResponse.responseText;

         // The panel is created from the HTML returned in the XHR request, not the container
         var dialogDiv = Dom.getFirstChild(containerDiv);
         while (dialogDiv && dialogDiv.tagName.toLowerCase() != "div")
         {
            dialogDiv = Dom.getNextSibling(dialogDiv);
         }

         // Create and render the YUI dialog
         this.dialog = Alfresco.util.createYUIPanel(dialogDiv,
         {
            width: this.options.width
         });

         // Hook close button
         this.dialog.hideEvent.subscribe(this.onHideEvent, null, this);

         // Are we controlling a Forms Service-supplied form?
         if (Dom.get(this.id + "-form-submit"))
         {
            this.isFormOwner = false;
            // FormUI component will initialise form, so we'll continue processing later
            this.formsServiceDeferred.fulfil("onTemplateLoaded");
         }
         else
         {
            // OK button needs to be "submit" type
            this.widgets.okButton = Alfresco.util.createYUIButton(this, "ok", null,
            {
               type: "submit"
            });

            // Cancel button
            this.widgets.cancelButton = Alfresco.util.createYUIButton(this, "cancel", this.onCancel);

            // Form definition
            this.isFormOwner = true;
            this.form = new Alfresco.forms.Form(this.id + "-form");
            this.form.setSubmitElements(this.widgets.okButton);
            this.form.setAJAXSubmit(true,
            {
               successCallback:
               {
                  fn: this.onSuccess,
                  scope: this
               },
               failureCallback:
               {
                  fn: this.onFailure,
                  scope: this
               }
            });
            this.form.setSubmitAsJSON(true);
            this.form.setShowSubmitStateDynamically(true, false);

            // Initialise the form
            this.form.init();

            this._showDialog();
         }
      },

      /**
       * Event handler called when the "beforeFormRuntimeInit" event is received.
       *
       * @method onBeforeFormRuntimeInit
       * @param layer {String} Event type
       * @param args {Object} Event arguments
       * <pre>
       *    args.[1].component: Alfresco.FormUI component instance,
       *    args.[1].runtime: Alfresco.forms.Form instance
       * </pre>
       */
      onBeforeFormRuntimeInit: function AmSD_onBeforeFormRuntimeInit(layer, args)
      {
         var formUI = args[1].component,
            formsRuntime = args[1].runtime;

         this.widgets.okButton = formUI.buttons.submit;
         this.widgets.okButton.set("label", this.msg("button.save"));
         this.widgets.cancelButton = formUI.buttons.cancel;
         this.widgets.cancelButton.set("onclick",
         {
            fn: this.onCancel,
            scope: this
         });
         
         this.form = formsRuntime;
         this.form.setAJAXSubmit(true,
         {
            successCallback:
            {
               fn: this.onSuccess,
               scope: this
            },
            failureCallback:
            {
               fn: this.onFailure,
               scope: this
            }
         });
         
         this.formsServiceDeferred.fulfil("onBeforeFormRuntimeInit");
      },

      /**
       * Cancel button event handler
       *
       * @method onCancel
       * @param e {object} DomEvent
       * @param p_obj {object} Object passed back from addListener method
       */
      onCancel: function AmSD_onCancel(e, p_obj)
      {
         this.hide();
      },

      /**
       * Successful data webscript call event handler
       *
       * @method onSuccess
       * @param response {object} Server response object
       */
      onSuccess: function AmSD_onSuccess(response)
      {
         this.hide();

         if (!response)
         {
            // Invoke the callback if one was supplied
            if (this.options.onFailure && typeof this.options.onFailure.fn == "function")
            {
               this.options.onFailure.fn.call(this.options.onFailure.scope, null, this.options.onFailure.obj);
            }
            else
            {
               Alfresco.util.PopupManager.displayMessage(
               {
                  text: this.options.failureMessage || "Operation failed."
               });
            }
         }
         else
         {
            // Invoke the callback if one was supplied
            if (this.options.onSuccess && typeof this.options.onSuccess.fn == "function")
            {
               this.options.onSuccess.fn.call(this.options.onSuccess.scope, response, this.options.onSuccess.obj);
            }
            else
            {
               Alfresco.util.PopupManager.displayMessage(
               {
                  text: this.options.successMessage || "Operation succeeded."
               });
            }
         }
      },

      /**
       * Failed data webscript call event handler
       *
       * @method onFailure
       * @param response {object} Server response object
       */
      onFailure: function AmSD_onFailure(response)
      {
         // Make sure ok button is in the correct state if dialog is reused
         if (this.isFormOwner)
         {
            this.widgets.okButton.set("disabled", false);
            this.widgets.cancelButton.set("disabled", false);
         }
         this.form.updateSubmitElements();

         // Invoke the callback if one was supplied
         if (typeof this.options.onFailure.fn == "function")
         {
            this.options.onFailure.fn.call(this.options.onFailure.scope, response, this.options.onFailure.obj);
         }
         else
         {
            if (response.json && response.json.message && response.json.status.name)
            {
               Alfresco.util.PopupManager.displayPrompt(
               {
                  title: response.json.status.name,
                  text: response.json.message
               });
            }
            else
            {
               Alfresco.util.PopupManager.displayPrompt(
               {
                  title: this.msg("message.failure"),
                  text: response.serverResponse
               });
            }
         }
      }
   });

   /**
    * Dummy instance to load optional YUI components early.
    * Use fake "null" id, which is tested later in onComponentsLoaded()
   */
   var dummyInstance = new Alfresco.module.SimpleDialog("null");
})();/**
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
 * Document Library "Global Folder" picker module for Document Library.
 * 
 * @namespace Alfresco.module
 * @class Alfresco.module.DoclibGlobalFolder
 */
(function()
{
   /**
   * YUI Library aliases
   */
   var Dom = YAHOO.util.Dom,
      Event = YAHOO.util.Event,
      KeyListener = YAHOO.util.KeyListener,
      Selector = YAHOO.util.Selector;

   /**
    * Alfresco Slingshot aliases
    */
    var $html = Alfresco.util.encodeHTML,
       $combine = Alfresco.util.combinePaths,
       $hasEventInterest = Alfresco.util.hasEventInterest;

   Alfresco.module.DoclibGlobalFolder = function(htmlId)
   {
      Alfresco.module.DoclibGlobalFolder.superclass.constructor.call(this, "Alfresco.module.DoclibGlobalFolder", htmlId, ["button", "container", "connection", "json", "treeview"]);

      // Initialise prototype properties
      this.containers = {};

      // Decoupled event listeners
      if (htmlId != "null")
      {
         this.eventGroup = htmlId;
         YAHOO.Bubbling.on("siteChanged", this.onSiteChanged, this);
         YAHOO.Bubbling.on("containerChanged", this.onContainerChanged, this);
      }

      return this;
   };

   /**
   * Alias to self
   */
   var DLGF = Alfresco.module.DoclibGlobalFolder;
      
   /**
   * View Mode Constants
   */
   YAHOO.lang.augmentObject(DLGF,
   {
      /**
       * "Site" view mode constant.
       *
       * @property VIEW_MODE_SITE
       * @type integer
       * @final
       * @default 0
       */
      VIEW_MODE_SITE: 0,

      /**
       * "Repository" view mode constant.
       *
       * @property VIEW_MODE_REPOSITORY
       * @type integer
       * @final
       * @default 1
       */
      VIEW_MODE_REPOSITORY: 1,

      /**
       * "User Home" view mode constant.
       *
       * @property VIEW_MODE_USERHOME
       * @type integer
       * @final
       * @default 2
       */
      VIEW_MODE_USERHOME: 2
   });

   YAHOO.extend(Alfresco.module.DoclibGlobalFolder, Alfresco.component.Base,
   {
      /**
       * Object container for initialization options
       */
      options:
      {
         /**
          * Current siteId for site view mode.
          * 
          * @property siteId
          * @type string
          */
         siteId: "",

         /**
          * Current site's title for site view mode.
          *
          * @property siteTitle
          * @type string
          */
         siteTitle: "",

         /**
          * ContainerId representing root container in site view mode
          *
          * @property containerId
          * @type string
          * @default "documentLibrary"
          */
         containerId: "documentLibrary",

         /**
          * ContainerType representing root container in site view mode
          *
          * @property containerType
          * @type string
          * @default "cm:folder"
          */
         containerType: "cm:folder",

         /**
          * Root node representing root container in repository view mode
          *
          * @property rootNode
          * @type string
          * @default "alfresco://company/home"
          */
         rootNode: "alfresco://company/home",

         /**
          * NodeRef representing root container in user home view mode
          *
          * @property userHome
          * @type string
          * @default "alfresco://user/home"
          */
         userHome: "alfresco://user/home",

         /**
          * Initial path to expand on module load
          *
          * @property path
          * @type string
          * @default ""
          */
         path: "",
         
         /**
          * Initial node to expand on module load.
          * 
          * If given this module will make a call to repo and find the path for the node and figure
          * out if its inside a site or not. If inside a site the site view mode  will be used, otherwise
          * it will switch to repo mode.
          *
          * @property pathNodeRef
          * @type string
          * @default ""
          */
         pathNodeRef: null,                  
               
         /**
          * Width for the dialog
          *
          * @property width
          * @type integer
          * @default 40em
          */
         width: "60em",
         
         /**
          * Files to action
          *
          * @property files
          * @type object
          * @default null
          */
         files: null,

         /**
          * Template URL
          *
          * @property templateUrl
          * @type string
          * @default Alfresco.constants.URL_SERVICECONTEXT + "modules/documentlibrary/global-folder"
          */
         templateUrl: Alfresco.constants.URL_SERVICECONTEXT + "modules/documentlibrary/global-folder",

         /**
          * Dialog view mode: site or repository
          *
          * @property viewMode
          * @type integer
          * @default Alfresco.modules.DoclibGlobalFolder.VIEW_MODE_SITE
          */
         viewMode: DLGF.VIEW_MODE_SITE,

         /**
          * Allowed dialog view modes
          *
          * @property allowedViewModes
          * @type array
          * @default [VIEW_MODE_SITE, VIEW_MODE_REPOSITORY]
          */
         allowedViewModes:
         [
            DLGF.VIEW_MODE_SITE,
            DLGF.VIEW_MODE_REPOSITORY,
            DLGF.VIEW_MODE_USERHOME
         ],

         /**
          * Evaluate child folders flag (Site mode)
          *
          * @property evaluateChildFoldersSite
          * @type boolean
          * @default true
          */
         evaluateChildFoldersSite: true,

         /**
          * Maximum folder count configuration setting (Site mode)
          *
          * @property maximumFolderCountSite
          * @type int
          * @default -1
          */
         maximumFolderCountSite: -1,

         /**
          * Evaluate child folders flag (Repo mode)
          *
          * @property evaluateChildFoldersRepo
          * @type boolean
          * @default true
          */
         evaluateChildFoldersRepo: true,

         /**
          * Maximum folder count configuration setting (Repo mode)
          *
          * @property maximumFolderCountRepo
          * @type int
          * @default -1
          */
         maximumFolderCountRepo: -1,


         /**
          * Config for sites with specific container types
          *
          * @property siteTreeContainerTypes
          * @type Object
          */
         siteTreeContainerTypes: {}
      },


      /**
       * Container element for template in DOM.
       * 
       * @property containerDiv
       * @type DOMElement
       */
      containerDiv: null,

      /**
       * Paths we have to expand as a result of a deep navigation event.
       * 
       * @property pathsToExpand
       * @type array
       */
      pathsToExpand: null,

      /**
       * Selected tree node.
       * 
       * @property selectedNode
       * @type {YAHOO.widget.Node}
       */
      selectedNode: null,

      /**
       * Current list of containers.
       * 
       * @property containers
       * @type {object}
       */
      containers: null,

      /**
       * Main entry point
       * @method showDialog
       */
      showDialog: function DLGF_showDialog()
      {
         if (!this.containerDiv)
         {
            // Load the UI template from the server
            Alfresco.util.Ajax.request(
            {
               url: this.options.templateUrl,
               dataObj:
               {
                  htmlid: this.id
               },
               successCallback:
               {
                  fn: this.onTemplateLoaded,
                  scope: this
               },
               failureMessage: "Could not load 'global-folder' template:" + this.options.templateUrl,
               execScripts: true
            });
         }
         else
         {
            // Show the dialog
            this._beforeShowDialog();
         }
      },

      /**
       * Event callback when dialog template has been loaded
       *
       * @method onTemplateLoaded
       * @param response {object} Server response from load template XHR request
       */
      onTemplateLoaded: function DLGF_onTemplateLoaded(response)
      {
         // Reference to self - used in inline functions
         var me = this;
         
         // Inject the template from the XHR request into a new DIV element
         this.containerDiv = document.createElement("div");
         this.containerDiv.setAttribute("style", "display:none");
         this.containerDiv.innerHTML = response.serverResponse.responseText;

         // The panel is created from the HTML returned in the XHR request, not the container
         var dialogDiv = Dom.getFirstChild(this.containerDiv);
         
         // Create and render the YUI dialog
         this.widgets.dialog = Alfresco.util.createYUIPanel(dialogDiv,
         {
            width: this.options.width
         });
         
         // OK button
         this.widgets.okButton = Alfresco.util.createYUIButton(this, "ok", this.onOK);

         // Cancel button
         this.widgets.cancelButton = Alfresco.util.createYUIButton(this, "cancel", this.onCancel);

         // Mode buttons
         var modeButtons = new YAHOO.widget.ButtonGroup(this.id + "-modeGroup");
         modeButtons.on("checkedButtonChange", this.onViewModeChange, this.widgets.modeButtons, this);
         this.widgets.modeButtons = modeButtons;

         // Make user enter-key-strokes also trigger a change
         var buttons = this.widgets.modeButtons.getButtons(),
            fnEnterListener = function(e)
            {
               if (KeyListener.KEY.ENTER == e.keyCode)
               {
                  this.set("checked", true);
               }
            };

         for (var i = 0; i < buttons.length; i++)
         {
            buttons[i].addListener("keydown", fnEnterListener);
         }

         /**
          * Dynamically loads TreeView nodes.
          * This MUST be inline in order to have access to the parent class.
          * @method fnLoadNodeData
          * @param node {object} Parent node
          * @param fnLoadComplete {function} Expanding node's callback function
          */
         this.fnLoadNodeData = function DLGF_oR_fnLoadNodeData(node, fnLoadComplete)
         {
            // Get the path this node refers to
            var nodePath = node.data.path;

            // Prepare URI for XHR data request
            var uri = me._buildTreeNodeUrl.call(me, nodePath);

            // Prepare the XHR callback object
            var callback =
            {
               success: function DLGF_lND_success(oResponse)
               {
                  var results = Alfresco.util.parseJSON(oResponse.responseText);
                  
                  if (results.parent)
                  {
                     if (node.data.nodeRef.indexOf("alfresco://") === 0)
                     {
                        node.data.nodeRef = results.parent.nodeRef;
                     }

                     if (typeof node.data.userAccess == "undefined")
                     {
                        node.data.userAccess = results.parent.userAccess;
                        node.setUpLabel(
                        {
                           label: node.label,
                           style: results.parent.userAccess.create ? "" : "no-permission"
                        });
                     }
                  }
                  
                  if (results.items)
                  {
                     var item, tempNode;
                     for (var i = 0, j = results.items.length; i < j; i++)
                     {
                        item = results.items[i];
                        tempNode = new YAHOO.widget.TextNode(
                        {
                           label: $html(item.name),
                           path: $combine(nodePath, item.name),
                           nodeRef: item.nodeRef,
                           description: item.description,
                           userAccess: item.userAccess,
                           style: item.userAccess.create ? "" : "no-permission"
                        }, node, false);

                        if (!item.hasChildren)
                        {
                           tempNode.isLeaf = true;
                        }
                     }
                     
                     if (results.resultsTrimmed)
                     {
                        tempNode = new YAHOO.widget.TextNode(
                        {
                           label: "&lt;" + this.msg("message.folders-trimmed") + "&gt;",
                           style: "folders-trimmed"
                        }, node, false);
                     }
                  }
                  
                  /**
                  * Execute the node's loadComplete callback method which comes in via the argument
                  * in the response object
                  */
                  oResponse.argument.fnLoadComplete();
               },

               // If the XHR call is not successful, fire the TreeView callback anyway
               failure: function DLGF_lND_failure(oResponse)
               {
                  try
                  {
                     var response = YAHOO.lang.JSON.parse(oResponse.responseText);
                     
                     // Show the error in place of the root node
                     var rootNode = this.widgets.treeview.getRoot();
                     var docNode = rootNode.children[0];
                     docNode.isLoading = false;
                     docNode.isLeaf = true;
                     docNode.label = response.message;
                     docNode.labelStyle = "ygtverror";
                     rootNode.refresh();
                  }
                  catch(e)
                  {
                  }
               },
               
               // Callback function scope
               scope: me,

               // XHR response argument information
               argument:
               {
                  "node": node,
                  "fnLoadComplete": fnLoadComplete
               },

               // Timeout -- abort the transaction after 7 seconds
               timeout: 7000
            };

            // Make the XHR call using Connection Manager's asyncRequest method
            YAHOO.util.Connect.asyncRequest("GET", uri, callback);
         };

         // Show the dialog
         this._beforeShowDialog();
      },

      /**
       * Internal function called before show dialog function so additional information may be loaded
       * before _showDialog (which might be overriden) is called.
       *
       * @method _beforeShowDialog
       */
      _beforeShowDialog: function DLGF__beforeShowDialog()
      {
         if (this.options.pathNodeRef)
         {
            // If pathNodeRef is given the user of this component doesn't know what viewmode to display
            var url = Alfresco.constants.PROXY_URI + "slingshot/doclib/node/" + this.options.pathNodeRef.uri + "/location";
            if (this.options.rootNode)
            {
               // Repository mode
               url += "?libraryRoot=" + encodeURIComponent(this.options.rootNode.toString());
            }
            Alfresco.util.Ajax.jsonGet(
            {
               url: url,
               successCallback:
               {
                  fn: function(response)
                  {
                     if (response.json !== undefined)
                     {
                        var locations = response.json;
                        if (locations.site)
                        {
                           this.options.viewMode = DLGF.VIEW_MODE_SITE;
                           this.options.path = $combine(locations.site.path, locations.site.file);
                           this.options.siteId = locations.site.site;
                           this.options.siteTitle = locations.site.siteTitle;
                        }
                        else
                        {
                           this.options.viewMode = DLGF.VIEW_MODE_REPOSITORY;
                           this.options.path = $combine(locations.repo.path, locations.repo.file);
                           this.options.siteId = null;
                           this.options.siteTitle = null;
                        }
                        this._showDialog();
                     }
                  },
                  scope: this
               },
               failureMessage: this.msg("message.failure")
            });
         }
         else
         {
            this._showDialog();
         }
      },

      /**
       * Internal show dialog function
       * @method _showDialog
       */
      _showDialog: function DLGF__showDialog()
      {
         // Enable buttons
         this.widgets.okButton.set("disabled", false);
         this.widgets.cancelButton.set("disabled", false);

         // Dialog title
         var titleDiv = Dom.get(this.id + "-title");
         if (this.options.title)
         {
             titleDiv.innerHTML = this.options.title;
         }
         else
         {
            if (YAHOO.lang.isArray(this.options.files))
            {
               titleDiv.innerHTML = this.msg("title.multi", this.options.files.length);
            }
            else
            {
               titleDiv.innerHTML = this.msg("title.single", '<span class="light">' + $html(this.options.files.displayName) + '</span>');
            }
         }

         // Dialog view mode
         var allowedViewModes = Alfresco.util.arrayToObject(this.options.allowedViewModes),
            modeButtons = this.widgets.modeButtons.getButtons(),
            modeButton, viewMode;

         if (!(this.options.viewMode in allowedViewModes))
         {
            this.options.viewMode = this.options.allowedViewModes[0];
         }
         for (var i = 0, ii = modeButtons.length; i < ii; i++)
         {
            modeButton = modeButtons[i];
            viewMode = parseInt(modeButton.get("name"), 10);
            modeButton.set("disabled", !(viewMode in allowedViewModes));
            modeButton.setStyle("display", viewMode in allowedViewModes ? "block" : "none");
            if (viewMode == this.options.viewMode)
            {
               if (modeButton.get("checked"))
               {
                  // Will trigger the path expansion
                  this.setViewMode(viewMode);
               }
               else
               {
                  modeButton.set("checked", true);
               }
            }
         }
         
         // Register the ESC key to close the dialog
         if (!this.widgets.escapeListener)
         {
            this.widgets.escapeListener = new KeyListener(document,
            {
               keys: KeyListener.KEY.ESCAPE
            },
            {
               fn: function(id, keyEvent)
               {
                  this.onCancel();
               },
               scope: this,
               correctScope: true
            });
         }

         // Show the dialog
         this.widgets.escapeListener.enable();
         this.widgets.dialog.show();
      },
      
      /**
       * Public function to set current dialog view mode
       *  
       * @method setViewMode
       * @param mode {integer} New dialog view mode constant
       */
      setViewMode: function DLGF_setViewMode(viewMode)
      {
         this.options.viewMode = viewMode;
         
         if (viewMode == DLGF.VIEW_MODE_SITE)
         {
            Dom.removeClass(this.id + "-wrapper", "repository-mode");
            this._populateSitePicker();
         }
         else
         {
            Dom.addClass(this.id + "-wrapper", "repository-mode");
            // Build the TreeView widget
            this._buildTree(viewMode == DLGF.VIEW_MODE_USERHOME ? this.options.userHome : this.options.rootNode);
            this.onPathChanged(this.options.path ? this.options.path : "/");
         }
      },


      /**
       * BUBBLING LIBRARY EVENT HANDLERS
       * Disconnected event handlers for event notification
       */

      /**
       * Site Changed event handler
       *
       * @method onSiteChanged
       * @param layer {object} Event fired
       * @param args {array} Event parameters (depends on event type)
       */
      onSiteChanged: function DLGF_onSiteChanged(layer, args)
      {
         // Check the event is directed towards this instance
         if ($hasEventInterest(this, args))
         {
            var obj = args[1];
            if (obj !== null)
            {
               // Should be a site in the arguments
               if (obj.site !== null)
               {
                  this.options.siteId = obj.site;
                  this.options.siteTitle = obj.siteTitle;
                  this._populateContainerPicker();
                  var sites = Selector.query("a", this.id + "-sitePicker"), site, i, j,
                     picker = Dom.get(this.id + "-sitePicker");

                  for (i = 0, j = sites.length; i < j; i++)
                  {
                     site = sites[i];
                     if (site.getAttribute("rel") == obj.site)
                     {
                        Dom.addClass(site, "selected");
                        if (obj.scrollTo)
                        {
                           picker.scrollTop = Dom.getY(site) - Dom.getY(picker);
                        }
                     }
                     else
                     {
                        Dom.removeClass(site, "selected");
                     }
                  }
               }
            }
         }
      },

      /**
       * Container Changed event handler
       *
       * @method onContainerChanged
       * @param layer {object} Event fired
       * @param args {array} Event parameters (depends on event type)
       */
      onContainerChanged: function DLGF_onContainerChanged(layer, args)
      {
         // Check the event is directed towards this instance
         if ($hasEventInterest(this, args))
         {
            var obj = args[1];
            if (obj !== null)
            {
               // Should be a container in the arguments
               if (obj.container !== null)
               {
                  this.options.containerId = obj.container;
                  this.options.containerType = this.containers[obj.container].type;
                  this._buildTree(this.containers[obj.container].nodeRef);
                  // Kick-off navigation to current path
                  this.onPathChanged(this.options.path);
                  var containers = Selector.query("a", this.id + "-containerPicker"), container, i, j,
                     picker = Dom.get(this.id + "-containerPicker");

                  for (i = 0, j = containers.length; i < j; i++)
                  {
                     container = containers[i];
                     if (container.getAttribute("rel") == obj.container)
                     {
                        Dom.addClass(container, "selected");
                        if (obj.scrollTo)
                        {
                           picker.scrollTop = Dom.getY(container) - Dom.getY(picker);
                        }
                     }
                     else
                     {
                        Dom.removeClass(container, "selected");
                     }
                  }
               }
            }
         }
      },


      /**
       * YUI WIDGET EVENT HANDLERS
       * Handlers for standard events fired from YUI widgets, e.g. "click"
       */

      /**
       * Dialog OK button event handler
       *
       * @method onOK
       * @param e {object} DomEvent
       * @param p_obj {object} Object passed back from addListener method
       */
      onOK: function DLGF_onOK(e, p_obj)
      {
         // Close dialog and fire event so other components may use the selected folder
         this.widgets.escapeListener.disable();
         this.widgets.dialog.hide();
         
         var selectedFolder = this.selectedNode ? this.selectedNode.data : null;
         if (selectedFolder && this.options.viewMode == DLGF.VIEW_MODE_SITE)
         {
            selectedFolder.siteId = this.options.siteId;
            selectedFolder.siteTitle = this.options.siteTitle;
            selectedFolder.containerId = this.options.containerId;
         }
         
         YAHOO.Bubbling.fire("folderSelected",
         {
            selectedFolder: selectedFolder,
            eventGroup: this
         });
      },

      /**
       * Dialog Cancel button event handler
       *
       * @method onCancel
       * @param e {object} DomEvent
       * @param p_obj {object} Object passed back from addListener method
       */
      onCancel: function DLGF_onCancel(e, p_obj)
      {
         this.widgets.escapeListener.disable();
         this.widgets.dialog.hide();
      },

      /**
       * Mode change buttongroup event handler
       *
       * @method onViewModeChange
       * @param e {object} DomEvent
       * @param p_obj {object} Object passed back from addListener method
       */
      onViewModeChange: function DLGF_onViewModeChange(e, p_obj)
      {
         var viewMode = this.options.viewMode;
         try
         {
            viewMode = parseInt(e.newValue.get("name"), 10);
            this.setViewMode(viewMode);
         }
         catch(ex)
         {
            // Remain in current view mode
         }
      },
      
      /**
       * Fired by YUI TreeView when a node has finished expanding
       * @method onExpandComplete
       * @param oNode {YAHOO.widget.Node} the node recently expanded
       */
      onExpandComplete: function DLGF_onExpandComplete(oNode)
      {
         Alfresco.logger.debug("DLGF_onExpandComplete");

         // Make sure the tree's DOM has been updated
         this.widgets.treeview.render();
         // Redrawing the tree will clear the highlight
         this._showHighlight(true);
         
         if (this.pathsToExpand && this.pathsToExpand.length > 0)
         {
            var node = this.widgets.treeview.getNodeByProperty("path", this.pathsToExpand.shift());
            if (node !== null)
            {
               var el = node.getContentEl(),
                  container = Dom.get(this.id + "-treeview");
               
               container.scrollTop = Dom.getY(el) - (container.scrollHeight / 3);

               if (node.data.path == this.currentPath)
               {
                  this._updateSelectedNode(node);
               }
               node.expand();
            }
         }
      },

      /**
       * Fired by YUI TreeView when a node label is clicked
       * @method onNodeClicked
       * @param args.event {HTML Event} the event object
       * @param args.node {YAHOO.widget.Node} the node clicked
       * @return allowExpand {boolean} allow or disallow node expansion
       */
      onNodeClicked: function DLGF_onNodeClicked(args)
      {
         Alfresco.logger.debug("DLGF_onNodeClicked");

         var e = args.event,
            node = args.node,
            userAccess = node.data.userAccess;

         if ((userAccess && userAccess.create) || (node.data.nodeRef == "") || (node.data.nodeRef.indexOf("alfresco://") === 0))
         {
            this.onPathChanged(node.data.path);
            this._updateSelectedNode(node);
         }

         Event.preventDefault(e);
         return false;
      },

      
      /**
       * Update tree when the path has changed
       * @method onPathChanged
       * @param path {string} new path
       */
      onPathChanged: function DLGF_onPathChanged(path)
      {
         Alfresco.logger.debug("DLGF_onPathChanged:" + path);

         // ensure path starts with leading slash if not the root node
         if (path.charAt(0) != "/")
         {
            path = "/" + path;
         }
         this.currentPath = path;
         
         // Search the tree to see if this path's node is expanded
         var node = this.widgets.treeview.getNodeByProperty("path", path);
         if (node !== null)
         {
            // Node found
            this._updateSelectedNode(node);
            node.expand();
            while (node.parent !== null)
            {
               node = node.parent;
               node.expand();
            }
            return;
         }
         
         /**
          * The path's node hasn't been loaded into the tree. Create a stack
          * of parent paths that we need to expand one-by-one in order to
          * eventually display the current path's node
          */
         var paths = path.split("/"),
            expandPath = "/";
         // Check for root path special case
         if (path === "/")
         {
            paths = [""];
         }
         this.pathsToExpand = [];
         
         for (var i = 0, j = paths.length; i < j; i++)
         {
            // Push the path onto the list of paths to be expanded
            expandPath = $combine("/", expandPath, paths[i]);
            this.pathsToExpand.push(expandPath);
         }
         Alfresco.logger.debug("DLGF_onPathChanged paths to expand:" + this.pathsToExpand.join(","));
         // Kick off the expansion process by expanding the first unexpanded path
         do
         {
            node = this.widgets.treeview.getNodeByProperty("path", this.pathsToExpand.shift());
         } while (this.pathsToExpand.length > 0 && node.expanded);
         
         if (node !== null)
         {
            node.expand();
         }
      },
      

      /**
       * PRIVATE FUNCTIONS
       */

      /**
       * Creates the Site Picker control.
       * @method _populateSitePicker
       * @private
       */
      _populateSitePicker: function DLGF__populateSitePicker()
      {
         var sitePicker = Dom.get(this.id + "-sitePicker"),
            me = this;
         
         sitePicker.innerHTML = "";
         
         var fnSuccess = function DLGF__pSP_fnSuccess(response, sitePicker)
         {
            var sites = response.json, element, site, i, j, firstSite = null;
            
            var fnClick = function DLGF_pSP_onclick(site)
            {
               return function()
               {
                  YAHOO.Bubbling.fire("siteChanged",
                  {
                     site: site.shortName,
                     siteTitle: site.title,
                     eventGroup: me
                  });
                  return false;
               };
            };
            
            if (sites.length > 0)
            {
               firstSite = sites[0];
            }
            
            for (i = 0, j = sites.length; i < j; i++)
            {
               site = sites[i];
               element = document.createElement("div");
               if (i == j - 1)
               {
                  Dom.addClass(element, "last");
               }

               element.innerHTML = '<a rel="' + site.shortName + '" href="#""><h4>' + $html(site.title) + '</h4>' + '<span>' + $html(site.description) + '</span></a>';
               element.onclick = fnClick(site);
               sitePicker.appendChild(element);
            }
            
            // Select current site, or first site retrieved
            YAHOO.Bubbling.fire("siteChanged",
            {
               site: (this.options.siteId && this.options.siteId.length > 0) ? this.options.siteId : firstSite.shortName,
               siteTitle: (this.options.siteId && this.options.siteId.length > 0) ? this.options.siteTitle : firstSite.title,
               eventGroup: this,
               scrollTo: true
            });
         };
         
         var config =
         {
            url: Alfresco.constants.PROXY_URI + "api/sites",
            responseContentType: Alfresco.util.Ajax.JSON,
            successCallback:
            {
               fn: fnSuccess,
               scope: this,
               obj: sitePicker
            },
            failureCallback: null
         };
         
         Alfresco.util.Ajax.request(config);
      },

      /**
       * Creates the Container Picker control.
       * @method _populateContainerPicker
       * @private
       */
      _populateContainerPicker: function DLGF__populateContainerPicker()
      {
         var containerPicker = Dom.get(this.id + "-containerPicker"),
            me = this;
         
         containerPicker.innerHTML = "";
         
         var fnSuccess = function DLGF__pCP_fnSuccess(response, containerPicker)
         {
            var containers = response.json.containers, element, container, i, j;
            this.containers = {};
            
            var fnClick = function DLGF_pCP_onclick(containerName)
            {
               return function()
               {
                  YAHOO.Bubbling.fire("containerChanged",
                  {
                     container: containerName,
                     eventGroup: me
                  });
                  return false;
               };
            };
            
            for (i = 0, j = containers.length; i < j; i++)
            {
               container = containers[i];
               this.containers[container.name] = container;
               element = document.createElement("div");
               if (i == j - 1)
               {
                  Dom.addClass(element, "last");
               }

               element.innerHTML = '<a rel="' + container.name + '" href="#"><h4>' + container.name + '</h4>' + '<span>' + container.description + '</span></a>';
               element.onclick = fnClick(container.name);
               containerPicker.appendChild(element);
            }

            // Select current container
            YAHOO.Bubbling.fire("containerChanged",
            {
               container: this.options.containerId,
               eventGroup: this,
               scrollTo: true
            });
         };

         var fnFailure = function DLGF_pCP_fnFailure(response)
         {
            try
            {
               // Show a message in place of the root node
               var rootNode = this.widgets.treeview.getRoot(),
                  docNode = rootNode.children[0];

               docNode.isLoading = false;
               docNode.isLeaf = true;
               docNode.label = this.msg("message.error");
               docNode.labelStyle = "ygtverror";
               rootNode.refresh();
            }
            catch(e)
            {
            }
            containerPicker.innerHTML = '';
         };
         
         var config =
         {
            url: Alfresco.constants.PROXY_URI + "slingshot/doclib/containers/" + this.options.siteId,
            responseContentType: Alfresco.util.Ajax.JSON,
            successCallback:
            {
               fn: fnSuccess,
               scope: this,
               obj: containerPicker
            },
            failureCallback:
            {
               fn: fnFailure,
               scope: this
            }
         };
         
         Alfresco.util.Ajax.request(config);
      },

      /**
       * Creates the TreeView control and renders it to the parent element.
       * @method _buildTree
       * @param p_rootNodeRef {string} NodeRef of root node for this tree
       * @private
       */
      _buildTree: function DLGF__buildTree(p_rootNodeRef)
      {
         Alfresco.logger.debug("DLGF__buildTree");

         // Create a new tree
         var tree = new YAHOO.widget.TreeView(this.id + "-treeview");
         this.widgets.treeview = tree;

         // Having both focus and highlight are just confusing (YUI 2.7.0 addition)
         YAHOO.widget.TreeView.FOCUS_CLASS_NAME = "";

         // Turn dynamic loading on for entire tree
         tree.setDynamicLoad(this.fnLoadNodeData);

         var rootLabel = "location.path.repository";
         if (this.options.viewMode == DLGF.VIEW_MODE_SITE)
         {
            var treeConfig = this.options.siteTreeContainerTypes[this.options.containerType] || {};
            rootLabel = treeConfig.rootLabel || "location.path.documents";
         }
         else if (this.options.viewMode == DLGF.VIEW_MODE_USERHOME)
         {
            rootLabel = "location.path.userHome";
         }

         // Add default top-level node
         var tempNode = new YAHOO.widget.TextNode(
         {
            label: this.msg(rootLabel),
            path: "/",
            nodeRef: p_rootNodeRef
         }, tree.getRoot(), false);

         // Register tree-level listeners
         tree.subscribe("clickEvent", this.onNodeClicked, this, true);
         tree.subscribe("expandComplete", this.onExpandComplete, this, true);

         // Render tree with this one top-level node
         tree.render();
      },

      /**
       * Highlights the currently selected node.
       * @method _showHighlight
       * @param isVisible {boolean} Whether the highlight is visible or not
       * @private
       */
      _showHighlight: function DLGF__showHighlight(isVisible)
      {
         Alfresco.logger.debug("DLGF__showHighlight");

         if (this.selectedNode !== null)
         {
            if (isVisible)
            {
               Dom.addClass(this.selectedNode.getEl(), "selected");
            }
            else
            {
               Dom.removeClass(this.selectedNode.getEl(), "selected");
            }
         }
      },
      
      /**
       * Updates the currently selected node.
       * @method _updateSelectedNode
       * @param node {object} New node to set as currently selected one
       * @private
       */
      _updateSelectedNode: function DLGF__updateSelectedNode(node)
      {
         Alfresco.logger.debug("DLGF__updateSelectedNode");

         this._showHighlight(false);
         this.selectedNode = node;
         this._showHighlight(true);
      },

      /**
       * Build URI parameter string for treenode JSON data webscript
       *
       * @method _buildTreeNodeUrl
       * @param path {string} Path to query
       */
      _buildTreeNodeUrl: function DLGF__buildTreeNodeUrl(path)
      {
         var uriTemplate = Alfresco.constants.PROXY_URI;
         if (this.options.viewMode == DLGF.VIEW_MODE_SITE)
         {
            var treeConfig = this.options.siteTreeContainerTypes[this.options.containerType] || {};
            if (treeConfig.uri)
            {
               uriTemplate += treeConfig.uri;
            }
            else
            {
               uriTemplate += "slingshot/doclib/treenode/site/{site}/{container}{path}";
               uriTemplate += "?children={evaluateChildFoldersSite}";
               uriTemplate += "&max={maximumFolderCountSite}";
            }
         }
         else
         {
            if (this.options.viewMode == DLGF.VIEW_MODE_USERHOME)
            {
               uriTemplate += "slingshot/doclib/treenode/node/{userHome}{path}";
               uriTemplate += "?children={evaluateChildFoldersRepo}";
            }
            else
            {
               uriTemplate += "slingshot/doclib/treenode/node/alfresco/company/home{path}";
               uriTemplate += "?children={evaluateChildFoldersRepo}";
               uriTemplate += "&libraryRoot={rootNode}";
            }
            uriTemplate += "&max={maximumFolderCountRepo}";
         }

         var url = YAHOO.lang.substitute(uriTemplate,
         {
            site: encodeURIComponent(this.options.siteId),
            container: encodeURIComponent(this.options.containerId),
            rootNode: this.options.rootNode,
            userHome: (this.options.userHome || "").replace(":/", ""),
            path: Alfresco.util.encodeURIPath(path),
            evaluateChildFoldersSite: this.options.evaluateChildFoldersSite + '',
            maximumFolderCountSite: this.options.maximumFolderCountSite,
            evaluateChildFoldersRepo: this.options.evaluateChildFoldersRepo + '',
            maximumFolderCountRepo: this.options.maximumFolderCountRepo
         });

         return url;
      }
   });

   /* Dummy instance to load optional YUI components early */
   var dummyInstance = new Alfresco.module.DoclibGlobalFolder("null");
})();
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
 * Document Library "Copy- and Move-To" module for Document Library.
 * 
 * @namespace Alfresco.module
 * @class Alfresco.module.DoclibCopyMoveTo
 */
(function()
{
   Alfresco.module.DoclibCopyMoveTo = function(htmlId)
   {
      Alfresco.module.DoclibCopyMoveTo.superclass.constructor.call(this, htmlId);

      // Re-register with our own name
      this.name = "Alfresco.module.DoclibCopyMoveTo";
      Alfresco.util.ComponentManager.reregister(this);

      this.options = YAHOO.lang.merge(this.options,
      {
         allowedViewModes:
         [
            Alfresco.module.DoclibGlobalFolder.VIEW_MODE_SITE,
            Alfresco.module.DoclibGlobalFolder.VIEW_MODE_REPOSITORY,
            Alfresco.module.DoclibGlobalFolder.VIEW_MODE_USERHOME
         ],
         extendedTemplateUrl: Alfresco.constants.URL_SERVICECONTEXT + "modules/documentlibrary/copy-move-to"
      });

      return this;
   };

   YAHOO.extend(Alfresco.module.DoclibCopyMoveTo, Alfresco.module.DoclibGlobalFolder,
   {
      /**
       * Set multiple initialization options at once.
       *
       * @method setOptions
       * @override
       * @param obj {object} Object literal specifying a set of options
       * @return {Alfresco.module.DoclibMoveTo} returns 'this' for method chaining
       */
      setOptions: function DLCMT_setOptions(obj)
      {
         var myOptions = {};

         if (typeof obj.mode !== "undefined")
         {
            var dataWebScripts =
            {
               copy: "copy-to",
               move: "move-to"
            };
            if (typeof dataWebScripts[obj.mode] == "undefined")
            {
               throw new Error("Alfresco.module.CopyMoveTo: Invalid mode '" + obj.mode + "'");
            }
            myOptions.dataWebScript = dataWebScripts[obj.mode];
         }
         
         myOptions.viewMode = Alfresco.util.isValueSet(this.options.siteId) ? Alfresco.module.DoclibGlobalFolder.VIEW_MODE_SITE : Alfresco.module.DoclibGlobalFolder.VIEW_MODE_REPOSITORY;
         // Actions module
         this.modules.actions = new Alfresco.module.DoclibActions();

         return Alfresco.module.DoclibCopyMoveTo.superclass.setOptions.call(this, YAHOO.lang.merge(myOptions, obj));
      },

      /**
       * Event callback when superclass' dialog template has been loaded
       *
       * @method onTemplateLoaded
       * @override
       * @param response {object} Server response from load template XHR request
       */
      onTemplateLoaded: function DLCMT_onTemplateLoaded(response)
      {
         // Load the UI template, which only will bring in new i18n-messages, from the server
         Alfresco.util.Ajax.request(
         {
            url: this.options.extendedTemplateUrl,
            dataObj:
            {
               htmlid: this.id
            },
            successCallback:
            {
               fn: this.onExtendedTemplateLoaded,
               obj: response,
               scope: this
            },
            failureMessage: "Could not load 'copy-move-to' template:" + this.options.extendedTemplateUrl,
            execScripts: true
         });
      },

      /**
       * Event callback when this class' template has been loaded
       *
       * @method onExtendedTemplateLoaded
       * @override
       * @param response {object} Server response from load template XHR request
       */
      onExtendedTemplateLoaded: function DLCMT_onExtendedTemplateLoaded(response, superClassResponse)
      {
         // Now that we have loaded this components i18n messages let the original template get rendered.
         Alfresco.module.DoclibCopyMoveTo.superclass.onTemplateLoaded.call(this, superClassResponse);
      },

      /**
       * YUI WIDGET EVENT HANDLERS
       * Handlers for standard events fired from YUI widgets, e.g. "click"
       */

      /**
       * Dialog OK button event handler
       *
       * @method onOK
       * @param e {object} DomEvent
       * @param p_obj {object} Object passed back from addListener method
       */
      onOK: function DLCMT_onOK(e, p_obj)
      {
         var files, multipleFiles = [], params, i, j,
            eventSuffix =
            {
               copy: "Copied",
               move: "Moved"
            };

         // Single/multi files into array of nodeRefs
         if (YAHOO.lang.isArray(this.options.files))
         {
            files = this.options.files;
         }
         else
         {
            files = [this.options.files];
         }
         for (i = 0, j = files.length; i < j; i++)
         {
            multipleFiles.push(files[i].node.nodeRef);
         }
         
         // Success callback function
         var fnSuccess = function DLCMT__onOK_success(p_data)
         {
            var result,
               successCount = p_data.json.successCount,
               failureCount = p_data.json.failureCount;

            this.widgets.dialog.hide();

            // Did the operation succeed?
            if (!p_data.json.overallSuccess)
            {
               Alfresco.util.PopupManager.displayMessage(
               {
                  text: this.msg("message.failure")
               });
               return;
            }

            YAHOO.Bubbling.fire("files" + eventSuffix[this.options.mode],
            {
               destination: this.currentPath,
               successCount: successCount,
               failureCount: failureCount
            });
            
            for (var i = 0, j = p_data.json.totalResults; i < j; i++)
            {
               result = p_data.json.results[i];
               
               if (result.success)
               {
                  YAHOO.Bubbling.fire((result.type == "folder" ? "folder" : "file") + eventSuffix[this.options.mode],
                  {
                     multiple: true,
                     nodeRef: result.nodeRef,
                     destination: this.currentPath
                  });
               }
            }

            Alfresco.util.PopupManager.displayMessage(
            {
               text: this.msg("message.success", successCount)
            });
         };

         // Failure callback function
         var fnFailure = function DLCMT__onOK_failure(p_data)
         {
            this.widgets.dialog.hide();

            Alfresco.util.PopupManager.displayMessage(
            {
               text: this.msg("message.failure")
            });
         };

         // Construct webscript URI based on current viewMode
         var webscriptName = this.options.dataWebScript + "/node/{nodeRef}",
            nodeRef = new Alfresco.util.NodeRef(this.selectedNode.data.nodeRef);
         
         // Construct the data object for the genericAction call
         this.modules.actions.genericAction(
         {
            success:
            {
               callback:
               {
                  fn: fnSuccess,
                  scope: this
               }
            },
            failure:
            {
               callback:
               {
                  fn: fnFailure,
                  scope: this
               }
            },
            webscript:
            {
               method: Alfresco.util.Ajax.POST,
               name: webscriptName,
               params:
               {
                  nodeRef: nodeRef.uri
               }
            },
            wait:
            {
               message: this.msg("message.please-wait")
            },
            config:
            {
               requestContentType: Alfresco.util.Ajax.JSON,
               dataObj:
               {
                  nodeRefs: multipleFiles,
		  parentId: this.options.parentId
               }
            }
         });
         
         this.widgets.okButton.set("disabled", true);
         this.widgets.cancelButton.set("disabled", true);
      },

      /**
       * Gets a custom message depending on current view mode
       * and use superclasses
       *
       * @method msg
       * @param messageId {string} The messageId to retrieve
       * @return {string} The custom message
       * @override
       */
      msg: function DLCMT_msg(messageId)
      {
         var result = Alfresco.util.message.call(this, this.options.mode + "." + messageId, this.name, Array.prototype.slice.call(arguments).slice(1));
         if (result ==  (this.options.mode + "." + messageId))
         {
            result = Alfresco.util.message.call(this, messageId, this.name, Array.prototype.slice.call(arguments).slice(1))
         }
         if (result == messageId)
         {
            result = Alfresco.util.message(messageId, "Alfresco.module.DoclibGlobalFolder", Array.prototype.slice.call(arguments).slice(1));
         }
         return result;
      },

      
      /**
       * PRIVATE FUNCTIONS
       */

      /**
       * Internal show dialog function
       * @method _showDialog
       * @override
       */
      _showDialog: function DLCMT__showDialog()
      {
         this.widgets.okButton.set("label", this.msg("button"));
         return Alfresco.module.DoclibCopyMoveTo.superclass._showDialog.apply(this, arguments);
      }
   });

   /* Dummy instance to load optional YUI components early */
   var dummyInstance = new Alfresco.module.DoclibCopyMoveTo("null");
})();/**
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
 * PeopleFinder component.
 * 
 * @namespace Alfresco
 * @class Alfresco.PeopleFinder
 */
(function()
{
   /**
    * YUI Library aliases
    */
   var Dom = YAHOO.util.Dom,
      Event = YAHOO.util.Event;
   
   /**
    * Alfresco Slingshot aliases
    */
   var $html = Alfresco.util.encodeHTML,
      $userProfile = Alfresco.util.userProfileLink;

   /**
    * PeopleFinder constructor.
    * 
    * @param {String} htmlId The HTML id of the parent element
    * @return {Alfresco.PeopleFinder} The new PeopleFinder instance
    * @constructor
    */
   Alfresco.PeopleFinder = function(htmlId)
   {
      Alfresco.PeopleFinder.superclass.constructor.call(this, "Alfresco.PeopleFinder", htmlId, ["button", "container", "datasource", "datatable", "json"]);
      
      // Initialise prototype properties
      this.userSelectButtons = {};
      this.searchTerm = "";
      this.singleSelectedUser = "";
      this.selectedUsers = {};
      this.notAllowed = {};
      this.following = {};

      /**
       * Decoupled event listeners
       */
      YAHOO.Bubbling.on("personSelected", this.onPersonSelected, this);
      YAHOO.Bubbling.on("personDeselected", this.onPersonDeselected, this);

      return this;
   };
   
   YAHOO.lang.augmentObject(Alfresco.PeopleFinder,
   {
      VIEW_MODE_DEFAULT: "",
      VIEW_MODE_COMPACT: "COMPACT",
      VIEW_MODE_FULLPAGE: "FULLPAGE"
   });
   
   YAHOO.lang.extend(Alfresco.PeopleFinder, Alfresco.component.Base,
   {
      /**
       * Object container for initialization options
       *
       * @property options
       * @type object
       */
      options:
      {
         /**
          * Current siteId.
          * 
          * @property siteId
          * @type string
          */
         siteId: "",

         /**
          * View mode
          * 
          * @property viewMode
          * @type string
          * @default Alfresco.PeopleFinder.VIEW_MODE_DEFAULT
          */
         viewMode: Alfresco.PeopleFinder.VIEW_MODE_DEFAULT,

         /**
          * Single Select mode flag
          * 
          * @property singleSelectMode
          * @type boolean
          * @default false
          */
         singleSelectMode: false,
         
         /**
          * Whether we show the current user or not flag
          * 
          * @property showSelf
          * @type boolean
          * @default true
          */
         showSelf: true,
         
         /**
          * Number of characters required for a search.
          * 
          * @property minSearchTermLength
          * @type int
          * @default 1
          */
         minSearchTermLength: 1,
         
         /**
          * Maximum number of items to display in the results list
          * 
          * @property maxSearchResults
          * @type int
          * @default 100
          */
         maxSearchResults: 100,

         /**
          * Whether to set UI focus to this component or not
          * 
          * @property setFocus
          * @type boolean
          * @default false
          */
         setFocus: false,

         /**
          * Label to add button .
          *
          * @property addButtonLabel
          * @type string
          */
         addButtonLabel: null,

         /**
          * Suffix to add button label.
          *
          * @property addButtonSuffix
          * @type string
          */
         addButtonSuffix: "",

         /**
          * Override the default data webscript
          *
          * @property dataWebScript
          * @type string
          */
         dataWebScript: "",
         
         /**
          * Current userId.
          * 
          * @property userId
          * @type string
          */
         userId: ""
      },

      /**
       * Object container for storing YUI button instances, indexed by username.
       * 
       * @property userSelectButtons
       * @type object
       */
      userSelectButtons: null,
      
      /**
       * Current search term, obtained from form input field.
       * 
       * @property searchTerm
       * @type string
       */
      searchTerm: null,
      
      /**
       * Single selected user, for when in single select mode
       * 
       * @property singleSelectedUser
       * @type string
       */
      singleSelectedUser: null,

      /**
       * Selected users. Keeps a list of selected users for correct Add button state.
       * 
       * @property selectedUsers
       * @type object
       */
      selectedUsers: null,

      /**
       * Users for whom the action is not allowed
       * 
       * @property notAllowed
       * @type array
       */
      notAllowed: null,

      /**
       * Keeps track if this component is searching or not
       *
       * @property isSearching
       * @type Boolean
       */
      isSearching: false,
      
      /**
       * Map of the users the current user is following
       * 
       * @property following
       * @type object
       */
      following: null,

      /**
       * Fired by YUI when parent element is available for scripting.
       * Component initialisation, including instantiation of YUI widgets and event listener binding.
       *
       * @method onReady
       */
      onReady: function PeopleFinder_onReady()
      {  
         var me = this;
         
         // View mode specific setup
         if (this.options.viewMode == Alfresco.PeopleFinder.VIEW_MODE_COMPACT)
         {
            Dom.addClass(this.id + "-body", "compact");
            Dom.removeClass(this.id + "-results", "hidden");
         }
         else if (this.options.viewMode == Alfresco.PeopleFinder.VIEW_MODE_FULLPAGE)
         {
            Dom.setStyle(this.id + "-results", "height", "auto");
            Dom.removeClass(this.id + "-help", "hidden");
            
            // Kick off ajax request to get the users the current user is following
            Alfresco.util.Ajax.jsonGet(
            {
               url: Alfresco.constants.PROXY_URI + "api/subscriptions/" + encodeURIComponent(this.options.userId) + "/following",
               successCallback:
               {
                  fn: function(response)
                  {
                     if (response.json.people)
                     {
                        var following = {};
                        var people = response.json.people;
                        for (var i=0; i<people.length; i++)
                        {
                           following[people[i].userName] = true;
                        }
                        me.following = following;
                     }
                  },
                  scope: this
               }
            });
         }
         else
         {
            Dom.setStyle(this.id + "-results", "height", "300px");
            Dom.removeClass(this.id + "-results", "hidden");
         }
         
         // Search button
         this.widgets.searchButton = Alfresco.util.createYUIButton(this, "search-button", this.onSearchClick);

         // DataSource definition  
         var peopleSearchUrl = Alfresco.constants.PROXY_URI + YAHOO.lang.substitute(this.options.dataWebScript, this.options);
         peopleSearchUrl += (peopleSearchUrl.indexOf("?") < 0) ? "?" : "&";
         this.widgets.dataSource = new YAHOO.util.DataSource(peopleSearchUrl,
         {
            responseType: YAHOO.util.DataSource.TYPE_JSON,
            connXhrMode: "queueRequests",
            responseSchema:
            {
                resultsList: "people"
            }
         });

         this.widgets.dataSource.doBeforeParseData = function PeopleFinder_doBeforeParseData(oRequest, oFullResponse)
         {
            var updatedResponse = oFullResponse;
            
            if (oFullResponse)
            {
               var items = oFullResponse.people, i, ii;

               // crop item list to max length if required
               if (items.length > me.options.maxSearchResults)
               {
                  items = items.slice(0, me.options.maxSearchResults-1);
               }

               // Remove the current user from the list?
               if (!me.options.showSelf)
               {
                  for (i = 0, ii = items.length; i < ii; i++)
                  {
                      if (items[i].userName == Alfresco.constants.USERNAME)
                      {
                         items.splice(i, 1);
                         break;
                      }
                  }
               }
               
               // Sort the user list by name
               items.sort(function (user1, user2)
               {
                  var name1 = user1.firstName + user1.lastName,
                     name2 = user2.firstName + user2.lastName;
                  return (name1 > name2) ? 1 : (name1 < name2) ? -1 : 0;
               });
               
               me.notAllowed = {};
               if (oFullResponse.notAllowed)
               {
                  me.notAllowed = Alfresco.util.arrayToObject(oFullResponse.notAllowed);
               }

               // we need to wrap the array inside a JSON object so the DataTable is happy
               updatedResponse =
               {
                  people: items
               };
            }
            
            return updatedResponse;
         };
         
         // Setup the DataTable
         this._setupDataTable();
         
         // register the "enter" event on the search text field
         var searchText = Dom.get(this.id + "-search-text");
         
         // declare variable to keep JSLint and YUI Compressor happy
         var enterListener = new YAHOO.util.KeyListener(searchText,
         {
            keys: YAHOO.util.KeyListener.KEY.ENTER
         },
         {
            fn: function(eventName, event, obj)
            {
               me.onSearchClick();
               Event.stopEvent(event[1]);
               return false;
            },
            scope: this,
            correctScope: true
         }, YAHOO.env.ua.ie > 0 ? YAHOO.util.KeyListener.KEYDOWN : "keypress");
         enterListener.enable();
         
         // Set initial focus?
         if (this.options.setFocus)
         {
            searchText.focus();
         }
      },
      
      /**
       * Setup the YUI DataTable with custom renderers.
       *
       * @method _setupDataTable
       * @private
       */
      _setupDataTable: function PeopleFinder__setupDataTable()
      {
         /**
          * DataTable Cell Renderers
          *
          * Each cell has a custom renderer defined as a custom function. See YUI documentation for details.
          * These MUST be inline in order to have access to the Alfresco.PeopleFinder class (via the "me" variable).
          */
         var me = this;
          
         /**
          * User avatar custom datacell formatter
          *
          * @method renderCellAvatar
          * @param elCell {object}
          * @param oRecord {object}
          * @param oColumn {object}
          * @param oData {object|string}
          */
         var renderCellAvatar = function PeopleFinder_renderCellAvatar(elCell, oRecord, oColumn, oData)
         {
            Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");

            var avatarUrl = Alfresco.constants.URL_RESCONTEXT + "components/images/no-user-photo-64.png";
            if (oRecord.getData("avatar") !== undefined)
            {
               avatarUrl = Alfresco.constants.PROXY_URI + oRecord.getData("avatar") + "?c=queue&ph=true";
            }

            elCell.innerHTML = '<img class="avatar" src="' + avatarUrl + '" alt="avatar" />';
         };

         /**
          * Description/detail custom datacell formatter
          *
          * @method renderCellDescription
          * @param elCell {object}
          * @param oRecord {object}
          * @param oColumn {object}
          * @param oData {object|string}
          */
         var renderCellDescription = function PeopleFinder_renderCellDescription(elCell, oRecord, oColumn, oData)
         {
            var userName = oRecord.getData("userName"),
               name = userName,
               firstName = oRecord.getData("firstName"),
               lastName = oRecord.getData("lastName"),
               userStatus = oRecord.getData("userStatus"),
               userStatusTime = oRecord.getData("userStatusTime");
            
            if ((firstName !== undefined) || (lastName !== undefined))
            {
               name = firstName ? firstName + " " : "";
               name += lastName ? lastName : "";
            }
            
            var title = oRecord.getData("jobtitle") || "",
               organization = oRecord.getData("organization") || "";
            
            var desc = '<h3 class="itemname">' + $userProfile(userName, name, 'class="theme-color-1" tabindex="0"') + ' <span class="lighter">(' + $html(userName) + ')</span></h3>';
            if (title.length !== 0)
            {
               if (me.options.viewMode == Alfresco.PeopleFinder.VIEW_MODE_COMPACT)
               {
                  desc += '<div class="detail">' + $html(title) + '</div>';
               }
               else
               {
                  desc += '<div class="detail"><span>' + me.msg("label.title") + ":</span> " + $html(title) + '</div>';
               }
            }
            if (organization.length !== 0)
            {
               if (me.options.viewMode == Alfresco.PeopleFinder.VIEW_MODE_COMPACT)
               {
                  desc += '<div class="detail">&nbsp;(' + $html(organization) + ')</div>';
               }
               else
               {
                  desc += '<div class="detail"><span>' + me.msg("label.company") + ":</span> " + $html(organization) + '</div>';
               }
            }
            if (userStatus !== null && me.options.viewMode !== Alfresco.PeopleFinder.VIEW_MODE_COMPACT)
            {
               desc += '<div class="user-status">' + $html(userStatus) + ' <span>(' + Alfresco.util.relativeTime(Alfresco.util.fromISO8601(userStatusTime.iso8601)) + ')</span></div>';
            }
            elCell.innerHTML = desc;
         };
         
         /**
          * Actions datacell formatter
          * 
          * @method renderCellActions
          * @param elCell {object}
          * @param oRecord {object}
          * @param oColumn {object}
          * @param oData {object|string}
          */
         var renderCellActions = function PeopleFinder_renderCellActions(elCell, oRecord, oColumn, oData)
         {
            Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");
            Dom.setStyle(elCell.parentNode, "text-align", "right");
            
            var userName = oRecord.getData("userName"),
               desc = '<span id="' + me.id + '-action-' + userName + '"></span>';
            elCell.innerHTML = desc;
            
            // This component is used as part of the People Search page and various People Picker components
            // so create the Add button if required - it is not displayed in the full people search list mode.
            if (me.options.viewMode !== Alfresco.PeopleFinder.VIEW_MODE_FULLPAGE)
            {
               var button = new YAHOO.widget.Button(
               {
                  type: "button",
                  label: (me.options.addButtonLabel ? me.options.addButtonLabel : me.msg("button.add")) + " " + me.options.addButtonSuffix,
                  name: me.id + "-selectbutton-" + userName,
                  container: me.id + '-action-' + userName,
                  tabindex: 0,
                  disabled: userName in me.notAllowed,
                  onclick:
                  {
                     fn: me.onPersonSelect,
                     obj: oRecord,
                     scope: me
                  }
               });
               me.userSelectButtons[userName] = button;
               
               if ((userName in me.selectedUsers) || (me.options.singleSelectMode && me.singleSelectedUser !== ""))
               {
                  me.userSelectButtons[userName].set("disabled", true);
               }
            }
            // Create the Follow/Unfollow buttons for the people
            if (me.options.viewMode === Alfresco.PeopleFinder.VIEW_MODE_FULLPAGE &&
                me.options.userId !== userName)
            {
               var following = me.following[userName];
               var button = new YAHOO.widget.Button(
               {
                  type: "button",
                  label: following ? me.msg("button.unfollow") : me.msg("button.follow"),
                  name: me.id + "-followbutton-" + userName,
                  container: me.id + '-action-' + userName,
                  tabindex: 0
               });
               button.set("onclick",
               {
                  fn: following ? me.onPersonUnfollow : me.onPersonFollow,
                  obj:
                  {
                     record: oRecord,
                     button: button
                  },
                  scope: me
               });
            }
         };

         // DataTable column defintions
         var columnDefinitions =
         [
            { key: "avatar", label: "Avatar", sortable: false, formatter: renderCellAvatar, width: this.options.viewMode == Alfresco.PeopleFinder.VIEW_MODE_COMPACT ? 36 : 70 },
            { key: "person", label: "Description", sortable: false, formatter: renderCellDescription },
            { key: "actions", label: "Actions", sortable: false, formatter: renderCellActions, width: 80 }
         ];

         // DataTable definition
         this.widgets.dataTable = new YAHOO.widget.DataTable(this.id + "-results", columnDefinitions, this.widgets.dataSource,
         {
            renderLoopSize: Alfresco.util.RENDERLOOPSIZE,
            initialLoad: false,
            MSG_EMPTY: this.msg("message.instructions")
         });

         this.widgets.dataTable.doBeforeLoadData = function PeopleFinder_doBeforeLoadData(sRequest, oResponse, oPayload)
         {
            if (oResponse.results)
            {
               this.renderLoopSize = Alfresco.util.RENDERLOOPSIZE;
            }
            return true;
         };

         // Enable row highlighting
         this.widgets.dataTable.subscribe("rowMouseoverEvent", this.widgets.dataTable.onEventHighlightRow);
         this.widgets.dataTable.subscribe("rowMouseoutEvent", this.widgets.dataTable.onEventUnhighlightRow);
      },
      
      /**
       * Public function to clear the results DataTable
       */
      clearResults: function PeopleFinder_clearResults()
      {
         // Clear results DataTable
         if (this.widgets.dataTable)
         {
            var recordCount = this.widgets.dataTable.getRecordSet().getLength();
            this.widgets.dataTable.deleteRows(0, recordCount);
         }
         Dom.get(this.id + "-search-text").value = "";
         this.singleSelectedUser = "";
         this.selectedUsers = {};
      },


      /**
       * YUI WIDGET EVENT HANDLERS
       * Handlers for standard events fired from YUI widgets, e.g. "click"
       */

      /**
       * Select person button click handler
       *
       * @method onPersonSelect
       * @param e {object} DomEvent
       * @param p_obj {object} Object passed back from addListener method
       */
      onPersonSelect: function PeopleFinder_onPersonSelect(event, p_obj)
      {
         var userName = p_obj.getData("userName");
         
         // Fire the personSelected bubble event
         YAHOO.Bubbling.fire("personSelected",
         {
            eventGroup: this,
            userName: userName,
            firstName: p_obj.getData("firstName"),
            lastName: p_obj.getData("lastName"),
            email: p_obj.getData("email")
         });
      },
      
      /**
       * Follow person button click handler
       *
       * @method onPersonFollow
       * @param e {object} DomEvent
       * @param p_obj {object} Object passed back from addListener method
       */
      onPersonFollow: function PeopleFinder_onPersonFollow(event, p_obj)
      {
         var userName = p_obj.record.getData("userName");
         
         // follow the user - on success, update the button label and bind appropriate event handler
         
         // disable the button to prohibit multiple presses before we get a response
         p_obj.button.set("disabled", true);
         
         // execute call to follow the user
         var me = this;
         Alfresco.util.Ajax.request(
         {
            url: Alfresco.constants.PROXY_URI + "api/subscriptions/" + encodeURIComponent(this.options.userId) + "/follow",
            method: Alfresco.util.Ajax.POST,
            dataObj: [userName],
            requestContentType: Alfresco.util.Ajax.JSON,
            successCallback:
            {
               fn: function(res)
               {
                  // on success, update the label and event handler
                  p_obj.button.set("label", me.msg("button.unfollow"));
                  p_obj.button.set("onclick",
                  {
                     fn: me.onPersonUnfollow,
                     obj:
                     {
                        record: p_obj.record,
                        button: p_obj.button
                     },
                     scope: me
                  });
                  // update our following cache
                  me.following[userName] = true;
                  // enable the button again
                  p_obj.button.set("disabled", false);
               },
               scope: this
            },
            failureCallback:
            {
               fn: function(res)
               {
                  var json = Alfresco.util.parseJSON(res.serverResponse.responseText);
                  Alfresco.util.PopupManager.displayPrompt(
                  {
                     title: this._msg("message.failure"),
                     text: json.message
                  });
                  // enable the button again
                  p_obj.button.set("disabled", false);
               },
               scope: this
            }
         });
      },
      
      /**
       * Unfollow person button click handler
       *
       * @method onPersonUnfollow
       * @param e {object} DomEvent
       * @param p_obj {object} Object passed back from addListener method
       */
      onPersonUnfollow: function PeopleFinder_onPersonUnfollow(event, p_obj)
      {
         var userName = p_obj.record.getData("userName");
         
         // unfollow the user - on success, update the button label and bind appropriate event handler
         
         // disable the button to prohibit multiple presses before we get a response
         p_obj.button.set("disabled", true);
         
         // execute call to follow the user
         var me = this;
         Alfresco.util.Ajax.request(
         {
            url: Alfresco.constants.PROXY_URI + "api/subscriptions/" + encodeURIComponent(this.options.userId) + "/unfollow",
            method: Alfresco.util.Ajax.POST,
            dataObj: [userName],
            requestContentType: Alfresco.util.Ajax.JSON,
            successCallback:
            {
               fn: function(res)
               {
                  // on success, update the label and event handler
                  p_obj.button.set("label", me.msg("button.follow"));
                  p_obj.button.set("onclick",
                  {
                     fn: me.onPersonFollow,
                     obj:
                     {
                        record: p_obj.record,
                        button: p_obj.button
                     },
                     scope: me
                  });
                  // update our following cache
                  me.following[userName] = false;
                  // enable the button again
                  p_obj.button.set("disabled", false);
               },
               scope: this
            },
            failureCallback:
            {
               fn: function(res)
               {
                  var json = Alfresco.util.parseJSON(res.serverResponse.responseText);
                  Alfresco.util.PopupManager.displayPrompt(
                  {
                     title: this._msg("message.failure"),
                     text: json.message
                  });
                  // enable the button again
                  p_obj.button.set("disabled", false);
               },
               scope: this
            }
         });
      },

      /**
       * Search button click event handler
       *
       * @method onSearchClick
       * @param e {object} DomEvent
       * @param p_obj {object} Object passed back from addListener method
       */
      onSearchClick: function PeopleFinder_onSearchClick(e, p_obj)
      {
         var searchTerm = Dom.get(this.id + "-search-text").value;
         if (searchTerm.replace(/\*/g, "").length < this.options.minSearchTermLength)
         {
            Alfresco.util.PopupManager.displayMessage(
            {
               text: this.msg("message.minimum-length", this.options.minSearchTermLength)
            });
            return;
         }
         
         this.userSelectButtons = {};
         this._performSearch(searchTerm);
      },


      /**
       * BUBBLING LIBRARY EVENT HANDLERS FOR PAGE EVENTS
       * Disconnected event handlers for inter-component event notification
       */

      /**
       * Person Selected event handler
       *
       * @method onPersonSelected
       * @param layer {object} Event fired
       * @param args {array} Event parameters (depends on event type)
       */
      onPersonSelected: function PeopleFinder_onPersonSelected(layer, args)
      {
         var obj = args[1];
         // Should be person details in the arguments
         if (obj && (obj.userName !== undefined))
         {
            var userName = obj.userName;
            // Add the userName to the selectedUsers object
            this.selectedUsers[userName] = true;
            this.singleSelectedUser = userName;
         
            // Disable the add button(s)
            if (this.options.singleSelectMode)
            {
               for (var button in this.userSelectButtons)
               {
                  if (this.userSelectButtons.hasOwnProperty(button))
                  {
                     this.userSelectButtons[button].set("disabled", true);
                  }
               }
            }
            else
            {
               if (this.userSelectButtons[userName])
               {
                  this.userSelectButtons[userName].set("disabled", true);
               }
            }
         }
      },

      /**
       * Person Deselected event handler
       *
       * @method onPersonDeselected
       * @param layer {object} Event fired
       * @param args {array} Event parameters (depends on event type)
       */
      onPersonDeselected: function PeopleFinder_onPersonDeselected(layer, args)
      {
         var obj = args[1];
         // Should be person details in the arguments
         if (obj && (obj.userName !== undefined))
         {
            delete this.selectedUsers[obj.userName];
            this.singleSelectedUser = "";
            // Re-enable the add button(s)
            if (this.options.singleSelectMode)
            {
               for (var button in this.userSelectButtons)
               {
                  if (this.userSelectButtons.hasOwnProperty(button))
                  {
                     this.userSelectButtons[button].set("disabled", false);
                  }
               }
            }
            else
            {
               if (this.userSelectButtons[obj.userName])
               {
                  this.userSelectButtons[obj.userName].set("disabled", false);
               }
            }
         }
      },


      /**
       * PRIVATE FUNCTIONS
       */
      
      /**
       * Resets the YUI DataTable errors to our custom messages
       * NOTE: Scope could be YAHOO.widget.DataTable, so can't use "this"
       *
       * @method _setDefaultDataTableErrors
       * @param dataTable {object} Instance of the DataTable
       */
      _setDefaultDataTableErrors: function PeopleFinder__setDefaultDataTableErrors(dataTable)
      {
         var msg = Alfresco.util.message;
         dataTable.set("MSG_EMPTY", msg("message.empty", "Alfresco.PeopleFinder"));
         dataTable.set("MSG_ERROR", msg("message.error", "Alfresco.PeopleFinder"));
      },
      
      /**
       * Updates people list by calling data webscript
       *
       * @method _performSearch
       * @param searchTerm {string} Search term from input field
       */
      _performSearch: function PeopleFinder__performSearch(searchTerm)
      {
         if (!this.isSearching)
         {
            this.isSearching = true;

            // Reset the custom error messages
            this._setDefaultDataTableErrors(this.widgets.dataTable);

            // Don't display any message
            this.widgets.dataTable.set("MSG_EMPTY", this.msg("message.searching"));

            // Empty results table
            this.widgets.dataTable.deleteRows(0, this.widgets.dataTable.getRecordSet().getLength());

            var successHandler = function PeopleFinder__pS_successHandler(sRequest, oResponse, oPayload)
            {
               if (this.options.viewMode != Alfresco.PeopleFinder.VIEW_MODE_COMPACT)
               {
                  if (Dom.hasClass(this.id + "-results", "hidden"))
                  {
                     Dom.removeClass(this.id + "-results", "hidden");
                     Dom.addClass(this.id + "-help", "hidden");
                  }
               }
               this._enableSearchUI();
               this._setDefaultDataTableErrors(this.widgets.dataTable);
               this.widgets.dataTable.onDataReturnInitializeTable.call(this.widgets.dataTable, sRequest, oResponse, oPayload);
            };

            var failureHandler = function PeopleFinder__pS_failureHandler(sRequest, oResponse)
            {
               this._enableSearchUI();
               if (oResponse.status == 401)
               {
                  // Our session has likely timed-out, so refresh to offer the login page
                  window.location.reload();
               }
               else
               {
                  try
                  {
                     var response = YAHOO.lang.JSON.parse(oResponse.responseText);
                     this.widgets.dataTable.set("MSG_ERROR", response.message);
                     this.widgets.dataTable.showTableMessage(response.message, YAHOO.widget.DataTable.CLASS_ERROR);
                  }
                  catch(e)
                  {
                     this._setDefaultDataTableErrors(this.widgets.dataTable);
                  }
               }
            };

            this.searchTerm = searchTerm;
            this.widgets.dataSource.sendRequest(this._buildSearchParams(searchTerm),
            {
               success: successHandler,
               failure: failureHandler,
               scope: this
            });

            // Display a wait feedback message if the people hasn't been found yet
            this.widgets.searchButton.set("disabled", true);
            YAHOO.lang.later(2000, this, function(){
               if (this.isSearching)
               {
                  if (!this.widgets.feedbackMessage)
                  {
                     this.widgets.feedbackMessage = Alfresco.util.PopupManager.displayMessage(
                     {
                        text: Alfresco.util.message("message.searching", this.name),
                        spanClass: "wait",
                        displayTime: 0
                     });
                  }
                  else if (!this.widgets.feedbackMessage.cfg.getProperty("visible"))
                  {
                     this.widgets.feedbackMessage.show();
                  }
               }
            }, []);
         }
      },

      /**
       * Enable search button, hide the pending wait message and set the panel as not searching.
       *
       * @method _enableSearchUI
       * @private
       */
      _enableSearchUI: function PeopleFinder__enableSearchUI()
      {
         // Enable search button and close the wait feedback message if present
         if (this.widgets.feedbackMessage && this.widgets.feedbackMessage.cfg.getProperty("visible"))
         {
            this.widgets.feedbackMessage.hide();
         }
         this.widgets.searchButton.set("disabled", false);
         this.isSearching = false;
      },

      /**
       * Build URI parameter string for People Finder JSON data webscript
       *
       * @method _buildSearchParams
       * @param searchTerm {string} Search terms to query
       */
      _buildSearchParams: function PeopleFinder__buildSearchParams(searchTerm)
      {
         return "filter=" + encodeURIComponent(searchTerm) + "&maxResults=" + this.options.maxSearchResults;
      }
   });
})();/**
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
 * Document Library "Permissions" module for Document Library.
 * 
 * @namespace Alfresco.module
 * @class Alfresco.module.DoclibPermissions
 */
(function()
{
   /**
   * YUI Library aliases
   */
   var Dom = YAHOO.util.Dom;

   /**
    * Alfresco Slingshot aliases
    */
   var $html = Alfresco.util.encodeHTML;

   Alfresco.module.DoclibPermissions = function(htmlId)
   {
      Alfresco.module.DoclibPermissions.superclass.constructor.call(this, "Alfresco.module.DoclibPermissions", htmlId, ["button", "container", "connection", "json"]);
      
      // Initialise prototype properties
      this.rolePickers = {};
      this.hiddenRoles = {};
      
      return this;
   };
   
   YAHOO.extend(Alfresco.module.DoclibPermissions, Alfresco.component.Base,
   {
      /**
       * Object container for initialization options
       */
      options:
      {
         /**
          * Current siteId.
          * 
          * @property siteId
          * @type string
          */
         siteId: "",

         /**
          * Available roles
          *
          * @property: roles
          * @type: array
          * @default: null
          */
         roles: null,

         /**
          * File(s) to apply permissions against
          *
          * @property: files
          * @type: array
          * @default: null
          */
         files: null,

         /**
          * Width for the dialog
          *
          * @property: width
          * @type: integer
          * @default: 44em
          */
         width: "44em"
      },
      
      /**
       * Object container for storing role picker UI elements.
       * 
       * @property rolePickers
       * @type object
       */
      rolePickers: null,

      /**
       * Object container for storing roles that picker doesn't show
       * 
       * @property hiddenRoles
       * @type objects
       */
      hiddenRoles: null,

      /**
       * Container element for template in DOM.
       * 
       * @property containerDiv
       * @type DOMElement
       */
      containerDiv: null,

      /**
       * Main entry point
       * @method showDialog
       */
      showDialog: function DLP_showDialog()
      {
         // Clear cached values
         this.hiddenRoles = {};
         
         // DocLib Actions module
         if (!this.modules.actions)
         {
            this.modules.actions = new Alfresco.module.DoclibActions();
         }
         
         if (!this.containerDiv)
         {
            // Load the UI template from the server
            Alfresco.util.Ajax.request(
            {
               url: Alfresco.constants.URL_SERVICECONTEXT + "modules/documentlibrary/permissions",
               dataObj:
               {
                  htmlid: this.id,
                  site: this.options.siteId
               },
               successCallback:
               {
                  fn: this.onTemplateLoaded,
                  scope: this
               },
               failureMessage: "Could not load Document Library Permissions template",
               execScripts: true
            });
         }
         else
         {
            // Show the dialog
            this._showDialog();
         }
      },

      /**
       * Event callback when dialog template has been loaded
       *
       * @method onTemplateLoaded
       * @param response {object} Server response from load template XHR request
       */
      onTemplateLoaded: function DLP_onTemplateLoaded(response)
      {
         // Inject the template from the XHR request into a new DIV element
         this.containerDiv = document.createElement("div");
         this.containerDiv.setAttribute("style", "display:none");
         this.containerDiv.innerHTML = response.serverResponse.responseText;

         // The panel is created from the HTML returned in the XHR request, not the container
         var dialogDiv = Dom.getFirstChild(this.containerDiv);
         while (dialogDiv && dialogDiv.tagName.toLowerCase() != "div")
         {
            dialogDiv = Dom.getNextSibling(dialogDiv);
         }
         
         // Create and render the YUI dialog
         this.widgets.dialog = Alfresco.util.createYUIPanel(dialogDiv,
         {
            width: this.options.width
         });
         
         // OK and cancel buttons
         this.widgets.okButton = Alfresco.util.createYUIButton(this, "ok", this.onOK);
         this.widgets.cancelButton = Alfresco.util.createYUIButton(this, "cancel", this.onCancel);
         
         // Mark-up the group/role drop-downs
         var roles = YAHOO.util.Selector.query('button.site-group', this.widgets.dialog.element),
            roleElementId, roleValue;
         
         for (var i = 0, j = roles.length; i < j; i++)
         {
            roleElementId = roles[i].id;
            roleValue = roles[i].value;
            this.rolePickers[roleValue] = new YAHOO.widget.Button(roleElementId,
            {
               type: "menu", 
               menu: roleElementId + "-select"
            });
            this.rolePickers[roleValue].getMenu().subscribe("click", this.onRoleSelected, this.rolePickers[roleValue]);
         }
         
         // Reset Permissions button
         this.widgets.resetAll = Alfresco.util.createYUIButton(this, "reset-all", this.onResetAll);
         
         // Show the dialog
         this._showDialog();
      },


      /**
       * YUI WIDGET EVENT HANDLERS
       * Handlers for standard events fired from YUI widgets, e.g. "click"
       */

      /**
       * Role menu item selected event handler
       *
       * @method onRoleSelected
       * @param e {object} DomEvent
       */
      onRoleSelected: function DLP_onRoleSelected(p_sType, p_aArgs, p_oButton)
      {
         var target = p_aArgs[1];
         p_oButton.set("label", target.cfg.getProperty("text"));
         p_oButton.set("name", target.value);
      },
      
      /**
       * Reset All button event handler
       *
       * @method onResetAll
       * @param e {object} DomEvent
       * @param p_obj {object} Object passed back from addListener method
       */
      onResetAll: function DLP_onResetAll(e, p_obj)
      {
         this._applyPermissions("reset-all");
      },
      
      /**
       * Dialog OK button event handler
       *
       * @method onOK
       * @param e {object} DomEvent
       * @param p_obj {object} Object passed back from addListener method
       */
      onOK: function DLP_onOK(e, p_obj)
      {
         // Generate data webscript parameters from UI elements
         var permissions = this._parseUI();
         this._applyPermissions("set", permissions);
      },
      
      /**
       * Apply permissions by calling data webscript with given operation
       *
       * @method _applyPermission
       * @param operation {string} set|reset-all|allow-members-collaborate|deny-all
       * @param params {object} Permission parameters
       */
      _applyPermissions: function DLP__applyPermissions(operation, permissions)
      {
         var files, multipleFiles = [];

         // Single/multi files into array of nodeRefs
         files = this.options.files;
         for (var i = 0, j = files.length; i < j; i++)
         {
            multipleFiles.push(files[i].node.nodeRef);
         }
         
         // Success callback function
         var fnSuccess = function DLP__onOK_success(p_data)
         {
            var result,
              successCount = p_data.json.successCount,
              failureCount = p_data.json.failureCount;
            
            this._hideDialog();

            // Did the operation succeed?
            if (!p_data.json.overallSuccess)
            {
               Alfresco.util.PopupManager.displayMessage(
               {
                  text: this.msg("message.permissions.failure")
               });
               return;
            }
            
            YAHOO.Bubbling.fire("filesPermissionsUpdated",
            {
               successCount: successCount,
               failureCount: failureCount
            });
            
            for (var i = 0, j = p_data.json.totalResults; i < j; i++)
            {
               result = p_data.json.results[i];
               
               if (result.success)
               {
                  YAHOO.Bubbling.fire(result.type == "folder" ? "folderPermissionsUpdated" : "filePermissionsUpdated",
                  {
                     multiple: true,
                     nodeRef: result.nodeRef
                  });
               }
            }
            
            Alfresco.util.PopupManager.displayMessage(
            {
               text: this.msg("message.permissions.success", successCount)
            });
         };
         
         // Failure callback function
         var fnFailure = function DLP__onOK_failure(p_data)
         {
            this._hideDialog();

            Alfresco.util.PopupManager.displayMessage(
            {
               text: this.msg("message.permissions.failure")
            });
         };

         // Construct the data object for the genericAction call
         this.modules.actions.genericAction(
         {
            success:
            {
               callback:
               {
                  fn: fnSuccess,
                  scope: this
               }
            },
            failure:
            {
               callback:
               {
                  fn: fnFailure,
                  scope: this
               }
            },
            webscript:
            {
               method: Alfresco.util.Ajax.POST,
               name: "permissions/{operation}/site/{site}",
               params:
               {
                  site: this.options.siteId,
                  operation: operation
               }
            },
            config:
            {
               requestContentType: Alfresco.util.Ajax.JSON,
               dataObj:
               {
                  nodeRefs: multipleFiles,
                  permissions: permissions
               }
            }
         });

         this.widgets.okButton.set("disabled", true);
         this.widgets.cancelButton.set("disabled", true);
      },

      /**
       * Dialog Cancel button event handler
       *
       * @method onCancel
       * @param e {object} DomEvent
       * @param p_obj {object} Object passed back from addListener method
       */
      onCancel: function DLP_onCancel(e, p_obj)
      {
         this._hideDialog();
      },


      /**
       * PRIVATE FUNCTIONS
       */

      /**
       * Internal show dialog function
       * @method _showDialog
       */
      _showDialog: function DLP__showDialog()
      {
         var i, j;
         
         // Enable buttons
         this.widgets.okButton.set("disabled", false);
         this.widgets.cancelButton.set("disabled", false);

         // Dialog title
         var titleDiv = Dom.get(this.id + "-title");
         if (YAHOO.lang.isArray(this.options.files))
         {
            titleDiv.innerHTML = this.msg("title.multi", this.options.files.length);
         }
         else
         {
            var fileSpan = '<span class="light">' + $html(this.options.files.displayName) + '</span>';
            titleDiv.innerHTML = this.msg("title.single", fileSpan);
            // Convert to array
            this.options.files = [this.options.files];
         }
         
         // Default values - "None" initially
         for (var rolePicker in this.rolePickers)
         {
            if (this.rolePickers.hasOwnProperty(rolePicker))
            {
               this.rolePickers[rolePicker].set("name", "");
               this.rolePickers[rolePicker].set("label", this.msg("role.None"));
            }
         }
         
         var defaultRoles = this.options.files[0].node.permissions.roles,
            permissions;

         for (i = 0, j = defaultRoles.length; i < j; i++)
         {
            permissions = defaultRoles[i].split(";");
            if (permissions[1] in this.rolePickers)
            {
               this.rolePickers[permissions[1]].set("name", permissions[2]);
               // it's possible that an odd collection of permissions have been set - one that is not defined
               // as a well known Share role combination - so all for that possibility i.e. no msg available
               var msg = this.msg("role." + permissions[2]);
               if (msg === "role." + permissions[2])
               {
                  msg = permissions[2];
               }
               this.rolePickers[permissions[1]].set("label", msg);
            }
            else
            {
               this.hiddenRoles[permissions[1]] =
               {
                  user: permissions[1],
                  role: permissions[2]
               };
            }
         }

         // Register the ESC key to close the dialog
         var escapeListener = new YAHOO.util.KeyListener(document,
         {
            keys: YAHOO.util.KeyListener.KEY.ESCAPE
         },
         {
            fn: function(id, keyEvent)
            {
               this.onCancel();
            },
            scope: this,
            correctScope: true
         });
         escapeListener.enable();

         // Show the dialog
         this.widgets.dialog.show();
      },

      /**
       * Hide the dialog, removing the caret-fix patch
       *
       * @method _hideDialog
       * @private
       */
      _hideDialog: function DLP__hideDialog()
      {
         // Grab the form element
         var formElement = Dom.get(this.id + "-form");

         // Undo Firefox caret issue
         Alfresco.util.undoCaretFix(formElement);
         this.widgets.dialog.hide();
      },

      /**
       * Parse the UI elements into a parameters object
       *
       * @method _parseUI
       * @return {object} Parameters ready for webscript execution
       * @private
       */
      _parseUI: function DLP__parseUI()
      {
         var params = [],
            role;
         
         // Set any hidden roles to avoid removing them from node
         for (var user in this.hiddenRoles)
         {
            params.push(
            {
               group: this.hiddenRoles[user].user,
               role: this.hiddenRoles[user].role
            });
         }
         
         // Set roles from the permission selectors
         for (var picker in this.rolePickers)
         {
            if (this.rolePickers.hasOwnProperty(picker))
            {
               role = this.rolePickers[picker].get("name");
               if ((role != "") && (role != "None"))
               {
                  params.push(
                  {
                     group: this.rolePickers[picker].get("value"),
                     role: role
                  });
               }
            }
         }

         return params;
      }
   });

   /* Dummy instance to load optional YUI components early */
   var dummyInstance = new Alfresco.module.DoclibPermissions("null");
})();
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
 * Document Library "Details" module for Document Library.
 * 
 * @namespace Alfresco.module
 * @class Alfresco.module.DoclibAspects
 */
(function()
{
   /**
   * YUI Library aliases
   */
   var Dom = YAHOO.util.Dom,
      Event = YAHOO.util.Event;

   /**
    * Alfresco Slingshot aliases
    */
   var $html = Alfresco.util.encodeHTML;


   Alfresco.module.DoclibAspects = function(htmlId)
   {
      Alfresco.module.DoclibAspects.superclass.constructor.call(this, htmlId, ["button", "container", "datasource", "datatable"]);

      this.eventGroup = htmlId;
      this.currentValues = [];
      this.selectedValues = {};

      return this;
   };
   
   YAHOO.extend(Alfresco.module.DoclibAspects, Alfresco.module.SimpleDialog,
   {
      /**
       * Those that are currently applied to the object in the repository.
       * 
       * @property currentValues
       * @type object
       */
      currentValues: null,

      /**
       * Keeps a list of selected values for evaluating added and removed values.
       * 
       * @property selectedValues
       * @type object
       */
      selectedValues: null,

      /**
       * Set multiple initialization options at once.
       *
       * @method setOptions
       * @override
       * @param obj {object} Object literal specifying a set of options
       * @return {Alfresco.DocListToolbar} returns 'this' for method chaining
       */
      setOptions: function DA_setOptions(obj)
      {
         Alfresco.module.DoclibAspects.superclass.setOptions.call(this,
         {
            width: "50em",
            templateUrl: Alfresco.constants.URL_SERVICECONTEXT + "modules/documentlibrary/aspects",
            doBeforeDialogShow:
            {
               fn: this.doBeforeDialogShow,
               obj: null,
               scope: this
            },
            doBeforeAjaxRequest:
            {
               fn: this.doBeforeAjaxRequest,
               obj: null,
               scope: this
            }
         });

         this.options = YAHOO.lang.merge(this.options, obj);
         
         return this;
      },

      /**
       * Render item using a passed-in template
       *
       * @method renderItem
       * @param item {object} Item object literal
       * @param template {string} String with "{parameter}" style placeholders
       */
      renderItem: function DA_renderItem(item, template)
      {
         var renderHelper = function(p_key, p_value, p_metadata)
         {
            var html = "";
            
            if (p_key.toLowerCase() == "icon")
            {
               // Look for extra metadata to specify width x height, e.g. "{icon 16 16}"
               var width = "", height = "", arrDims;
               if (p_metadata && p_metadata.length > 0)
               {
                  arrDims = p_metadata.split(" ");
                  width = ' width="' + arrDims[0] + '"';
                  if (arrDims.length > 1)
                  {
                     height = ' height="' + arrDims[1] + '"';
                  }
               }
               html = '<img src="' + p_value + '"' + width + height + ' alt="' + $html(item.name) + '" title="' + $html(item.name) + '" />'; 
            }
            else
            {
               html = $html(p_value);
            }
            
            return html;
         };
         
         return YAHOO.lang.substitute(template, item, renderHelper);
      },
      
      /**
       * Return i18n string for given aspect
       *
       * @method i18n
       * @param aspect {string} The aspect qName
       * @param scope {object} Optional - Scope if 'this' is not the component instance
       * @return {string} The custom message
       */
      i18n: function DA_i18n(aspect, scope)
      {
         return this.msg("aspect." + aspect.replace(":", "_"));
      },
      
      /**
       * Interceptor just before dialog is shown
       *
       * @method doBeforeDialogShow
       * @param p_form {object} The forms runtime instance
       * @param p_this {object} Caller scope
       * @param p_obj {object} Optional - arbitrary object passed through
       */
      doBeforeDialogShow: function DA_doBeforeDialogShow(p_form, p_this, p_obj)
      {
         // Dialog title
         var fileSpan = '<span class="light">' + $html(this.options.file.displayName) + '</span>';
         Dom.get(this.id + "-title").innerHTML = this.msg("title", fileSpan);

         // DocLib Actions module
         if (!this.modules.actions)
         {
            // This module does not rely on Site scope, so can use the DoclibActions module in Repository mode all the time.
            this.modules.actions = new Alfresco.module.DoclibActions(Alfresco.doclib.MODE_REPOSITORY);
         }
         
         this._createAspectsControls();
         this._requestAspectData();

         // Enable buttons
         this.widgets.okButton.set("disabled", false);
         this.widgets.cancelButton.set("disabled", false);
      },
      
      /**
       * Interceptor just before Ajax request is sent
       *
       * @method doBeforeAjaxRequest
       * @param p_config {object} Object literal containing request config
       * @return {boolean} True to continue sending form, False to prevent it
       */
      doBeforeAjaxRequest: function DA_doBeforeAjaxRequest(p_config)
      {
         // Success callback function
         var fnSuccess = function DA_dBAR_success(p_data)
         {
            this.hide();

            // Did the operation succeed?
            Alfresco.util.PopupManager.displayMessage(
            {
               text: this.msg(p_data.json.overallSuccess ? "message.aspects.success" : "message.aspects.failure")
            });
            
            if (p_data.json.results[0].tagScope)
            {
               // TODO: Call a (non-existent) REST API to refresh the tag scope, then fire tagRefresh upon it's return
               // YAHOO.Bubbling.fire("tagRefresh");
            }
         };

         // Failure callback function
         var fnFailure = function DA_dBAR_failure(p_data)
         {
            this.hide();

            Alfresco.util.PopupManager.displayMessage(
            {
               text: this.msg("message.aspects.failure")
            });
         };

         // Construct generic action call
         this.modules.actions.genericAction(
         {
            success:
            {
               event:
               {
                  name: "metadataRefresh",
                  obj:
                  {
                     highlightFile: this.options.file.name
                  }
               },
               callback:
               {
                  fn: fnSuccess,
                  scope: this
               }
            },
            failure:
            {
               callback:
               {
                  fn: fnFailure,
                  scope: this
               }
            },
            webscript:
            {
               method: Alfresco.util.Ajax.POST,
               name: "aspects/node/{nodeRef}",
               params:
               {
                  nodeRef: this.options.file.jsNode.nodeRef.uri
               }
            },
            config:
            {
               requestContentType: Alfresco.util.Ajax.JSON,
               dataObj:
               {
                  added: this.getAddedValues(),
                  removed: this.getRemovedValues()
               }
            }
         });

         // Return false - we'll be using our own Ajax request
         return false;
      },

      /**
       * Returns an array of values that have been added to the current values
       *
       * @method getAddedValues
       * @return {array}
       */
      getAddedValues: function DA_getAddedValues()
      {
         var addedValues = [],
            currentValues = Alfresco.util.arrayToObject(this.currentValues);
         
         for (var value in this.selectedValues)
         {
            if (this.selectedValues.hasOwnProperty(value))
            {
               if (!(value in currentValues))
               {
                  addedValues.push(value);
               }
            }
         }
         return addedValues;
      },

      /**
       * Returns an array of values that have been removed from the current values
       *
       * @method getRemovedValues
       * @return {array}
       */
      getRemovedValues: function DA_getRemovedValues()
      {
         var removedValues = [],
            currentValues = Alfresco.util.arrayToObject(this.currentValues);
         
         for (var value in currentValues)
         {
            if (currentValues.hasOwnProperty(value))
            {
               if (!(value in this.selectedValues))
               {
                  removedValues.push(value);
               }
            }
         }
         return removedValues;
      },


      /**
       * PRIVATE FUNCTIONS
       */
      
      /**
       * Creates UI controls to support Aspect picker.
       *
       * NOTE: This function has "refactor" written all over it. It's on the TODO list...
       *
       * @method _createAspectsControls
       * @private
       */
      _createAspectsControls: function DA__createAspectsControls()
      {
         var me = this;

         /**
          * Icon datacell formatter
          */
         var renderCellIcon = function renderCellIcon(elCell, oRecord, oColumn, oData)
         {
            Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");
            elCell.innerHTML = me.renderItem(oRecord.getData(), '<div>{icon 16 16}</div>');
         };

         /**
          * Name datacell formatter
          */
         var renderCellName = function renderCellName(elCell, oRecord, oColumn, oData)
         {
            elCell.innerHTML = me.renderItem(oRecord.getData(), '<h3 class="name">{name}</h3>');
         };

         /**
          * Add button datacell formatter
          */
         var renderCellAdd = function renderCellAdd(elCell, oRecord, oColumn, oData)
         {
            Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");
            if (oRecord.getData("canAdd"))
            {
               elCell.innerHTML = '<a href="#" class="add-item add-' + me.eventGroup + '" title="' + me.msg("button.add") + '"><span class="addIcon">&nbsp;</span></a>';
            }
         };

         /**
          * Remove item datacell formatter
          */
         var renderCellRemove = function renderCellRemove(elCell, oRecord, oColumn, oData)
         {  
            Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");
            if (oRecord.getData("canRemove"))
            {
               elCell.innerHTML = '<a href="#" class="remove-item remove-' + me.eventGroup + '" title="' + me.msg("button.remove") + '"><span class="removeIcon">&nbsp;</span></a>';
            }
         };

         /**
          * Addable values list (left-hand side)
          */
         // DataSource
         this.widgets.dataSourceLeft = new YAHOO.util.DataSource([],
         {
            responseType: YAHOO.util.DataSource.TYPE_JSARRAY
         }); 

         // DataTable
         var columnDefinitionsLeft =
         [
            { key: "icon", label: "icon", sortable: false, formatter: renderCellIcon, width: 10 },
            { key: "name", label: "name", sortable: false, formatter: renderCellName },
            { key: "id", label: "add", sortable: false, formatter: renderCellAdd, width: 16 }
         ];
         this.widgets.dataTableLeft = new YAHOO.widget.DataTable(this.id + "-left", columnDefinitionsLeft, this.widgets.dataSourceLeft,
         {
            MSG_EMPTY: this.msg("label.loading")
         });

         // Hook action click events
         var fnAddHandler = function fnAddItemHandler(layer, args)
         {
            var owner = YAHOO.Bubbling.getOwnerByTagName(args[1].anchor, "div");
            if (owner !== null)
            {
               var target = args[1].target,
                  rowId = target.offsetParent,
                  record = me.widgets.dataTableLeft.getRecord(rowId);

               if (record)
               {
                  me.widgets.dataTableRight.addRow(record.getData());
                  me.selectedValues[record.getData("id")] = record;
                  me.widgets.dataTableLeft.deleteRow(rowId);
               }
            }
            return true;
         };
         YAHOO.Bubbling.addDefaultAction("add-" + this.eventGroup, fnAddHandler);

         /**
          * Selected values list (right-hand side)
          */
         this.widgets.dataSourceRight = new YAHOO.util.DataSource([],
         {
            responseType: YAHOO.util.DataSource.TYPE_JSARRAY
         }); 
         var columnDefinitionsRight =
         [
            { key: "icon", label: "icon", sortable: false, formatter: renderCellIcon, width: 10 },
            { key: "name", label: "name", sortable: false, formatter: renderCellName },
            { key: "id", label: "remove", sortable: false, formatter: renderCellRemove, width: 16 }
         ];
         this.widgets.dataTableRight = new YAHOO.widget.DataTable(this.id + "-right", columnDefinitionsRight, this.widgets.dataSourceRight,
         {
            MSG_EMPTY: this.msg("label.loading")
         });

         // Hook action click events
         var fnRemoveHandler = function fnRemoveHandler(layer, args)
         {
            var owner = YAHOO.Bubbling.getOwnerByTagName(args[1].anchor, "div");
            if (owner !== null)
            {
               var target = args[1].target,
                  rowId = target.offsetParent,
                  record = me.widgets.dataTableRight.getRecord(rowId);

               if (record)
               {
                  me.widgets.dataTableLeft.addRow(record.getData());
                  delete me.selectedValues[record.getData("id")];
                  me.widgets.dataTableRight.deleteRow(rowId);
               }
            }
            return true;
         };
         YAHOO.Bubbling.addDefaultAction("remove-" + this.eventGroup, fnRemoveHandler);
      },
      
      /**
       * Gets current aspect values from the Repository
       *
       * @method _requestAspectData
       * @private
       */
      _requestAspectData: function DA__requestAspectData()
      {
         this.selectedValues = {};
         
         Alfresco.util.Ajax.request(
         {
            method: "GET",
            url: Alfresco.constants.PROXY_URI + 'slingshot/doclib/aspects/node/' + this.options.file.jsNode.nodeRef.uri,
            successCallback: 
            { 
               fn: this._requestAspectDataSuccess, 
               scope: this 
            },
            failureCallback: 
            { 
               fn: this._requestAspectDataFailure, 
               scope: this 
            }
         });
      },

      /**
       * Failure handler for aspect data request
       *
       * @method _requestAspectDataFailure
       * @private
       */
      _requestAspectDataFailure: function DA__requestAspectDataFailure()
      {
         this.widgets.dataTableLeft.set("MSG_EMPTY", this.msg("label.load-failure"));
         this.widgets.dataTableRight.set("MSG_EMPTY", this.msg("label.load-failure"));
      },
      
      /**
       * Success handler for aspect data request
       *
       * @method _requestAspectDataSuccess
       * @param response {object} Object literal containing response data
       * @private
       */
      _requestAspectDataSuccess: function DA__requestAspectDataSuccess(response)
      {
         this.currentValues = {};
         
         if (typeof response.json != "undefined")
         {
            var currentArr = response.json.current,
               currentObj = Alfresco.util.arrayToObject(currentArr),
               visibleArr = this.options.visible,
               visibleObj = Alfresco.util.arrayToObject(visibleArr),
               addableArr = this.options.addable,
               removeableArr = this.options.removeable,
               i, ii;

            this.currentValues = currentArr;

            if (addableArr.length === 0)
            {
               addableArr = visibleArr.slice(0);
            }
            
            this._googleDocsFilter(addableArr);
            
            if (removeableArr.length === 0)
            {
               removeableArr = visibleArr.slice(0);
            }
            var addableObj = Alfresco.util.arrayToObject(addableArr),
               removeableObj = Alfresco.util.arrayToObject(removeableArr);

            var current, addable, record;
            // Current Values into right-hand table
            for (i = 0, ii = currentArr.length; i < ii; i++)
            {
               current = currentArr[i];
               record =
               {
                  id: current,
                  icon: Alfresco.constants.URL_RESCONTEXT + "components/images/aspect-16.png",
                  name: this.i18n(current),
                  canAdd: current in addableObj,
                  canRemove: current in removeableObj
               };
               if (current in visibleObj)
               {
                  this.widgets.dataTableRight.addRow(record);
               }
               this.selectedValues[current] = record;
            }
            
            // Addable values into left-hand table
            for (i = 0, ii = addableArr.length; i < ii; i++)
            {
               addable = addableArr[i];
               if ((addable in visibleObj) && !(addable in currentObj))
               {
                  this.widgets.dataTableLeft.addRow(
                  {
                     id: addable,
                     icon: Alfresco.constants.URL_RESCONTEXT + "components/images/aspect-16.png",
                     name: this.i18n(addable),
                     canAdd: true,
                     canRemove: true
                  });
               }
            }

            this.widgets.dataTableLeft.set("MSG_EMPTY", this.msg("label.no-addable"));
            this.widgets.dataTableRight.set("MSG_EMPTY", this.msg("label.no-current"));
            this.widgets.dataTableLeft.render();
            this.widgets.dataTableRight.render();
         }
      },
      
      /**
       * Filters addable aspects based on certain application business logic
       *
       * @method _googleDocsFilter
       * @protected
       * @param addable {Array} Array of addable aspects as read from configuration
       */
       _googleDocsFilter: function DA__googleDocsFilter(addable)
       {
          var googleDocsAllowed =
          {
             "text/plain": true,
             "application/msword": true,
             "application/vnd.ms-excel": true,
             "application/vnd.ms-powerpoint": true
          },
            mimetype = this.options.file.node.mimetype;
          
          if (!googleDocsAllowed.hasOwnProperty(mimetype))
          {
             // Array Remove - By John Resig (MIT Licensed)
             var fnArrayRemove = function fnArrayRemove(array, from, to)
             {
               var rest = array.slice((to || from) + 1 || array.length);
               array.length = from < 0 ? array.length + from : from;
               return array.push.apply(array, rest);
             };

             for (var i = 0, ii = addable.length; i < ii; i++)
             {
                if (addable[i] == "gd:googleEditable")
                {
                   fnArrayRemove(addable, i);
                   break;
                }
             }
          }
       }
   });
})();
/**
 * Dummy instance to load optional YUI components early.
 * Use fake "null" id, which is tested later in onComponentsLoaded()
*/
var doclibAspects = new Alfresco.module.DoclibAspects("null");/**
 * Copyright (C) 2005-2011 Alfresco Software Limited.
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
 * socialPublishing component.
 *
 * Enables a user to publish a nodeRef to an external channel or view the publish history on a node.
 *
 * @namespace Alfresco.module
 * @class Alfresco.module.socialPublishing
 */
 
(function()
{
   
   /**
    * YUI Library aliases
    */
   var Dom = YAHOO.util.Dom,
         Event = YAHOO.util.Event,
         Selector = YAHOO.util.Selector,
         KeyListener = YAHOO.util.KeyListener;
   
   /**
    * socialPublishing constructor.
    *
    * socialPublishing is considered a singleton so constructor should be treated as private,
    * please use Alfresco.module.getsocialPublishingInstance() instead.
    *
    * @param {string} htmlId The HTML id of the parent element
    * @return {Alfresco.module.socialPublishing} The new socialPublishing instance
    * @constructor
    * @private
    */
   Alfresco.module.socialPublishing = function(containerId)
   {
      this.name = "Alfresco.module.socialPublishing";
      this.id = containerId;

      var instance = Alfresco.util.ComponentManager.get(this.id);
      if (instance !== null)
      {
         throw new Error("An instance of Alfresco.module.socialPublishing already exists.");
      }

      /* Register this component */
      Alfresco.util.ComponentManager.register(this);

      // Load YUI Components
      Alfresco.util.YUILoaderHelper.require(["button", "container"], this.onComponentsLoaded, this);

      return this;
      
   };

   Alfresco.module.socialPublishing.prototype =
   {

      /**
       * The default config for the gui state for the publish dialog.
       * The user can override these properties in the show() method.
       *
       * @property defaultShowConfig
       * @type object
       */
      defaultShowConfig:
      {
         nodeRef: null,
         filename: null
      },

      /**
       * The merged result of the defaultShowConfig and the config passed in
       * to the show method.
       *
       * @property showConfig
       * @type object
       */
      showConfig: {},
      
      /**
       * Object container for storing YUI widget and HTMLElement instances.
       *
       * @property widgets
       * @type object
       */
      widgets: {},
      
      /**
       * Property containing an object of the status update channels and their limit.
       * used by this.checkUpdateLength()
       * 
       * @property updateLimits
       * @type object
       * 
       */
      updateLimits: {},
      
      /**
       * Fired by YUILoaderHelper when required component script files have
       * been loaded into the browser.
       *
       * @method onComponentsLoaded
       */
      onComponentsLoaded: function SP_onComponentsLoaded()
      {
         // Shortcut for dummy instance
         if (this.id === null)
         {
            return;
         }
      },

      /**
       * Sets the update limits for later use in checkUpdateLength()
       */
      setUpdateLimits: function SP_setUpdateLimits(obj) 
      {
         this.updateLimits = obj;
         
         // allow chaining
         return this
      },
      
      /**
       * Show can be called multiple times and will display the dialog
       * in different ways depending on the config parameter.
       *
       * @method show
       * @param config {object} describes how the dialog should be displayed
       * The config object is in the form of:
       * {
       *    nodeRef: {string},  // the nodeRef
       *    version: {string}   // the version to show properties of
       * }
       */
      show: function SP_show(config)
      {  
         // Merge the supplied config with default config and check mandatory properties
         this.showConfig = YAHOO.lang.merge(this.defaultShowConfig, config);
         if (this.showConfig.nodeRef === undefined ||
             this.showConfig.filename === undefined)
         {
             throw new Error("A nodeRef & filename must be provided");
         }
         
         // If this.widgets.panel exists, but is for a different nodeRef, start again.
         if (this.widgets.panel) 
         {
            this.widgets.panel.destroy;
         }
         
         // If it hasn't load the gui (template) from the server
         Alfresco.util.Ajax.request(
         {
            url: Alfresco.constants.URL_SERVICECONTEXT + "modules/social-publishing?nodeRef=" + this.showConfig.nodeRef + "&htmlid=" + this.id,
            successCallback:
            {
               fn: this.onTemplateLoaded,
               scope: this
            },
            failureMessage: Alfresco.util.message("socialPublish.template.error", this.name),
            execScripts: true
         });
         
         // Register the ESC key to close the dialog
         this.widgets.escapeListener = new KeyListener(document,
         {
            keys: KeyListener.KEY.ESCAPE
         },
         {
            fn: this.onCancelButtonClick,
            scope: this,
            correctScope: true
         }); 
                  
      },

      /**
       * Called when the dialog html template has been returned from the server.
       * Creates the YIU gui objects such as the panel.
       *
       * @method onTemplateLoaded
       * @param response {object} a Alfresco.util.Ajax.request response object
       */
      onTemplateLoaded: function SP_onTemplateLoaded(response)
      {


         // Check the widget has been created. If there are no channels, it won't be:
         if (response.serverResponse.responseText.indexOf(this.id) === -1)
         {
            Alfresco.util.PopupManager.displayMessage(
            {
               text: Alfresco.util.message("socialPublish.noChannels")
            });
            return;
         }

         // Inject the template from the XHR request into a new DIV element
         var containerDiv = document.createElement("div");
         containerDiv.innerHTML = response.serverResponse.responseText;
               
         var dialogDiv = YAHOO.util.Dom.getFirstChild(containerDiv);

         // Create the panel from the HTML returned in the server reponse         
         this.widgets.panel = Alfresco.util.createYUIPanel(dialogDiv);

         // associate the panel with a nodeRef so we know when to refresh or redisplay it:
         this.widgets.panel.nodeRef = this.showConfig.nodeRef;
         
         this.widgets.selectChannelButton = new YAHOO.widget.Button(this.id + "-channel-select-button",
         {
            type: "menu",
            menu: this.id + "-publishChannel-menu",
            lazyloadmenu: false
         });
         
         this.widgets.selectStatusUpdateChannels = new YAHOO.widget.Button(this.id + "-statusSelect-button",
         {
            type: "menu",
            menu: this.id + "-statusSelect-menu",
            lazyloadmenu: false
         });
         
         
         // Save a reference to HTMLElements
         this.widgets.headerText = Dom.get(this.id + "-header-span");
         this.widgets.cancelButton = Alfresco.util.createYUIButton(this, "cancel-button", this.onCancelButtonClick);
         this.widgets.publishButton = Alfresco.util.createYUIButton(this, "publish-button", this.onPublishButtonClick);
         this.widgets.formContainer = Dom.get(this.id + "-publish-form");
         this.widgets.statusUpdateText = Dom.get(this.id + "-statusUpdate-text");
         this.widgets.statusUpdateCount = Dom.get(this.id + "-statusUpdate-count");
         this.widgets.statusUpdateCountMsg = Dom.get(this.id + "-statusUpdate-countMessage");
         this.widgets.statusUpdateChannelCount = Dom.get(this.id + "-statusUpdate-channel-count");
         this.widgets.statusUpdateCountURL = Dom.get(this.id + "-statusUpdate-count-urlMessage");
         this.widgets.statusUpdateCheckboxes = Dom.getElementsByClassName("statusUpdate-checkboxes", "input", this.widgets.formContainer);
         this.widgets.statusUpdateUrlCheckbox = Dom.get(this.id + "-statusUpdate-checkbox-url");
         
         // add key listener to update the character count
         Event.addListener(this.widgets.statusUpdateText, "keydown", this.onStatusUpdateKeypress, {}, this);
         Event.addListener(this.widgets.statusUpdateText, "keyup", this.onStatusUpdateKeypress, {}, this);
         
         // add listener for the status update check box.
         Event.addListener(this.widgets.statusUpdateCheckboxes, "click", this.onStatusCheckboxToggle, {}, this);

         // add listener for selection of publish channel:
         Event.addListener(Dom.get(this.id + "-publishChannel-menu"), "click", this.onSelectPublishChannel, {}, this);
         
         // add listeners for multi select options for Status Updates
         Event.addListener(Dom.get(this.id + "-statusSelectActionAll"), "click", this.onSelectAllStatusChannels, {}, this);
         Event.addListener(Dom.get(this.id + "-statusSelectActionNone"), "click", this.onSelectNoStatusChannels, {}, this);
         
         // add listener for URL check box
         Event.addListener(this.widgets.statusUpdateUrlCheckbox, "click", this.onStatusURLToggle, {}, this);
         
         // Show panel
         this._showPanel();
         
      },
      
      /**
       * Fired when the user clicks the cancel button.
       * Closes the panel.
       *
       * @method onCancelButtonClick
       * @param event {object} a Button "click" event
       */
      onCancelButtonClick: function SP_onCancelButtonClick()
      {
         this.closeDialogue();
      },
      
      /**
       * Fired when the user clicks the "Publish" button on the dialogue
       * 
       * @method onPublishButtonClick
       */
      onPublishButtonClick: function SP_onPublishButtonClick()
      {
         // create the JSON object for the POST request.
         var selectedChannelId = this.widgets.selectChannelButton.get("value"),
            publishData = 
            {
               "channelId": selectedChannelId,
               "publishNodes": [this.showConfig.nodeRef],
               "statusUpdate": {}
            },
            me = this,
            statusUpdateChannels = []
            includeStatus = false;
         
         // Are any of the status update channels selected?
         for (var i = 0; i < this.widgets.statusUpdateCheckboxes.length; i++) {
            if (this.widgets.statusUpdateCheckboxes[i].checked) {
               statusUpdateChannels.push(this.widgets.statusUpdateCheckboxes[i].value);
               includeStatus = true;
            }
         }
         
         // Build up the JSON object for the statusUpdate
         if (includeStatus) {
            publishData.statusUpdate = 
            {
               "message": this.widgets.statusUpdateText.value,
               "channelIds": statusUpdateChannels
            }
            // If the URL is to be included, add the nodeRef to the statusUpdate obj
            if (this.widgets.statusUpdateUrlCheckbox.checked) {
               publishData.statusUpdate.nodeRef = this.showConfig.nodeRef
            }
         };
         
         // Define success and failure functions inline so they have closeure access to local vars.
         var success = function SP_onPublishSuccess(response)
         {
            // Check to see if there is a DocumentPublishing module that needs refreshing
            var DocPubComponent = Alfresco.util.ComponentManager.findFirst("Alfresco.DocumentPublishing")
            if (DocPubComponent !== null) {
               DocPubComponent.doRefresh();
            }
            
            // Build up necessary data and HTML.
            // It looks more complicated than it actually is.
            var fileName = me.showConfig.filename, 
               channelName = this.widgets.selectChannelButton.getAttributeConfig("label").value,
               docDetailsURL = Alfresco.constants.URL_PAGECONTEXT + "document-details?nodeRef=" + me.showConfig.nodeRef;
               linkText = Alfresco.util.message("socialPublish.confirm.link", me.name, 
                     {
                        "0": fileName
                     }),
               linkHTML = "<a href='" + docDetailsURL + "'>" + linkText + "</a>",
               channelHTML = "<span class='channel'>" + channelName + "</span>",
               trackingText = Alfresco.util.message("socialPublish.confirm.track", me.name,
                  {
                     "0": linkHTML
                  }),
               successText = Alfresco.util.message("socialPublish.confirm.success", me.name,
                  {
                     "0": fileName,
                     "1": channelHTML
                  }),
               balloonHTML = "<div class='publishConfirm'><div class='success'>" + successText + "</div><div class='tracking'>" + trackingText + "</div></div>",
               doclib = Alfresco.util.ComponentManager.findFirst("Alfresco.DocumentList")
               balloonElement = (doclib) ? Dom.get(doclib.id) : Dom.getElementsByClassName("document-thumbnail")[0];
               balloon = Alfresco.util.createBalloon(balloonElement,
               {
                  html: balloonHTML,
                  width: "48em"
               });
            
            balloon.show();
            // hide the balloon after 10 seconds.
            YAHOO.lang.later(10000, this, function()
            {
               balloon.hide();
            })
         }
         
         // Make the POST request to the publishing queue
         Alfresco.util.Ajax.request(
         {
            url: Alfresco.constants.PROXY_URI + "api/publishing/queue",
            method: Alfresco.util.Ajax.POST,
            requestContentType: "application/json",
            responseContentType: "application/json",
            dataObj: publishData,
            successCallback:
            {
               fn: success,
               scope: this
            },
            failureMessage: Alfresco.util.message("socialPublish.confirm.failure", this.name)
         });
         
         this.closeDialogue();
      },
      
      /**
       * 
       * Closes the fialogue and tidys up any loose ends
       * 
       * @method closeDialogue
       */
      closeDialogue: function SP_closeDialogue(){
         
         // hide the truncation message
         this.resetTruncationMsg();
         
         // Hide the panel
         this.widgets.panel.hide();
         
         // Disable the Esc key listener
         this.widgets.escapeListener.disable(); 
         
      },
      
      /**
       * 
       * Triggered on Keyup event in the status update box
       * 
       * @method onStatusUpdateKeypress
       */
      onStatusUpdateKeypress: function SP_onStatusUpdateKeypress()
      {
         this.checkUpdateLength();
      },
      
      /**
       * 
       * Triggered when a Status Update check box is selected or unselected.
       * 
       * @method onStatusCheckboxToggle
       */
      onStatusCheckboxToggle: function SP_onStatusCheckboxToggle(event)
      {
         // apply the selected class
         Alfresco.util.toggleClass(Dom.getAncestorByClassName(Event.getTarget(event), "status-channel"), "selected");

         // trigger onSelected function
         this.onSelectedStatusChannelChange();
      },
      
      /**
       * 
       * Triggered when the "All" open is selected from the select dropdown list on the status update channels
       * 
       * @method onSelectAllStatusChannels
       */
      onSelectAllStatusChannels: function SP_onSelectAllStatusChannels(event){
         for (var i in this.widgets.statusUpdateCheckboxes){
            var el = this.widgets.statusUpdateCheckboxes[i]
            el.checked = true;
            Dom.addClass(Dom.getAncestorByClassName(el, "status-channel"), "selected");
         }
         this.onSelectedStatusChannelChange();
         Event.preventDefault(event);
      },

      /**
       * 
       * Triggered when the "None" open is selected from the select dropdown list on the status update channels
       * 
       * @method onSelectNoStatusChannels
       */
      onSelectNoStatusChannels: function SP_onSelectNoStatusChannels(event){
         for (var i in this.widgets.statusUpdateCheckboxes){
            var el = this.widgets.statusUpdateCheckboxes[i]
            el.checked = false;
            Dom.removeClass(Dom.getAncestorByClassName(el, "status-channel"), "selected");
         }
         this.onSelectedStatusChannelChange();
         Event.preventDefault(event);
      },
      
      /**
       * called everytime a change is made to the list of selected status channels.
       * 
       * @method onSelectedStatusChannelChange
       */
      onSelectedStatusChannelChange: function SP_onSelectedStatusChannelChange(){
         // Reset the Truncation Message (this will be shown again by checkUpdateLength if required)
         this.resetTruncationMsg();
         
         // Update Character Count
         this.checkUpdateLength();
         
         // Update selected channel count
         var selectedChannelsCount = Selector.filter(this.widgets.statusUpdateCheckboxes, ":checked").length 
         this.widgets.statusUpdateChannelCount.innerHTML = Alfresco.util.message("socialPublish.dialogue.statusUpdate.select.count", this.name,
         {
            "0": selectedChannelsCount,
            "1": this.widgets.statusUpdateCheckboxes.length 
         });
         
         // Enable or disable the status update boxes.
         if (selectedChannelsCount > 0) {
            // enable status update boxes:
            this.widgets.statusUpdateText.removeAttribute("disabled")
            this.widgets.statusUpdateUrlCheckbox.removeAttribute("disabled")
         } 
         else 
         {
            // disable status update boxes:
            Dom.setAttribute(this.widgets.statusUpdateText, "disabled", "disabled");
            Dom.setAttribute(this.widgets.statusUpdateUrlCheckbox, "disabled", "disabled");
         }         
      },
      
      /**
       * Triggered when the user clicks on the checkbox to include the URL or not.
       * 
       * @method onStatusURLToggle
       */
      onStatusURLToggle: function SP_onStatusURLToggle() 
      {
         this.checkUpdateLength();
      },
      
      /**
       * Triggered when the user selects a channel from the drop down list of available publishing channels
       * 
       * @method onSelectPublishChannel
       */
      onSelectPublishChannel: function SP_onSelectPublishChannel(event, obj)
      {
         var el = Event.getTarget(event);
         if (!Selector.test(el, "a.publishChannel")) {
            el = Dom.getAncestorByClassName(el, "publishChannel")
         }
         this.widgets.selectChannelButton.set("label", el.innerHTML);
         this.widgets.selectChannelButton.set("value", el.rel);
         Event.preventDefault(event);
      },
      
      /**
       * Checks the update length against the defined maximum (if there is one) and trims the contents to that length.
       * 
       * @method checkUpdateLength
       */
      checkUpdateLength: function SP_checkUpdateLength() 
      {
         var limit = null,
            count = 0,
            charsRemaining = 0,
            checkedUpdateChannels = Selector.filter(this.widgets.statusUpdateCheckboxes, ":checked"),
            channelTypeLimits = {}; // Used for trunctation message
         
         // Check to see if there are any status update channels selected
         if (checkedUpdateChannels.length > 0) 
         {
            // get the minimum length of the selected channels. This is the number to count down from.
            for (var i = 0; i < checkedUpdateChannels.length; i++) 
            {
               var channelLimit = parseInt(Dom.getAttribute(checkedUpdateChannels[i], "rel"), 10),
                  channelType = Dom.getAttribute(checkedUpdateChannels[i], "name");
               
               // Check channel limit is greater than zero (zero indicates unlimited) and the count has either not been 
               // set previously or is set to a higher value (since we're looking for the lowest limit)
               if (channelLimit > 0 && (channelLimit < limit || limit === null))
               {
                  limit = channelLimit
               }

               // Build up an array of channel types and channel limits - used for truncation messaging later.
               // If the channel Limit hasn't already been added to the array and isn't zero, add it.
               if (channelTypeLimits[channelType] === undefined && channelLimit !== 0) 
               {
                  channelTypeLimits[channelType] = channelLimit;
               }
               
            }
            
            // check that at least one of the selected channels set a limit.
            if (limit !== null) {
                  
               // should the URL length be deducted?
               if (this.widgets.statusUpdateUrlCheckbox.checked) {
                  // get URL length
                  var urlLength = parseInt(Dom.getAttribute(this.widgets.statusUpdateUrlCheckbox, "rel"), 10)
                  // deduct from count
                  count = count + urlLength;
                  // let the user know it's been deducted
                  this.widgets.statusUpdateCountURL.innerHTML = Alfresco.util.message("socialPublish.dialogue.statusUpdate.urlChars", this.name,
                  {
                        "0": urlLength
                  }); 
               } 
               else 
               {
                  // user doesn't need to know about it.
                  this.widgets.statusUpdateCountURL.innerHTML = "";
               }
               
               // deduct the current character count
               count = count + this.widgets.statusUpdateText.value.length;
               
               // calculate number of characters remaining
               charsRemaining = limit - count;
               
               // display the characters remaining:
               this.widgets.statusUpdateCount.innerHTML = Alfresco.util.message("socialPublish.dialogue.statusUpdate.charsRemaining", this.name,
               {
                     "0": charsRemaining
               });
               
               // display the help message:
               this.widgets.statusUpdateCountMsg.innerHTML = Alfresco.util.message("socialPublish.dialogue.statusUpdate.countMessage", this.name)
               
               // If the message is too long, display a warning that truncation will occur.
               if (charsRemaining < 0) {
                  
                  // Add a warning style to the container:
                  Dom.addClass(Dom.getAncestorByClassName(this.widgets.statusUpdateCount, "statusUpdate-count-container", "div"), "warning");
                  
                  var truncationChannels=[];
                  
                  // Compare count with length of each channel's limit and build a list of channels that will be truncated.
                  for (var i in channelTypeLimits){
                     if (parseInt(channelTypeLimits[i],10) < count) {
                        truncationChannels.push(i);
                     }
                  }
                  
                  this.showTruncationMsg(truncationChannels)
                  
               } else {
                  
                  // hide and reset the truncation message
                  this.resetTruncationMsg();
                  
                  // remove the warning style from the count:
                  Dom.removeClass(Dom.getAncestorByClassName(this.widgets.statusUpdateCount, "statusUpdate-count-container", "div"), "warning");
                  
               }
            } 
            else 
            {
               // hide count if there's nothing selected.
               this.widgets.statusUpdateCount.innerHTML = this.widgets.statusUpdateCountURL.innerHTML = "";  
            }
         } 
         else 
         {
            // hide count if there's nothing selected.
            this.widgets.statusUpdateCount.innerHTML = this.widgets.statusUpdateCountURL.innerHTML = this.widgets.statusUpdateCountMsg = "";
         }            
         
      },
      
      /**
       * 
       * Shows the truncation message
       * 
       * @method showTruncation
       * @param truncationChannels {array} - list of names of channels that will be truncated 
       */
      showTruncationMsg: function SP_showTruncationMsg(truncationChannels)
      {
         // check that there hasn't already been a truncation notification, or that the truncation channels have changed since last notification
         if (this.widgets.truncationNotification === null || this.widgets.truncationNotification.truncationChannels.length !== truncationChannels.length)
         {
            // Ensure previous messages have been reset (so we don't overlap them):
            this.resetTruncationMsg();
            
            // Single or plural channel truncation?
            var msgType = (truncationChannels.length > 1) ? "plural" : "singular";
            
            this.widgets.truncationNotification = Alfresco.util.createBalloon(this.widgets.statusUpdateText,
            {
               text:Alfresco.util.message("socialPublish.dialogue.statusUpdate.truncationMessage." + msgType, this.name,
               {
                  "0": truncationChannels.join(", ")
               }), 
               width: "24em"
            });
            
            // Store a reference to the channels this message refers to
            this.widgets.truncationNotification.truncationChannels = truncationChannels;
            
            this.widgets.truncationNotification.show();
         }
      },
      
      /**
       * 
       * Resets the truncation message
       * 
       * @method resetTruncationMsg
       */
      resetTruncationMsg: function SP_resetTruncationMsg()
      {
         if (this.widgets.truncationNotification) {
            this.widgets.truncationNotification.hide();
         }
         this.widgets.truncationNotification = null;   
      },
      
      /**
       * Adjust the gui according to the config passed into the show method.
       *
       * @method _applyConfig
       * @private
       */
      _applyConfig: function SP__applyConfig()
      {

         // Set the panel section
         var header = Alfresco.util.message("socialPublish.dialogue.header", this.name,
         {
            "0": "<strong>" + this.showConfig.filename + "</strong>"
         });
         this.widgets.headerText["innerHTML"] = header;

         this.widgets.cancelButton.set("disabled", false);
      },

      /**
       * Prepares the gui and shows the panel.
       *
       * @method _showPanel
       * @private
       */
      _showPanel: function SP__showPanel()
      {

         // Apply the config before it is showed
         this._applyConfig();

         // Enable the Esc key listener
         this.widgets.escapeListener.enable();
         
         // Show the panel
         this.widgets.panel.show();
      }
   };
})();

Alfresco.module.getSocialPublishingInstance = function()
{
   var instanceId = "alfresco-socialPublishing-instance";
   return Alfresco.util.ComponentManager.get(instanceId) || new Alfresco.module.socialPublishing(instanceId);
}