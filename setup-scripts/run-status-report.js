//undeploy model 
//deploy activiti alfresco/module/ssr-platform/workflow/sampleCountExceeded.bpmn

//desc task activiti$10050


// create reportAction action
    var reportAction = actions.create("ssr-platform.process_report");
   
	reportAction.parameters.nameCheckTask = "activiti$nameMismatch:1:120578";
	reportAction.parameters.countCheckTask = "activiti$sampleCountExceeded:1:120582";
	reportAction.parameters.countryCheckTask = "activiti$countryCheck:1:120586";
	reportAction.parameters.dateCheckTask = "activiti$dateCheck:1:120590";
	reportAction.parameters.statusCheckTask = "activiti$statusCheck:1:120594";
	reportAction.parameters.transform = true;	  


    //execute action against a document
    reportAction.execute(document);

	logger.log(reportAction.parameters.result);
