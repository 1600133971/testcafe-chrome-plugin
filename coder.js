var dt = new TestCafeRenderer(document);
window.onload = function onpageload() {
  var with_xy = false,
    download = window.location.search == "?download=true";
  if (window.location.search == "?xy=true") {
    with_xy = true;
  }
  chrome.runtime.sendMessage({
    action: "get_items"
  }, function (response) {
    dt.items = response.items;
    dt.render(with_xy,
      download ?
      function (content) {
        dt.download(false, content);
      } : false
    );
    if (!download) {
      document.getElementById("run-button").onclick = function () {
        dt.postToServer(document.getElementById("run-url").value);
      };
    }
  });
};
