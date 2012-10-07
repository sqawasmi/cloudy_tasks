console.log('well, started the middleware');
MemoryStore = require('/usr/local/lib/node_modules/mojito/node_modules/connect/lib/middleware/session/memory');
store = new MemoryStore({ maxAge: 60000 });
module.exports = function (req, res, next) {
	var cookies = {};
	req.headers.cookie && req.headers.cookie.split(';').forEach(function( cookie ) {
	    var parts = cookie.split('=');
	    cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
	  });
	if (cookies.sid) {
		console.log('I have a session!');
		console.log(cookies.sid);
	//	var utils = require('connect/lib/utils');
	//	var crypto = require('crypto');
		store.get(cookies.sid, function(err, sess) {
			if (typeof(sess) == 'undefined' ) {
				console.log('i don\'t have a session until now!');
			} else {
				console.log('we have this:');
				console.log(sess);
				req.session = sess;
			}
			next();
		});
	} else {
		console.log("we don't have sid at all.. ok next()");
		next();
	}
};