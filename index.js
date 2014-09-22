var express = require('express');
var FeedParser = require('feedparser');
var http = require('http');
var querystring = require('querystring');
var path = require('path');
var app = express();
var extend = require('util')._extend;
var moment = require("moment");

var feeder = (function() {
   var result = {};

   return {
      'reset': function() {
         result = {};
      },
      'parse': function(id, url) {
         console.log('Retrieving feed for ' + id + '...');
         var temp = {};
         http.get(url, function(res) {
            res.pipe(new FeedParser({})
               .on('error', function(error){
                  temp.error = 'Failed to parse feed XML!';
               })
               .on('meta', function(meta){
                  temp.meta = meta;
               })
               .on('readable', function(){
                  var stream = this, item;
                  if ( !temp.data ) {
                     temp.data = [];
                  }
                  while (item = stream.read()){
                     var time = moment(Date.parse(item.pubDate));

                     temp.data.push({
                       'title': item.title,
                       'link': item.link,
                       'description':  item.description,                       
                       'time': time.format("D MMM YYYY HH:mm:ss")
                     });
                  }
               })
               .on('end', function(){
                  result[id] = temp;
               }));
         }); 
      },
      'result': function(maxItems) {
         var object = extend({}, result);
         for (var key in object) {
            var feed = object[key];
            if ( typeof feed.data !== 'undefined' ) {
               feed.data = feed.data.splice(0, maxItems);
            }
         }
         return object;
      }
   }
}());

app
   .set('port', process.env.PORT || 8080)
   .set('views', path.join(__dirname, 'views'))
   .set('view engine', 'jade')
   .get('/', function(req, res) {
      res.render('index', { title: 'News' });
   })
   .get('/news', function(req, res) {
      res.json(feeder.result(req.query.maxItems));
   })
   .use(express.static(path.join(__dirname, 'public')));

var getFeeds = function() {
   feeder.parse('bbc', 'http://feeds.bbci.co.uk/news/rss.xml');
   feeder.parse('sky', 'http://news.sky.com/feeds/rss/home.xml');
   setTimeout(getFeeds, 60 * 1000);
};

getFeeds();

http.createServer(app).listen(app.get('port'), function(){
  console.log('News server listening on port ' + app.get('port'));
});