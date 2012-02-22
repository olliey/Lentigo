var Config=function(){
    var fs=require('fs');
    var _=require('underscore');
    var mykey=fs.readFileSync(__dirname+'').toString();
    var mycert=fs.readFileSync(__dirname+'').toString();
    var httpport=82;
    var httpsport=443;
    var httpsserver="https://localhost";
    var httpserver="localhost";
    var proxyport=81;
    var twitterKey= '';
    var twitterSecret='';
    var googleId= '';
    var googleSecret= '';

    var getport=function(host){
        var hosts=[{h:'localhost',p:82}];
	var subs;
	if(host.match(':')){
	    subs=host.substring(0,host.indexOf(':'));
	    console.log("Contained port in hostname");
	} else {
	    subs=host; 
	    console.log("Did not contain port in hostname");
	}
	var hostportpair=_.find(hosts,function(num){
	    return num.h==subs;
        });
        var port=hostportpair.p;
	return port;
       };
    

    var that={
	getport:getport,
	mykey:mykey, 
	mycert:mycert, 
	httpport:httpport,
	httpsport:httpsport,
	httpserver:httpserver,
	httpsserver:httpsserver,
	proxyport:proxyport,
	twitterKey:twitterKey,
	twitterSecret:twitterSecret,
	googleId:googleId,
	googleSecret:googleSecret
    };
    return that;
}

exports.Config=Config;













