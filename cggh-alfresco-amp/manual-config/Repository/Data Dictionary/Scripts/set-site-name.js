var first = document.properties['cggh:siteName'];
var last = document.properties['cggh:siteCountry'];
var displayName = "";
if (last != null && last.length > 0) {
  displayName = last;
} else if (first != null && first.length > 0) {
  displayName = first;
}
if (first != null && first.length > 0 && last != null && last.length > 0) {
 displayName = last + ", " + first;
}
document.properties.name = displayName;
document.save();