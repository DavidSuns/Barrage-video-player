/***********************
* XMLParser
* == Licensed Under the MIT License : /LICENSING
* Copyright (c) 2012 Jim Chen ( CQZ, Jabbany )
************************/
function CommentLoader(url,xcm,callback){
	if(callback == null)
		callback = function(){return;};
	var xmlhttp = null;
	if (window.XMLHttpRequest){
		xmlhttp=new XMLHttpRequest();
	}
	else{
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.open("GET",url,true);
	xmlhttp.send();
	var cm = xcm;
	xmlhttp.onreadystatechange = function(){
		if (xmlhttp.readyState==4 && xmlhttp.status==200){
				cm.load(BzParser(xmlhttp.responseText));
				callback();
		}
	}
}
function createCORSRequest(method, url){
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr){
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined"){
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        xhr = null;
    }
    return xhr;
}

function BzParser(a) {
    var b = [];
    try {
        var c = JSON.parse(a)
    } catch(d) {
				console.log("Error: Could not parse json list!")
        return [];
    }

    for (var i = 0; i < c.length; i++){
      j = {
				stime : Math.round(1e3 * parseFloat(c[i].stime)),
	      size : c[i].size,
	      color : c[i].color,
	      mode : c[i].mode,
	      date : parseInt(new Date(c[i].create_at)),
	      pool : 0,
	      position : "absolute",
	      dbid : c[i].id,
	      hash : c[i].id,
	      text : c[i].content.replace(/(\/n|\\n|\n|\r\n)/g, "\n"),
	      border : !1
			};
      b.push(j);
    }
    //not support mode[7,8]
    return b;
}
