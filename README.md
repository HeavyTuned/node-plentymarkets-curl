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
to prevent heavy load on the backend we're limiting the calls to one call per second - this should be enough for most use cases.

## Login
either you can call plenty.login(); before each start or let the script fire the request without logging in. This should result in an UINotLoggedInException exception if your cookie data is invalid.  
The API automatically relogs the user by calling login() and repeats your last call.  
The Backend automatically blocks the user after too many login attempts within a short time.

## How do I get the required request parameters and url?
You can use your Chrome Developer Console and manually fire a request in your plantymarts backend and log it in the Networking / XHR section

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

plenty.post("https://"+config.curlPlentyMainDomain+"/plenty/api/ui.php", {foo: "bar"}, function(callResult){
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
for logging in you have to pass a object to setCreditials with the backend domain, a username & password
```javascript
	{
		domain: string, (your main plentymarkets domain without https://)
		password: string, (users backend password)
		user: string, (backend user )
	}
```

### responseObject
every callback object is build in this style.

```javascript
	{
		success: boolean, (only validates if the request was successful and the login worked - does not validate the response result)
		call: string, (api call URL or login)
		data: object, (response object parse XML or JSON)
		exception: object (error object from curl or plentymarkets)
	}
```

###new PlentyCurlAPI()
initializes a new api object
```javascript

var PlentyCurlAPI = require("node-plentymarkets-curl");
var plenty = new PlentyCurlAPI();

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

###setDebug(boolean)
display each call response as prettyfied JSON through console.log();

Example:

```javascript

plenty.setDebug(true);
```

Output after a call:

```ShellSession
DEBUG LOG START
success:   true
data: 
  plenty: 
    block: 
      - 
        blockNumIndex: 
          - 
            data: 
              - 
                """
                  
                  	<!-- START PlentyGuiAjaxMessage  -->
                  	<div id="ajaxRegisterOrders_Error" class="PlentyGuiAjaxMessage bar_err">
                  		
                  	<table id="PlentyGuiTable_1_id">
                  		<tbody id="PlentyGuiTable_1_id_tbody">
                  	<tr id="PlentyGuiTableRow_1_id" class="PlentyGuiTableRow">
                  		<th id="PlentyGuiTableHead_1_id" class="PlentyGuiTableHead icon"><br />
                  		</th>
                  		<td id="PlentyGuiTableData_1_id" class="PlentyGuiTableData" align="left" valign="top">		
                  	
                  	<div id="PlentyGuiPane_1_id" class="PlentyGuiPane">
                  		<span id="PlentyGuiText_2_id" class="bold PlentyGuiText">Code 1 : Der Vorgang konnte nicht korrekt durchgeführt werden. Bitte Dateneingabe pr�fen.<br/></span>
                  		<span id="PlentyGuiText_1_id" class="PlentyGuiText">unknown</span>
                  	</div>
                  		
                  		</td>
                  	</tr>
                  		</tbody>
                  	</table>
                  	
                  	</div>
                  	<!-- END PlentyGuiAjaxMessage  -->
                  	
                """
            id: 
              - shipmenty_center_register_result_pane
            add: 
              - 0
            $: 
              index: 0
exception: 

call:      https://myPlentyDomain.de/plenty/admin/gui_call.php
DEBUG LOG END
````

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

//registers orders at DHL intraship
plenty.get("https://www.myPlentyDomain.de/plenty/admin/gui_call.php",{
	"Object" : "mod_order/shipmentcenter2@GuiAjaxShipmentCenterRegister",
	"Params[gui]" : "ajaxRegisterOrders",
	"Params[result_id]" : "shipmenty_center_register_result_pane",
	"gwt_tab_id" : "1",
	"presenter_id": "",
	"selection" : myOrderArray.join(","),
	"PageConfig[param]" : "search",
	"PageConfig[name]" : "_PC_GuiShipmentCenterBase",
	"exec.png" : "exec.png",
	"registerShipment[shipping_provider]" : "DhlIntraship",
	"addParam[status_to]" : "0",
	"addParam[shippingDate]" : new moment().format("DD.MM.YYYY"),
	"ignorePspList" : "1",
	"addParam[billing_nr]" : "0000000000_00_00",
	"addParam[service_option]" : "auto"
}, function(out){
	if(out.success){
		//handle XML result
	}
})
```