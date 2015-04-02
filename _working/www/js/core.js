/*
 * core.js v1.0.0
 */

var strings = {
	loginFail : "Login details do not exist. /sadface"
};

var meta = {
	keys : {
		google : {
			//ios : "AIzaSyCNLRT_u09YBOx-SL76CAZny2Z3xtOQn64",
			ios : "AIzaSyAYfY4a-BeFVOLsgW2EudijdAV9GCmAXx4",
			web : "AIzaSyAYfY4a-BeFVOLsgW2EudijdAV9GCmAXx4",
			android : "AIzaSyAYfY4a-BeFVOLsgW2EudijdAV9GCmAXx4",
			current : ""
		}
	},
	locations : [],
	oldLocations : [
		{
			a : "324 St. Johns Avenue",
			lon : -97.1316184,
			lat : 49.9212885
		},
		{
			a : "549 Castle Avenue",
			lon : -97.0967149,
			lat : 49.9066913
		},
		{
			a : "1234 Corydon Avenue",
			lon : -97.1731519,
			lat : 49.8640781
		},
		{
			a : "Apt 30, 555 St. Mary Avenue",
			lon : -97.1518443,
			lat : 49.8890405
		},
		{
			a : "10 Marble Avenue",
			lon : -97.2116321,
			lat : 49.9362962
		}
	],
	lastLocationSearch : {},
	lastKeypressAt : new Date(),
	deviceReady : false,
	deviceOnline : false
};

var touch = {
	addE: function(){
		return $.Deferred(function(f){
			$('.touchable').on('mousedown touchstart',function(){
				$('.touched').removeClass('touched');
				$(this).addClass('touched');
			});
			$('.touchable').on('mouseup touchend touchcancel',function(){
				$('.touched').removeClass('touched');
			});
			f.resolve();
		});
	},
	remE: function(){
		return $.Deferred(function(f){
			$('.touchable').off('mousedown touchstart');
			$('.touchable').off('mouseup touchend touchcancel');
			f.resolve();
		});
	},
	initialize: function(){
		touch.remE().done( touch.addE );
	},
	reset: function(){
		touch.remE().done( touch.addE );
	}
};

var app = {
	initialize: function() {
		console.log('App init');
		//Parse INIT
		Parse.initialize("OfIvWaRe1ZvcA0x5BTK1hwPq9hEOB9Ksfi64kysX", "NWMRCKtj5OFisw0X3GJk3zZFT6k2CRkMtMkh3uZD");
		
		//set Google API Key
		meta.keys.google.current = meta.keys.google.web;

		//bind events necessary on mobile
		app.bindEvents();
		views.initialize();
		touch.initialize();
	},
	bindEvents: function() {
		//bind device events
		document.addEventListener('deviceready', this.onDeviceReady, false);
		document.addEventListener('online', function(){
			meta.deviceOnline = true;
		}, false);
		document.addEventListener('offline', function(){
			meta.deviceOnline = false;
		}, false);
	},
	onDeviceReady: function() {
		console.log('Device is ready');
		meta.deviceReady = true;
		if (device.platform.toLowerCase() == "ios"){
			meta.keys.google.current = meta.keys.google.ios;
		}
	},
	getLocation: function(useHTML5geoBoolean){
		if (useHTML5geoBoolean) {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function(position){
					meta.geo.longitude = position.coords.longitude;
					meta.geo.latitude = position.coords.latitude;
					var point = new Parse.GeoPoint({
						'latitude' : meta.geo.latitude,
						'longitude' : meta.geo.longitude
					});
					Parse.User.current().set('Geo',point);
					Parse.User.current().save(null,{
						success : function(user){
							console.log("Updated User's Geolocation");
						},
						error : function(user, error){
							console.error("Failed to update User's Geolocation");
							console.error(error);
						}
					});
				});
			} else {
				console.log('Location not found.');
			}
		} else {
			//use alternative (Phonegap) geo-locator
		}
	}
};

var views = {
	initialize: function(screen) {
		console.log('View inits');
		menu.initialize();
		// check if there is an active session
		if ( Parse.User.current() ) {
			// init all the in-app views
			//views.modals.addLocation.initialize();
			// show the default view
			views.screens.list.initialize();
		} else {
			// show the signup or login page
			views.screens.login.initialize();
		}
	},
	screens : {
		login : {
			initialize : function(){
				console.log('Loading login screen...');
				$.when( views.screens.login.getData() ).done( views.screens.login.render() );
			},
			getData : function(){
				console.log('Loading login screen data...done.');
			},
			render : function(){
				console.log('Rendering login screen...');
				$.when( views.screens.login.remE() ).done( function(){
					$('app screen').addClass('hidden');
					views.screens.login.addE();
					$('screen#login').removeClass('hidden');
				});
			},
			addE : function(){
				$('screen#login #btn_goToSignup').hammer().on('tap',function(e){
					e.preventDefault();
					$('app screen').addClass('hidden');
					views.screens.signup.initialize();
				});
				$('screen#login #frm_login').on('submit', function(e){
					$('screen#login #btn_login').prop('disabled',true);
					//Parse Login code
					Parse.User.logIn($('screen#login #frm_login #txt_user').val(),$('screen#login #frm_login #txt_pass').val(), {
						success : function(user){
							//YAY, now do stuff
							console.log('Parse.User.logIn Success');
							console.log(user);
							views.screens.list.initialize();
							setTimeout(function(){
								$('screen#login #btn_login').prop('disabled',false);
								$('screen#login #frm_login')[0].reset();
							},500);
						},
						error : function(user, error){
							//BOO, fail it
							console.error('Parse.User.logIn Error');
							switch(error.code){
								case 101:
									$('screen#login #feedback_login').html(strings.loginFail);
								default:
									console.error(user);
									console.error(error);
							}
							setTimeout(function(){
								$('screen#login #feedback_login').html(' ');
								$('screen#login #btn_login').prop('disabled',false);
							},3000);
						}
					});
					$('input, select, textarea, button').blur();
					e.preventDefault();
				});
			},
			remE : function(){
				$('screen#login #btn_goToSignup').hammer().off('tap');
				$('screen#login #frm_login').off('submit');
			}
		},
		signup : {
			initialize : function(){
				console.log('Loading signup screen...');
				$.when( views.screens.signup.getData() ).done( views.screens.signup.render() );
			},
			getData : function(){
				console.log('Loading signup screen data...done.');
			},
			render : function(){
				console.log('Rendering signup screen...');
				$.when( views.screens.signup.remE() ).done( function(){
					$('app screen').addClass('hidden');
					views.screens.signup.addE();
					$('screen#signup').removeClass('hidden');
				});
			},
			addE : function(){
				$('screen#signup #btn_cancel').hammer().on('tap',function(e){
					$('app screen').addClass('hidden');
					views.screens.login.initialize();
					e.preventDefault();
				});
				$('screen#signup #frm_signup #txt_pass2').on('keyup', function() {
					if ($(this).val() == $('screen#signup #frm_signup #txt_pass1').val()) {
						$(this).removeClass('bad');
						$(this).addClass('good');
					} else {
						$(this).removeClass('good');
						$(this).addClass('bad');
					}
					//if there are no "bad" fields, enable the submit
					if ($('screen#signup #frm_signup .bad').length == 0) {
						$('screen#signup #btn_submit').prop('disabled', false);
					} else {
						$('screen#signup #btn_submit').prop('disabled', true);
					}
				});
				$('screen#signup #frm_signup').on('submit', function(e){
					$('screen#signup #btn_signup').prop('disabled',true);
					var u = new Parse.User();
					u.set('firstname', $('screen#signup #frm_signup #txt_fName').val() );
					u.set('username', $('screen#signup #frm_signup #txt_uName').val() );
					u.set('email', $('screen#signup #frm_signup #txt_email').val() );
					u.set('password', $('screen#signup #frm_signup #txt_pass1').val() );
					u.signUp(null, {
						success : function(user){
							//YAY, now do stuff
							console.log('Parse.User.signUp Success');
							//console.log(user);
							views.screens.list.initialize();
						},
						error : function(user, error){
							//Boo, shit failed
							console.log('Parse.User.signUp Error');
							console.error(error);
							setTimeout(function(){
								$('screen#signup #btn_signup').prop('disabled',false);
							},3000);
						}
					});
					$('input, select, textarea, button').blur();
					e.preventDefault();
				});
			},
			remE : function(){
				$('screen#signup #btn_cancel').hammer().off('tap');
				$('screen#signup #frm_signup #txt_pass2').off('keyup');
				$('screen#signup #frm_signup').off('submit');
			}
		},
		list : {
			initialize : function(){
				views.screens.list.render();
				views.screens.list.getData();
			},
			getData : function(forceDataUpdate){
				$('screen#list #btn_refreshDistance').addClass('disabled');
				$('screen#list #btn_refreshDistance').addClass('infiniteSpin');
				if (forceDataUpdate) { $('screen#list content').html( 'Loading...' ); }
				var useHTMLgeo = true;
				if ( meta.deviceReady ) {
					useHTMLgeo = false;
				}
				utility.deferredGetLocation(useHTMLgeo,forceDataUpdate).done(function(gp){
					var geoQ = new Parse.Query(Parse.Object.extend('Locations'));
					geoQ.near('Geo', gp);
					geoQ.find({
						success : function(data){
							//DEBUG
							//console.log(data);
							meta.locations = Parse.Collection.extend({
								model: Parse.Object.extend('Locations')
							});
							var nearbyLocations = new meta.locations();
							nearbyLocations.fetch({
								success : function(data){
									//reset the list content
									$('screen#list content').html( '' );
									var t = _.template( $('#tpl_card').html() );
									var a = [];
									_.each(data.models, function(e,i,l){
										// e = individual object
										// i = array index ##
										// l = passed array
										var o = {};
										o.geo = e.get('Geo');
										o.name = e.get('Name');
										o.address = e.get('Address1');
										o.d = utility.getDist(o.geo.longitude, o.geo.latitude);
										o.t = utility.getTimeToDist(o.d);
										a.push(o);
										//populate the list
										//$('screen#list content').append( t(o) );
									});
									a = _.sortBy(a, function(e){ return e.d });
									_.each(a, function(e,i,l){
										//populate the list
										$('screen#list content').append( t(e) );
										setTimeout(function(){
											$('screen#list content card').addClass('visible');
										},1750);
									});
									touch.reset();
									views.screens.list.remE().done(views.screens.list.addE);
								},
								error : function(data, error){
									//reset the list content
									$('screen#list content').html( 'Could not load your Locations' );
									console.log('Failed creating nearby collection');
									console.log(error);
								}
							});
						},
						error : function(data,error){
							$('screen#list content').html( 'Could not load your Locations' );
							console.log('Error querying Locations')
							console.log(error)
						}
					});
				}).fail(function(error){
					$('screen#list content').html( 'Could not load your current location.' );
					console.error(error);
				}).always(function(){
					$('screen#list #btn_refreshDistance').removeClass('disabled');
					$('screen#list #btn_refreshDistance').removeClass('infiniteSpin');
				});
			},
			render : function(){
				$('app screen').addClass('hidden');
				views.screens.list.remE().done( function(){
					views.screens.list.addE();
					$('screen#list').removeClass('hidden');
				});
			},
			remE : function(){
				return $.Deferred(function(f){
					$('screen#list #btn_toggleMenu').hammer().off('tap');
					$('screen#list #btn_refreshDistance').hammer().off('tap');
					$('screen#list #btn_addLocation').hammer().off('tap');
					$('screen#list content card').hammer().off('tap');
					f.resolve();
				});
			},
			addE : function(){
				return $.Deferred(function(f){
					$('screen#list #btn_toggleMenu').hammer().on('tap',function(){
						$(this).addClass('spinFaceLeft');
						setTimeout(menu.show,300);
					});
					$('screen#list #btn_refreshDistance').hammer().on('tap',function(){
						views.screens.list.getData(true);
					});
					$('screen#list #btn_addLocation').hammer().on('tap',function(){
						$.when( views.modals.addLocation.initialize() ).done( views.modals.addLocation.show() );
					});
					$('screen#list content card').hammer().on('tap',function(){
						// do something to show the item's details
						
					});
					f.resolve();
				});
			}
		},
		detail : {
			initialize : function(){},
			getData : function(){},
			render : function(){}
		}
	},
	modals : {
		addLocation : {
			initialize : function(){
				$.when( views.modals.addLocation.remE() ).done( views.modals.addLocation.addE() );
			},
			show : function(){
				var Location = Parse.Object.extend("Locations");
				meta.tempLocation = new Location();
				views.modals.addLocation.getNearbyLocations();
				$('screen').not('.hidden').addClass('fadeAway');
				//$('modal#addLocation top #btn_save').addClass('disabled');
				$('modal#addLocation').removeClass('viewportBottom');
				$('modal#addLocation tabgroup#'+$('modal#addLocation tab.active').attr('for') ).removeClass('hidden');
			},
			hide : function(){
				$('modal#addLocation').addClass('viewportBottom');
				$('screen').not('.hidden').removeClass('fadeAway');
				setTimeout(function(){
					$('modal#addLocation content tabgroup').addClass('hidden');
				},1000);
			},
			getNearbyLocations : function(){
				console.log('getNearbyLocations');
				utility.deferredGetLocation(true).done(function(geoPoint){
					utility.deferredGetAddress(geoPoint).done(function(r){
						//DEBUG
						//console.log('Addresses...');
						//console.log(r);
						// add results to the UI
						_.each(r.results, function(e,i,l){
							// e = individual object
							// i = array index ##
							// l = passed array
							e.sequence = i;
							var t = _.template( $('#tpl_modal-addLocation_data-item').html() );
							$('modal#addLocation results').append( t(e) );
							views.modals.addLocation.remListE().done(views.modals.addLocation.addListE);
						});
					});
				});
			},
			loadDataIntoForm : function(dO){
				//DEBUG
				//console.log(dataObject);
				var address = "";
				var name = $('modal#addLocation #txt_name').val();
				// clear the form
				$('modal#addLocation #frm_details')[0].reset();
				$('modal#addLocation #txt_name').val(name);
				$('modal#addLocation #txt_lat').val(dO.geometry.location.lat);
				$('modal#addLocation #txt_lng').val(dO.geometry.location.lng);
				$.each(dO.address_components, function(i,v){
					$.each(v.types,function(j,w){
						if(w == "locality"){
							$('modal#addLocation #txt_city').val(dO.address_components[i].long_name);
						}
						if( w == "street_number"){
							address = dO.address_components[i].long_name;
						}
						if( w == "route"){
							address += " " + dO.address_components[i].long_name;
							$('modal#addLocation #txt_address1').val(address);
						}
						if( w == "administrative_area_level_1"){
							$('modal#addLocation #txt_region').val(dO.address_components[i].long_name);
						}
						if( w == "country"){
							$('modal#addLocation #txt_country').val(dO.address_components[i].short_name);
						}
						if( w == "postal_code" || w == "zip_code" ){
							$('modal#addLocation #txt_code').val(dO.address_components[i].short_name);
						}
					});
				});
			},
			setData : function(){
				meta.tempLocation.set('createdBy', Parse.User.current() );
				meta.tempLocation.set('Name', name);
				var geo = new Parse.GeoPoint({
					latitude: parseFloat($('modal#addLocation #txt_lat').val()),
					longitude: parseFloat($('modal#addLocation #txt_lng').val())
				});
				meta.tempLocation.set('Geo', geo);
				meta.tempLocation.set('City', $('modal#addLocation #txt_city').val() );
				meta.tempLocation.set('Address1', $('modal#addLocation #txt_address1').val() );
				meta.tempLocation.set('Region', $('modal#addLocation #txt_region').val() );
				meta.tempLocation.set('Country', $('modal#addLocation #txt_country').val() );
				meta.tempLocation.set('Code', $('modal#addLocation #txt_code').val() );
				meta.tempLocation.save({
					success: function(d){
						console.log(d);
					},
					error: function(d,e){
						console.error(e);
						alert(e.message);
					}
				});
				meta.tempLocation = null;
				$('modal#addLocation #frm_details')[0].reset();
				$('input, select, textarea, button').blur();
				$('modal#addLocation results').html('');
				views.modals.addLocation.hide();
			},
			remE : function(){
				$('modal#addLocation #btn_cancel').hammer().off('tap');
				$('modal#addLocation #btn_save').hammer().off('tap');
				$('modal#addLocation tabs tab').hammer().off('tap');
				$('modal#addLocation form#frm_details #txt_address1, modal#addLocation form#frm_details #txt_city').off('keyup');
				$('modal#addLocation form#frm_details').off('submit');
			},
			addE : function(){
				$('modal#addLocation #btn_cancel').hammer().on('tap', function(){
					views.modals.addLocation.hide();
				});
				$('modal#addLocation #btn_save').hammer().on('tap', function(){
					$.when( views.modals.addLocation.setData() ).done( function(){
						views.screens.list.getData(true);
						views.modals.addLocation.hide();
					} );
				});
				$('modal#addLocation tabs tab').hammer().on('tap', function(){
					$('modal#addLocation tabs tab').removeClass('active');
					$(this).addClass('active');
					$('modal#addLocation tabgroup').addClass('hidden');
					$('modal#addLocation tabgroup#'+$('modal#addLocation tab.active').attr('for') ).removeClass('hidden');
				});
				$('modal#addLocation form#frm_details #txt_address1, modal#addLocation form#frm_details #txt_city').on('keyup', function(e){
					
					meta.lastKeypressAt = new Date();
					var string = $('modal#addLocation #txt_address1').val() + ',' + $('modal#addLocation #txt_city').val();
					
					// immediately invoke the timer to run after 2 sec
					setTimeout(function(){
						if ( (meta.lastKeypressAt - new Date()) >= 2000 ) {
							//DEBUG
							console.log('Normally, I\'d be doing something here');
							/*utility.delayGeolocate(string).done(function(r){
								//DEBUG
								console.log(string);
								console.log(r);
							}).fail(function(e){
								//DEBUG
								console.error(e);
							});*/
						}
					},2000);
					
					//$('input, select, textarea, button').blur();
				});
				$('modal#addLocation form#frm_details').on('submit', function(e){
					var string = $('modal#addLocation #txt_address1').val() + ',' + $('modal#addLocation #txt_city').val();
					var loc = utility.geolocate(string);
					//DEBUG
					console.log(string);
					console.log(loc);
					$('input, select, textarea, button').blur();
					e.preventDefault();
				});
			},
			remListE : function(){
				return $.Deferred(function(f){
					$('modal#addLocation form results item').hammer().off('tap');
					f.resolve();
				});
			},
			addListE : function(){
				return $.Deferred(function(f){
					$('modal#addLocation form results item').hammer().on('tap',function(){
						$('modal#addLocation form results item').removeClass('selected');
						$(this).addClass('selected');
						var i = parseInt($(this).data('id'));
						console.log(i);
						views.modals.addLocation.loadDataIntoForm( meta.lastLocationSearch.results[i] );
					});
					f.resolve();
				});
			}
		}
	}
};

var menu = {
	initialize : function(){
		$('menu').addClass('menu-left');
		$('app').removeClass('tiltBack');
		$.when( menu.remE() ).done( menu.addE() );
	},
	show : function(){
		console.log('Showing Menu');
		$('app').addClass('tiltBack');
		$('menu').removeClass('menu-left');
		$('app screen').not('.hidden').each(function(i,v){
			window['views']['screens'][$(v).attr('id')]['remE']();
		});
		setTimeout(function(){
			$('app').hammer().one('tap hold', function(){
				menu.hide();
			});
		},500);
	},
	hide : function(){
		console.log('Hiding Menu');
		$('menu').addClass('menu-left');
		$('app').removeClass('tiltBack');
		$('app screen').not('.hidden').each(function(i,v){
			window['views']['screens'][$(v).attr('id')]['addE']();
		});
		setTimeout(function(){
			$('.spinFaceLeft').removeClass('spinFaceLeft');
		},300);
	},
	remE : function(){
		$('menu #btn_menu_locations').hammer().off('tap');
		$('menu #btn_menu_favs').hammer().off('tap');
		$('menu #btn_menu_settings').hammer().off('tap');
		$('menu #btn_menu_logout').hammer().off('tap');
	},
	addE : function(){
		$('menu #btn_menu_locations').hammer().on('tap',function(){});
		$('menu #btn_menu_favs').hammer().on('tap',function(){});
		$('menu #btn_menu_settings').hammer().on('tap',function(){});
		$('menu #btn_menu_logout').hammer().on('tap',function(){
			Parse.User.logOut();
			views.initialize();
		});
	}
};

var utility = {
	dateDiff : function(date1, date2){
		if (!date2) {
			// if no date2, assume to check difference to now
			date2 = new Date();
		}
		return (date1 - date2)
	},
	deg2rad : function(deg){
		return deg * (Math.PI/180)
	},
	getDist : function(longitude, latitude){
		
		var target = {
			lon : longitude,
			lat : latitude
		};

		var R = 6371; // Radius of the earth in km
		var dLat = utility.deg2rad( parseFloat(Parse.User.current().get('Geo').latitude) - parseFloat(target.lat) );
		var dLon = utility.deg2rad( parseFloat(Parse.User.current().get('Geo').longitude) - parseFloat(target.lon) ); 
		var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(utility.deg2rad( parseFloat(target.lat) )) * Math.cos(utility.deg2rad( parseFloat(Parse.User.current().get('Geo').latitude) )) * Math.sin(dLon/2) * Math.sin(dLon/2); 
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		var d = R * c; // Distance in km
		var dRounded2 = +d.toFixed(2); // Round to 2 decimal

		return dRounded2	
	},
	getTimeToDist : function(distInKm,speedInKmH){
		if(!speedInKmH){
			speedInKmH = 35;
		}
		var d = ( (distInKm/speedInKmH) * 60);
		var dRounded = +d.toFixed(0);
		return dRounded
	},
	openAppleMaps : function(longitude, latitude){
		window.location.href = "maps://maps.apple.com/?q="+latitude+","+longitude;
	},
	geolocate : function(addressString){
		var loc = {};
		$.getJSON('https://maps.googleapis.com/maps/api/geocode/json?address='+encodeURI(addressString)+'&key='+meta.keys.google.current)
		.done(function(data){
			meta.tempGeolocate = data;
			loc = data.results[0].geometry.location;
			meta.locations = data.results;
			return loc;
		})
		.fail(function(jqXHR,textStatus,error){
			console.error(error);
		});
	},
	reverseGeoCode : function(lat, lng, callback){
		var uri = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lng+'&key='+meta.keys.google.current;
		
		$.getJSON(uri)
		.done(function(data){
			console.log('Got address(es)');
			meta.lastLocationSearch = data;
			//console.log(data);
		})
		.fail(function(jqXHR,textStatus,error){
			console.error(error);
		})
		.always(callback);
	},
	delayGeolocate : function(stringtoLocate){
		return $.Deferred(function(data){
			if (stringtoLocate) {
				// do the lookup
				$.getJSON('https://maps.googleapis.com/maps/api/geocode/json?address='+encodeURI(stringtoLocate)+'&key='+meta.keys.google.current)
				.done(function(d){
					data.resolve(d);
				})
				.fail(function(jqXHR,textStatus,error){
					data.reject(error);
				});
			} else {
				data.reject('No address specified.');
			}
		}).promise();
	},
	deferredGetLocation : function(useHTML5geoBoolean, forceDataUpdate){
		return $.Deferred(function(data){
			// 300000ms = 5min
			if ( utility.dateDiff(Parse.User.current().get('GeoAt')) <= 300000 || forceDataUpdate == true ) {
				// get a fresh location
				if (useHTML5geoBoolean == true) {
					if (navigator.geolocation) {
						navigator.geolocation.getCurrentPosition(function(position){
							if (typeof position != "undefined") {
								var point = new Parse.GeoPoint({
									'latitude' : position.coords.latitude,
									'longitude' : position.coords.longitude
								});
								Parse.User.current().set('Geo',point);
								Parse.User.current().set('GeoAt',new Date);
								Parse.User.current().save(null,{
									success : function(user){
										console.log("Parse: Updated User's Geolocation");
									},
									error : function(user, error){
										console.error("Parse: Failed to update User's Geolocation");
										console.error(error);
									}
								});
								data.resolve(point);
							} else {
								data.reject('Unable to retrieve position from webview.');
							}
						});
					} else {
						data.reject({
							error : 'Browser doesn\'t support HTML5 Geolocation.'
						});
						console.error('Browser doesn\'t support HTML5 Geolocation.');
					}
				} else {
					data.reject({
						error : "Must use useHTML5geoBoolean"
					});
				}
			} else {
				// get the cached data
				data.resolve( Parse.User.current().get('Geo') );
			}
		}).promise();
	},
	deferredGetAddress : function(geoPoint){
		var uri;
		if (!geoPoint) {
			uri = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+Parse.User.current().get('Geo').latitude+','+Parse.User.current().get('Geo').longitude+'&key='+meta.keys.google.current;
		} else {
			uri = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+geoPoint.latitude+','+geoPoint.longitude+'&key='+meta.keys.google.current;
		}
		return $.getJSON(uri)
			.done(function(data){
				console.log('Got address(es)');
				meta.lastLocationSearch = data;
				//console.log(data);
			})
			.fail(function(jqXHR,textStatus,error){
				console.error(error);
			});
	},
};

$(function(){
	app.initialize();
});
