var mysql = require('mysql');
var crypto = require('crypto');
var con = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'jamesbaobao',
  database: 'Coexer'
});
exports.connect = function (cb){
con.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
  }
  console.log("Connected!");
  cb();
});
}

exports.verification = function (e, p, cb){
  p = crypto.createHash('md5').update(p).digest("hex");
  var query = 'SELECT * FROM login WHERE user = \"' + e.toString() +'\" And pw = \"'+ p.toString()+'\"'+' AND time = 0';

  con.query(query ,function (err, result) {
    if (err) throw err;
    if(result!= undefined&&result.length==1 ){
	cb(true);
}else{
	cb(false);
	}
});

}
exports.newuser = function(e,p,cb){
var query = 'SELECT * FROM login WHERE user = \"' + e.toString() +'\"';
con.query(query ,function (err, result) {
if(result.length!=0){
  cb(false);
}else{
  p = crypto.createHash('md5').update(p).digest("hex");
  query = 'INSERT INTO login (user,pw,time) VALUES (\''+e+'\',\''+p+'\','+0+')';
  console.log(query);
  con.query(query ,function (err, result) {
cb(true);
  })
}

})
}
exports.updatekey = function(e,p,cb){
    p = crypto.createHash('md5').update(p).digest("hex");
var query = 'INSERT INTO login (user,pw,time) VALUES (\''+e+'\',\''+p+'\','+new Date().getTime()+')';
con.query(query ,function (err, result) {
  if (err) throw err;
cb();
})

}
exports.checkkey = function(e,p,cb){
clearOld(function(){
    p = crypto.createHash('md5').update(p).digest("hex");
var query = 'SELECT * FROM login WHERE user = \"' + e.toString() +'\" And pw = \"'+ p.toString()+'\"';
con.query(query ,function (err, result) {
  if (err) throw err;
  if(result!= undefined&&result.length==1 ){
cb(true);
}else{
cb(false);
}
});
})
}
function clearOld(cb){
  var date = new Date().getTime();
  var threshold = date-600000;
  var query = "remove * from login where time < "+threshold +" AND time !=0";
  con.query(query ,function (err, result) {
    cb()
  });
}
function clearPlayed(cb){
  var d = new Date();
  var date =dateGenerator(new Date());
  var query = `remove * from activity where date < ${date} OR (time <= ${d.getHours()+1} AND date =  ${date})`;
  con.query(query ,function (err, result) {
    cb()
  });
}

exports.addtoslot = function(time,date,location,e,cb){
  clearPlayed(function(){
var query = `select * FROM activity WHERE date= ${date} And time = ${time} And people= '${e}'`;
con.query(query ,function (err, result) {
  if (err) throw err;
  if(result.length>0){
    cb(false);
    }else{
      query = `select * FROM activity WHERE date= ${date} And time = ${time} And sport = '${location}'`;
      con.query(query ,function (err, result) {
        if(result.length!=0&&result[0].seat<=result.length){
          cb(false);
        }else{
          query = `insert into activity (date,time,seat,sport,description,people)values(${date},${time},${seat[location]},'${location}','${result[0].description}','${e}')`;
          con.query(query ,function (err, result) {
            if (err) throw err;
          cb(true);
        })
        }
      })
    }

});
});
}
exports.createslot = function(time,date,location,description,e,cb){
  clearPlayed(function(){
var query = `select * FROM activity WHERE date= ${date} And time = ${time} And people= '${e}'`;
console.log(query);
con.query(query ,function (err, result) {
  if (err) throw err;
  if(result.length>0){
    cb(0);
    console.log('repeat');
    }else{
      query = `select * FROM activity WHERE date= ${date} And time = ${time} And sport = '${location}'`;
      con.query(query ,function (err, result) {
        if(result.length==0){
          query = `insert into activity (date,time,seat,sport,description,people)values(${date},${time},${seat[location]},'${location}','${description}','${e}')`;
          con.query(query ,function (err, result) {
            if (err){ throw (err + '\n' +query)};
          cb(1);
        })
        }else if(result[0].seat<=result.length){
          cb(0);
            console.log(result.length+'full'+result[0].seat);
        } else{
          cb(2);
        }
      })
    }

});
});
}
var seat = {Soccer:22,Gym:5,Football:14,Basketball:10,Tennis:2,Badminton:4,Baseball:16,Dodgeball:10,Frisbee:12};
function dateGenerator(x){
var d = x;
y = d.getFullYear()*10000;
m = (d.getMonth()+1)*100;
d = d.getDate();
console.log('ymd login'+(y+m+d));
return y+m+d;
}
exports.find = function(sport,time,cb){
var query = `select * FROM activity WHERE time = ${time} And sport= '${sport}'`;
con.query(query ,function (err, result) {
if(result.length==0){
cb(false);

}else{
  var out = [];
  var date = {};
  var track = 0;
for(var i = 0; i<result.length;i++){
if(Object.keys(date).length==0||date[result[i].date.toString()]==undefined){
out.push( {num:1,date:result[i].date,time:result[i].time,sport:result[i].sport});
date[result[i].date] = track;
track++;
  }else {
    out[date[result[i].date.toString()]].num++;
  }
}
console.log(out.toString());
cb(out);
}
})
}
