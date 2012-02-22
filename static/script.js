$(document).ready(function() {
//socket
var server=$('#server').val();
var socket=io.connect(server,{secure:true});

socket.on('chatbegin',function(data){
    var name=data.name;
    console.log(name);
    console.log("chatbegin called");
    $('#chat').removeClass('notcalled');
    $('#vale').val(name);
});

socket.on('message',function(data){
    console.log("message received");
    var mes=data.message;
    $('#conv').append(mes+'</br>');
    $('#conv').scrollTop(100000);
});

$("#register a").click(function(){
  $('#registerme').removeClass('notcalled');
  $('#login').removeClass('notcalled');
});

$('#chatbutton').click(function(){
  $('#chat').removeClass('notcalled');
});

$('#registerform').submit(function(ev){
  var what=$('#thename').val();
  var pass=$('#pword').val()
  $.get('register',function(data){
  console.log(data);
  });
//  socket.emit('register',{name:what});
  cssmod(what);
  ev.preventDefault();
});         

$('#loginform').submit(function(ev){
  var what=$('#lthename').val();
  var pass=$('#lpword').val();
  $.get('login',function(data){
      console.log(data);
  });
});

$('#logout').click(function(){
  $.get('/logout',function(data){
    $('#who').addClass('notcalled');
    $('#logout').addClass('notcalled');
  });
});

$('#chatform').submit(function(ev){
  console.log("chatform submitted");
  var mes=$('#message').val();
  var thep=$('#vale').val();
  $('#message').val('').focus();
  $('#conv').append(mes+'</br>');
  $('#conv').scrollTop(100000);
  socket.emit('relaym',{message:mes,name:thep});
  return false;
});

$('#user a').click(function(ev){
  ev.preventDefault();
  var chatreq=this.hash.substr(1);
  $('#chat').removeClass('notcalled');
  $('#vale').val(chatreq);
  socket.emit('chatstart',{name:chatreq});
});

var cssmod=function(what){
    $('#logout').removeClass('notcalled');
    $('#who').removeClass('notcalled').html(what);
    $('#registerme').addClass('notcalled');
    $('#login').addClass('notcalled');
}

});


//two quirks
//register.jade: if you put double quotes instead of single //quotes you cannot put 
//the a will jump to an anchor if you have a slash in the ad//dress but not if you dont
//

