var email = document.childByNamePath("Emails");
if ( email == null)
{
   email = document.createFolder("Emails");
}

var docsFolder = document.childByNamePath("Documents");
if ( docsFolder == null)
{
   docsFolder  = document.createFolder("Documents");
}
