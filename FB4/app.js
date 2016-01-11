
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  //Importing the 'client-sessions' module
  , session = require('client-sessions');

var app = express();

//configure the sessions with our application
app.use(session({   
	  
	cookieName: 'session',    
	secret: 'cmpe273_test_string',    
	duration: 30 * 60 * 1000,    
	activeDuration: 5 * 60 * 1000,  }));


app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.post('/signUp', routes.signUp);
app.post('/login', routes.login);
app.get('/home', routes.home);
app.get('/about', routes.about);
app.get('/getProfile', routes.getProfile);
app.post('/logout', routes.logout);
app.post('/search', routes.searchFriend);
app.post('/sendReq', routes.sendRequest);
app.post('/acceptReq', routes.acceptFriend);
app.post('/postFeed', routes.newsFeed);
app.get('/wallPost', routes.wall);
app.get('/group', routes.groups);
app.post('/createGrp', routes.createGroup);
app.get('/getGroups', routes.getGroups);
app.post('/groupDetails', routes.groupDetails);
app.post('/deleteMembers', routes.deleteMembers);
app.get('/getFriends', routes.getFriends);
app.post('/addMember', routes.addMember);
app.get('/workedu', routes.workedu);
app.post('/saveWorkEdu', routes.saveWorkEdu);
app.get('/contactInfo', routes.contactInfo);
app.post('/saveContactInfo', routes.saveContactInfo);
app.get('/overview', routes.overview);
app.get('/life', routes.life);
app.get('/getLife', routes.getLife);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Facebook server listening on port " + app.get('port'));
});
