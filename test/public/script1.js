(function (exports) {
  console.log('script 1: 09/20/2013 02:35 PM');
  console.log('location', exports.location.pathname);
  console.log('time', Date.now());
  window.onload = () => {
    const title = document.getElementById('title');
    title.innerHTML = "This page should re-fresh when changing any js files in test/public";

    const subtitle = document.getElementById('subtitle');
    subtitle.innerHTML = "It should also reload css when changing any css files in the same folder";
  };
})(window);
