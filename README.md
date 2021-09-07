
## Running locally

Use the run.sh script

You'll need a local copy of LDAP running - see setup-scripts

When starting from scratch you will need to add yourself to the PEOPLE_FINDERS
group before you can add yourself to ALFRESCO_ADMINISTRATORS

You should add the all_site_users (from LDAP) group to the ALL_SITE_USERS
group. This is managed via the auth/cron-ldap-manage-user.js script in the Data
Dictionary

When you've created the sequencing site then you can use the javascript console to create study folders

Run (https://github.com/cggh/cggh-alfresco-extensions/blob/master/setup-scripts/list-studies.js) on live (or similar) and copy the output to the javascript console on your local instance and run it there

## Installation on servers

- Set up your alfresco and solr servers
- Run locally to generate the files
- Copy the files to the alfresco server (https://github.com/cggh/cggh-alfresco-extensions/blob/master/setup-scripts/copy_files_to_server.sh)
- (Set up local mail server and LDAP if appropriate - https://github.com/cggh/cggh-alfresco-extensions/blob/master/setup-scripts/test-setup.sh)
- Run https://github.com/cggh/cggh-alfresco-extensions/blob/master/setup-scripts/alfinstall.sh
- Create config_params file from template
- Edit and run https://github.com/cggh/cggh-alfresco-extensions/blob/master/setup-scripts/additional_install.sh
- Check it all works, including outgoing (and incoming) email
- (Sync with live (https://github.com/cggh/cggh-alfresco-extensions/blob/master/setup-scripts/resync-alfresco.sh))

If in doubt see the links to the Alfresco docs and community in the wiki

## Code release

The pom uses maven gitflow so use that to create a release (from the dvlp branch) and generate the non-SNAPSHOT versions of the output files

Generate a new amp and/or jar file and install on the server - see Alfresco documentation (also done in the additional_install.sh script but that does a lot else as well)
