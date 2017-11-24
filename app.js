var http = require('http'),
    path = require('path'),
    express = require('express'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    js2xmlparser = require('js2xmlparser'),
    libxslt = require('libxslt');

var router = express();
var server = http.createServer(router);

router.use(express.static(path.resolve(__dirname, 'views')));
router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

// GET request to dislay index.html located inside /views folder
router.get('/', function(req, res) {
  res.render('index');
});

// HTML produced by XSL Transformation
router.get('/get/html', function(req, res) {
  
    res.writeHead(200, { 'Content-Type': 'text/html' });
    
    var docSource = fs.readFileSync('Squad.xml', 'utf8');
    var stylesheetSource = fs.readFileSync('Squad.xsl', 'utf8');
    
    var doc = libxslt.libxmljs.parseXml(docSource);
    var stylesheet = libxslt.parse(stylesheetSource);
    
    var result = stylesheet.apply(doc);
    
    res.end(result.toString());
  
});

// POST request to add to JSON & XML files
router.post('/post/json', function(req, res) {

  // Function to read in a JSON file, add to it & convert to XML
  function appendJSON(obj) {

    // Read in a JSON file
    var JSONfile = fs.readFileSync('Squad.json', 'utf8');

    // Parse the JSON file in order to be able to edit it 
    var JSONparsed = JSON.parse(JSONfile);

    // Add a new record into player array within the JSON file    
    JSONparsed.player.push(obj);

    // Beautify the resulting JSON file
    var JSONformated = JSON.stringify(JSONparsed, null, 4);

    // Write the updated JSON file back to the system 
    fs.writeFileSync('Squad.json', JSONformated);

    // Convert the updated JSON file to XML     
    var XMLformated = js2xmlparser.parse("squad", JSON.parse(JSONformated));

    // Write the resulting XML back to the system
    fs.writeFileSync('Squad.xml', XMLformated);

  }

  // Call appendJSON function and pass in body of the current POST request
  appendJSON(req.body);
  
  // Re-direct the browser back to the page, where the POST request came from
  res.redirect('back');

});


router.post('/post6/json', function(req, res) {
 
	var content = req.body.table_content;

	var parsedContent = JSON.parse(content);
	
		fs.writeFile('views/test.json', parsedContent,'utf8', function (err) {
			if (err) {
				// append failed
			} else {
				// done
			}
		})
	res.sendStatus(200)
	
	/* Logging used to test and verify data
	console.log(parsedContent);
	console.log(req.body);
	console.log(req.body.table_content);
	*/
});




//Multiple page functions
router.get("/squads", function(request, response) {
  response.render('squads');
});

router.get("*", function(request, response) {
  response.end("404!");
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
  var addr = server.address();
  console.log("Server listening at", addr.address + ":" + addr.port);
});