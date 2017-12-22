(function (exports) {
  const doc = exports.document;
  const loc = exports.location;
  const title = doc.title;
  const slice = Array.prototype.slice;
  const head = elsByTag('head')[0];
  const host = loc.host;
  const map = Array.prototype.map;
  const socket = initializeWebSocket();
  const tags = '{{type}}'.split(',');
  const cssRefresh = '{{cssRefresh}}' === 'true';
  const timeout = { load: parseInt('{{delay}}', 10), status: 3000 };
  const loading = {};

  function status (msg) {
    doc.title = msg;
    setTimeout(function () {
      doc.title = title;
    }, timeout.status);
  }

  function initializeWebSocket () {
    const el = elsByTag('script')
      .filter(function (el) {
        return el.src && el.src.match(/rfresh-client/);
      })[0];
    const url = parseUrl(el.src);
    return new WebSocket('ws://' + url.host);
  }

  function parseUrl (url) {
    const el = doc.createElement('a');
    el.href = url;
    return el;
  }

  function elsByTag (tag) {
    return slice.call(doc.getElementsByTagName(tag));
  }

  function createLinkEl (href, media) {
    const el = doc.createElement('link');
    el.setAttribute('rel', 'stylesheet');
    el.setAttribute('href', href);
    el.setAttribute('media', media)
    return el;
  }

  function pollUntilCssLoads(clone, cb) {
    const poll = function() {
      if (clone.sheet) {
        cb();
      } else {
        setTimeout(poll, 50);
      }
    };

    poll();
  }

  function waitUntilCssLoads(clone, cb) {
    clone.onload = function() {
      status('stylesheet reloaded ' + clone.href);
      cb();
    };
  }

  function reloadStylesheetEl(link, href, cb) {
    const clone = createLinkEl(href, link.media);
    const parent = link.parentNode;

    if (parent.lastChild === link) {
      parent.appendChild(clone);
    } else {
      parent.insertBefore(clone, link.nextSibling);
    }

    waitUntilCssLoads(clone, function() {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
        clone.onreadystatechange = null;
      }
      if (cb) {
        cb(clone);
      }
    });
  }

  function createLinkAndAddToHead(href, media) {
    const el = createLinkEl(href, media);
    head.appendChild(el);
    return el;
  }

  function getStylesheetEl (href) {
    const el = elsByTag('link')
      .filter(function (el) {
        return el.href.match(new RegExp(href));
      })[0];
    return el || createLinkAndAddToHead(href);
  }

  function getScripts () {
    var els = [];

    tags.forEach(function (tag) {
      els = els.concat(elsByTag(tag));
    });

    return els
      .map(function (el) {
        const path = el.href || el.src;

        return {
          href : path,
          url  : path.replace(loc.origin, ''),
          type : el.type,
          rel  : el.rel,
          tag  : el.tagName
        };
      })
      .filter(function (el) {
        var rfresh   = el.url.match(/rfresh-client/) && el.url.length > 0
          , empty    = el.url.length === 0
          , external = !{{allowExternal}} && el.url.match(/https?:/);
        return !rfresh && !external && !empty && (el.tag !== 'LINK' || el.rel == 'stylesheet');
      });
  }

  function queueReloadStylesheet(data) {
    const poll = function() {
      if (loading[data.href]) {
        setTimeout(poll, 100);
      } else {
        reloadStylesheet(data);
      }
    };

    poll();
  }

  function reloadStylesheet (data) {
    if (loading[data.href]) {
      queueReloadStylesheet(data);
      return;
    }

    loading[data.href] = true;
    const el = getStylesheetEl(data.href);
    const now = 'rfresh_reload=' + Date.now();
    const sep = data.href.indexOf('?') === -1 ? '?' : '&';
    const cacheBust = sep + now;

    reloadStylesheetEl(el, data.href + cacheBust, function() {
      loading[data.href] = false;
    });
  }

  function reloadPage () {
    const bypassCache = false;
    loc.reload(bypassCache);
  }

  function ready (cb) {
    const delay = 1000;

    let itemCount = 0;

    function runWhenLoaded () {
      var count = getScripts().length;
      if (count > itemCount) {
        itemCount = count;
        setTimeout(runWhenLoaded, delay);
      } else {
        cb();
      }
    }

    if (timeout.load && !isNaN(timeout.load) && timeout.load > 0) {
      setTimeout(runWhenLoaded, timeout.load);
    } else if (doc.readyState === 'complete') {
      cb();
    } else {
      window.addEventListener('load', cb, false);
    }
  }

  socket.onopen = function (e) {
    ready(function () {
      const scripts = getScripts();
      const data = JSON.stringify(scripts);
      socket.send(data);
    });
  };

  socket.onmessage = function (e) {
    const data = JSON.parse(e.data);

    if (data.tag === 'LINK' && !cssRefresh) {
      reloadStylesheet(data);
    } else {
      reloadPage();
    }
  };
})(window);
