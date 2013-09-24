// ==UserScript==
// @name            rfresh
// @namespace       http://gabesoft.com/
// @version         0.1
// @description     loads the rfresh client js
// @match           http://localhost:8002/index.html
// ==/UserScript==

(function (window) {
    var script = document.createElement('script')
      , head   = document.getElementsByTagName('head')[0];

    script.src = 'http://localhost:8003/rfresh-client.js';
    head.appendChild(script);
})(window);
