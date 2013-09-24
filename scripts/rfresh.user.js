// ==UserScript==
// @name            rfresh
// @namespace       rfresh
// @description     loads the rfresh client js
// @include         http://localhost/index.html
// ==UserScript==

(function (window) {
    var script = document.createElement('script')
      , head   = document.getElementsByTagName('head')[0];

    script.src = 'http://localhost:8003/rfresh-client.js';
    head.appendChild(script);
})(window);
