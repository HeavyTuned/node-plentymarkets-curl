var util = require('util');
var Curl = require( 'node-libcurl' ).Curl;
var path = require( 'path' );
var fs = require( 'fs' );
var xmlParseString = require('xml2js').parseString;
var RateLimiter = require('limiter').RateLimiter;
var limiter = new RateLimiter(60, 'minute');
var prettyjson = require('prettyjson');

const querystring = require('querystring');

function PlentyCurlAPI() {}

PlentyCurlAPI.prototype.requiredCreditials = ["domain","password","user"];
PlentyCurlAPI.prototype.debug = false;

PlentyCurlAPI.prototype.currentCreditialsSet = false;

PlentyCurlAPI.prototype.currentCreditials  = {};

PlentyCurlAPI.prototype.userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36";

PlentyCurlAPI.prototype.cookieJarFileName = "cookiejar.txt";

PlentyCurlAPI.prototype.plentyUserID = 0;
PlentyCurlAPI.prototype.plentyCSRFToken = 0;

PlentyCurlAPI.prototype.dataObject = {
	success: false,
	data: {},
	exception: {}
};

PlentyCurlAPI.prototype.setDebug = function(value){
	this.debug = value;
};

PlentyCurlAPI.prototype.setUserID = function(id){
	PlentyCurlAPI.prototype.plentyUserID = id;
};

PlentyCurlAPI.prototype.getUserID = function(){
	return PlentyCurlAPI.prototype.plentyUserID;
};

PlentyCurlAPI.prototype.setUserToken = function(token){
	PlentyCurlAPI.prototype.plentyCSRFToken = token;
};

PlentyCurlAPI.prototype.getUserToken = function(){
	return PlentyCurlAPI.prototype.plentyCSRFToken;
};

PlentyCurlAPI.prototype.buildQueryString =  function(obj){
	if(typeof obj != "object"){
		throw("ERROR: buildQueryString argument should be either an object or array");
	}
	return querystring.stringify(obj);
};


PlentyCurlAPI.prototype.extend = function(target) {
	var sources = [].slice.call(arguments, 1);
	sources.forEach(function (source) {
		for (var prop in source) {
			target[prop] = source[prop];
		}
	});
	return target;
};

PlentyCurlAPI.prototype.buildResponseObject = function(responseObject){
	var buildResponseObject = this.extend({}, this.dataObject, responseObject);
	if(this.debug === true){
		console.log("DEBUG LOG START");
		console.log(prettyjson.render(buildResponseObject));
		console.log("DEBUG LOG END");
	}
	return buildResponseObject;
};

PlentyCurlAPI.prototype.prepareGetRequest = function(url, queryStringObject){
	var curl = new Curl();
	url = url+"?"+this.buildQueryString(queryStringObject);

	curl.setOpt( Curl.option.URL, url );
	curl.setOpt( Curl.option.USERAGENT, this.userAgent );
	curl.setOpt( Curl.option.FOLLOWLOCATION, true );
	curl.setOpt( Curl.option.COOKIEFILE, this.cookieJarFileName );
	return curl;
};

/*
	We need this function since it looks that querystring.stringify() fails on nested objects
*/
PlentyCurlAPI.prototype.stringifyNestedObject = function(obj) {
	return querystring.escape(JSON.stringify(obj));
};

PlentyCurlAPI.prototype.preparePostRequest = function(url, queryString){
	var curl = new Curl();
	var postfields =  queryString;
	curl.setOpt( Curl.option.URL, url );
	curl.setOpt( Curl.option.USERAGENT, this.userAgent );
	curl.setOpt( Curl.option.FOLLOWLOCATION, true );
	curl.setOpt( Curl.option.COOKIEFILE, this.cookieJarFileName );
	curl.setOpt( Curl.option.POST, 1 );
	curl.setOpt( Curl.option.POSTFIELDS, postfields );
	curl.setOpt( Curl.option.POSTFIELDSIZE, postfields.length );
	curl.setOpt( Curl.option.HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded; charset=UTF-8'] );

	return curl;
};

PlentyCurlAPI.prototype.prepareLoginRequest = function(){
	var curl = new Curl();
	var url = this.currentCreditials.domain+"/plenty/api/ui.php?request={%22requests%22%3A[{%22_dataName%22%3A%22PlentyMarketsLogin%22%2C%20%22_moduleName%22%3A%22user%2Flogin%22%2C%20%22_searchParams%22%3A{%22username%22%3A%22"+this.currentCreditials.user+"%22%2C%20%22password%22%3A%22"+this.currentCreditials.password+"%22%2C%20%22lang%22%3A%22de%22%2C%20%22secureLogin%22%3Atrue%2C%20%22isGWT%22%3Atrue}%2C%20%22_writeParams%22%3A{}%2C%20%22_commandStack%22%3A[{%22type%22%3A%22read%22%2C%20%22command%22%3A%22read%22}]%2C%20%22_dataArray%22%3A{}%2C%20%22_dataList%22%3A{}}]%2C%20%22meta%22%3A{}}";
	curl.setOpt( Curl.option.URL, url );
	curl.setOpt( Curl.option.USERAGENT, this.userAgent );
	curl.setOpt( Curl.option.FOLLOWLOCATION, false );

	curl.setOpt( Curl.option.COOKIEFILE, this.cookieJarFileName );
	curl.setOpt( Curl.option.COOKIEJAR, this.cookieJarFileName );
	return curl;
};

PlentyCurlAPI.prototype.buildRequestCallback = function(curl, url, callback){
	var self = this;
	return function(){
		curl.on( 'end', function(code, body) {

			try{
				if(code == 200 || code == 302){
					try{
						var response = JSON.parse(body);
						if(response.class !== undefined && response.class == "UINotLoggedInException"){
							self.login(function(loginTest){
								if(loginTest.sucess === true){
									self.apiRequest(requestCallback);
								}else{
									callback(self.buildResponseObject({call: "login", success: false, data:loginTest}));
								}
							});
						}else{
							callback(self.buildResponseObject({call: url, success: true, data: response}));
						}
					}catch(ex){ /*not json*/
						xmlParseString(body, function (err, result) {
							callback(self.buildResponseObject({call: url, success: true, data: result}));
						});
					}
				}else{
					callback(self.buildResponseObject({call: url, success: false, exception: {"code":code}}));
				}
			}catch(exception){
				callback(self.buildResponseObject({call: url, success: false, exception: exception}));
				return false;
			}
			this.close();
			return false;
		});

		curl.on( 'error', function(err, curlErrCode){
			callback(self.buildResponseObject({call: url, success: false, exception: err}));
			this.close();
		} );

		curl.perform();
	};
};

PlentyCurlAPI.prototype.loginWasSuccessful = function(response){
	if(response && response.resultObjects.length >0){
		if(response.resultObjects[0]._exceptionFound === false){
			if(response.resultObjects[0]._data.length >0){
				if(response.resultObjects[0]._data[0]._dataArray.isValid === true){
					PlentyCurlAPI.prototype.setUserID(response.resultObjects[0]._data[0]._dataArray.userId);

					PlentyCurlAPI.prototype.setUserToken(response.resultObjects[0]._data[0]._dataArray.csrfToken);
					return true;
				}
			}
		}
	}
	return false;
};

PlentyCurlAPI.prototype.setCreditials = function(creditials){
	if(creditials === undefined){
		throw("ERROR: Missing Creditials Object {domain:string, password:string, user:string}");
	}

	this.requiredCreditials.forEach(function(cred){
		if(creditials[cred] === undefined){
			throw("ERROR: Missing Creditial: "+cred);
		}
	});

	if(creditials.domain.indexOf("http") == -1){
		throw("ERROR: creditials.domain now requires a full http:// / https path!");
	}
	this.currentCreditials = creditials;
	this.currentCreditialsSet = true;
};

PlentyCurlAPI.prototype.login = function(callback){
	var self = this;
	if(callback === undefined){
		callback = function(){};
	}

	if(this.currentCreditialsSet === false){
		throw("ERROR: You need call setCreditials first before you can login");
	}

	var cookieJarFile = path.join( __dirname, this.cookieJarFileName);
	var curl = this.prepareLoginRequest();

	if ( !fs.existsSync( this.cookieJarFileName ) ) {
		fs.writeFileSync( this.cookieJarFileName );
	}

	this.apiRequest(function(){
		curl.on( 'end', function(code, body) {
			try{
				if(code == 200 || code == 302){
					var response = JSON.parse(body);
					if(self.loginWasSuccessful(response) === true){
						callback(self.buildResponseObject({call: "login", success: true, data: response}));
					}else{
						callback(self.buildResponseObject({call: "login", success: false, data: response}));
					}
				}else{
					callback(self.buildResponseObject({call: "login", success: false, exception: {"code":code}}));
				}
			}catch(exception){
				callback(self.buildResponseObject({call: "login", success: false, exception: exception}));
				return false;
			}
			this.close();
			return false;
		});

		curl.on( 'error', function(err, curlErrCode){
			callback(self.buildResponseObject({call: "login", success: false, exception: err}));
			this.close();
		} );

		curl.perform();
	});
};

PlentyCurlAPI.prototype.post = function(url, data, callback){
	var self = this;
	var curl = this.preparePostRequest(url, data);
	var requestCallback = this.buildRequestCallback(curl, url, callback);
	this.apiRequest(requestCallback);
};

PlentyCurlAPI.prototype.get = function(url, data, callback){
	var self = this;
	var curl = this.prepareGetRequest(url, data);
	var requestCallback = this.buildRequestCallback(curl, url, callback);
	this.apiRequest(requestCallback);
};

PlentyCurlAPI.prototype.apiRequest = function(func){
	limiter.removeTokens(1, function(err, remainingRequests) {
		func();
	});
};

module.exports = PlentyCurlAPI;
