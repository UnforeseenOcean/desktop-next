window.__devtron = {require: undefined, process: undefined}

const log = require('electron-log');

console.log = log.info;
console.error = log.error;
console.trace = log.trace;

if (window && window.process && window.process.versions['electron']) {
        // is running inside electron not in web-browser
        //
        // http://electron.atom.io/docs/faq/#i-can-not-use-jqueryrequirejsmeteorangularjs-in-electron
        // move window.module, window.require inserted in DOM becuase of electron-node integration
        //
        window.nodeRequire = window.require;
        window.nodeExports = window.exports;
        window.nodeModule = window.module;

        delete window.require;
        delete window.exports;
        delete window.module;
}

const path = nodeRequire('path');
const remote = nodeRequire('electron').remote;

function EnforceJqueryCaching() {
	var localCache = {
	    /**
	     * timeout for cache in millis
	     * @type {number}
	     */
	    timeout: 30000,
	    /**
	     * @type {{_: number, data: {}}}
	     **/
	    data: {},
	    remove: function (url) {
	        delete localCache.data[url];
	    },
	    exist: function (url) {
	        return !!localCache.data[url] && ((new Date().getTime() - localCache.data[url]._) < localCache.timeout);
	    },
	    get: function (url) {
	        console.log('Getting in cache for url' + url);
	        return localCache.data[url].data;
	    },
	    set: function (url, cachedData, callback) {
	        localCache.remove(url);
	        localCache.data[url] = {
	            _: new Date().getTime(),
	            data: cachedData
	        };
	        if ($.isFunction(callback)) callback(cachedData);
	    }
	};

	$.ajaxPrefilter(function (options, originalOptions, jqXHR) {
	    if (options.cache) {
	        var complete = originalOptions.complete || $.noop,
	            url = originalOptions.url;
	        //remove jQuery cache as we have our own localCache
	        options.cache = false;
	        options.beforeSend = function () {
	            if (localCache.exist(url)) {
	                complete(localCache.get(url));
	                return false;
	            }
	            return true;
	        };
	        options.complete = function (data, textStatus) {
	            localCache.set(url, data, complete);
	        };
	    }
	});
}

window.onload = function() {
	console.log("Loaded page");

	console.log("jQurey Version: " + jQuery().jquery);

	EnforceJqueryCaching();
	jQuery(document).ready(function() {
		var win = remote.getCurrentWindow();

		win.on("resize", function() {
			var $max_li = $("a#window-max-btn").find("i");
			var win = remote.getCurrentWindow();
			if (!win.isMaximized()) {
			    $max_li.html("fullscreen");
			} else {
			    $max_li.html("fullscreen_exit");
			}
		})

		function onSystemLoading() {

			if(jQuery("a.login-link").length)
			    jQuery("a.login-link").trigger("click");
			else {
				jQuery("drawer-signout").on("click", (e) => {
					location.reload();
				});
			}

			$('head').append(`<link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/icon?family=Material+Icons">`);
			$('head').append(`<link rel="stylesheet" type="text/css" href="file:///${path.resolve(path.join(__dirname, 'style', 'style.css'))}">`);

			/*
			jQuery.ajax({
		        url: path.resolve(path.join(__dirname, 'style', 'style.css')),
		        success:function(data){
		            $("<style></style>").appendTo("head").html(data);
		        }
		    });
		    */

			if(jQuery("div.logo").length)
				jQuery("div.logo").remove();

			/* Nasty hack because the navbar doesn't always load first */
			let handleCreateNavMenu = setInterval(() => {
				if(jQuery("nav.global-nav").length){
					jQuery("nav.global-nav").append(CreateCloseMenu());
					clearInterval(handleCreateNavMenu);
				}
			}, 100);

		}

		function CreateCloseMenu() {
			let $ul = $("<ul></ul>");
			$ul.addClass("secondary-nav");
			$ul.addClass("window-buttons");
			$ul.css("left", "0");

			let $close_li = $("<li></li>");
			let $close_a = $("<a href='#' id='window-close-btn' class='masterTooltip' title='close'></a>");
			$close_a.html("<span class='value'><i class='material-icons'>close</i></span>");
			$close_a.click(function(e) {
				var win = remote.getCurrentWindow();
		        win.close();
			});
			$close_li.append($close_a);

			let $min_li = $("<li></li>");
			let $min_a = $("<a href='#' id='window-min-btn' class='masterTooltip' title='miniize'></a>");
			$min_a.html("<span class='value'><i class='material-icons'>remove</i></span>");
			$min_a.click(function(e) {
				var win = remote.getCurrentWindow();
		        win.minimize();
			});
			$min_li.append($min_a);

			let $max_li = $("<li></li>");
			let $max_a = $("<a href='#' id='window-max-btn' class='masterTooltip' title='maximize'></a>");
			$max_a.html("<span class='value'><i class='material-icons'>fullscreen</i></span>");
			$max_a.click(function(e) {
				var win = remote.getCurrentWindow();
			    if (!win.isMaximized()) {
			        win.maximize();
			        $(this).find("i").html("fullscreen_exit");
			    } else {
			        win.unmaximize();
			        $(this).find("i").html("fullscreen");
			    }
			});
			$max_li.append($max_a);

			$ul.append($close_li);
			$ul.append($min_li);
			$ul.append($max_li);

			return $ul;
		}

		onSystemLoading();
	});
}
