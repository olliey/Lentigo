var config=require('./config').Config();
//umm
var express=require("express");
var sio=require('socket.io');

var myusers=[];

var MemStore = express.session.MemoryStore;
var sessionStore=new MemStore;
var app=express.createServer({key:config.mykey,cert:config.mycert});
var util=require('util');
var http=express.createServer();

var everyauth=require('everyauth');
everyauth.debug=true;
var Promise=everyauth.Promise;

var mongoose=require('mongoose');

var mongooseAuth=require('mongoose-auth');

mongoose.connect('mongodb://localhost/mydatabase');        

var Schema = mongoose.Schema;
var userSchema = new Schema({});

var User;

userSchema.plugin(mongooseAuth,{
    everymodule:{
	everyauth:{
	    User:function(){
		return User;
	    }
	}
    },
    twitter:{
	everyauth: {
            myHostname: 'http://localhost:81'
	    , consumerKey: config.twitterKey
            , consumerSecret: config.twitterSecret
            , redirectPath: '/'
        }
    },
    google:{
	everyauth:{
	    myHostname: 'http://localhost:81'
            , appId: config.googleId
            , appSecret: config.googleSecret
            , redirectPath: '/'
            , scope: 'https://www.googleapis.com/auth/userinfo.email'
	    }
   },
   password: {
       everyauth: {
           getLoginPath: '/login'
           , postLoginPath: '/login'
           , loginView: 'login.jade'
           , getRegisterPath: '/register'
           , postRegisterPath: '/register'
           , registerView: 'register.jade'
           , loginSuccessRedirect: '/'
           , registerSuccessRedirect: '/'
	   }
        }
});

mongoose.model('user',userSchema);

User=mongoose.model('user');

var usersByLogin={};
var usersByTwitter={};
var usersById = {};
var nextUserId = 0;

function addUser (source, sourceUser) {
  var user;
  if (arguments.length === 1) { // password-based
      console.log("registering user");
    user = sourceUser = source;
    user.id = ++nextUserId;
    return usersById[nextUserId] = user;
  } else { // non-password-based
    user = usersById[++nextUserId] = {id: nextUserId};
    user[source] = sourceUser;
  }
  return user;
}

/*everyauth.password
    .getLoginPath('/login')
    .postLoginPath('/login')
    .loginView('login.jade')
    .authenticate(function(login,password){
	var errors = [];
	if (!login) errors.push('Missing login');
	if (!password) errors.push('Missing password');
	if (errors.length) return errors;
	var user = usersByLogin[login];
	if (!user) return ['Login failed'];
	if (user.password !== password) return ['Login failed'];
	return user;
    })
    .loginSuccessRedirect('/')
    .getRegisterPath('/register')
    .postRegisterPath('/register')
    .registerView('register.jade')
    .validateRegistration(function(newUserAttrs,errors){
	var login = newUserAttrs.login;
	if (usersByLogin[login]) errors.push('Login already taken');
	return errors;
    })
    .registerUser(function(newUserAttrs){
	var login = newUserAttrs[this.loginKey()];
	return usersByLogin[login] = addUser(newUserAttrs);
	})
    .registerSuccessRedirect('/');
*/

http.get('*',function(req,res){
   console.log("redirecting to https"); 
   res.redirect(config.httpsserver+req.url);
});
http.listen(config.httpport);

app.configure(function()
{

//app.use(express.logger());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({secret:'keyboard cat',
  store:sessionStore,
  key:'express.sid'}));
app.use(express.static(__dirname+"/static"));
app.use(everyauth.middleware());
app.use(express.errorHandler());
});

app.set('view engine','jade');

app.dynamicHelpers({
  session:function(req,res){
  return req.session;
  }
});
app.dynamicHelpers({
    myusers:function(req,res){
    return myusers;
    }
});
app.dynamicHelpers({
    server:function(req,res){
    return config.server;
    }
});

app.get('/',function(req,res){
res.render("initial");
});

var Session=require('connect').middleware.session.Session;
var parseCookie=require('connect').utils.parseCookie;

var io=sio.listen(app);

io.configure(function(){
io.set('log level',1);
});

io.set('authorization',function(data,accept){
    if(data.headers.cookie){
	data.cookie=parseCookie(data.headers.cookie);
	data.sessionID=data.cookie['express.sid'];
	sessionStore.get(data.sessionID,function(err,session){
	    if(err)
		{accept("err",false);
	    } else {
		data.session=new Session(data,session);
		accept(null,true);
	    }   
	}
    )} else {
	return accept("could not find cookie",false);
    }
});

io.sockets.on('connection',function(socket){



});

everyauth.helpExpress(app);

app.listen(config.httpsport);

