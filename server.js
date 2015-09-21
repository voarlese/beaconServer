
var express = require('express');
var mongodb = require('mongodb');
var bodyParser = require('body-parser');
var app = express();
var nodemailer = require("nodemailer");
var md5 = require('md5');
var http = require('http');
var session = require('express-session');
var cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(session({secret:'wj;oeifj;wa',
				saveUninitialized:true,
				resave:true}));


//Configuration
/*
	Here we are configuring our SMTP Server details.
	STMP is mail server which is responsible for sending and recieving email.
*/
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "iseeking101@gmail.com",
        pass: "iseeking2015"
    }
});
/*------------------SMTP Over-----------------------------*/
// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: true });



var mongodbURL = 'mongodb://iseeking101:iseeking2015@ds027318.mongolab.com:27318/iseeking';
var myDB;

mongodb.MongoClient.connect(mongodbURL, function(err, db) {
	if (err) {
		console.log(err);
	} else {
		myDB = db;
		console.log('connection success');
	}
});



/*登出
http.get("/logout", function(req, res){
    //刪除session
    req.session.destroy(function(error){
        res.send("成功刪除session");
    });
});
*/

app.get('/', function(req, res) {
	var html = '<p>welcome tracking of missing uncle!</p>'+'<form action="/updateBeaconId" method="post">' +
               'Enter your name:' +
               '<input type="text" name="user" placeholder="..." />' +
			   //'<input type="text" name="password" placeholder="..." />' +
			   //'<input type="text" name="email" placeholder="..." />' +
			   '<input type="text" name="beaconId" placeholder="..." />' +
			   
               '<br>' +
               '<button type="submit">Submit</button>' +
            '</form>';
    
    
	res.status(200).send(html);
	res.end();
});
app.post('/getOld',urlencodedParser,function(req,res){
	 
	
	var whereName = {"user" : req.body.user,old_detail:{$exists:true}};
	var collection = myDB.collection('login');
	collection.find(whereName).toArray(function(err, docs) {
		if(err){
			res.status(406).send(err);
			res.end();
		}else{
			if (typeof docs[0] !== 'undefined' && docs[0] !== null ) { 
			res.type('application/json');
			var jsonData = JSON.stringify(docs);
			var jsonObj = JSON.parse(jsonData);
			console.log(jsonObj[0].old_detail.userName);
			res.status(200).send(docs);
			res.end();
			}else{
				res.type('text/plain');
				res.status(200).send("no detail");
				res.end();
			}
		}
	});
});
app.post('/getMember',urlencodedParser,function(req,res){
	 
	
	var whereName = {"user" : req.body.user,detail:{$exists:true}};
	var collection = myDB.collection('login');
	collection.find(whereName).toArray(function(err, docs) {
		if(err){
			res.status(406).send(err);
			res.end();
		}else{
			if (typeof docs[0] !== 'undefined' && docs[0] !== null ) { 
			res.type('application/json');
			var jsonData = JSON.stringify(docs);
			var jsonObj = JSON.parse(jsonData);
			console.log(jsonObj[0].detail.userName);
			res.status(200).send(docs);
			res.end();
			}else{
				res.type('text/plain');
				res.status(200).send("no detail");
				res.end();
			}
		}
	});
});
app.post('/updateOld',urlencodedParser,function(req,res){
	var user = req.body.user;
	var oldName = req.body.oldName;
	var oldCharacteristic = req.body.oldCharacteristic;
	var oldhistory = req.body.oldhistory;
	var oldclothes = req.body.oldclothes;
	var oldaddr = req.body.oldaddr;
	var beaconId = req.body.beaconId;
 	var collection = myDB.collection('login');
	var whereName = {"user": user};
//
	collection.update(whereName, {$set: {"old_detail":{"beaconId":beaconId,"oldName":oldName,"oldCharacteristic":oldCharacteristic,"oldhistory":oldhistory,"oldclothes":oldclothes,"oldaddr":oldaddr}}},  function(err) {
      if(err){
		    res.send("There was a problem adding the information to the database.");
		    console.log(err);		
		}else{
			res.type("text/plain");
			res.status(200).send("ok");
			res.end();	
		}
    });
});
app.post('/updateBeaconId',urlencodedParser,function(req,res){
	var user = req.body.user;
	var oldName = req.body.oldName;
	var oldCharacteristic = req.body.oldCharacteristic;
	var oldhistory = req.body.oldhistory;
	var oldclothes = req.body.oldclothes;
	var oldaddr = req.body.oldaddr;
	var beaconId = req.body.beaconId;
 	var collection = myDB.collection('login');
	var whereName = {"user": user};
// collection.find({"user":user_name}).toArray(function(err,docs){});
	collection.find().toArray(function(err,docs){
		if(err){
			res.status(406).send(err);
			res.end();
		}else{
			var jsonData = JSON.stringify(docs);
			var jsonObj = JSON.parse(jsonData);
			var e ="";
			console.log("in find");
			for(var i =0 ; i < jsonObj.length ;i++){
				
				if ( jsonObj[i].old_detail.beaconId == beaconId ){
					e = "exist";
					console.log("e="+e);
					break;
				} 	
				console.log("in for"+i);
			}
			
			if ( e == "exist") { 
			console.log("in exist");
			res.type("text/plain");
			res.status(200).send("exist");
			res.end();
			}else{
				collection.update(whereName, {$set: {"old_detail":{"beaconId":beaconId,"oldName":oldName,"oldCharacteristic":oldCharacteristic,"oldhistory":oldhistory,"oldclothes":oldclothes,"oldaddr":oldaddr}}},  function(err) {
					if(err){
					res.send("There was a problem adding the information to the database.");
					console.log(err);		
					}else{
					res.type("text/plain");
					res.status(200).send("ok");
					res.end();	
					}	
				});
			}
		}
		
	});
});
app.post('/updateMember',urlencodedParser,function(req,res){
	var user = req.body.user;
	var userName = req.body.userName;
	var userPhone = req.body.userPhone;
	var userAddress = req.body.userAddress;
	var reward = req.body.reward;
	var location = req.body.location;	
 	var collection = myDB.collection('login');
	var whereName = {"user": user};

	
	collection.update(whereName, {$set: {"detail":{"userName":userName,"userPhone":userPhone,"userAddress":userAddress,"reward":reward,"location":location}}},  function(err) {
      if(err){
		    res.send("There was a problem adding the information to the database.");
		    console.log(err);		
		}else{
			res.type("text/plain");
			res.status(200).send("ok");
			res.end();	
		}
    });
});


app.post('/login',urlencodedParser,function(req,res){
  //確認session有無user在沒有就執行登入，有就直接回傳
  if(req.session.user){
	  res.type('text/plain');
	  res.status(200).send("1");  
  }
  else{
  //sess.cookie.maxAge = 5000;
  //user存入session
  req.session.user = req.body.user;
  //抓取post 參數
  var user_name = req.body.user;
  var user_password = md5(req.body.password);
  if (!req.body) return res.sendStatus(400)
  //設定query條件
  var whereMf ={"user": user_name,"password": user_password};
  var collection = myDB.collection('login');
	collection.find(whereMf).toArray(function(err, docs) {
		if (err) {
			res.status(406).send(err);
			res.end();
		} else {
			var jsonData = JSON.stringify(docs);
			var jsonObj = JSON.parse(jsonData);
			var rt = "0";
			//如果不是undefined或不是null表示有查到資料，則回傳
			if (typeof docs[0] !== 'undefined' && docs[0] !== null ) { 
				if(jsonObj[0].comfirm == 0){
					rt = "2"; console.log("帳號無開通");
					res.type('text/plain');
					res.status(200).send(rt); 
					res.end();
				}else{
					rt = "1"; console.log("login");
					res.type('text/plain');
					res.status(200).send(rt);  
					res.end();
				}
				
			}else{
				rt = "0";
				res.type('text/plain');
				res.status(200).send(rt);  
				res.end();
			}
		}
	});
  }
});


app.get('/comfirm',function(req,res){
	var mf = req.query.mf
	var user_name = req.query.user
	var collection = myDB.collection('login');
	var whereName = {"user": user_name,"mf": mf};
	collection.update(whereName, {$set: {"comfirm":1}},  function(err) {
      if(err){
		    res.send("There was a problem adding the information to the database.");
		    console.log(err);		
		}else{
			res.type("text/plain");
			res.status(200).send("帳號已開通");
			res.end();	
		}
    });
});
app.post('/register',urlencodedParser,function(req,res){
	console.log("in register app");
    var user_name = req.body.user;
	var user_password = req.body.password;
	var user_email = req.body.email;
	var mf = md5(Math.random());
	var collection = myDB.collection('login');
	var content = "帳號:"+ user_name + "  您好，請點網址開通帳號: http://beacon-series.herokuapp.com/comfirm?mf=" + mf + "&user="+user_name
	var mailOptions={
		to : user_email,
		subject : "認證信",
		text : content
	}
	console.log(user_name);
	collection.find({"user":user_name}).toArray(function(err,docs){
		if(err){
			res.status(406).send(err);
			res.end();
		}else{
			if (typeof docs[0] !== 'undefined' && docs[0] !== null ) {
				res.type("text/plain");
				res.status(200).send("exist");
				res.end();
			}else{
				collection.insert({
		"id":"",
        "user" : user_name,
        "password" : md5(user_password),
		"email" : user_email,
		"comfirm" : 0,
		"mf" : mf,
		"pic":"",
		"detail" : {
			"userName":"",
			"userPhone":"",
			"userAddress":"",
			"reward":"",
			"location":""
		},
		"old_detail":{
			"beaconId":"",
			"oldName":"",
			"oldCharacteristic":"",
			"oldhistory":"",
			"oldclothes":"",
			"oldaddr":""
			
		}
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
			console.log("data inserted");
            // If it worked, set the header so the address bar doesn't still say /adduser
            res.type("text/plain");
			res.status(200).send("OK");
			smtpTransport.sendMail(mailOptions, function(error, response){
			if(error){
				console.log(error);		
			}else{
			console.log("Message sent: " + response.message);		
			}
			});
			res.end();
            // And forward to success page
            
        }
    });
				
			}
				
		}	

	});
	
});


/*
app.get('/api/test', function(request, response) {
	var user_name = request.query.user;
	var user_password = request.query.password;
	
	var collection = myDB.collection('login');
	collection.find({}).toArray(function(err, docs) {
		if (err) {
			response.status(406).send(err);
			response.end();
		} else {
			response.type('application/json');
			response.status(200).send(docs);
			response.end();
		}
	})
});
*/
var port = process.env.PORT || 3000; // process.env.PORT for Heroku
http.createServer(app).listen(port);

