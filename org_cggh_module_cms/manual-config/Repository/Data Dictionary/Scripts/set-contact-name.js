var first = document.properties['dl:contactFirstName'];
var last = document.properties['dl:contactLastName'];
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