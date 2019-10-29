var dt = new TestCafeRenderer(document);
window.onload = function onpageload() {
  var download = window.location.search == "?download=true";
  chrome.runtime.sendMessage({
    action: "get_items"
  }, function (response) {
    dt.items = response.items;
    dt.render(
      download ?
      function (content) {
        dt.download(false, content);
      } : false
    );
  });
};
