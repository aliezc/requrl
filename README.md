# requrl

easily to request a url

## Install

```
npm Install requrl
```

## Usage

This is a demo:

```javascript
var request = require('requrl');

request({
	url: 'http://example.com/',				// request url, must
	method: 'POST',							// request method, default to GET
	headers: {								// headers will append, object
		"accept-content": "text/html"
	},
	data: {									// POST data, could be string, Buffer or object
		"name": "demo"
	},
	timeout: 10000,							// request timeout, default to 30000
	success: function(data, info){},		// callback while success, info is response headers
	error: function(err){}					// callback while error
});
```