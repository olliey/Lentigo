var httpProxy = require('http-proxy');
var config = require('./config').Config();
httpProxy.createServer(function(req,res,proxy){
    var host;
    if(req.headers.host){
    if(req.headers.host.match(':')){
	host=req.headers.host.substring(0,req.headers.host.indexOf(':'));	
    } else {
	host=req.headers.host;
    }
    }
    console.log("Host is : "+host);
    console.log("Proxy from: "+config.proxyport+" to: "+config.getport(req.headers.host));
    proxy.proxyRequest(req,res,{
	host:host,
	port:config.getport(req.headers.host)
    });    
}).listen(config.proxyport);
