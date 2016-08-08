# node-plentymarkets-curl
[![license][license-image]][license-url]
[![node][node-image]][node-url]

[node-image]:https://img.shields.io/badge/node.js-%3E=_0.10-green.svg?style=flat-square
[node-url]:https://nodejs.org/download/

[license-image]:https://img.shields.io/github/license/JCMais/node-libcurl.svg?style=flat-square
[license-url]:https://raw.githubusercontent.com/JCMais/node-libcurl/develop/LICENSE-MIT
A Curl API for Plentymarkets-Backend

### Install
```npm install node-plentymarkets-curl --save```

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

plenty.post("https://"+config.config.curlPlentyMainDomain+"/plenty/api/ui.php", {request: '{"requests":[{"_dataName":"TemplateImportTemplate", "_moduleName":"cms/template/import", "_searchParams":{}, "_writeParams":{"designName":"Calisto", "lang":"de", "importAll":false}, "_validateParams":{}, "_commandStack":[{"type":"write", "command":"writeFromDropbox"}], "_dataArray":{}, "_dataList":{}}], "meta":{"id":3}}'}, function(callResult){console.log(callResult);
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