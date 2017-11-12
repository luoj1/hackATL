const express = require('express');
var fs = require('fs');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var path = require('path');
const app = express();
var login = require('./model/login.js');
var jwt    = require('jsonwebtoken');
app.set('superSecret', makeid(100));
app.use(bodyParser({limit: '50mb'}));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); //
//app.set('view engine', 'html');
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.set('views', path.join(__dirname, 'views'));

app.get('/', function (req, res) {
	console.log("get/");
  login.connect(function(){
  console.log('mysql work');
  res.render('Main');
  });
});
app.get('/login', function (req, res) {
	console.log("get/login");

    res.render('Login',{'x':''});
});
app.get('/SignAccount',function(req,res){
  res.render('SignAccount');
})
app.post('/join',function(req,res){
  console.log('post/create');
  readtoken(req.body.info,function(r){
  if(r!=false){
  var reee = r.eee;
  login.checkkey(r.eee,r.ppp,function(r){
    console.log('keychecked');
    if(r==true){
      login.addtoslot(req.body.time,dateGenerator(req.body.date),req.body.location,reee,function(r){
        if(r==1){
          res.redirect('/thanku');
        }else{
          res.render('join',{info:req.body.info});
        }
      })
    }
    })
    }else{
      res.render('loginTest',{'x':''});
    }
    })
    })
app.get('/join/:sport/:time',function(req,res){
  login.find(req.params.sport,req.params.time,function(out){
  res.contentType('text/json');
  res.json(out);
})
})
app.post('/create',function(req,res){
  console.log('post/create');
  readtoken(req.body.info,function(r){
  if(r!=false){
  var reee = r.eee;
  login.checkkey(r.eee,r.ppp,function(r){
    console.log('keychecked');
    if(r==true){
      console.log('rbd:'+req.body.date);
//-------------------------------------------
if(oldDate(req.body.date)||req.body.date==''||req.body.date==null){
  res.render('create',{info:req.body.info,'x':'time problem',time:req.body.time,date:'',location:req.body.location,description:req.body.description});
  return;
}

login.createslot(req.body.time,dateGenerator(req.body.date),req.body.location,req.body.description,reee,function(r){
if(r==1){
  res.redirect('/thanku');
}else if (r ==2){
  console.log('merge')
  //res.render('create',{info:req.body.info,'x':'overlap',time:req.body.time,date:req.body.date,location:req.body.location,description:req.body.description});
  if(req.body.merge==1){
  login.addtoslot(req.body.time,dateGenerator(req.body.date),req.body.location,reee,function(r){
    if(r==1){
      res.redirect('/thanku');
    }else{
      res.render('create',{info:req.body.info,'x':'fully',time:req.body.time,date:req.body.date,location:req.body.location,description:req.body.description});
    }
  })
}else{
  res.render('create',{info:req.body.info,'x':'not merged',time:req.body.time,date:req.body.date,location:req.body.location,description:req.body.description});
}
}else{
  res.render('create',{info:req.body.info,'x':'full',time:req.body.time,date:req.body.date,location:req.body.location,description:req.body.description});
}
})

//-------------------------------------------
}
})
}else{
  res.render('loginTest',{'x':''});
}
})
})



app.post('/signup', function (req, res) {
	console.log("post/signup");
  var user = req.body.username;
  var pw = req.body.password;
  var pw2 = req.body.password2;
  if(pw == pw2 &&validateEmail(user)){
    login.newuser(user,pw,function(r){
    if(r){
    res.render('loginTest',{'x':''});
  }else{
    res.render('signup',{'x':'already there'});
  }
    })
  }else{
    res.render('signup',{'x':'check uname and pw'});
  }
});
app.post('/todo', function(req,res){
  console.log('post/todo');
  readtoken(req.body.info,function(r){
  if(r!=false){
  login.checkkey(r.eee,r.ppp,function(r){
    console.log('keychecked');
    if(r==true){
if(req.body.action=='join'){

res.render('join',{info:req.body.info});
}else if(req.body.action=='create'){
  var d = new Date();
res.render('create',{info:req.body.info,x:'',time:'',date:`${d.getYear()}-${d.getMonth()}-${d.getDate()}`,location:'',description:''});
}
}
})
}else{
  res.render('loginTest',{'x':''});
}
})
})
app.post('/login',function(req,res){
    var user = req.body.username;
    var pw = req.body.password;
    if(!validateEmail(user)){
      res.render('loginTest',{'x':'not email'});
      return;
    }
    login.verification(user,pw,function(r){
      console.log(r);
      if(r == true){
        var key =  makeid(100);
        login.updatekey(user,key,function(){
        var jwtup = maketoken(user,key);
        res.render('pivot',{'welcome':user, info: jwtup});
        });
      }else{
        res.render('loginTest',{'x':'incorrect key'});
      }

    })
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
//------------------------------method----------------------------------
function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
function makeid(l) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < l; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
function maketoken(e,p){
	return jwt.sign({eee:e,ppp:p}, app.get('superSecret'), {
        });
}
function readtoken(token,cb){
	jwt.verify(token, app.get('superSecret'), function(err, decoded) {
      if (err) {
        console.log(err);
		cb(false);
      } else {
        // if everything is good, save to request for use in other routes
		cb(decoded);
      }
    });
}
function dateGenerator(x){
var d = new Date(x);
y = d.getFullYear()*10000;
m = (d.getMonth()+1)*100;
d = d.getDate()+1;
console.log('ymd app'+(y+m+d));
return y+m+d;
}
function oldDate(x){
var d = new Date(x);
var today =  new Date();
return today>=d;
}
