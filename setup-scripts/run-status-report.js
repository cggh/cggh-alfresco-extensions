//undeploy model 
//deploy activiti alfresco/module/ssr-platform/workflow/sampleCountExceeded.bpmn

//desc task activiti$10050


// create reportAction action
    var reportAction = actions.create("ssr-platform.process_report");
   
	reportAction.parameters.nameCheckTask = "activiti$nameMismatch:1:104";
	reportAction.parameters.countCheckTask = "activiti$sampleCountExceeded:1:904";
	reportAction.parameters.transform = true;	  


    //execute action against a document
    reportAction.execute(document);

	logger.log(reportAction.parameters.result);