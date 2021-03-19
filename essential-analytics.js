Bootstrapper.essentialAnalytics = Bootstrapper.essentialAnalytics || {};
Bootstrapper.essentialAnalytics.send = Bootstrapper.essentialAnalytics.send || function() {
	this._queue = this._queue || [];
	this._queue.push(arguments[0]);
};

var analytics = Bootstrapper.essentialAnalytics,
	_private = {};

// Set private variables and functions
_private.options = analytics.options || {};
_private.options.domain = '' || 't.nc0.co'; // set '' in App
_private.options.client = '' || Bootstrapper.ensightenOptions.client; // set '' in App

_private.utils = _private.utils || {};
_private.utils.getDomain = function() {
	return 'https://' + _private.options.domain + '/pc/' + _private.options.client + '/' + (_private.options.enableSST ? 'sst/' : '');
};
_private.utils.getQueryParam = function(key) {
	var params = window.location.search.replace(/^\?/, '').split('&');
	for (var i = 0; i < params.length; i++) {
		if (params[i].split('=')[0] === key) {
			return params[i].split('=')[1];
		}
	}
	return;
};
_private.utils.generateUUID = function() {
	var d = new Date().getTime(),
		a = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = (dt + Math.random()*16)%16 | 0;
			d = Math.floor(d/16);
			return (c=='x' ? r :(r&0x3|0x8)).toString(16);
		});
	return a;
};
_private.utils.addDefaultData = function() {
	var a = analytics;
	a._version = '0.1'; // version of the Analytics Light library
	if (!_private.options.disableBrowserTracking) {
		a._browserHeight = window.innerHeight ? window.innerHeight : document.documentElement ? document.documentElement.offsetHeight : '';
		a._browserLanguage = navigator.language;
		a._browserWidth = window.innerWidth ? window.innerWidth : document.documentElement ? document.documentElement.offsetWidth : '';
		a._documentEncoding = document.inputEncoding;
		if (Bootstrapper.deviceModel) { a._deviceModel = Bootstrapper.deviceModel; }
		a._javaEnabled = navigator.javaEnabled();
		a._pixelDepth = window.screen && window.screen.pixelDepth ? window.screen.pixelDepth : window.screen.colorDepth;
		a._screenSize = window.screen ? window.screen.width + 'x' + window.screen.height : '';
		a._userAgent = navigator.userAgent;
		a._viewport = (a._browserWidth && a._browserHeight) ? (a._browserWidth + 'x' + a._browserHeight) : '';
	}
	if (!_private.options.disablePageTracking) {
		a._pageTitle = document.title;
		a._pageURL = window.location.href;
		a._referringURL = document.referrer;
	}
	if (!_private.options.disableTimestampTracking) {
		a._timestamp = (+new Date());
		a._timezoneOffset = new Date().getTimezoneOffset();
	}
	if (_private.options.disableVisitorId) {
		// generate visitor ID for each call
		a._uuid = _private.utils.generateUUID();
	}
	if (!_private.options.disableCampaignTracking) {
		a.utm_medium = a.utm_medium || _private.utils.getQueryParam('utm_medium');
		a.utm_source = a.utm_source || _private.utils.getQueryParam('utm_source');
		a.utm_campaign = a.utm_campaign || _private.utils.getQueryParam('utm_campaign');
		a.utm_content = a.utm_content || _private.utils.getQueryParam('utm_content');
		a.utm_term = a.utm_term || _private.utils.getQueryParam('utm_term');

		if (window.location.search.indexOf('gclid=')) {
			a.utm_medium = a.utm_medium || 'paid_search';
			a.utm_source = a.utm_source || 'Google';
		}
		else if (document.referrer) {
			var referreringDomain = document.referrer.replace(/.*:\/\//, '').split('/')[0];
			if (/(baidu|bing|google|yahoo|yandex)/i.test(referreringDomain)) {
				a.utm_medium = a.utm_medium || 'organic';
				a.utm_source = a.utm_source || referreringDomain;
			}
			else if (!~referreringDomain.indexOf(window.location.host)) {
				a.utm_medium = a.utm_medium || 'referral';
				a.utm_source = a.utm_source || referreringDomain;
			}
		}
		else {
			a.utm_medium = 'direct';
		}
	}
	if (_private.options.enableSST && _private.options.enableSSTLogs) {
		a.sstTest = 'true';
	}
};
_private.utils.removeDefaultData = function() {
	var dataVariables = ['_browserHeight', '_browserLanguage', '_browserWidth', '_documentEncoding', '_deviceModel', '_javaEnabled', '_pixelDepth', '_screenSize', '_userAgent', '_viewport', '_pageTitle', '_pageURL', '_referringURL', '_timestamp', '_timezoneOffset', '_uuid', 'utm_medium', 'utm_source', 'utm_campaign', 'utm_content', 'utm_term', 'sstTest'];
	for (var i = 0; i < dataVariables.length; i++) {
		delete analytics[dataVariables[i]];
	}
};
_private.send = function(data) {
	data = data || {};
	_private.utils.removeDefaultData();
	_private.utils.addDefaultData();

	var queryParams = [],
		a = JSON.parse(JSON.stringify(analytics)); // create copy of analytics object

	a = Object.assign(a, data);
	for (var i in a) {
		if (a.hasOwnProperty(i)) {
			var currentData = a[i];
			currentData = typeof currentData === 'object' ? JSON.stringify(currentData) : currentData; // stringify arrays/objects
			queryParams.push(encodeURIComponent(i) + '=' + encodeURIComponent(currentData));
		}
	}
	new Image().src = _private.utils.getDomain() + '?' + queryParams.join('&');
};
_private.init = function() {
	_private.utils.addDefaultData();
	// initialise and send any requests that are queued
	if (analytics._queue) {
		var queuedRequests = JSON.parse(JSON.stringify(analytics._queue));
		delete analytics._queue;
		for (var i = 0; i < queuedRequests.length; i++) {
			_private.send(queuedRequests[i]);
		}
	}
};

// Set public variables and functions
analytics.clearVariables = function() {
	analytics.data = {};
};
analytics.setOption = function(key, value) {
	_private.options[key] = value;
};
analytics.send = function(data) {
	_private.send(data);
};

_private.init();