var data = [
            ["Alex","Mentzer"],
["Aline","Uwimana"],
["Andrew","Ishizuka"],
["Antoinette","Tshefu"],
["Aparup","Das"],
["Benjamin","Mordmueller"],
["Caterina","Fanello"],
["Chanaki","Amaratunga"],
["Delia","Bethell"],
["Diego","Ayala"],
["Ehiji","Enato"],
["Fotis","Kafotis"],
["Franck","Prugnolle"],
["Gilbert","Legoff"],
["Greg","Lanzaro"],
["Igor","Sharakhov"],
["Isabella","Ochola"],
["Jorge","Cano"],
["Marie","Onyamboko"],
["Mark","Fukuda"],
["Pharath","Lim"],
["Philip","Spence"],
["Reginald","Kavishe"],
["Robert","Seder"],
["Sankarganesh","Jeyaraj"],
["Senthilkumar","Nachimuthu"],
["Umbero","D'alessandro"],
["Vincent","Robert"],
["Wen","Kilama"]];

for (var i=0; i<data.length; i++) {
	  var d = data[i];
	  var contact = document.createNode(null, "dl:contact");
	  contact.properties["dl:contactFirstName"] = d[0];
	  contact.properties["dl:contactLastName"] = d[1];
	  contact.save();
	  logger.log("created new contact: " + contact.nodeRef);
	}