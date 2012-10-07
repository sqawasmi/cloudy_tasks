/*
 * session handler for mojito, this is not production.. just for testing purposes..
 */
YUI.add('session-addon', function(Y, NAME) {
	var MemoryStore = require('connect/lib/middleware/session/memory');
	var utils = require('connect/lib/utils');
	var crypto = require('crypto');
	store = new MemoryStore({ maxAge: 60000 })
	session = {};
	
	function Addon(command, adapter, ac) {
		this.req = ac.http.getRequest();
		this.ac = ac;
		this.key = 'sid';
		this.secret = 'i love you';
		this.fingerprint = '';
		this.cookie = {} //options.cookie
		this.trustProxy = true;
		this.sessionID = ac.cookie.get(this.key);
		
		if (!this.sessionID) {
			console.log('creating a session cookie!');
			this.generate();
		} else if (this.req.session) {
			session = this.req.session;
		} else {
			console.log('we have a session id, but there is no session stored!');
		}
	};

	Addon.prototype = {
		namespace: 'session',
		hash : function(base) {
		    return crypto
				.createHmac('sha256', this.secret)
				.update(base)
				.digest('base64')
				.replace(/=*$/, '');
		 },
		generate : function(){
			var base = utils.uid(24);
			//req.sessionID = sessionID;
			this.sessionID = base + '.' + this.hash(base);
			console.log(base);
			//req.session = new Session(req);
			//req.session.cookie = new Cookie(cookie);
			this.ac.cookie.set(this.key, this.sessionID, {path: '/'});
		},
		sessionStore : function () {
			return store;
		},
		get: function(key) {
			if (key) {
				return session[key];
			}
			return session;
		},
		set: function(key, val, next, expires) {
			if (typeof(next) === 'string')
				console.log('yes its function!');
			var sessionV = this.ac.session.get();
			sessionV[key] = val;
			sessionV["cookie"] = {expires: null}
			store.set(this.sessionID, sessionV, function(err, result) {
				if (err)
					next(err, null);
				session[key] = val;
				next(null, val);
			});
		},
		register: function(ac, next) {
			console.log('will call generate');
			this.generate();
			console.log('done with generate');
			store.set(this.sessionID,{"name": "shaker qawasmi", cookie: {expires: null} }, function (done) {
				console.log('done creating the session');
			});
			store.get(this.sessionID, function(err, sess) {
				console.log(sess);
			});
			next(null, {"done": "success"});
		},
		twitter: function(ac, next) {
			self = this;
			console.log('out');
			_next = function() {
				console.log('after');
				console.log(self.get('foo'));
				next(null, {"done": "success"});
			}
			console.log(this.get('access_token'));
			this.set('foo', 'bar', _next);
			
		}
	};
	
	Y.mojito.addons.ac.session = Addon;
	
}, '0.0.1', {requires: ['mojito', 'mojito-cookie-addon']});