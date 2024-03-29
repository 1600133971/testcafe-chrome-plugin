﻿//-----------------------------------------------
// Proxy to access current tab recorder instance
// ----------------------------------------------
function RecorderProxy() {
  this.active = null;
}

RecorderProxy.prototype.start = function(url) {
  chrome.tabs.getSelected(null, function(tab) {
    chrome.runtime.sendMessage({action: "start", recorded_tab: tab.id, start_url: url});
  });
}

RecorderProxy.prototype.stop = function() {
  chrome.runtime.sendMessage({action: "stop"});
}

RecorderProxy.prototype.open = function(url, callback) {
  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.sendMessage(tab.id, {action: "open", 'url': url}, callback);
  });
}

RecorderProxy.prototype.addComment = function(text, callback) {
  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.sendMessage(tab.id, {action: "addComment", 'text': text}, callback);
  });
}

//-----------------------------------------------
// UI
//----------------------------------------------
function RecorderUI() {
  this.recorder = new RecorderProxy();
  chrome.runtime.sendMessage({action: "get_status"}, function(response) {
    if (response.active) {
      ui.set_started();
    } else {
      if (!response.empty) {
        ui.set_stopped();
      }
      chrome.tabs.getSelected(null, function(tab) {
        document.forms[0].elements["url"].value = tab.url;
      });
    }
  });
}

RecorderUI.prototype.start = function() {
  var url = document.forms[0].elements["url"].value;
  if (url == "") {
    return false;
  }
  if ((url.indexOf("http://") == -1) && (url.indexOf("https://")) ) {
    url = "http://" + url;
  }
  ui.set_started()
  ui.recorder.start(url);

  return false;
}

RecorderUI.prototype.set_started = function() {
  var e = document.getElementById("bstop");
  e.className = e.className.replace(/ hide|hide/ig, "");
  e.onclick = ui.stop;
  e.value = "Stop Recording";
  e = document.getElementById("bgo");
  e.className += " hide";
  e = document.getElementById("bedit");
  e.className += " hide";
  e = document.getElementById("recording");
  e.className = e.className.replace(/ hide|hide/ig, "");
  e = document.getElementById("turl");
  e.disabled = true;
  e = document.getElementById("bdownload");
  e.className += " hide";
  chrome.browserAction.setBadgeText({
    "text": "REC"
  });
  chrome.browserAction.setBadgeBackgroundColor({
    "color": "#c53929"
  });
}

RecorderUI.prototype.stop = function() {
  ui.set_stopped();
  ui.recorder.stop();
  return false;
}

RecorderUI.prototype.set_stopped = function() {
  var e = document.getElementById("bstop");
  e.className += " hide";
  e = document.getElementById("bgo");
  e.className = e.className.replace(/ hide|hide/ig, "");
  e = document.getElementById("bedit");
  e.className = e.className.replace(/ hide|hide/ig, "");
  e = document.getElementById("recording");
  e.className += " hide";
  e = document.getElementById("turl");
  e.disabled = false;
  e = document.getElementById("bdownload");
  e.className = e.className.replace(/ hide|hide/ig, "");
  chrome.browserAction.setBadgeText({
    "text": ""
  });
  chrome.browserAction.setBadgeBackgroundColor({
    "color": "#0000"
  });
}

RecorderUI.prototype.edit = function(options) {
  chrome.tabs.create({url: "./editor.html"});
}

RecorderUI.prototype.download = function(){
  chrome.tabs.create({url: "./coder.html?download=true"});
}

RecorderUI.prototype.setBtnGoState = function(){
  chrome.tabs.getSelected(null, function (tab) {
    if(/(chrome|chrome\-extension)\:/.test(tab.url)){
      document.querySelector("input#bgo").className += " disabled";
      document.querySelector("input#bgo").disabled = true;
    }
  });
  document.querySelector("input#turl").addEventListener("input", function(){
    var bgoStyle = document.querySelector("input#bgo");
    if(!/(chrome|chrome\-extension)\:/.test(this.value)){
      bgoStyle.className = bgoStyle.className.replace(/ disabled|disabled/ig, "");
      bgoStyle.disabled = false;
    }
  });
}

var ui;

// bind events to ui elements
window.onload = function(){
  document.querySelector('input#bgo').onclick=function() {ui.start(); return false;};
  document.querySelector('input#bstop').onclick=function() {ui.stop(); return false;};
  document.querySelector('input#bdownload').onclick=function() {ui.download(); return false;};
  document.querySelector('input#bedit').onclick=function() {ui.edit(); return false;};
  ui = new RecorderUI();
  ui.setBtnGoState();
}
