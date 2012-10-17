/**
 * User Profile - Title Component
 */

var profileId = page.url.templateArgs["userid"];
if (profileId != null)
{
   if (profileId != "all")
   {
      // load user details for the profile from the repo
      var userObj = user.getUser(profileId);
      if (userObj != null)
      {
         model.profile = userObj;
      }
      else
      {
         // fallback if unable to get user details
         // TODO: display error?
         model.profile = user;
      }
      model.allUsers = false;
   }
   else
   {
      model.profile = null;
      model.allUsers = true;
   }
}
else
{
   // if no profile specified, must be current user which will allow editing
   model.profile = user;
}