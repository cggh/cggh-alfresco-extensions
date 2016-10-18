var email = document.childByNamePath("Emails");
if ( email == null)
{
   email = document.createFolder("Emails");
}

var alias = document.name.substr(0,document.name.indexOf(' ')); + '-emails';
email.addAspect("emailserver:aliasable");
email.properties["emailserver:alias"] = alias;
email.save();

var docsFolder = document.childByNamePath("Documents");
if ( docsFolder == null)
{
   docsFolder  = document.createFolder("Documents");
}