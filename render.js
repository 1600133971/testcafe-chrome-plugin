// ---------------------------------------------------------------------------
// TestCafeRenderer -- a class to render recorded tests to a TestCafeJS
// test format.
// ---------------------------------------------------------------------------

if (typeof (EventTypes) == "undefined") {
  EventTypes = {};
}

EventTypes.OpenUrl = 0;
EventTypes.Click = 1;
EventTypes.Change = 2;
EventTypes.Comment = 3;
EventTypes.Submit = 4;
EventTypes.CheckPageTitle = 5;
EventTypes.CheckPageLocation = 6;
EventTypes.CheckTextPresent = 7;
EventTypes.CheckValue = 8;
EventTypes.CheckValueContains = 9;
EventTypes.CheckText = 10;
EventTypes.CheckHref = 11;
EventTypes.CheckEnabled = 12;
EventTypes.CheckDisabled = 13;
EventTypes.CheckSelectValue = 14;
EventTypes.CheckSelectOptions = 15;
EventTypes.CheckImageSrc = 16;
EventTypes.PageLoad = 17;
EventTypes.ScreenShot = 18;
EventTypes.MouseDown = 19;
EventTypes.MouseUp = 20;
EventTypes.MouseDrag = 21;
EventTypes.MouseDrop = 22;
EventTypes.KeyPress = 23;
EventTypes.MouseOver = 24;
EventTypes.DoubleClick = 25;
EventTypes.RightClick = 26;
EventTypes.PressKey = 27;
EventTypes.ResizeWindow = 28;
EventTypes.MaximizeWindow = 29;
EventTypes.NavigateTo = 30;
EventTypes.Wait = 31;
EventTypes.NativeDialog = 32;
EventTypes.Debug = 33;
EventTypes.TestSpeed = 34;
EventTypes.PageLoadTimeout = 35;
EventTypes.UploadFile = 36;
EventTypes.SelectText = 37;

function TestCafeRenderer(document) {
  this.document = document;
  this.title = "Testcase";
  this.items = null;
  this.history = new Array();
  this.last_events = new Array();
  this.screen_id = 1;
  this.unamed_element_id = 1;
}

TestCafeRenderer.prototype.download = function (fileName, content) {
  function bt(content) {
    return content
    .replace(/;\s/g, ';\n\n')
    .replace(/`\s\./g, '`\n  .')
    .replace(/=>\s{\s/g, '=> {\n  ')
    .replace(/await\st\s\./g, 'await t\n    .')
    .replace(/\)\s\./g, ')\n    .')
    .replace(/\)\s\/\*/g, ')\n    /*')
    .replace(/\s\}\);/g, '\n});');
  }
  var inst = document.createElement("a"),
    blob = new Blob([bt(content)], {
      "type": "text/javascript"
    }),
    evt = document.createEvent("HTMLEvents");
  document.body.innerText = "";
  evt.initEvent("click", false, false);
  inst.download = fileName || "TestCafeJS.test.js";
  inst.href = URL.createObjectURL(blob);
  inst.dispatchEvent(evt);
  inst.click();
  setTimeout(function () {
    window.close();
  }, 300);
}

TestCafeRenderer.prototype.text = function (txt) {
  this.document.writeln(txt);
}

TestCafeRenderer.prototype.stmt = function (text, indent) {
  if (indent == undefined) {
    indent = 1;
  }
  var output = (new Array(2 * indent)).fill(" ").join("") + text;
  this.document.writeln(output);
}

TestCafeRenderer.prototype.cont = function (text) {
  this.document.writeln("    ... " + text);
}

TestCafeRenderer.prototype.pyout = function (text) {
  this.document.writeln("    " + text);
}

TestCafeRenderer.prototype.pyrepr = function (text, escape) {
  // todo: handle non--strings & quoting
  // There should a more eloquent way of doing this but by
  // doing the escaping before adding the string quotes prevents
  // the string quotes from accidentally getting escaped creating
  // a syntax error in the output code.
  var s = text;
  if (escape) {
    s = s.replace(/(['"])/g, "\\$1");
  }
  var s = "'" + s + "'";
  return s;
}

TestCafeRenderer.prototype.space = function () {
  this.document.write("\n");
}

TestCafeRenderer.prototype.regexp_escape = function (text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s\/]/g, "\\$&");
};

TestCafeRenderer.prototype.cleanStringForXpath = function (str, escape) {
  var parts = str.match(/[^'"]+|['"]/g);
  parts = parts.map(function (part) {
    if (part === "'") {
      return '"\'"'; // output "'"
    }

    if (part === '"') {
      return "'\"'"; // output '"'
    }
    return "'" + part + "'";
  });
  var xpath = '';
  if (parts.length > 1) {
    xpath = "concat(" + parts.join(",") + ")";
  } else {
    xpath = parts[0];
  }
  if (escape) xpath = xpath.replace(/(["])/g, "\\$1");
  return xpath;
}

var d = {};
d[EventTypes.OpenUrl] = "openUrl";
d[EventTypes.Click] = "click";
d[EventTypes.Change] = "change";
d[EventTypes.Comment] = "comment";
d[EventTypes.Submit] = "submit";
d[EventTypes.CheckPageTitle] = "checkPageTitle";
d[EventTypes.CheckPageLocation] = "checkPageLocation";
d[EventTypes.CheckTextPresent] = "checkTextPresent";
d[EventTypes.CheckValue] = "checkValue";
d[EventTypes.CheckText] = "checkText";
d[EventTypes.CheckHref] = "checkHref";
d[EventTypes.CheckEnabled] = "checkEnabled";
d[EventTypes.CheckDisabled] = "checkDisabled";
d[EventTypes.CheckSelectValue] = "checkSelectValue";
d[EventTypes.CheckSelectOptions] = "checkSelectOptions";
d[EventTypes.CheckImageSrc] = "checkImageSrc";
d[EventTypes.PageLoad] = "pageLoad";
d[EventTypes.ScreenShot] = "screenShot";
/*d[EventTypes.MouseDown] = "mousedown";
d[EventTypes.MouseUp] = "mouseup"; */
d[EventTypes.MouseDrag] = "mousedrag";
d[EventTypes.KeyPress] = "keypress";
d[EventTypes.MouseOver] = "mouseover";
d[EventTypes.DoubleClick] = "doubleclick";
d[EventTypes.RightClick] = "rightclick";
d[EventTypes.PressKey] = "presskey";
d[EventTypes.ResizeWindow] = "resizeWindow";
d[EventTypes.MaximizeWindow] = "maximizeWindow";
d[EventTypes.NavigateTo] = "navigateTo";
d[EventTypes.Wait] = "wait";
d[EventTypes.NativeDialog] = "nativeDialog";
d[EventTypes.Debug] = "debug";
d[EventTypes.TestSpeed] = "testSpeed";
d[EventTypes.PageLoadTimeout] = "pageLoadTimeout";
d[EventTypes.UploadFile] = "uploadFile";
d[EventTypes.SelectText] = "selectText";

TestCafeRenderer.prototype.dispatch = d;

var cc = EventTypes;

TestCafeRenderer.prototype.render = function (download) {
  var etypes = EventTypes;
  this.document.open();
  if (!download) {
    this.document.write('<pre>');
    this.document.write('<code class="language-js">');
  }
  this.writeHeader(download);
  var last_down = null;
  var forget_click = false;

  for (var i = 0; i < this.items.length; i++) {
    var item = this.items[i];
    if (item.type == etypes.Comment) {
      this.space();
    }

    if (i == 0) {
      if (item.type != etypes.OpenUrl) {
        this.text("ERROR: the recorded sequence does not start with a url openning.");
      } else {
        this.startUrl(item);
        continue;
      }
    }

    // remember last MouseDown to identify drag
    if (item.type == etypes.MouseDown) {
      last_down = this.items[i];
      continue;
    }
    if (item.type == etypes.MouseUp && last_down) {
      if (Math.abs(last_down.x - item.x) < 5 && Math.abs(last_down.y - item.y) < 5) {
        //MouseDown //MouseUp<- //Click //MouseDown //MouseUp<- //Click //DoubleClick
        if ((this.items[i + 5] && this.items[i + 5].type == etypes.DoubleClick && this.items[i + 5].x == item.x && this.items[i + 5].y == item.y) ||
          (this.items[i + 2] && this.items[i + 2].type == etypes.DoubleClick && this.items[i + 2].x == item.x && this.items[i + 2].y == item.y)) {
          //DoubleClick情况，过滤本次MouseDown/MouseUp，同时滤过接下来一个Click
        }
        //MouseDown //MouseUp<- //Click //Click //Change //MouseDown //MouseUp<- //Click //Click //Change //DoubleClick[特殊场景：点击checkbox的关联label，会激发checkbox的click,数值改变激活Change]
        else if ((this.items[i + 9] && this.items[i + 9].type == etypes.DoubleClick && this.items[i + 9].x == item.x && this.items[i + 9].y == item.y) ||
          (this.items[i + 4] && this.items[i + 4].type == etypes.DoubleClick && this.items[i + 4].x == item.x && this.items[i + 4].y == item.y)) {
          //DoubleClick情况，过滤本次MouseDown/MouseUp，同时滤过接下来一个Click
        }
        //MouseDown //MouseUp<- //RightClick
        else if (this.items[i + 1] && this.items[i + 1].type == etypes.RightClick && this.items[i + 1].x == item.x && this.items[i + 1].y == item.y) {
          //RightClick情况，过滤本次MouseDown/MouseUp，同时滤过接下来一个Click
        } else {
          //Click情况，根据本次MouseDown/MouseUp构建Click，同时滤过接下来一个Click
          this[this.dispatch[etypes.Click]](item);
        }
      } else {
        item.before = last_down;
        this[this.dispatch[etypes.MouseDrag]](item);
      }
      last_down = null;
      forget_click = true;
      continue;
    }
    if (item.type == etypes.Click && forget_click) {
      forget_click = false;
      continue;
    }

    //[场景]checkbox点击label,序列：//MouseDown //MouseUp //Click[上述算法消除] //Click[本算法跳过]
    if (i > 0 && item.type == etypes.Click &&
      (this.items[i - 1].type && this.items[i - 1].type == etypes.Click && this.items[i - 1].x == item.x && this.items[i - 1].y == item.y)) {
      continue;
    }

    // we do not want click due to user checking actions
    if (i > 0 && item.type == etypes.Click &&
      ((this.items[i - 1].type >= etypes.CheckPageTitle && this.items[i - 1].type <= etypes.CheckImageSrc) || this.items[i - 1].type == etypes.ScreenShot)) {
      continue;
    }

    if (this.dispatch[item.type]) {
      this[this.dispatch[item.type]](item);
    }
    if (item.type == etypes.Comment)
      this.space();
  }
  this.writeFooter();
  if (!download) {
    this.document.write('</code>');
    this.document.write('</pre>');
    this.document.writeln('<link rel="stylesheet" href="js/rainbow/monokai.css">');
    this.document.writeln('<link rel="stylesheet" href="js/rainbow/testcafe.css">');
    this.document.writeln('<script src="js/rainbow/rainbow.min.js"></script>');
    this.document.writeln('<script src="js/rainbow/rainbow.linenumbers.min.js"></script>');
    this.document.writeln('<script src="js/rainbow/generic.js"></script>');
    this.document.writeln('<script src="js/rainbow/javascript.js"></script>');
    this.document.writeln('<script src="js/rainbow/testcafe.js"></script>');
  }
  download && download(this.document.body.innerText);
  this.document.close();
}

TestCafeRenderer.prototype.writeHeader = function (download) {
  var date = new Date();
  if (!download) {
    this.space();
    this.text('//==============================================================================', 0);
    this.text('// TestCafe generated ' + date + ' ', 0);
    this.text('//==============================================================================', 0);
    this.space();
  }
  this.stmt('import { Selector, t, ClientFunction } from "testcafe";', 0);
  this.space();
  this.stmt('fixture `fixture demo`', 0);
}

TestCafeRenderer.prototype.writeFooter = function () {
  this.space();
  this.stmt("});", 0);
}

TestCafeRenderer.prototype.rewriteUrl = function (url) {
  return url;
}

TestCafeRenderer.prototype.shortUrl = function (url) {
  return url.substr(url.indexOf('/', 10), 999999999);
}

TestCafeRenderer.prototype.startUrl = function (item) {
  var url = this.rewriteUrl(item.url);
  this.stmt('.page `' + url + '`;', 1);
  this.space();
  this.stmt('test("TestCafeJS test", async t => {', 0);
  this.stmt('await t', 1);
}

TestCafeRenderer.prototype.openUrl = function (item) {
  var url = this.rewriteUrl(item.url);
  var history = this.history;
  // if the user apparently hit the back button, render the event as such
  if (url == history[history.length - 2]) {
    history.pop();
    history.pop();
  }

  this.stmt(".navigateTo(" + url + ")", 2);
}

TestCafeRenderer.prototype.pageLoad = function (item) {
  var url = this.pyrepr(this.rewriteUrl(item.url));
  this.history.push(url);
}

TestCafeRenderer.prototype.normalizeWhitespace = function (s) {
  return s.replace(/^\s*/, '').replace(/\s*$/, '').replace(/\s+/g, ' ');
}

TestCafeRenderer.prototype.nonEmpty = function (item) {
  return item && item != "";
}

TestCafeRenderer.prototype.getControl = function (item) {
  var type = item.info.type;
  var tag = item.info.tagName.toLowerCase();
  var selector;
  if (this.nonEmpty(item.info.id)) {
    selector = tag + '#' + item.info.id;
  } else if (this.nonEmpty(item.info.path)) {
    selector = item.info.path;
  } else if ((type == "submit" || type == "button") && this.nonEmpty(item.info.value)) {
    selector = tag + '[type=' + type + '][value=' + this.pyrepr(item.info.value) + ']';
  } else if (this.nonEmpty(item.info.name)) {
    selector = tag + '[name=' + this.pyrepr(item.info.name) + ']';
  } else {
    selector = item.info.selector;
  }
  return selector;
}

TestCafeRenderer.prototype.getSelector = function (item) {
  var type = item.info.type;
  var tag = item.info.tagName.toLowerCase();
  if (this.nonEmpty(item.info.id)) {
    return 'Selector("' + tag + '#' + item.info.id + '")';
  } else if ((type == "button" || type == "submit" || tag == "button" || tag == "i") && this.nonEmpty(item.info.path) && this.nonEmpty(item.info.textContent)) {
    return 'Selector("' + item.info.path + '").withExactText("' + item.info.textContent + '")';
  } else if (this.nonEmpty(item.info.path)) {
    return 'Selector("' + item.info.path + '")';
  } else if (this.nonEmpty(item.info.name)) {
    return 'Selector("' + tag + '[name="' + item.info.name + '"]' + '")';
  } else {
    return 'Selector("' + item.info.selector + '")';
  }
}

TestCafeRenderer.prototype.mousedrag = function (item) {
  var selector = '"' + this.getControl(item) + '"';
  var dragOffsetX = item.x - item.before.x;
  var dragOffsetY = item.y - item.before.y;
  this.stmt('.drag(Selector(' + selector + '), ' + dragOffsetX.toString() + ', ' + dragOffsetY.toString() + ')', 2);
}

TestCafeRenderer.prototype.click = function (item) {
  //var selector = '"' + this.getControl(item) + '"';
  //this.stmt('.click(Selector(' + selector + '))', 2);
  this.stmt('.click(' + this.getSelector(item) + ')', 2);
}

TestCafeRenderer.prototype.doubleclick = function (item) {
  //var selector = '"' + this.getControl(item) + '"';
  //this.stmt('.doubleClick(Selector(' + selector + '))', 2);
  this.stmt('.doubleClick(' + this.getSelector(item) + ')', 2);
}

TestCafeRenderer.prototype.rightclick = function (item) {
  //var selector = '"' + this.getControl(item) + '"';
  //this.stmt('.rightClick(Selector(' + selector + '))', 2);
  this.stmt('.rightClick(' + this.getSelector(item) + ')', 2);
}

TestCafeRenderer.prototype.presskey = function (item) {
  this.stmt('.pressKey("' + item.text + '")', 2);
}

TestCafeRenderer.prototype.resizeWindow = function (item) {
  this.stmt('.resizeWindow(' + item.text + ')', 2);
}

TestCafeRenderer.prototype.maximizeWindow = function (item) {
  this.stmt('.maximizeWindow()', 2);
}

TestCafeRenderer.prototype.navigateTo = function (item) {
  this.stmt('.navigateTo("' + item.text + '")', 2);
}

TestCafeRenderer.prototype.wait = function (item) {
  this.stmt('.wait(' + item.text + ')', 2);
}

TestCafeRenderer.prototype.nativeDialog = function (item) {
  this.stmt('.setNativeDialogHandler(() => true)', 2);
}

TestCafeRenderer.prototype.debug = function (item) {
  this.stmt('.debug()', 2);
}

TestCafeRenderer.prototype.testSpeed = function (item) {
  this.stmt('.setTestSpeed(' + item.text + ')', 2);
}

TestCafeRenderer.prototype.pageLoadTimeout = function (item) {
  this.stmt('.setPageLoadTimeout(' + item.text + ')', 2);
}

TestCafeRenderer.prototype.uploadFile = function (item) {
  //在change处理，因为只有change才能上报真正变化的文本
}

TestCafeRenderer.prototype.selectText = function (item) {
  this.stmt('.selectText(' + this.getSelector(item) + ', ' + item.info.selectionStart.toString() + ',' + item.info.selectionEnd.toString() + ')', 2);
}

TestCafeRenderer.prototype.change = function (item) {
  var tag = item.info.tagName.toLowerCase();
  var selector = '"' + this.getControl(item) + '"';

  //点击后选择option
  if (tag == 'select' && item.info.type == 'select-one') {
    this.stmt('.click(Selector(' + selector + ').find("option").withExactText("' + item.info.selectedText + '"))', 2);
  }

  //点击后选择text
  if (tag == 'input' && (item.info.type == 'text' || item.info.type == 'textarea')) {
    this.stmt('.typeText(Selector(' + selector + '), "' + item.info.value + '")', 2);
  }

  //点击后触发upload
  if (tag == 'input' && item.info.type == 'file' && item.info.value != "") {
    this.stmt('.setFilesToUpload(Selector(' + selector + '), "' + item.info.value.replace(/\\/g, "/") + '")', 2);
  }
}

TestCafeRenderer.prototype.mouseover = function (item) {
  var selector = '"' + this.getControl(item) + '"';
  this.stmt('.hover(Selector(' + selector + '))', 2);
}

TestCafeRenderer.prototype.keypress = function (item) {
  var text = item.text.replace('\n', '').replace('\r', '');
  if (text && text !== "") {
    this.stmt('.typeText(Selector("' + this.getControl(item) + '"), "' + text + '")', 2);
  }
}

TestCafeRenderer.prototype.submit = function (item) {
  this.stmt("/* submit form */", 2);
}

TestCafeRenderer.prototype.screenShot = function (item) {
  this.stmt('.takeScreenshot("screenshot' + this.screen_id + '.png")', 2);
  this.screen_id = this.screen_id + 1;
}

TestCafeRenderer.prototype.comment = function (item) {
  var lines = item.text.split('\n');
  this.stmt('/*', 2);
  for (var i = 0; i < lines.length; i++) {
    this.stmt(lines[i], 4);
  }
  this.stmt('*/', 2);
}

TestCafeRenderer.prototype.checkPageTitle = function (item) {
  this.stmt('.expect(Selector("head > title").textContent)', 2);
  this.stmt('.eql("' + item.title + '")', 2);
}

TestCafeRenderer.prototype.checkPageLocation = function (item) {
  this.stmt('.expect("' + item.url + '")', 2);
  this.stmt('.notEql("")', 2);
  this.stmt('.expect(ClientFunction(() => document.location.href.toString())())', 2);
  this.stmt('.match(/^'+ this.regexp_escape(item.url) +'$/)', 2);
}

TestCafeRenderer.prototype.checkTextPresent = function (item) {
  this.stmt('.expect(Selector("' + this.getControl(item) + '").textContent)', 2);
  this.stmt('.notEql("")', 2);
}

TestCafeRenderer.prototype.checkValue = function (item) {
  var type = item.info.type;
  if (type == 'checkbox' || type == 'radio') {
    if (item.info.checked) {
      this.stmt('.expect(Selector("' + this.getControl(item) + '").checked)', 2);
      this.stmt('.ok()', 2);
    } else {
      this.stmt('.expect(Selector("' + this.getControl(item) + '").checked)', 2);
      this.stmt('.notOk()', 2);
    }
  } else {
    this.stmt('.expect(await Selector("' + this.getControl(item) + '").getAttribute("value"))', 2);
    this.stmt('.eql("' + item.info.value + '")', 2);
  }
}

TestCafeRenderer.prototype.checkText = function (item) {
  if (item.text.indexOf('\n') >= 0) {
    alert("no support for multilines!");
  } else {
    this.stmt('.expect(Selector("' + this.getControl(item) + '").textContent)', 2);
    this.stmt('.eql("' + item.text + '")', 2);
  }
}

TestCafeRenderer.prototype.checkHref = function (item) {
  this.stmt('.expect(await Selector("' + this.getControl(item) + '").hasAttribute("href"))', 2);
  this.stmt('.ok()', 2);
  this.stmt('.expect(await Selector("' + this.getControl(item) + '").getAttribute("href"))', 2);
  this.stmt('.eql("' + item.info.href + '")', 2);
}

TestCafeRenderer.prototype.checkEnabled = function (item) {
  this.stmt('.expect(await Selector("' + this.getControl(item) + '").hasAttribute("disabled"))', 2);
  this.stmt('.notOk()', 2);
  this.stmt('.expect("' + this.getControl(item) + '")', 2);
  this.stmt('.notContains("disabled")', 2);
}

TestCafeRenderer.prototype.checkDisabled = function (item) {
  this.stmt('.expect(await Selector("' + this.getControl(item) + '").hasAttribute("disabled"))', 2);
  this.stmt('.ok()', 2);
  this.stmt('.expect(await Selector("' + this.getControl(item) + '").getAttribute("disabled"))', 2);
  this.stmt('.eql("disabled")', 2);
  this.stmt('.expect("' + this.getControl(item) + '")', 2);
  this.stmt('.contains("disabled")', 2);
}

TestCafeRenderer.prototype.checkSelectValue = function (item) {
  this.stmt('.expect(await Selector("' + this.getControl(item) + '").find("option").withExactText("' + item.info.value + '").exists)', 2);
  this.stmt('.ok()', 2);
}

TestCafeRenderer.prototype.checkSelectOptions = function (item) {
  this.stmt('.expect(Selector("' + this.getControl(item) + '").find("option").withExactText("' + item.info.value + '").selected)', 2);
  this.stmt('.ok()', 2);
  this.stmt('.expect(Selector("' + this.getControl(item) + '").childElementCount)', 2);
  this.stmt('.notEql(0)', 2);
}

TestCafeRenderer.prototype.checkImageSrc = function (item) {
  this.stmt('.expect(await Selector("' + this.getControl(item) + '").hasAttribute("src"))', 2);
  this.stmt('.ok()', 2);
  this.stmt('.expect(await Selector("' + this.getControl(item) + '").getAttribute("src"))', 2);
  this.stmt('.notEql("")', 2);
}
