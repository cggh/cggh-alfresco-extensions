//undeploy model 
//deploy activiti alfresco/module/ssr-platform/workflow/sampleCountExceeded.bpmn

//desc task activiti$10050


// create reportAction action
    var reportAction = actions.create("ssr-platform.process_report");
   
	reportAction.parameters.nameCheckTask = "activiti$nameMismatch:1:104";
	reportAction.parameters.countCheckTask = "activiti$sampleCountExceeded:1:904";
	reportAction.parameters.countryCheckTask = "activiti$countryCheck:4:57712";
	reportAction.parameters.dateCheckTask = "activiti$dateCheck:8:58816";
	reportAction.parameters.statusCheckTask = "activiti$statusCheck:4:57720";
	reportAction.parameters.transform = true;	  


    //execute action against a document
    reportAction.execute(document);

	logger.log(reportAction.parameters.result);