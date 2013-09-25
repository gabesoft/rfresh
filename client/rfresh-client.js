(function (exports) {
    var doc     = exports.document
      , loc     = exports.location
      , title   = doc.title
      , slice   = Array.prototype.slice
      , head    = elsByTag('head')[0]
      , host    = loc.host
      , map     = Array.prototype.map
      , socket  = initializeWebSocket()
      , tags    = '{{type}}'.split(',')
      , timeout = { load: '{{delay}}' * 1, status: 3000 };

    function status (msg) {
        doc.title = msg;
        setTimeout(function () {
            doc.title = title;
        }, timeout.status);
    }

    function initializeWebSocket () {
        var el = elsByTag('script')
               .filter(function (el) {
                    return el.src && el.src.match(/rfresh-client/);
                })[0]
          , url = parseUrl(el.src);
        return new WebSocket('ws://' + url.host);
    }

    function parseUrl (url) {
        var el = doc.createElement('a');
        el.href = url;
        return el;
    }

    function elsByTag (tag) {
        return slice.call(doc.getElementsByTagName(tag));
    }

    function createStylesheetEl (href) {
        var el = doc.createElement('link');
        el.setAttribute('rel', 'stylesheet');
        el.setAttribute('href', href);
        head.appendChild(el);
        return el;
    }

    function getStylesheetEl (href) {
        return elsByTag('link').filter(function (el) {
            return el.href.match(new RegExp(href));
        })[0] || createStylesheetEl(href);
    }

    function getScripts () {
        var els = [];

        tags.forEach(function (tag) {
            els = els.concat(elsByTag(tag));
        });

        return els
           .map(function (el) {
                var path = el.href || el.src;

                return {
                    href : path
                  , url  : path.replace(loc.origin, '')
                  , type : el.type
                  , tag  : el.tagName
                }
            })
           .filter(function (el) {
                return !el.url.match(/rfresh-client/) && el.url.length > 0;
            })
    }

    function reloadStylesheet (data) {
        var el = getStylesheetEl(data.href)
          , now = 'rfresh_reload=' + Date.now()
          , sep = data.href.indexOf('?') === -1 ? '?' : '&'
          , cacheBust = sep + now;

        status('reloaded ' + data.href);
        el.href = data.href + cacheBust;
    }

    function reloadPage (data) {
        var bypassCache = false;
        loc.reload(bypassCache);
    }

    function ready (cb) {
        if (timeout.load && timeout.load > 0) {
            setTimeout(cb, timeout.load);
        } else if (doc.readyState === 'complete') {
            cb();
        } else {
            window.addEventListener('load', cb, false);
        }
    }

    socket.onopen = function (e) {
        ready(function () {
            var scripts = getScripts()
              , data    = JSON.stringify(scripts);
            socket.send(data);
        });
    };

    socket.onmessage = function (e) {
        var data = JSON.parse(e.data);

        if (data.tag === 'LINK') {
            reloadStylesheet(data);
        } else {
            reloadPage(data);
        }
    };
})(window);