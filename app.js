var http = require('http'),
    path = require('path'),
    express = require('express'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    js2xmlparser = require('js2xmlparser'),
    libxslt = require('libxslt'),
    xml2js = require('xml2js');
		xml2jsonparser = require('xml2json');

var router = express();
var server = http.createServer(router);

router.use(express.static(path.resolve(__dirname, 'views')));
router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

//==============================================
//SECURITY
//session security
/*var expresssession = require('express-session')

router.use(expresssession({
  secret: 's3Cur3',
  name: 'sessionId'
}))*/

/*//cookie security
var session = require('cookie-session')
var expiryDate = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
router.use(session({
  name: 'session',
  keys: ['key1', 'key2'],
  cookie: {
    secure: true,
    httpOnly: true,
    domain: 'webapp-x15045111859534.codeanyapp.com',
    path: 'foo/bar',
    expires: expiryDate
  }
}));*/

//helmet for security
var helmet = require('helmet');

router.use(helmet({
	frameguard:{action: 'deny'}
}))

router.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", 'maxcdn.bootstrapcdn.com']
  }
}))
//Rate limiter for DDOS
var RateLimit = require('express-rate-limit');
 
var limiter = new RateLimit({
  windowMs: 15*60*1000, // 15 minutes 
  max: 100, // limit each IP to 100 requests per windowMs 
  delayMs: 0 // disable delaying - full speed until the max limit is reached 
});
 
//  apply to all requests 
router.use(limiter);

//================================================

//================================================
//XSD Validation
var xsd = require('libxml-xsd');
 
xsd.parseFile('Squad.xsd', function(err, schema){
  schema.validate('Squad.xml', function(err, validationErrors){
    // err contains any technical error 
    // validationError is an array, null if the validation is ok
		console.log('done');
  });  
});

/*var x = require('libxmljs');

var xsd = '<?xml version="1.0" encoding="utf-8" ?><xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns="http://example.com/XMLSchema/1.0" targetNamespace="http://example.com/XMLSchema/1.0" elementFormDefault="qualified" attributeFormDefault="unqualified"><xs:element name="foo"></xs:element></xs:schema>'
var xsdDoc = x.parseXmlString(xsd);

var xml0 = 'Squad.xml';
var xmlDoc0 = x.parseXmlString(xml0);
var xml1 = 'Squad.xml';
var xmlDoc1 = x.parseXmlString(xml1);

var result0 = xmlDoc0.validate(xsdDoc);
console.log("result0:", result0);

var result1 = xmlDoc1.validate(xsdDoc);
console.log("result1:", result1);*/
//=================================================

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

// POST request to add
router.post('/post/json', function(req, res) {
  
   function xmlFileToJs(filename, cb) {
    var filepath = path.normalize(path.join(__dirname, filename));
    fs.readFile(filepath, 'utf8', function(err, xmlStr) {
      if (err) throw (err);
      xml2js.parseString(xmlStr, {}, cb);
    });
  }

  //Function to convert JSON to XML and save it
  function jsToXmlFile(filename, obj, cb) {
    var filepath = path.normalize(path.join(__dirname, filename));
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(obj);
    fs.writeFile(filepath, xml, cb);
  }


  // Function to read in a JSON file, add to it & convert to XML
  function appendJSON(obj) {
    
      xmlFileToJs('Squad.xml', function(err, result) {
      if (err) throw (err);
      result.squad.player.push(obj);
      jsToXmlFile('Squad.xml', result, function(err) {
        if (err) console.log(err);
				
				//=====================================================================================
				//To create json file to for loading the left table
				var XMLfile = fs.readFileSync('Squad.xml', 'utf8');
				var json = xml2jsonparser.toJson(XMLfile);
				fs.writeFileSync('squaddata.json', json);

					fs.readFile('squaddata.json', 'utf8', (err, data) => {
					if (err) throw err;
					data = JSON.parse(data);
					data = data.squad.player.map( (s,i) => ( [ s.Name , i, 0, "" , s.Name ] ) );
					var stringy = JSON.stringify(data);
					//console.log(data);
					//console.log(stringy);
					fs.writeFileSync('views/lefttable.json', stringy);
					});
				//=====================================================================================
      })
    })
    
  }
	
	// Call appendJSON function and pass in body of the current POST request
  appendJSON(req.body);

  // Re-direct the browser back to the page, where the POST request came from
  res.redirect('back');
	
});

//Delete POST request
router.post('/post/delete', function(req, res) {
  // Function to read in XML file and convert it to JSON
  function xmlFileToJs(filename, cb) {
    var filepath = path.normalize(path.join(__dirname, filename));
    fs.readFile(filepath, 'utf8', function(err, xmlStr) {
      if (err) throw (err);
      xml2js.parseString(xmlStr, {}, cb);
    });
  }

  //Function to convert JSON to XML and save it
  function jsToXmlFile(filename, obj, cb) {
    var filepath = path.normalize(path.join(__dirname, filename));
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(obj);
    fs.writeFile(filepath, xml, cb);
  }

  // Function to read in a JSON file, add to it & convert to XML
  function deleteJSON(obj) {

    //console.log(obj);
    // Function to read in XML file, convert it to JSON, add a new object and write back to XML file
    xmlFileToJs('Squad.xml', function(err, result) {
      if (err) throw (err);
      //console.log(result.squad.player);
      //console.log(obj.row);
      for( var i in result.squad ) {
           delete result.squad.player[obj.row-1];
      }
			
      jsToXmlFile('Squad.xml', result, function(err) {
        if (err) console.log(err);
				
				//=====================================================================================
				//To create json file for loading the left table
				var XMLfile = fs.readFileSync('Squad.xml', 'utf8');
				var json = xml2jsonparser.toJson(XMLfile);
				fs.writeFileSync('squaddata.json', json);

					fs.readFile('squaddata.json', 'utf8', (err, data) => {
					if (err) throw err;
					data = JSON.parse(data);
					data = data.squad.player.map( (s,i) => ( [ s.Name , i, 0, "" , s.Name ] ) );
					var stringy = JSON.stringify(data);
					//console.log(data);
					//console.log(stringy);
					fs.writeFileSync('views/lefttable.json', stringy);
					});
				//=====================================================================================
      })
    })
  }

  // Call appendJSON function and pass in body of the current POST request
  deleteJSON(req.body);
  // Re-direct the browser back to the page, where the POST request came from
  //Reload moved to jQuery client side
	//res.redirect('back');
});


//POST request to save json file for loading on the pitchtable
router.post('/post6/json', function(req, res) {
 
	var content = req.body.table_content;

	var parsedContent = JSON.parse(content);
	
		fs.writeFile('views/pitchtable.json', parsedContent,'utf8', function (err) {
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



router.get("/squads", function(request, response) {
  response.render('squads');
});

router.get("/squadupdate", function(request, response) {
  response.render('squadupdate');
});

router.get("*", function(request, response) {
  response.end("404!");
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
  var addr = server.address();
  console.log("Server listening at", addr.address + ":" + addr.port);
});

