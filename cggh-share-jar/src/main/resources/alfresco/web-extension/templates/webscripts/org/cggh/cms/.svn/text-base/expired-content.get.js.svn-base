<import resource="classpath:/alfresco/templates/webscripts/org/alfresco/slingshot/search/search.lib.js">

/**
 * See processResults() in search.lib.js. Extends this function to include cm:owner and cm:to props.
 * 
 * @param nodes
 * @param maxResults
 * @return the final search results object
 */
function processECResults(nodes, maxResults)
{    
   var results = [],
      added = 0,
      parts,
      item,
      i, j;
   
   for (i = 0, j = nodes.length; i < j && added < maxResults; i++)
   {
      /**
       * For each node we extract the site/container qname path and then
       * let the per-container helper function decide what to do.
       */
      parts = splitQNamePath(nodes[i]);
      if (parts !== null)
      {
         item = getItem(parts[0], parts[1], parts[2], nodes[i]);
         if (item !== null)
         {
            item.owner = nodes[i].properties.owner;
            item.to = nodes[i].properties.to;
            results.push(item);
            added++;
         }
      }
   }
   
   return (
   {
      items: results
   });
}

/**
 * Main script entry point
 * 
 * @function main
 * @return null
 */
function main()
{
   var maxResults = (args.maxResults != null) ? parseInt(args.maxResults, 10) : 50;
   var username = url.templateArgs.userId || args.user || person.properties.userName;
   var query = "+@cm\\:to:[MIN TO NOW]" +
               " +PATH:\"/app:company_home/st:sites/*//*\"" +
               " +TYPE:\"content\"" +
               " -TYPE:\"dl:dataListItem\"" +
               " -TYPE:\"thumbnail\"";
   if (username != "all")
      query += " +@cm\\:owner:\"" + username + "\""
   var nodes = search.luceneSearch(query, "@cm:modified", true);
   
   //reset processed results (in search.lib.js)
   processedCache = {}
   var results = processECResults(nodes, maxResults);
   
   // Populate the view model
   model.username = username;
   model.results = results;
}
main();

