/*
 * tmamz database api plugin, will be used to for all comunication with the database API ~ Shaker 
 */
YUI.add('fbauth-addon', function(Y, NAME) {
	
	function Addon(command, adapter, ac) {
		this.ac = ac;
		this.appId = "";
	    this.appSecret = "";
	    this.cbUrl = "http://local.host:8666/fbauth/cb";
		this.loginUrl = "http://local.host:8666/fbauth/login";
		this.siteUrl = "http://local.host:8666/fbauth/done";
		this.fbscope = "email,user_interests,user_about_me,user_hometown,user_location,user_status,user_birthday";
		this.fbUrl = "http://www.facebook.com/dialog/oauth?client_id=" + this.appId + "&redirect_uri=" + encodeURIComponent(this.cbUrl) + "&scope=" + this.fbscope;
		this.access = 'https://graph.facebook.com/oauth/access_token?client_id=' + this.appId + "&redirect_uri=" + encodeURIComponent(this.cbUrl) + "&client_secret=" + this.appSecret + "&code=";
	};
	Addon.prototype = {
		namespace: 'fbauth',
		redirect: function(next) {
		    this.ac.http.redirect(this.fbUrl,'302');
			next();
		},
		getToken: function(code, next) {
			var config = {
		        	timeout: 5000,
		        	headers: {
		          		'Cache-Control': 'max-age=0'
					}
				}
			var _self = this;
			rest.GET(_self.access + code, {}, config, function (err, res) {
				if (err) 
					throw err;
				response = Y.QueryString.parse(res.getBody());
				_self.ac.session.set('access_token', response.access_token, function (err, result) {
					next(null, {"done":"success"});
				});
			});
		},
		callback: function(data, next) {
			//ok i got the data from facebook
			var code = this.ac.params.url('code');
			
			if(!code) {
				this.redirect();
			}
			_next = next;
			var _self = this;
			this.getToken(code, function(err, next) {
				//_next(null, {"done":"success"});
				_self.ac.http.redirect(_self.siteUrl,'302');
			});
		},
		getContent: function(next) {
			var token = this.ac.session.get('access_token');
			var user = this.ac.session.get('user');
			var _self = this;
			if (typeof(user) != 'undefined') {
				next(null, user);
			}
			else if (typeof(token) != 'undefined') {
				var url = 'https://graph.facebook.com/me?access_token=' + token;
				rest.GET(url, {}, config, function (err, res) {
					if (err) 
						throw err;
					var data = JSON.parse(res.getBody());
					var user = {
						email: data.email,
						name: data.name,
						first_name: data.first_name,
						id: data.id,
						username: data.username
					}
					_self.ac.session.set('user', user, function (err, result) {
						next(null, user);
					});
				});
			} else
				this.ac.http.redirect(this.loginUrl,'302');
		},
		test: function(next) {
			console.log(this.ac.session.get('access_token'));
			this.getContent(function(err, result) {
				next(null, result);
			});
		}
	};
	
	Y.mojito.addons.ac.fbauth = Addon;
	
}, '0.0.1', {requires: ['mojito', 'session-addon', 'mojito-rest-lib', 'querystring-parse-simple']});