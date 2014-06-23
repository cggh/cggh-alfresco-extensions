define(
        [
                "module", "dojo/_base/xhr", "dojo/request/script", "dojo/request/iframe", "dojo/Deferred", "dojo/_base/lang", "dojo/query",
                "dojo/dom-attr", "dojo/dom-construct", "dojo/json", "dojo/_base/declare", "dojo/store/util/QueryResults" /*=====, "./api/Store" =====*/
        ],
        function(module, xhr, script, iframe, Deferred, lang, query, domAttr, domConstruct, JSON, declare, QueryResults /*=====, Store =====*/) {

            // No base class, but for purposes of documentation, the base class is dojo/store/api/Store
            var base = null;
            /*===== base = Store; =====*/

            return declare("cggh.cmis.store.CmisStore", base, {

                mid : module.id.replace(/[\/\.\-]/g, '_'),
                counter : 0,

                // summary:
                //              This is a basic store for RESTful communicating with a server through JSON
                //              formatted data. It implements dojo/store/api/Store.

                constructor : function(options) {
                    // summary:
                    //          This is a basic store for RESTful communicating with a server through JSON
                    //          formatted data.
                    // options: cggh/cmis/store/CmisStore
                    //          This provides any configuration information that will be mixed into the store
                    declare.safeMixin(this, options);
                    if (!(options.target && typeof options.target != 'undefined')) {
                        this.target = this.base + this.root;
                    }
                    /* If you want to get Repository properties then this is a good place to do it
                    var deferred = script.get(this.target + '?cmisselector=properties', {
                        jsonp : "callback"
                    });
                    var results = new Deferred();
                    deferred.then(function(data) {
                        //console.log(data);
                    });
                    */
                },

                // target: String
                //              The target base URL to use for all requests to the server. This string will be
                //              prepended to the id to generate the URL (relative or absolute) for requests
                //              sent to the server
                //              This is base + root
                target : "",

                root : "/root",

                base : "",

                // idProperty: String
                //              Indicates the property to use as the identity property. The values of this
                //              property should be unique.
                idProperty : "objectId",

                // sortParam: String
                //              The query parameter to used for holding sort information. If this is omitted, than
                //              the sort information is included in a functional query token to avoid colliding
                //              with the set of name/value pairs.

                // ascendingSuffix: String
                //              The prefix to apply to sort attribute names that are ascending
                ascendingSuffix : " ASC",

                // descendingSuffix: String
                //              The prefix to apply to sort attribute names that are ascending
                descendingSuffix : " DESC",

                // succinct: boolean
                // whether to return succinct results
                succinct : true,

                //if true remove excludedProperties from put, if false only use allowedProperties
                putExclude : true,
                // properties excluded from put
                excludeProperties : [
                        'cmis:allowedChildObjectTypeIds', 'cmis:path', 'cmis:creationDate', 'cmis:changeToken', 'cmis:lastModifiedBy',
                        'cmis:createdBy', 'cmis:objectId', 'alfcmis:nodeRef', 'cmis:parentId', 'cmis:secondaryObjectTypeIds',
                        'cmis:lastModificationDate', 'cmis:baseTypeId', 'cmis:objectTypeId'
                ],

                // properties allowed by put
                allowedProperties : [
                        'cmis:name', 'cmis:description', 'cmis:title'
                ],

                // cmisOptions: object
                // Further options
                // cmisselector       options
                // object             filter, includeRelationships, includePolicyIds, renditionFilter, includeACL, includeAllowableActions
                // properties         includeRelationships, includePolicyIds, renditionFilter, includeACL, includeAllowableActions
                // children           maxItems, skipCount, filter, includeAllowableActions, includeRelationships, renditionFilter, orderBy, includePathSegment
                // allowedActions     
                // relationships      includeSubRelationshipTypes, relationshipDirection, typeId, maxItems, skipCount, filter, includeAllowableActions
                // renditions         renditionFilter, maxItems, skipCount

                propertiesOptions : {
                    includeRelationships : 'both', // none, source, target, both
                    includePolicyIds : true,
                    renditionFilter : '*', //e.g. cmis:none, cmis:thumbnail, image/*, application/pdf
                    includeACL : true,
                    includeAllowableActions : true
                },

                queryOptions : {
                    cmisselector : 'children' //(object|properties|children|allowedActions|relationships|renditions|content)
                },
                // The number of milliseconds to wait for a response
                // Due to the nature of jsonp you'll never get an e.g. 404 so to receive an error response it's necessary to timeout
                timeout : 2000,

                _usePath : function(id, options) {
                    var usePath = false;
                    if (typeof options.usePath === "undefined") {
                        var i = id.indexOf('/');
                        if (i >= 0) {
                            usePath = true;
                        }
                    } else {
                        if (options.usePath) {
                            usePath = true;
                        }
                    }
                    return (usePath);
                },

                get : function(id, options) {
                    // summary:
                    //              Retrieves an object by its identity. This will trigger a (jsonp) GET
                    //              request to the server.
                    // id: String
                    //              The identity to use to lookup the object If the id
                    //              string contains a path separator (/) then will look up by
                    //              path, otherwise uses the object id
                    // options: Object
                    //              Can explicit set usePath: true or false
                    // returns:
                    //              {dojo/_base/Deferred}

                    options = options || {};

                    var usePath = this._usePath(id, options);

                    var queryParams = '';
                    if (usePath) {
                        queryParams = id;
                    } else {
                        queryParams = '?objectid=' + id;
                    }

                    var hasQuestionMark;
                    hasQuestionMark = queryParams.indexOf("?") > -1;
                    queryParams += (hasQuestionMark ? "&" : "?") + 'cmisselector=object';

                    if (this.succinct) {
                        queryParams += "&succinct=true";
                    }

                    var deferred = script.get(this.target + (queryParams || ""), {
                        jsonp : "callback",
                        timeout : this.timeout
                    });
                    var results = new Deferred();
                    deferred.then(lang.hitch(this, function(data) {
                        results.resolve(this._modifyQueryResponse(data));
                    }));

                    return (results);
                },

                getMetadata : function(id, options) {
                    // summary:
                    //          Returns metadata about the object
                    // id: String
                    //              The identity to use to lookup the object If the id
                    //              string contains a path separator (/) then will look up by
                    //              path, otherwise uses the object id
                    // options: Object
                    //              Can explicit set usePath: true or false
                    // returns:
                    //              {dojo/_base/Deferred}
                    options = options || {};

                    var newOptions = lang.clone(this.propertiesOptions);
                    lang.mixin(newOptions, options);

                    var usePath = this._usePath(id, options);

                    var queryParams = '';

                    if (usePath) {
                        queryParams = id;
                    } else {
                        queryParams = '?objectid=' + id;
                    }

                    var hasQuestionMark;
                    hasQuestionMark = queryParams.indexOf("?") > -1;
                    queryParams += (hasQuestionMark ? "&" : "?") + 'cmisselector=object';

                    delete newOptions.usePath;
                    hasQuestionMark = queryParams.indexOf("?") > -1;
                    params = xhr.objectToQuery(newOptions);
                    queryParams += (hasQuestionMark ? "&" : "?") + params;

                    if (this.succinct) {
                        queryParams += "&succinct=true";
                    }

                    var deferred = script.get(this.target + (queryParams || ""), {
                        jsonp : "callback",
                        timeout : this.timeout
                    });
                    var results = new Deferred();
                    deferred.then(lang.hitch(this, function(data) {
                        //console.log(data);
                        results.resolve(this._modifyQueryResponse(data));
                    }), function(error) {
                        results.reject(error);
                    });

                    return (results);
                },

                getIdentity : function(object) {
                    // summary:
                    //          Returns an objects identity
                    // object: Object
                    //          The object to get the identity from
                    // returns:
                    //          The identity value
                    var ret = null;
                    if (this.succinct) {
                        if (object.succinctProperties) {
                            ret = object.succinctProperties['cmis:objectId'];
                        } else {
                            ret = object['cmis:objectId'];
                        }
                    } else {
                        if (object.properties) {
                            ret = object.properties['cmis:objectId'].value;
                        } else {
                            ret = object['cmis:objectId'].value;
                        }
                    }
                    return ret;
                },

                put : function(object, options) {
                    // summary:
                    //          Updates an object. This will trigger a POST request to the server
                    //          Note that only a limited number of properties can be updated. The
                    //          properties sent are controlled by either excludeProperties or
                    //          allowedProperties
                    // object: Object
                    //          The object to store
                    // options: Object
                    //          Additional metadata for storing the data. Can include an "id" property 
                    //          if it is not in the object
                    // returns:
                    //          {dojo/_base/Deferred}
                    options = options || {};
                    var objectData = {};
                    var params = '';
                    var id;
                    if ("id" in options) {
                        id = options.id;
                        var usePath = this._usePath(id, options);
                        if (usePath) {
                            params = id;
                        } else {
                            objectData["objectId"] = id;
                        }
                    } else {
                        id = this.getIdentity(object);
                    }
                    objectData["cmisaction"] = "update";
                    var hasId = typeof id != "undefined";

                    if (!hasId) {
                        console.log("Id is required");
                        return;
                    }
                    objectData["objectId"] = id;
                    var properties;
                    if (this.succinct) {
                        if (object.succinctProperties) {
                            properties = object.succinctProperties;
                        } else {
                            properties = object;
                        }

                    } else {
                        if (object.properties) {
                            properties = object.properties;
                        } else {
                            properties = object;
                        }
                    }

                    var i = 0;

                    //Resolve properties
                    //If namespaces are used i.e. a CMIS query has been used to retrieve the data
                    //then it's possible that you will have a non-namespace(via a get from somewhere...) 
                    //and a namespaced property - you don't want both so assume the namespaced one is correct
                    for ( var key in properties) {
                        //If the object was created via a CMIS query it could be of the form t.cm:title
                        //in which case we want to remove the t.
                        var alias = key.indexOf('.');
                        if (alias > -1) {
                            var noaliaskey = key.substr(alias + 1)
                            properties[noaliaskey] = properties[key];
                            delete properties[key];
                        }
                    }
                    for ( var key in properties) {

                        var update = this.putExclude;
                        //In practice only one of these will apply
                        if (update) {
                            for ( var ex in this.excludeProperties) {
                                if (this.excludeProperties[ex] === key) {
                                    update = false;
                                    break;
                                }
                            }
                        } else {
                            for ( var inc in this.allowedProperties) {
                                if (this.allowedProperties[inc] === key) {
                                    update = true;
                                    break;
                                }
                            }
                        }
                        if (update) {
                            var value;
                            if (this.succinct) {
                                value = properties[key];
                            } else {
                                value = properties[key].value;
                            }
                            //Sometimes null (== "") causes problems e.g. datetime
                            if (value != null) {
                                objectData["propertyId[" + i + "]"] = key;
                                objectData["propertyValue[" + i + "]"] = value;
                                i++;
                            }
                        }
                    }

                    var options = {
                        data : objectData
                    };
                    return (this._doPost(params, options));
                },
                add : function(object, options) {
                    // summary:
                    //          Adds an object. This will trigger a POST request to the server
                    // object: Object
                    //          The object to store.
                    // options: 
                    //          Must contain either a parentId or a parent object as the location in 
                    //          which to store the new object unless the object is a form and it has a value set for objectId
                    options = options || {};

                    //Needs to be the id of the parent
                    var parentId = null;
                    if (options.parentId) {
                        parentId = options.parentId;
                    } else if (options.parent) {
                        parentId = this.getIdentity(options.parent);
                    }

                    var postOptions = {};
                    if (object.form) {
                        //Check if the form
                        var parent = query('input[name=objectId]', object.form);
                        if (parent.length > 0) {
                            //There's a parentId in the form but it's not set
                            var formParentId = domAttr.get(parent[0], 'value');
                            var fpi = parent[0].value;
                            if (formParentId && (formParentId == '' || formParentId == "undefined")) {
                                if (parentId == null) {
                                    console.log("Either options.parentId or options.parent must be specified");
                                    return;
                                }
                                domAttr.set(parent[0], 'value', parentId);
                            }
                        } else {
                            domConstruct.create("input", {
                                name : "objectId",
                                value : parentId,
                                type : "hidden"
                            }, object.form);
                        }
                        postOptions = {
                            form : object.form
                        };
                    } else {
                        if (parentId == null) {
                            console.log("Either options.parentId or options.parent must be specified");
                            return;
                        }
                        var objectData = {};
                        var i = 0;
                        if (object['cmis:objectTypeId'] == 'cmis:folder') {
                            objectData["cmisaction"] = "createFolder";
                        } else {
                            objectData["cmisaction"] = "createDocument";
                        }
                        for ( var key in object) {
                            objectData["propertyId[" + i + "]"] = key;
                            objectData["propertyValue[" + i + "]"] = (object[key]);
                            i++;
                        }
                        if (this.succinct) {
                            objectData["succinct"] = "true";
                        }

                        objectData["objectId"] = parentId;
                        /*
                        <form id="cd1" action="http://localhost:8080/alfresco/api/…" method="post">
                          <table>
                          <tr>
                          <td><label for="name">Name:</label></td>
                          <td><input name="propertyValue[0]" type="text" id="name”/></td>
                          <td><input id="content" name="Browse" type="file" height="70px" size="50"/></td>
                          </tr>
                          </table>
                          <input id="cd" type="submit" value="Create Document"/></td>
                          <input name="propertyId[0]" type="hidden" value="cmis:name" />
                          <input name="propertyId[1]" type="hidden" value="cmis:objectTypeId" />
                          <input name="propertyValue[1]" type="hidden" type="text" id="typeId" value="cmis:document"/> </td>
                          <input name="cmisaction" type="hidden" value="createDocument" />
                          </form>
                        */

                        //Can either provide data: objectData or
                        // form : domNode
                        postOptions = {
                            data : objectData
                        };
                    }
                    return (this._doPost(null, postOptions));
                },

                //http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
                _getToken : function() {

                    if (typeof (window.crypto) != 'undefined' && typeof (window.crypto.getRandomValues) != 'undefined') {
                        // If we have a cryptographically secure PRNG, use that
                        // http://stackoverflow.com/questions/6906916/collisions-when-generating-uuids-in-javascript
                        var buf = new Uint16Array(8);
                        window.crypto.getRandomValues(buf);
                        var S4 = function(num) {
                            var ret = num.toString(16);
                            while (ret.length < 4) {
                                ret = "0" + ret;
                            }
                            return ret;
                        };
                        return (S4(buf[0]) + S4(buf[1]) + "-" + S4(buf[2]) + "-" + S4(buf[3]) + "-" + S4(buf[4]) + "-" + S4(buf[5])
                                + S4(buf[6]) + S4(buf[7]));
                    } else {
                        var lut = [];
                        for (var i = 0; i < 256; i++) {
                            lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
                        }

                        var d0 = Math.random() * 0xffffffff | 0;
                        var d1 = Math.random() * 0xffffffff | 0;
                        var d2 = Math.random() * 0xffffffff | 0;
                        var d3 = Math.random() * 0xffffffff | 0;
                        return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' + lut[d1 & 0xff]
                                + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-'
                                + lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff]
                                + lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];

                    }
                },
                _doPost : function(params, options) {

                    var token = this.mid + this._getToken();

                    if (options.form) {
                        var tokenNodes = query('input[name=token]', options.form);
                        if (tokenNodes.length > 0) {
                            domAttr.set(tokenNodes[0], 'value', token);
                        } else {
                            domConstruct.create("input", {
                                name : "token",
                                value : token,
                                type : "hidden"
                            }, options.form);

                        }
                    } else {
                        options.data.token = token;
                    }

                    var results = new Deferred();
                    var deferred = iframe.post(this.target + (params || ''), options);

                    deferred.then(lang.hitch(this, function(data) {
                        console.log("Unexpected success!");
                    }), lang.hitch(this, function error(data) {
                        //Because the response is json there's always an error (for iframe to work a json response needs to be wrapped in a textarea
                        var queryParams = '?cmisselector=lastResult&token=' + token;
                        var outcome = script.get(this.base + queryParams, {
                            jsonp : "callback",
                            timeout : this.timeout
                        }).then(lang.hitch(this, function(data) {

                            if (data.code && data.code >= 200 && data.code <= 300) {
                                //Likely 200 - OK or 201 - created
                                if (data.code == 201) {
                                    //Created - dijit Tree at least expects the created object to be returned so...
                                    this.get(data.objectId, {
                                        usePath : false
                                    }).then(lang.hitch(this, function(newObject) {
                                        results.resolve(newObject);
                                    }), function(error) {
                                        results.reject(error);
                                    });
                                } else {
                                    results.resolve(data);
                                }
                            } else if (data.code && data.code >= 400 && data.code <= 500) {
                                //An error code
                                results.reject(data);
                            } else {
                                //Don't know what's going on so just resolve
                                //This is the case for remove because it's not a transaction so comes back as an unknown transaction
                                //Should probably try and do something tidier for remove
                                results.resolve(data);
                            }

                        }));
                    }));
                    return results;

                },

                remove : function(id, options) {
                    // summary:
                    //          Deletes an object by its identity. This will trigger a DELETE request to the server.
                    // id: String or Object
                    //          The identity to use to delete the object
                    //          String can either be the path or the object Id
                    //      If the id string contains a path separator (/) then will look up by path, otherwise
                    //      uses the object id
                    // options: Object?
                    //  Can explicit set usePath: true or false
                    options = options || {};

                    var objectData = {};
                    objectData["cmisaction"] = "delete";
                    var objectId;
                    var params = '';
                    if (id && typeof id == "object") {
                        objectId = this.getIdentity(id);
                        objectData["objectId"] = objectId;
                    } else {
                        var usePath = this._usePath(id, options);
                        if (usePath) {
                            params = id;
                        } else {
                            objectData["objectId"] = id;
                        }
                    }
                    var options = {
                        data : objectData
                    };
                    return (this._doPost(params, options));
                },

                _modifyQueryResponse : function(data) {
                    var ret;
                    if (this.succinct) {
                        ret = data.succinctProperties;
                    } else {
                        ret = data.properties;
                    }
                    return ret;
                },
                query : function(queryParams, options) {
                    // summary:
                    //          Queries the store for objects. This will trigger a GET request to the server, with the
                    //          query added as a query string.
                    // query: Object
                    //          The query to use for retrieving objects from the store.
                    //              This can include a CMIS query like "SELECT * FROM cmis:document"
                    //              searchAllVersions
                    //              includeRelationships
                    //              
                    //              
                    //              
                    // options: __QueryOptions?
                    //          The optional arguments to apply to the resultset.
                    // returns: dojo/store/api/Store.QueryResults
                    //          The results of the query, extended with iterative methods.
                    options = options || {};

                    queryParams = queryParams || '';

                    var requestURL = this.target;

                    var hasQuestionMark = requestURL.indexOf("?") > -1;
                    //query object is converted to a list of parameters
                    if (queryParams && typeof queryParams == "object") {
                        var newOptions = lang.clone(this.queryOptions);
                        lang.mixin(newOptions, queryParams);
                        if (typeof newOptions.path != "undefined") {
                            var usePath = this._usePath(newOptions.path, options);
                            if (usePath) {
                                queryParams = newOptions.path;
                            }
                            delete newOptions.path;
                        }
                        if (newOptions.statement) {
                            newOptions.cmisselector = 'query';
                            requestURL = this.base;
                        }
                        optionsParams = xhr.objectToQuery(newOptions);
                        queryParams = (hasQuestionMark ? "&" : "?") + optionsParams;
                    } else {
                        //queryParams should be a string
                        var sep = '&';
                        if (!hasQuestionMark) {
                            hasQuestionMark = queryParams.indexOf("?");
                            if (hasQuestionMark < 0) {
                                sep = '?';
                            }
                            var cmisselector = this.queryOptions.cmisselector;
                            if (queryParams.indexOf("statement=") > -1) {
                                cmisselector = 'query';
                                requestURL = this.base;
                            }
                            queryParams += sep + 'cmisselector=' + cmisselector;
                        }
                    }
                    if (options.start >= 0 || options.count >= 0) {
                        hasQuestionMark = queryParams.indexOf("?") > -1;
                        queryParams += (hasQuestionMark ? "&" : "?") + "skipCount=" + (options.start || '0');
                        queryParams += (("count" in options && options.count != Infinity) ? "&maxItems="
                                + (options.count + (options.start || 0) - 1) : '');

                    }
                    if (options && options.sort) {
                        hasQuestionMark = queryParams.indexOf("?") > -1;
                        var params = '';
                        for (var i = 0; i < options.sort.length; i++) {
                            var sort = options.sort[i];
                            //Crude limiting as not all properties are sortable
                            if (sort.attribute.substr(0, 4) == "cmis") {
                                params += (i > 0 ? "," : "") + encodeURIComponent(sort.attribute)
                                        + encodeURIComponent((sort.descending ? this.descendingSuffix : this.ascendingSuffix));
                            }
                        }
                        if (params != '') {
                            queryParams += (hasQuestionMark ? "&" : "?") + "orderBy=" + params;
                        }
                    }

                    if (this.succinct) {
                        hasQuestionMark = queryParams.indexOf("?") > -1;
                        queryParams += (queryParams || hasQuestionMark ? "&" : "?") + "succinct=true";
                    }

                    var deferred = script.get(requestURL + (queryParams || ""), {
                        jsonp : "callback",
                        timeout : this.timeout
                    });

                    // Created a new deferred object and resolving it once
                    // the XHR deferred resolves
                    var results = new Deferred();
                    deferred.then(lang.hitch(this, function(data) {
                        //console.log(data);
                        var objects = data.objects;
                        var newData = [];
                        if (typeof objects == "undefined") {
                            var queryResults = data.results;
                            if (typeof queryResults == "undefined") {
                                newData[0] = this._modifyQueryResponse(data);
                            } else {
                                for (var i = 0; i < queryResults.length; i++) {
                                    //console.log(objects[i]);
                                    newData[i] = this._modifyQueryResponse(queryResults[i]);
                                }
                            }

                        } else {
                            for (var i = 0; i < objects.length; i++) {
                                //console.log(objects[i]);
                                newData[i] = this._modifyQueryResponse(objects[i].object);
                            }
                        }
                        //console.log(newData);
                        results.resolve(newData);
                    }));

                    results.total = deferred.then(function(response) {
                        var total = 0;
                        var s = typeof response;
                        if (s === 'object') {
                            if (response) {
                                if (Object.prototype.toString.call(response) == '[object Array]') {
                                    total = response.length;
                                } else {
                                    total = response.numItems;
                                }
                            }
                        }
                        //console.log("Number of results:" + total);
                        return total;
                    });

                    return QueryResults(results);
                },
                /**
                 *  adding getChildren() method needed by ObjectStoreModel
                 */
                getChildren : function(object) {
                    return this.query({
                        query : this.getIdentity(object),
                        cmisselector : 'children'
                    }, {
                        usePath : false
                    });
                },

            });

        });
