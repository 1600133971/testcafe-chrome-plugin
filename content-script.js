if (typeof (TestRecorder) == "undefined") {
  TestRecorder = {};
}

//---------------------------------------------------------------------------
//Browser -- a singleton that provides a cross-browser API for managing event 
//handlers and miscellaneous browser functions.
//Methods:
//captureEvent(window, name, handler) -- capture the named event occurring
//in the given window, setting the function handler as the event handler.
//The event name should be of the form "click", "blur", "change", etc. 
//releaseEvent(window, name, handler) -- release the named event occurring
//in the given window. The event name should be of the form "click", "blur",
//"change", etc. 
//getSelection(window) -- return the text currently selected, or the empty
//string if no text is currently selected in the browser.
//---------------------------------------------------------------------------

if (typeof (TestRecorder.Browser) == "undefined") {
  TestRecorder.Browser = {};
}

TestRecorder.Browser.captureEvent = function (wnd, name, func) {
  var lname = name.toLowerCase();
  var doc = wnd.document;
  wnd.captureEvents(Event[name.toUpperCase()]);
  wnd["on" + lname] = func;
}

TestRecorder.Browser.releaseEvent = function (wnd, name, func) {
  var lname = name.toLowerCase();
  var doc = wnd.document;
  wnd.releaseEvents(Event[name.toUpperCase()]);
  wnd["on" + lname] = null;
}

TestRecorder.Browser.getSelection = function (wnd) {
  var doc = wnd.document;
  if (wnd.getSelection) {
    return wnd.getSelection() + "";
  }
  else if (doc.getSelection) {
    return doc.getSelection() + "";
  }
  else if (doc.selection && doc.selection.createRange) {
    return doc.selection.createRange().text + "";
  }
  return "";
}

TestRecorder.Browser.windowHeight = function (wnd) {
  var doc = wnd.document;
  if (wnd.innerHeight) {
    return wnd.innerHeight;
  }
  else if (doc.documentElement && doc.documentElement.clientHeight) {
    return doc.documentElement.clientHeight;
  }
  else if (document.body) {
    return document.body.clientHeight;
  }
  return -1;
}

TestRecorder.Browser.windowWidth = function (wnd) {
  var doc = wnd.document;
  if (wnd.innerWidth) {
    return wnd.innerWidth;
  }
  else if (doc.documentElement && doc.documentElement.clientWidth) {
    return doc.documentElement.clientWidth;
  }
  else if (document.body) {
    return document.body.clientWidth;
  }
  return -1;
}

//---------------------------------------------------------------------------
//Event -- a class that provides a cross-browser API dealing with most of the
//interesting information about events.
//Methods:
//type()   -- returns the string type of the event (e.g. "click")
//target() -- returns the target of the event
//button() -- returns the mouse button pressed during the event. Because
//it is not possible to reliably detect a middle button press, this method 
//only recognized the left and right mouse buttons. Returns one of the  
//constants Event.LeftButton, Event.RightButton or Event.UnknownButton for 
//a left click, right click, or indeterminate (or no mouse click).
//keycode() -- returns the index code of the key pressed. Note that this 
//value may differ across browsers because of character set differences. 
//Whenever possible, it is suggested to use keychar() instead.
//keychar() -- returns the char version of the key pressed rather than a 
//raw numeric code. The resulting value is subject to all of the vagaries 
//of browsers, character encodings in use, etc.
//shiftkey() -- returns true if the shift key was pressed.
//posX() -- return the X coordinate of the mouse relative to the document.
//posY() -- return the y coordinate of the mouse relative to the document.
//stopPropagation() -- stop event propagation (if supported)
//preventDefault() -- prevent the default action (if supported)
//---------------------------------------------------------------------------

TestRecorder.Event = function (e) {
  this.event = (e) ? e : window.event;
}

TestRecorder.Event.LeftButton = 0;
TestRecorder.Event.MiddleButton = 1;
TestRecorder.Event.RightButton = 2;
TestRecorder.Event.UnknownButton = 3;

TestRecorder.Event.prototype.stopPropagation = function () {
  if (this.event.stopPropagation)
    this.event.stopPropagation();
}

TestRecorder.Event.prototype.preventDefault = function () {
  if (this.event.preventDefault)
    this.event.preventDefault();
}

TestRecorder.Event.prototype.type = function () {
  return this.event.type;
}

TestRecorder.Event.prototype.button = function () {
  if (this.event.button) {
    if (this.event.button == 2) {
      return TestRecorder.Event.RightButton;
    }
    return TestRecorder.Event.LeftButton;
  }
  else if (this.event.which) {
    if (this.event.which > 1) {
      return TestRecorder.Event.RightButton;
    }
    return TestRecorder.Event.LeftButton;
  }
  return TestRecorder.Event.UnknownButton;
}

TestRecorder.Event.prototype.target = function () {
  var t = (this.event.target) ? this.event.target : this.event.srcElement;
  if (t && t.nodeType == 3) // safari bug
    return t.parentNode;
  return t;
}

TestRecorder.Event.prototype.keycode = function () {
  return (this.event.keyCode) ? this.event.keyCode : this.event.which;
}

TestRecorder.Event.prototype.keychar = function () {
  return String.fromCharCode(this.keycode());
}

TestRecorder.Event.prototype.shiftkey = function () {
  if (this.event.shiftKey)
    return true;
  return false;
}

TestRecorder.Event.prototype.posX = function () {
  if (this.event.pageX)
    return this.event.pageX;
  else if (this.event.clientX) {
    return this.event.clientX + document.body.scrollLeft;
  }
  return 0;
}

TestRecorder.Event.prototype.posY = function () {
  if (this.event.pageY)
    return this.event.pageY;
  else if (this.event.clientY) {
    return this.event.clientY + document.body.scrollTop;
  }
  return 0;
}

//---------------------------------------------------------------------------
//TestCase -- this class contains the interesting events that happen in 
//the course of a test recording and provides some testcase metadata.
//Attributes:
//title -- the title of the test case.
//items -- an array of objects representing test actions and checks
//---------------------------------------------------------------------------

TestRecorder.TestCase = function () {
  this.title = "Test Case";
  this.items = new Array();
}

TestRecorder.TestCase.prototype.append = function (o) {
  this.items[this.items.length] = o;
  chrome.runtime.sendMessage({ action: "append", obj: o });
}

TestRecorder.TestCase.prototype.peek = function () {
  return this.items[this.items.length - 1];
}

TestRecorder.TestCase.prototype.poke = function (o) {
  this.items[this.items.length - 1] = o;
  chrome.runtime.sendMessage({ action: "poke", obj: o });
}

//---------------------------------------------------------------------------
//Event types -- whenever an interesting event happens (an action or a check)
//it is recorded as one of the object types defined below. All events have a
//'type' attribute that marks the type of the event (one of the values in the
//EventTypes enumeration) and different attributes to capture the pertinent 
//information at the time of the event.
//---------------------------------------------------------------------------

if (typeof (TestRecorder.EventTypes) == "undefined") {
  TestRecorder.EventTypes = {};
}

TestRecorder.EventTypes.OpenUrl = 0;
TestRecorder.EventTypes.Click = 1;
TestRecorder.EventTypes.Change = 2;
TestRecorder.EventTypes.Comment = 3;
TestRecorder.EventTypes.Submit = 4;
TestRecorder.EventTypes.CheckPageTitle = 5;
TestRecorder.EventTypes.CheckPageLocation = 6;
TestRecorder.EventTypes.CheckTextPresent = 7;
TestRecorder.EventTypes.CheckValue = 8;
TestRecorder.EventTypes.CheckValueContains = 9;
TestRecorder.EventTypes.CheckText = 10;
TestRecorder.EventTypes.CheckHref = 11;
TestRecorder.EventTypes.CheckEnabled = 12;
TestRecorder.EventTypes.CheckDisabled = 13;
TestRecorder.EventTypes.CheckSelectValue = 14;
TestRecorder.EventTypes.CheckSelectOptions = 15;
TestRecorder.EventTypes.CheckImageSrc = 16;
TestRecorder.EventTypes.PageLoad = 17;
TestRecorder.EventTypes.ScreenShot = 18;
TestRecorder.EventTypes.MouseDown = 19;
TestRecorder.EventTypes.MouseUp = 20;
TestRecorder.EventTypes.MouseDrag = 21;
TestRecorder.EventTypes.MouseDrop = 22;
TestRecorder.EventTypes.KeyPress = 23;
TestRecorder.EventTypes.MouseOver = 24;
TestRecorder.EventTypes.DoubleClick = 25;
TestRecorder.EventTypes.RightClick = 26;
TestRecorder.EventTypes.PressKey = 27;
TestRecorder.EventTypes.ResizeWindow = 28;
TestRecorder.EventTypes.MaximizeWindow = 29;
TestRecorder.EventTypes.NavigateTo = 30;
TestRecorder.EventTypes.Wait = 31;
TestRecorder.EventTypes.NativeDialog = 32;
TestRecorder.EventTypes.Debug = 33;
TestRecorder.EventTypes.TestSpeed = 34;
TestRecorder.EventTypes.PageLoadTimeout = 35;
TestRecorder.EventTypes.UploadFile = 36;
TestRecorder.EventTypes.SelectText = 37;

//item.info信息，来自target
TestRecorder.ElementInfo = function (element) {
  this.action = element.action;
  this.method = element.method;
  this.href = element.href;
  this.tagName = element.tagName;
  this.selector = this.getCleanCSSSelector(element);
  this.value = element.value;
  this.checked = element.checked;
  this.name = element.name;
  this.type = element.type;
  if (this.type) {
    this.type = this.type.toLowerCase();
  }
  if (element.form) {
    this.form = { id: element.form.id, name: element.form.getAttribute('name') };
  }
  this.src = element.src;
  this.id = element.id;
  this.title = element.title;
  this.options = [];
  if (element.selectedIndex != undefined) {
    for (var i = 0; i < element.options.length; i++) {
      var o = element.options[i];
      this.options[i] = { text: o.text, value: o.value };
    }
    if (element.selectedOptions.length >= 1) {
      this.selectedText = element.selectedOptions[0].text;
    }
  }
  this.label = this.findLabelText(element);
  this.path = this.getPath(element);
  this.textContent = element.textContent.indexOf("\\n") >= 0 ? "" : element.textContent;
  this.selectionStart = element.selectionStart;
  this.selectionEnd = element.selectionEnd;
}

TestRecorder.ElementInfo.prototype.getPath = function (element) {
  // 无效
  if (element == null) {
    return "";
  }

  //html级别没有tagName
  var tag = element.tagName.toLowerCase();
  if (tag === "body" || tag === "html") {
    return tag;
  }

  //消除className的前后空格
  var className = element.className.trim();

  //button类型含class单独列出
  if ((tag == "button" || element.type == "submit") && className != "") {
    return tag + "." + className.replace(/[ ]/g, ".");
  }

  //优先id
  var id = element.id.trim();
  if (id !== "") {
    return tag + "#" + id;
  }

  //不解析class的tag列表
  var filterTag = ["div", "table", "tbody", "tr", "td", "span", "fieldset"];
  var find = false;
  for (j in filterTag) {
    if (filterTag[j] == tag) {
      find = true;
    }
  }

  //构建class或nth-child
  var count = element.parentNode != null ? element.parentNode.childElementCount : 0;
  var cls = (!find && className != "" && className.split(" ").length < 3) ? "." + className.replace(/[ ]/g, ".") : "";
  var childn = "";
  if (cls === "" && count > 1) {
    var n = 0;
    for (i in element.parentNode.children) {
      n++;
      if (element.parentNode.children[i].innerHTML == element.innerHTML && element.parentNode.children[i].className == element.className) {
        break;
      }
    }
    if (n > 0) {
      childn = ":nth-child(" + n.toString() + ")";
    }
  }

  var parent = this.getPath(element.parentNode);
  return (parent !== "" ? parent  + " > " : "") + tag + cls + childn;
}

TestRecorder.ElementInfo.prototype.findLabelText = function (element) {
  var label = this.findContainingLabel(element)
  var text;
  if (!label) {
    label = this.findReferencingLabel(element);
  }
  if (label) {
    text = label.innerHTML;
    // remove newlines
    text = text.replace('\n', ' ');
    // remove tags
    text = text.replace(/<[^>]*>/g, ' ');
    // remove non-alphanumeric prefixes or suffixes
    text = text.replace(/^\W*/mg, '')
    text = text.replace(/\W*$/mg, '')
    // remove extra whitespace
    text = text.replace(/^\s*/, '').replace(/\s*$/, '').replace(/\s+/g, ' ');
  }

  return text;
}

TestRecorder.ElementInfo.prototype.findReferencingLabel = function (element) {
  var labels = window.document.getElementsByTagName('label')
  for (var i = 0; i < labels.length; i++) {
    if (labels[i].attributes['for'] && labels[i].attributes['for'].value == element.id)
      return labels[i]
  }
}

TestRecorder.ElementInfo.prototype.findContainingLabel = function (element) {
  var parent = element.parentNode;
  if (!parent)
    return undefined;
  if (parent.tagName && parent.tagName.toLowerCase() == 'label')
    return parent;
  else
    return this.findContainingLabel(parent);
}

TestRecorder.ElementInfo.prototype.getCleanCSSSelector = function (element) {
  if (!element) return;
  var selector = element.tagName ? element.tagName.toLowerCase() : '';
  if (selector == '' || selector == 'html') return '';

  var tmp_selector = '';
  var accuracy = document.querySelectorAll(selector).length;
  if (element.id) {
    selector = "#" + element.id.replace(/\./g, '\\.');
    accuracy = document.querySelectorAll(selector).length
    if (accuracy == 1) return selector;
  }
  if (element.className) {
    tmp_selector = '.' + element.className.trim().replace(/ /g, ".");
    if (document.querySelectorAll(tmp_selector).length < accuracy) {
      selector = tmp_selector;
      accuracy = document.querySelectorAll(selector).length
      if (accuracy == 1) return selector;
    }
  }
  var parent = element.parentNode;
  var parent_selector = this.getCleanCSSSelector(parent);

  if (parent_selector) {
    // resolve sibling ambiguity
    var matching_sibling = 0;
    var matching_nodes = document.querySelectorAll(parent_selector + ' > ' + selector);
    for (var i = 0; i < matching_nodes.length; i++) {
      if (matching_nodes[i].parentNode == parent) matching_sibling++;
    }
    if (matching_sibling > 1) {
      var index = 1;
      for (var sibling = element.previousElementSibling; sibling; sibling = sibling.previousElementSibling) index++;
      selector = selector + ':nth-child(' + index + ')';
    }

    // remove useless intermediary parent
    selector_array = parent_selector.split(' ');
    if (selector_array.length > 1) {
      for (var i = 1; i < selector_array.length; i++) {
        tmp_selector = selector_array.slice(0, i).join(' ') + ' ' + selector;
        if (document.querySelectorAll(tmp_selector).length == 1) {
          selector = tmp_selector;
          break;
        }
      }
    }

    // improve accuracy if still not correct
    accuracy = document.querySelectorAll(selector).length
    if (accuracy > 1) {
      tmp_selector = parent_selector + " " + selector;
      if (document.querySelectorAll(tmp_selector).length == 1) {
        selector = tmp_selector;
      } else {
        selector = parent_selector + " > " + selector;
      }
    }
  }

  return selector;
}

TestRecorder.DocumentEvent = function (type, target) {
  this.type = type;
  this.url = target.URL;
  this.title = target.title;
}

TestRecorder.ElementEvent = function (type, target, text) {
  this.type = type;
  this.info = new TestRecorder.ElementInfo(target);
  this.text = text ? text : recorder.strip(contextmenu.innertext(target));
}

TestRecorder.CommentEvent = function (text) {
  this.type = TestRecorder.EventTypes.Comment;
  this.text = text;
}

TestRecorder.KeyEvent = function (target, text) {
  this.type = TestRecorder.EventTypes.KeyPress;
  this.info = new TestRecorder.ElementInfo(target);
  this.text = text;
}

TestRecorder.MouseEvent = function (type, target, x, y) {
  this.type = type;
  this.info = new TestRecorder.ElementInfo(target);
  this.x = x;
  this.y = y;
  this.text = recorder.strip(contextmenu.innertext(target));
}

TestRecorder.ScreenShotEvent = function () {
  this.type = TestRecorder.EventTypes.ScreenShot;
}

TestRecorder.OpenURLEvent = function (url) {
  this.type = TestRecorder.EventTypes.OpenUrl;
  this.url = url;
  this.width = window.innerWidth;
  this.height = window.innerHeight;
}

TestRecorder.PageLoadEvent = function (url) {
  this.type = TestRecorder.EventTypes.OpenUrl;
  this.url = url;
  this.viaBack = back
}

//---------------------------------------------------------------------------
//ContextMenu -- this class is responsible for managing the right-click 
//context menu that shows appropriate checks for targeted elements.
//All methods and attributes are private to this implementation.
//---------------------------------------------------------------------------

TestRecorder.ContextMenu = function () {
  this.selected = null;
  this.target = null;
  this.window = null;
  this.visible = false;
  this.over = false;
  this.menu = null;
}

contextmenu = new TestRecorder.ContextMenu();

TestRecorder.ContextMenu.prototype.build = function (t, x, y) {
  var d = recorder.window.document;
  var b = d.getElementsByTagName("body").item(0);
  var menu = d.createElement("div");

  // Needed to deal with various cross-browser insanities...
  menu.setAttribute("style", "backgroundColor:#ffffff;color:#000000;border:1px solid #000000;padding:2px;position:absolute;display:none;top:" + y + "px;left:" + x + "px;border:1px;z-index:10000;");

  menu.style.backgroundColor = "#ffffff";
  menu.style.color = "#000000";
  menu.style.border = "1px solid #000000";
  menu.style.padding = "2px";
  menu.style.position = "absolute";
  menu.style.display = "none";
  menu.style.zIndex = "10010";
  menu.style.top = y.toString();
  menu.style.left = x.toString();
  menu.onmouseover = contextmenu.onmouseover;
  menu.onmouseout = contextmenu.onmouseout;

  var selected = TestRecorder.Browser.getSelection(recorder.window).toString();

  if (t.width && t.height) {
    menu.appendChild(this.item("Check Image Src", this.checkImgSrc));
  } else if (t.type == "text" || t.type == "textarea") {
    menu.appendChild(this.item("Check Text", this.checkText));
    menu.appendChild(this.item("Check Enabled", this.checkEnabled));
    menu.appendChild(this.item("Check Disabled", this.checkDisabled));
  } else if (selected && (selected != "")) {
    this.selected = recorder.strip(selected);
    menu.appendChild(this.item("Check Text Appears On Page", this.checkTextPresent));
  } else if (t.href) {
    menu.appendChild(this.item("Check Link Text", this.checkText));
    menu.appendChild(this.item("Check Link Href", this.checkHref));
  } else if (t.selectedIndex || t.type == "option") {
    var name = "Check Selected Value";
    if (t.type != "select-one") {
      name = name + "s";
    }
    menu.appendChild(this.item(name, this.checkSelectValue));
    menu.appendChild(this.item("Check Select Options", this.checkSelectOptions));
    menu.appendChild(this.item("Check Enabled", this.checkEnabled));
    menu.appendChild(this.item("Check Disabled", this.checkDisabled));
  } else if (t.type == "button" || t.type == "submit") {
    menu.appendChild(this.item("Check Button Value", this.checkValue));
    menu.appendChild(this.item("Check Enabled", this.checkEnabled));
    menu.appendChild(this.item("Check Disabled", this.checkDisabled));
  } else if (t.value) {
    menu.appendChild(this.item("Check Value", this.checkValue));
    menu.appendChild(this.item("Check Enabled", this.checkEnabled));
    menu.appendChild(this.item("Check Disabled", this.checkDisabled));
  } else if (t.innerText) {
    menu.appendChild(this.item("Check Text", this.checkText));
  }
  menu.appendChild(this.item("Check Page Location", this.checkPageLocation));
  menu.appendChild(this.item("Check Page Title", this.checkPageTitle));
  menu.appendChild(this.item("Screenshot", this.doScreenShot));
  menu.appendChild(this.item("Hover", this.hover));
  menu.appendChild(this.item("Resize Window", this.resizeWindow));
  menu.appendChild(this.item("Maximize Window", this.maximizeWindow));
  menu.appendChild(this.item("Navigate To", this.navigateTo));
  menu.appendChild(this.item("Wait", this.wait));
  menu.appendChild(this.item("Native Dialog Dealer", this.nativeDialog));
  menu.appendChild(this.item("Debug", this.debug));
  menu.appendChild(this.item("Test Speed", this.testSpeed));
  menu.appendChild(this.item("Page Load Timeout", this.pageLoadTimeout));
  menu.appendChild(this.item("Cancel", this.cancel));

  b.insertBefore(menu, b.firstChild);
  return menu;
}

TestRecorder.ContextMenu.prototype.item = function (text, func) {
  var doc = recorder.window.document;
  var div = doc.createElement("div");
  var txt = doc.createTextNode(text);
  div.setAttribute("style", "border-radius:5px;padding:0px 6px;border:1px solid #ffffff;");
  div.style.border = "1px solid #ffffff";
  div.style.padding = "0px 6px";
  div.appendChild(txt);
  div.onmouseover = this.onitemmouseover;
  div.onmouseout = this.onitemmouseout;
  div.onclick = func;
  return div;
}

TestRecorder.ContextMenu.prototype.show = function (e) {
  if (this.menu) {
    this.hide();
  }
  var wnd = recorder.window;
  var doc = wnd.document;
  this.target = e.target();
  var wh = TestRecorder.Browser.windowHeight(wnd);
  var ww = TestRecorder.Browser.windowWidth(wnd);
  var x = e.posX();
  var y = e.posY();
  if ((ww >= 0) && ((ww - x) < 100)) {
    x = x - 100;
  }
  if ((wh >= 0) && ((wh - y) < 100)) {
    y = y - 100;
  }
  var menu = this.build(e.target(), x, y);
  this.menu = menu;
  menu.style.display = "";
  this.visible = true;
  return;
}

TestRecorder.ContextMenu.prototype.hide = function () {
  var wnd = recorder.window;
  var d = wnd.document;
  var b = d.getElementsByTagName("body").item(0);
  this.menu.style.display = "none";
  b.removeChild(this.menu);
  this.target = null;
  this.visible = false;
  this.over = false;
  this.menu = null;
}

TestRecorder.ContextMenu.prototype.onitemmouseover = function (e) {
  this.style.backgroundColor = "mediumorchid";
  this.style.color = "#ffffff";
  this.style.border = "1px solid #c0c0c0";
  return true;
}

TestRecorder.ContextMenu.prototype.onitemmouseout = function (e) {
  this.style.backgroundColor = "#ffffff";
  this.style.color = "#000000";
  this.style.border = "1px solid #ffffff";
  return true;
}

TestRecorder.ContextMenu.prototype.onmouseover = function (e) {
  contextmenu.over = true;
}

TestRecorder.ContextMenu.prototype.onmouseout = function (e) {
  contextmenu.over = false;
}

TestRecorder.ContextMenu.prototype.onmousedown = function (e) {
  if (contextmenu.visible) {
    if (contextmenu.over == false) {
      contextmenu.hide();
      return true;
    }
    return true;
  }
  return false;
}

TestRecorder.ContextMenu.prototype.record = function (o) {
  recorder.testcase.append(o);
  recorder.log(o.type);
}

TestRecorder.ContextMenu.prototype.checkPageTitle = function () {
  var doc = recorder.window.document;
  var et = TestRecorder.EventTypes;
  var e = new TestRecorder.DocumentEvent(et.CheckPageTitle, doc);
  contextmenu.record(e);
}

TestRecorder.ContextMenu.prototype.doScreenShot = function () {
  var e = new TestRecorder.ScreenShotEvent();
  contextmenu.record(e);
}

TestRecorder.ContextMenu.prototype.checkPageLocation = function () {
  var doc = recorder.window.document;
  var et = TestRecorder.EventTypes;
  var e = new TestRecorder.DocumentEvent(et.CheckPageLocation, doc);
  contextmenu.record(e);
}

TestRecorder.ContextMenu.prototype.checkValue = function () {
  var t = contextmenu.target;
  var et = TestRecorder.EventTypes;
  var e = new TestRecorder.ElementEvent(et.CheckValue, t);
  contextmenu.record(e);
}

TestRecorder.ContextMenu.prototype.checkValueContains = function () {
  var s = contextmenu.selected;
  var t = contextmenu.target;
  var et = TestRecorder.EventTypes;
  var e = new TestRecorder.ElementEvent(et.CheckValueContains, t, s);
  contextmenu.selected = null;
  contextmenu.record(e);
}

TestRecorder.ContextMenu.prototype.innertext = function (e) {
  var doc = recorder.window.document;
  if (document.createRange) {
    var r = recorder.window.document.createRange();
    r.selectNodeContents(e);
    return r.toString();
  } else {
    return e.innerText;
  }
}

TestRecorder.ContextMenu.prototype.checkText = function () {
  var t = contextmenu.target;
  var s = "";
  if (t.type == "button" || t.type == "submit") {
    s = t.value;
  } else {
    s = contextmenu.innertext(t);
  }
  s = recorder.strip(s);
  var et = TestRecorder.EventTypes;
  var e = new TestRecorder.ElementEvent(et.CheckText, t, s);
  contextmenu.record(e);
}

TestRecorder.ContextMenu.prototype.checkTextPresent = function () {
  var t = contextmenu.target;
  var s = contextmenu.selected;
  var et = TestRecorder.EventTypes;
  var e = new TestRecorder.ElementEvent(et.CheckTextPresent, t, s);
  contextmenu.selected = null;
  contextmenu.record(e);
}

TestRecorder.ContextMenu.prototype.checkHref = function () {
  var t = contextmenu.target;
  var et = TestRecorder.EventTypes;
  var e = new TestRecorder.ElementEvent(et.CheckHref, t);
  contextmenu.record(e);
}

TestRecorder.ContextMenu.prototype.checkEnabled = function () {
  var t = contextmenu.target;
  var et = TestRecorder.EventTypes;
  var e = new TestRecorder.ElementEvent(et.CheckEnabled, t);
  contextmenu.record(e);
}

TestRecorder.ContextMenu.prototype.checkDisabled = function () {
  var t = contextmenu.target;
  var et = TestRecorder.EventTypes;
  var e = new TestRecorder.ElementEvent(et.CheckDisabled, t);
  contextmenu.record(e);
}

TestRecorder.ContextMenu.prototype.checkSelectValue = function () {
  var t = contextmenu.target;
  var et = TestRecorder.EventTypes;
  var e = new TestRecorder.ElementEvent(et.CheckSelectValue, t);
  contextmenu.record(e);
}

TestRecorder.ContextMenu.prototype.checkSelectOptions = function () {
  var t = contextmenu.target;
  var et = TestRecorder.EventTypes;
  var e = new TestRecorder.ElementEvent(et.CheckSelectOptions, t);
  contextmenu.record(e);
}

TestRecorder.ContextMenu.prototype.checkImgSrc = function () {
  var t = contextmenu.target;
  var et = TestRecorder.EventTypes;
  var e = new TestRecorder.ElementEvent(et.CheckImageSrc, t);
  contextmenu.record(e);
}

TestRecorder.ContextMenu.prototype.hover = function () {
  var t = contextmenu.target;
  var et = TestRecorder.EventTypes;
  var e = new TestRecorder.ElementEvent(et.MouseOver, t);
  contextmenu.record(e);
}

TestRecorder.ContextMenu.prototype.resizeWindow = function () {
  var wnd = recorder.window;
  var wh = TestRecorder.Browser.windowHeight(wnd);
  var ww = TestRecorder.Browser.windowWidth(wnd);
  var s = ww.toString() + ", " + wh.toString();
  var t = contextmenu.target;
  var et = TestRecorder.EventTypes;
  var e = new TestRecorder.ElementEvent(et.ResizeWindow, t, s);
  contextmenu.record(e);
}

TestRecorder.ContextMenu.prototype.maximizeWindow = function () {
  var t = contextmenu.target;
  var et = TestRecorder.EventTypes;
  var e = new TestRecorder.ElementEvent(et.MaximizeWindow, t);
  contextmenu.record(e);
}

TestRecorder.ContextMenu.prototype.navigateTo = function () {
  var s = prompt('Navigate To URL:', 'http://');
  var t = contextmenu.target;
  var et = TestRecorder.EventTypes;
  var e = new TestRecorder.ElementEvent(et.NavigateTo, t, s);
  contextmenu.record(e);
}

TestRecorder.ContextMenu.prototype.wait = function () {
  var s = prompt('The pause duration, in milliseconds:', '1000');  
  var t = contextmenu.target;
  var et = TestRecorder.EventTypes;
  var e = new TestRecorder.ElementEvent(et.Wait, t, s);
  contextmenu.record(e);
}

TestRecorder.ContextMenu.prototype.nativeDialog = function () {
  var t = contextmenu.target;
  var et = TestRecorder.EventTypes;
  var e = new TestRecorder.ElementEvent(et.NativeDialog, t);
  contextmenu.record(e);
}

TestRecorder.ContextMenu.prototype.debug = function () {
  var t = contextmenu.target;
  var et = TestRecorder.EventTypes;
  var e = new TestRecorder.ElementEvent(et.Debug, t);
  contextmenu.record(e);
}

TestRecorder.ContextMenu.prototype.testSpeed = function () {
  var s = prompt('Specifies the test speed. Must be a number between 1(fastest) and 0.01(slowest):', '0.1');  
  var t = contextmenu.target;
  var et = TestRecorder.EventTypes;
  var e = new TestRecorder.ElementEvent(et.TestSpeed, t, s);
  contextmenu.record(e);
}

TestRecorder.ContextMenu.prototype.pageLoadTimeout = function () {
  var s = prompt('Page load timeout(milliseconds). 0 to skip waiting for the window.load event:', '0');  
  var t = contextmenu.target;
  var et = TestRecorder.EventTypes;
  var e = new TestRecorder.ElementEvent(et.PageLoadTimeout, t, s);
  contextmenu.record(e);
}

TestRecorder.ContextMenu.prototype.cancel = function () {
  contextmenu.hide();
}

//---------------------------------------------------------------------------
//Recorder -- a controller class that manages the recording of web browser
//activities to produce a test case.
//Instance Methods:
//start() -- start recording browser events.
//stop()  -- stop recording browser events.
//reset() -- reset the recorder and initialize a new test case.
//---------------------------------------------------------------------------

TestRecorder.Recorder = function () {
  this.testcase = new TestRecorder.TestCase();
  this.logfunc = null;
  this.window = null;
  this.active = false;
}

//The recorder is a singleton -- there is no real reason to have more than
//one instance, and many of its methods are event handlers which need a
//stable reference to the instance.

recorder = new TestRecorder.Recorder();
recorder.logfunc = function (msg) { console.log(msg); };

TestRecorder.Recorder.prototype.start = function () {
  this.window = window;
  this.captureEvents();
  this.active = true;
  this.log("recorder started");
}

TestRecorder.Recorder.prototype.stop = function () {
  this.releaseEvents();
  this.active = false;
  this.log("recorder stopped");
  return;
}

TestRecorder.Recorder.prototype.open = function (url) {
  var e = new TestRecorder.OpenURLEvent(url);
  this.testcase.append(e);
  this.log("open url: " + url);
}

TestRecorder.Recorder.prototype.pageLoad = function () {
  var doc = recorder.window.document;
  var et = TestRecorder.EventTypes;
  var e = new TestRecorder.DocumentEvent(et.PageLoad, doc);
  this.testcase.append(e);
  this.log("page loaded url: " + e.url);
}

TestRecorder.Recorder.prototype.captureEvents = function () {
  var wnd = this.window;
  TestRecorder.Browser.captureEvent(wnd, "contextmenu", this.oncontextmenu);
  TestRecorder.Browser.captureEvent(wnd, "drag", this.ondrag);
  TestRecorder.Browser.captureEvent(wnd, "mousedown", this.onmousedown);
  TestRecorder.Browser.captureEvent(wnd, "mouseover", this.onmouseover);
  TestRecorder.Browser.captureEvent(wnd, "mouseup", this.onmouseup);
  TestRecorder.Browser.captureEvent(wnd, "click", this.onclick);
  TestRecorder.Browser.captureEvent(wnd, "dblclick", this.ondoubleclick);
  TestRecorder.Browser.captureEvent(wnd, "change", this.onchange);
  TestRecorder.Browser.captureEvent(wnd, "keypress", this.onkeypress);
  TestRecorder.Browser.captureEvent(wnd, "select", this.onselect);
  TestRecorder.Browser.captureEvent(wnd, "submit", this.onsubmit);
  TestRecorder.Browser.captureEvent(wnd, "keydown", this.onkeydown);
}

TestRecorder.Recorder.prototype.releaseEvents = function () {
  var wnd = this.window;
  TestRecorder.Browser.releaseEvent(wnd, "contextmenu", this.oncontextmenu);
  TestRecorder.Browser.releaseEvent(wnd, "drag", this.ondrag);
  TestRecorder.Browser.releaseEvent(wnd, "mousedown", this.onmousedown);
  TestRecorder.Browser.releaseEvent(wnd, "mouseover", this.onmouseover);
  TestRecorder.Browser.releaseEvent(wnd, "mouseup", this.onmouseup);
  TestRecorder.Browser.releaseEvent(wnd, "click", this.onclick);
  TestRecorder.Browser.releaseEvent(wnd, "dblclick", this.ondoubleclick);
  TestRecorder.Browser.releaseEvent(wnd, "change", this.onchange);
  TestRecorder.Browser.releaseEvent(wnd, "keypress", this.onkeypress);
  TestRecorder.Browser.releaseEvent(wnd, "select", this.onselect);
  TestRecorder.Browser.releaseEvent(wnd, "submit", this.onsubmit);
  TestRecorder.Browser.releaseEvent(wnd, "keydown", this.onkeydown);
}

TestRecorder.Recorder.prototype.clickaction = function (e) {
  // This method is called by our low-level event handler when the mouse 
  // is clicked in normal mode. Its job is decide whether the click is
  // something we care about. If so, we record the event in the test case.
  //
  // If the context menu is visible, then the click is either over the 
  // menu (selecting a check) or out of the menu (cancelling it) so we 
  // always discard clicks that happen when the menu is visible.
  if (!contextmenu.visible) {
    var et = TestRecorder.EventTypes;
    var t = e.target();
    if (t.href || (t.type && t.type == "submit") || (t.type && t.type == "button")) {
      this.testcase.append(new TestRecorder.ElementEvent(et.Click, t));
    } else if (t.type && t.type == "file" && t.tagName && t.tagName.toLowerCase() == "input") {
      this.testcase.append(new TestRecorder.ElementEvent(et.UploadFile, t));
    } else {
      this.testcase.append(new TestRecorder.MouseEvent(et.Click, t, e.posX(), e.posY()));
    }
  } else {
    contextmenu.hide();
  }
}

TestRecorder.Recorder.prototype.doubleclickaction = function (e) {
  // This method is called by our low-level event handler when the mouse 
  // is clicked in normal mode. Its job is decide whether the click is
  // something we care about. If so, we record the event in the test case.
  //
  // If the context menu is visible, then the click is either over the 
  // menu (selecting a check) or out of the menu (cancelling it) so we 
  // always discard clicks that happen when the menu is visible.
  if (!contextmenu.visible) {
    var et = TestRecorder.EventTypes;
    var t = e.target();
    if (t.href || (t.type && t.type == "submit") || (t.type && t.type == "button")) {
      this.testcase.append(new TestRecorder.ElementEvent(et.Click, t));
    } else {
      this.testcase.append(new TestRecorder.MouseEvent(et.DoubleClick, t, e.posX(), e.posY()));
    }
  }
}

TestRecorder.Recorder.prototype.addComment = function (text) {
  this.testcase.append(new TestRecorder.CommentEvent(text));
}

TestRecorder.Recorder.prototype.check = function (e) {
  // This method is called by our low-level event handler when the mouse 
  // is clicked in check mode. Its job is decide whether the click is
  // something we care about. If so, we record the check in the test case.
  contextmenu.show(e);
  var target = e.target();
  if (target.type) {
    var type = target.type.toLowerCase();
    if (type == "submit" || type == "button" || type == "image") {
      recorder.log('check button == "' + target.value + '"');
    }
  }
  else if (target.href) {
    if (target.innerText) {
      var text = recorder.strip(target.innerText);
      recorder.log('check link == "' + target.text + '"');
    }
  }
}

TestRecorder.Recorder.prototype.onpageload = function () {
  if (this.active) {
    // This must be called each time a new document is fully loaded into the
    // testing target frame to ensure that events are captured for the page.
    recorder.captureEvents();

    // if a new page has loaded, but there doesn't seem to be a reason why, 
    // then we need to record the fact or the information will be lost
    if (this.testcase.peek()) {
      var last_event_type = this.testcase.peek().type;
      if (last_event_type != TestRecorder.EventTypes.OpenUrl &&
        last_event_type != TestRecorder.EventTypes.Click &&
        last_event_type != TestRecorder.EventTypes.Submit) {
        this.open(this.window.location.toString());
      }
    }

    // record the fact that a page load happened
    if (this.window) {
      this.pageLoad();
    }
  }
}

TestRecorder.Recorder.prototype.onchange = function (e) {
  //console.log("onchange:", e);
  var e = new TestRecorder.Event(e);
  var last = recorder.testcase.peek();
  if (last != undefined && last.type != undefined && (last.type == TestRecorder.EventTypes.Click || last.type == TestRecorder.EventTypes.UploadFile)) {
    //前一个动作是Click，本次动作上报Change，触发typeText[场景：点击自动完成内容]
    var et = TestRecorder.EventTypes;
    var v = new TestRecorder.ElementEvent(et.Change, e.target());
    recorder.testcase.append(v);
    recorder.log("value changed: " + e.target().value);
  } else {
    recorder.log("no need to value changed: " + e.target().value);
  }
}

TestRecorder.Recorder.prototype.onselect = function (e) {
  //console.log("onselect:", e);
  var e = new TestRecorder.Event(e);
  var et = TestRecorder.EventTypes;
  var v = new TestRecorder.ElementEvent(et.SelectText, e.target());
  recorder.testcase.append(v);
}

TestRecorder.Recorder.prototype.onsubmit = function (e) {
  //console.log("onsubmit:", e);
  var e = new TestRecorder.Event(e);
  var et = TestRecorder.EventTypes;
  // We want to save the form element as the event target
  var t = e.target();
  while (t.parentNode && t.tagName != "FORM") {
    t = t.parentNode;
  }
  var v = new TestRecorder.ElementEvent(et.Submit, t);
  recorder.testcase.append(v);
  recorder.log("submit: " + e.target());
}

TestRecorder.Recorder.prototype.ondrag = function (e) {
  //console.log("ondrag:", e);
  var e = new TestRecorder.Event(e);
  recorder.testcase.append(
    new TestRecorder.MouseEvent(
      TestRecorder.EventTypes.MouseDrag, e.target(), e.posX(), e.posY()
    ));
}

TestRecorder.Recorder.prototype.onmousedown = function (e) {
  //console.log("onmousedown:", e);
  if (!contextmenu.visible) {
    var e = new TestRecorder.Event(e);
    if (e.button() == TestRecorder.Event.LeftButton) {
      recorder.testcase.append(
        new TestRecorder.MouseEvent(
          TestRecorder.EventTypes.MouseDown, e.target(), e.posX(), e.posY()
        ));
    }
  }
}

TestRecorder.Recorder.prototype.onmouseover = function (e) {
  //console.log("onmouseover:", e);
  if (!contextmenu.visible) {
    var e = new TestRecorder.Event(e);
    if (e.target().className == "hov") {
      recorder.testcase.append(
        new TestRecorder.MouseEvent(
          TestRecorder.EventTypes.MouseOver, e.target(), e.posX(), e.posY()
        ));
    }
  }
}

TestRecorder.Recorder.prototype.onmouseup = function (e) {
  //console.log("onmouseup:", e);
  if (!contextmenu.visible) {
    var e = new TestRecorder.Event(e);
    //鼠标左键弹起
    if (e.button() == TestRecorder.Event.LeftButton) {
      recorder.testcase.append(
        new TestRecorder.MouseEvent(
          TestRecorder.EventTypes.MouseUp, e.target(), e.posX(), e.posY()
        ));
    }
  }
}

//The dance here between onclick and oncontextmenu requires a bit of 
//explanation. IE and Moz/Firefox have wildly different behaviors when 
//a right-click occurs. IE6 fires only an oncontextmenu event; Firefox 
//gets an onclick event first followed by an oncontextment event. So 
//to do the right thing here, we need to silently consume oncontextmenu
//on Firefox, and reroute oncontextmenu to look like a click event for 
//IE. In both cases, we need to prevent the default action for cmenu.

TestRecorder.Recorder.prototype.onclick = function (e) {
  //console.log("onclick:", e);
  var e = new TestRecorder.Event(e);

  //shift+click模拟鼠标右击
  if (e.shiftkey()) {
    recorder.testcase.append(
      new TestRecorder.MouseEvent(
        TestRecorder.EventTypes.RightClick, e.target(), e.posX(), e.posY()
      ));
    return false;
  }

  if (e.button() == TestRecorder.Event.RightButton) {
    recorder.check(e);
    return true;
  } else if (e.button() == TestRecorder.Event.LeftButton) {
    recorder.clickaction(e);
    return true;
  }

  e.stopPropagation();
  e.preventDefault();
  return false;
}

TestRecorder.Recorder.prototype.ondoubleclick = function (e) {
  //console.log("ondoubleclick:", e);
  var e = new TestRecorder.Event(e);

  if (e.button() == TestRecorder.Event.LeftButton) {
    recorder.doubleclickaction(e);
    return true;
  }

  e.stopPropagation();
  e.preventDefault();
  return false;
}

TestRecorder.Recorder.prototype.oncontextmenu = function (e) {
  //console.log("oncontextmenu:", e);
  var e = new TestRecorder.Event(e);

  //右键屏蔽原有菜单，显示定制菜单，右击由shift+click激活
  recorder.check(e);

  e.stopPropagation();
  e.preventDefault();
  return false;
}

//keypress不能拦截功能键，只能拦截可打印字符
TestRecorder.Recorder.prototype.onkeypress = function (e) {
  //console.log("onkeypress:", e);
  var e = new TestRecorder.Event(e);

  //shift+S激活截屏事件
  if (e.shiftkey() && (e.keychar() == 'S')) {
    recorder.testcase.append(new TestRecorder.ScreenShotEvent());
    
    e.stopPropagation();
    e.preventDefault();
    return false;
  }

  var last = recorder.testcase.peek();
  if (last != undefined && last.type != undefined && last.type == TestRecorder.EventTypes.KeyPress) {
    //前一个事件是KeyPress，则更新text追加一个字符
    last.text = last.text + e.keychar();
    recorder.testcase.poke(last);
  } else {
    //前一个事件不是KeyPress，是新的KeyPress事件
    recorder.testcase.append(
      new TestRecorder.KeyEvent(e.target(), e.keychar())
    );
  }
  return true;
}

TestRecorder.Recorder.prototype.onkeydown = function (e) {
  //console.log("onkeydown:", e);
  var e = new TestRecorder.Event(e);
  var et = TestRecorder.EventTypes;
  //console.log("onkeydown keycode:", e.keycode);

  //点击Backspace键
  if (e.keycode() == 8 /*Backspace*/) {
    recorder.testcase.append(
      new TestRecorder.ElementEvent(et.PressKey, e.target(), "backspace")
    );
  }

  //点击Tab键
  if (e.keycode() == 9 /*Tab*/) {
    recorder.testcase.append(
      new TestRecorder.ElementEvent(et.PressKey, e.target(), "tab")
    );
  }

  //点击Enter键
  if (e.keycode() == 13 /*Enter*/) {
    recorder.testcase.append(
      new TestRecorder.ElementEvent(et.PressKey, e.target(), "enter")
    );
  }

  //点击Delete键
  if (e.keycode() == 46 /*Delete*/) {
    recorder.testcase.append(
      new TestRecorder.ElementEvent(et.PressKey, e.target(), "delete")
    );
  }

  return true;
}

TestRecorder.Recorder.prototype.strip = function (s) {
  return s.replace('\n', ' ').replace(/^\s*/, "").replace(/\s*$/, "");
}

TestRecorder.Recorder.prototype.log = function (text) {
  if (this.logfunc) {
    this.logfunc(text);
  }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action == "start") {
    recorder.start();
    sendResponse({});
  }
  if (request.action == "stop") {
    recorder.stop();
    sendResponse({});
  }
  if (request.action == "open") {
    recorder.open(request.url);
    sendResponse({});
  }
  if (request.action == "addComment") {
    recorder.addComment(request.text);
    sendResponse({});
  }
});

//get current status from background
chrome.runtime.sendMessage({ action: "get_status" }, function (response) {
  if (response.active) {
    recorder.start();
  }
});
