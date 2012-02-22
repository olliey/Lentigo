var _=require("underscore");
var dataprovider=require('./filldb');
var data=new DataProvider;

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/mydatabase');

var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var visitordata = new Schema({
    name     : String
  , password : String
  , sockids: Array
  , cookie:String
  , id : ObjectId
});

visitordata.path('name').validate(function(v){
	return v.length>4;
    },'could not validate');

mongoose.model('visitors', visitordata);
var Visitor = mongoose.model('visitors');

var Base=function(){
    var that;
    var users=[];
    Visitor.remove({'name':'guest'},function(err,num){
	console.log("\tRemoved "+num+" guests");
    });

    Visitor.find({},function(err,docs){ 
	users=docs;
	console.log("\tRetreived "+docs.length+" users from database");
    });

    showusers=function(){ return users};
  
    adduser=function(sock,cookie){
	
	var socks=[];
	socks.push(sock);

	var sel=_.find(users,function(num){
			   return num.cookie==cookie;
		       });

	var basicuser={
	    name:"guest",
	    password:null,
	    sockids:socks,
	    cookie:cookie
	};

	if(sel){
	    sel.sockids.push(sock);
	    users=_.filter(users,function(num){
		return num.cookie!==cookie;
		});
	    users.push(sel);
	    var selsock=sel.sockids;
	    Visitor.update({'cookie':sel.cookie},{sockids:selsock},function(err){
			if(err) {
			    console.log(err)
			} else {
			    console.log("New tab for user : "+sel.cookie)
			};
	    });

	} else {
	    users.push(basicuser);
	    var visitor=new Visitor(basicuser);
	    visitor.save(function(err){
		if(err){
			console.log(err);
		    } else {
			console.log("\tsaved visitor : "+basicuser.cookie);	    
		    }
		});
	    }
    }

    removetab=function(sock,cookie){
	var sel=_.find(users,function(num){
			return num.cookie==cookie;
			 });
	users=_.filter(users,function(num){
			   return num.cookie!==cookie;
		       });
	var founds=sel.sockids;
	if(founds.length==1){
	    Visitor.remove({'cookie':sel.cookie},function(err){
	    if(err){
		console.log(err);
	    }else{
		console.log("\tGuest with cookie : "+sel.cookie+"\n\thas no tabs and has been removed");	
	    }
	    });
	}else{
	var foundt=_.filter(founds,function(num){
		     return num!==sock;
		     });
	sel.sockids=foundt;
	users.push(sel);
	Visitor.update({'cookie':sel.cookie},{sockids:sel.sockids},function(err){
		if(err){console.log(err)}
		else{console.log("Tab removed for user with cookie : "+sel.cookie)}
	    });
	}
    };
    
    addreguser=function(person,cookie,callback){
	var found=_.find(users,function(num){
			 return num.cookie===cookie;
		     });
	users=_.filter(users,function(num){
			return num.cookie!==cookie;
			   });
	found.name=person.name;
	Visitor.find({'name':person.name},function(err,docs){
	    if(err){
		console.log(err)
	    } else {
		if(docs.name===person.name){
		    console.log("Username"+person.name+" already in use");
	//	    callback();
		} 
 	    }
	});
	users.push(found);	
    };
  
    userbyname=function(name){
	var requser=_.find(users,function(num){
	    return num.name===name;
	});
	return requser;
    }

    userbycookie=function(sid){
	var cookieguy=_.find(users,function(num){
	    return num.id==sid;
	});
	return cookieguy;
    }

    that={
	userbycookie:userbycookie,
	userbyname:userbyname,
	addreguser:addreguser,
	removetab:removetab,
	showusers:showusers,
	adduser:adduser
    }
    return that;
}

module.exports=Base;