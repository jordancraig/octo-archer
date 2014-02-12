var url = 'http://www.unsplash.com/',
    cheerio = require('cheerio'),
    request = require('request'),
    fs = require('fs'),
    date = require('datejs'),
    nodefs = require('node-fs'),
    express = require('express'),
    imageURLs = [],
    localImages = [],
    images = 'images/' + Date.today().getFullYear() +
    '/' + Date.today().getWeek() + '/';


function createDirectory(path) {
  nodefs.mkdirSync(path,0777,true,function(err) {
    if (err) return console.error(err);
  });
}


function getHTML(err, resp, html) {
  if (err) return console.error(err);
  var parsed_html = cheerio.load(html);

  parsed_html('img').map(function(i, link) {
    var src = cheerio(link).attr('src');
    if (!src.match('.jpg')) return
    imageURLs.push(src);
  });
  downloadImages();
}

function downloadImages() {
  createDirectory(images);
  for (url in imageURLs) {
    request(imageURLs[url])
    .pipe(fs.createWriteStream(__dirname + '/public/' + images + '/' + url + '.jpg'))
    .on('close', function(){

    });
    localImages.push(images + '/' + url + '.jpg');
    console.log(localImages);
  }
}

request(url, getHTML);

var app = express();


app.use(express.logger());
app.use(express.static(__dirname + '/public'));
app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.get('/', function(req, res) {
  res.render('index', {
    images: localImages
  });
});

app.listen(3000);
console.log('Express server listening on port 3000.');
