

if(document.properties["cggh:collaborationStatus"] != 'enquiry') {
  document.properties["cggh:enquiryStatus"] = null;
}
document.save();