'use strict';

var http = require('http');
var zlib = require('zlib');
var url = require('url');
var assert = require('assert');
var qs = require('querystring');

/*
 * req({
 * 	   url: 'http://example.com/',
 *     method: 'POST',
 * 	   data: {
 *     		id: 1
 *     },
 *     headers: {
 *          userAgent: 'CrOS 51.0'
 *     },
 *     success: function(data, info){},
 *     error: function(err){},
 *     timeout: 10000
 *	});
 */
var req = function(args){
	assert(typeof args.url == 'string', 'Invalid url type');
	
	if(typeof args.data == 'object'){
		if(args.headers){
			args.headers['content-type'] = 'application/x-www-form-urlencoded; charset=utf-8';
		}else{
			args.headers = {"content-type": 'application/x-www-form-urlencoded; charset=utf-8'};
		}
	}
	
	if(args.headers){
		if(!args.headers['accept-encoding'])args.headers['accept-encoding'] = 'gzip,deflate';
	}else{
		args.headers = {"accept-encoding": 'gzip,deflate'};
	}
	
	
	var urlobj = url.parse(args.url);
	var reqobj = http.request({
		protocol: urlobj.protocol || 'http:',
		host: urlobj.host,
		hostname: urlobj.host,
		port: urlobj.port || 80,
		method: typeof args.method == 'string' ? args.method.toUpperCase() : 'GET',
		path: urlobj.path || '/',
		headers: typeof args.headers == 'object' ? args.headers : {}
	}, function(res){
		var buf = new Buffer('');
		var info = res.headers;
		info.statusCode = res.statusCode;
		res.on('data', function(chunk){
			buf = Buffer.concat([buf, chunk]);
		}).on('end', function(){
			if(res.headers['content-encoding']){
				var unzip_cb = function(err, result){
					if(err){
						if(typeof args.error == 'function') args.error.call(reqobj, err);
					}else{
						if(typeof args.success == 'function') args.success.call(res, result);
					}
				}
				switch(res.headers['content-encoding']){
					case 'gzip':
						zlib.gunzip(buf, unzip_cb);
						break;
					case 'deflate':
						zlib.inflate(buf, unzip_cb);
						break;
					default:
						if(typeof args.success == 'function') args.success.call(res, result);
				}
			}else{
				if(typeof args.success == 'function') args.success.call(res, buf.toString());
			}
		});
	});
	
	reqobj.setTimeout(typeof args.timeout == 'number' ? args.timeout : 30000);
	
	reqobj.on('error', function(err){
		if(typeof args.error == 'function') args.error.call(reqobj, err);
	});
	
	reqobj.end(args.method == 'POST' ? qs.encode(args.data) : void(0));
}

module.exports = req;