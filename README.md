# node-plentymarkets-curl
[![license][license-image]][license-url]
[![node][node-image]][node-url]

[node-image]:https://img.shields.io/badge/node.js-%3E=_0.10-green.svg?style=flat-square
[node-url]:https://nodejs.org/download/

[license-image]:https://img.shields.io/github/license/JCMais/node-libcurl.svg?style=flat-square
[license-url]:https://raw.githubusercontent.com/JCMais/node-libcurl/develop/LICENSE-MIT
A Curl API for Plentymarkets-Backend

## Install
```npm install node-plentymarkets-curl --save```

## Limits
to prevent heavy load we're limiting the calls to one call per second.

## Login
either you can call plenty.login(); before each start or let the script fire the request without logging in. This should result in an UINotLoggedInException exception if your cookie data is invalid.  
The API automatically relogs the user by calling login() and repeats your last call.

### Simple Request
```javascript
var PlentyCurlAPI = require("node-plentymarkets-curl");
var config = require('./config.js');

var plenty = new PlentyCurlAPI();


plenty.setCreditials({
	domain: config.curlPlentyMainDomain,
	password: config.curlLoginPassword,
	user: config.curlLoginUserName,
});

plenty.post("https://"+config.config.curlPlentyMainDomain+"/plenty/api/ui.php", {request: '{"requests":[{"_dataName":"TemplateImportTemplate", "_moduleName":"cms/template/import", "_searchParams":{}, "_writeParams":{"designName":"Calisto", "lang":"de", "importAll":false}, "_validateParams":{}, "_commandStack":[{"type":"write", "command":"writeFromDropbox"}], "_dataArray":{}, "_dataList":{}}], "meta":{"id":3}}'}, function(callResult){
	if(callResult.success === true){
		if(typeof callResult.resultObjects == "array"){
			if(callResult.resultObjects[0]._exceptionFound == false){
				console.log("Imported Layout From Dropbox");
			}
		}
	}
});

```
## API

### creditialsObject
```javascript
	{
		domain: string, (your main plentymarkets domain without https://)
		password: string, (users backend password)
		user: string, (backend user )
	}
```

### responseObject
```javascript
	{
		success: boolean,
		call: string, (api call URL or login)
		data: object, (raw response object)
		exception: object (error object from curl or plentymarkets)
	}
```
###setCreditials
sets the login data for the calls
Example:

```javascript

plenty.setCreditials({
	domain: config.curlPlentyMainDomain,
	password: config.curlLoginPassword,
	user: config.curlLoginUserName,
});
```

### post(url, dataObject, callback(responseObject))

makes a POST request to the specified url

Example:

```javascript

//imports a Layout from Dropbox
plenty.post("https://myPlentyDomain.de/plenty/api/ui.php", {foo: "bar"}, function(callResult){
	if(callResult.success === true){
		if(typeof callResult.resultObjects == "array"){
			if(callResult.resultObjects[0]._exceptionFound == false){
				console.log("Imported Layout From Dropbox");
			}
		}
	}
});
```

### get(url, dataObject, callback(responseObject))

makes a GET request to the specified url

Example:

```javascript

//imports a Layout from Dropbox
plenty.post("https://myPlentyDomain.de/plenty/api/ui.php", {foo: "bar"}, function(callResult){
	if(callResult.success === true){
		if(typeof callResult.resultObjects == "array"){
			if(callResult.resultObjects[0]._exceptionFound == false){
				console.log("Imported Layout From Dropbox");
			}
		}
	}
});
```