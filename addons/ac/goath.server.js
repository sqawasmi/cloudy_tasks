/*
 * tmamz database api plugin, will be used to for all comunication with the database API ~ Shaker 
 */
YUI.add('goauth-addon', function(Y, NAME) {
	
	function Addon(command, adapter, ac) {
		this.ac = ac;
		this.appId = "";
	    this.appSecret = "";
	    this.cbUrl = "http://example.com:8666/goatuh/cb";
		this.loginUrl = "http://example.com:8666/goauth/login";
		this.siteUrl = "http://example.com:8666/goauth/done";
		this.fbscope = "email,user_interests,user_about_me,user_hometown,user_location,user_status,user_birthday";
		this.gUrl = "https://accounts.google.com/o/oauth2/auth?scope=https://www.googleapis.com/auth/tasks" + "&redirect_uri=" + encodeURIComponent(this.cbUrl)+"&response_type=code"+"&client_id="+this.appId;
		this.access = 'https://accounts.google.com/o/oauth2/token';
	};
	Addon.prototype = {
		namespace: 'goauth',
		redirect: function(next) {
		    this.ac.http.redirect(this.fbUrl,'302');
			next();
		},
		getToken: function(code, next) {
			var config = {
		        	headers: {
		          		"Content-type": "application/x-www-form-urlencoded"
					}
				},
				params = {
					"code": code,
					"client_id": this.appId,
					"client_secret": this.appSecret,
					"redirect_uri": this.cbUrl,
					"grant_type": "authorization_code"
				}
			//?client_id=' + this.appId + "&redirect_uri=" + encodeURIComponent(this.cbUrl) + "&client_secret=" + this.appSecret + "&code=";
			var _self = this;
			Y.mojito.lib.REST.POST(_self.access, params, config, function (err, res) {
				console.log('starting the error!');
				console.log(res);
				if (err) {
					console.log(err.getAllResponseHeaders());
					console.log(err);
					throw err;
				}
				response = Y.QueryString.parse(res.getBody());
				console.log(response);
				_self.ac.session.set('access_token', response.access_token, function (err, result) {
					next(null, {"done":"success"});
				});
			});
		},
		callback: function(data, next) {
			//ok i got the code from google
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
				Y.mojito.lib.REST.GET(url, {}, config, function (err, res) {
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
	
	Y.mojito.addons.ac.goauth = Addon;
	
}, '0.0.1', {requires: ['mojito', 'session-addon', 'mojito-rest-lib', 'querystring-parse-simple']});