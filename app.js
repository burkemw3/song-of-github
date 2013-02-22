
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    https = require('https'),
    path = require('path');

var app = express();

var ghe_hostname = ""; // only the hostname, like github.foobar.com not http://github.foobar.com.
var ghe_cookie = "_fi_sess="; // something like: _fi_sess=ASDVCASFRFVASFV...%3D--abcdef1234567890abcdef1234567890

app.configure(function(){
  app.set('port', process.env.PORT || 4000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'hjs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', function(req, res){
  var isCleanishUserRequest = false;
  if (req.query.username) {
    var re = /^[a-zA-Z0-9][-a-zA-Z0-9]*$/; // github requires username to start alphanumeric, then be alphanumerc + dash.
    isCleanishUserRequest = (re.exec(req.query.username) !== null);
  }
  if(true === isCleanishUserRequest){
    options = {
        hostname: ghe_hostname,
        path: "/users/" + req.query.username + "/contributions_calendar_data",
        headers : {
            Cookie: ghe_cookie
        }
    };
    https.get(options, function(response) {
      response.on('data', function(d){
        try{
          JSON.parse(d);
        }catch(e){
          d = null;
        }

        res.render('index', { calendarData: d, name: req.query.username, embeddable: req.query.embeddable });
      });
    });
  }else{
    res.render('index');
  }

});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
