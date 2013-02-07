var nodes = document.parent.children;
var myName = document.name;
var max = 1000;
var lastmax = max;

for each(var node in nodes) {
 if (node.typeShort == "cggh:collaborationFolder") {
  if (node.name != myName) {
    var code = parseInt(node.name.substring(0,4),10);
    if (code > max) {
      lastmax = max;
      max = code;
    } else if (code > lastmax) {
      lastmax = code;
    }
  }
 }
}

if ((max - lastmax) > 1) {
    max = lastmax;
  }

  max++;

  var myNum = myName.substring(0,4);
  if (parseInt(myNum, 10) > 0) {
    myName = max + myName.substring(4);
  } else {
    myName = max + " " + myName;
  }
  document.name = myName;
  document.save();

