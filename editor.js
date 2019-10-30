/** SoraMame block is block-type code editor mock-up for tiny script.
  Copyright 2014-2015 Yutaka Kachi released under MIT license.
 */

(function() {
  var soramame = {};
  var expDialog_hundle = {}; //for Express Line Editor

  /** clearTrash =============
  <a class="trash" href="#" ondblclick="SORAMAME_BLOCK.clearTrash()"></a>
  <ol id="trash-can" class="trash-code block connect-area"></ol>
   */
  soramame.clearTrash = function() {
    if(window.confirm("Clear trash?")) {
      $("#trash-can").empty();
    }
  };

  /** Serialize and transfer from blocks to code.  =============
  */
  var getCodeBlock = function() {
    function bt(content) {
      return content
        .replace(/import/g, '\nimport')
        .replace(/;\s/g, ';\n\n')
        .replace(/`\s\./g, '`\n  .')
        .replace(/=>\s{\s/g, '=> {\n  ')
        .replace(/await\st\s\./g, 'await t\n    .')
        .replace(/\)\s\./g, ')\n    .')
        .replace(/\)\s\/\*/g, ')\n    /*')
        .replace(/\s\}\);/g, '\n});\n')
        .replace(/\nawait\st\n/g, '\n  await t\n')
    }
    var data = $('.serialize .code-body').text().trim().replace(/\s+\n/g, "").replace(/\s\s+/g, " ");
    return bt(data);
  };

  soramame.setSerializeBlock  = function() {
    var code = $('<code></code>');
    code .addClass('language-js');
    code.append(getCodeBlock());
    var pre = $('<pre></pre>');
    pre.append(code);
    $('#div-code2').empty();
    $('#div-code2').append(pre);
    Rainbow.color();
  };

  soramame.setCode  = function(codeText) {
    var code = $('<code></code>');
    code .addClass('language-js');
    code.append(codeText);
    var pre = $('<pre></pre>');
    pre.append(code);
    $('#div-code0').empty();
    $('#div-code0').append(pre);
    Rainbow.color();
  };

  String.prototype.endWith = function(str){
    if(str==null||str==""||this.length==0||str.length>this.length)
      return false;
    if(this.substring(this.length-str.length)==str)
      return true;
    else
      return false;
  }
  
  String.prototype.startWith = function(str){
    if(str==null||str==""||this.length==0||str.length>this.length)
      return false;
    if(this.substr(0,str.length)==str)
      return true;
    else
      return false;
  }

  /**
   * {}
   * @param text
   * @returns {string}
   */
  function getBraceStr(text) {
    let regex = /\{(.+?)\}/g;
    let options = text.match(regex)
    let option = options[0]
    return option.substring(1, option.length - 1);
  }

  /**
   * []
   * @param text
   * @returns {string}
   */
  function getBracketStr(text) {
    let regex = /\[(.+?)\]/g;
    let options = text.match(regex)
    let option = options[0]
    return option.substring(1, option.length - 1);
  }

  /**
  * ())
  * @param text
  * @returns {string}
  */
  function getParenthesesStr(text) {
    let regex = /\((.+?)\)\)/g;
    let options = text.match(regex)
    let option = options[0]
    return option.substring(1, option.length - 1);
  }

  /**
  * ""
  * @param text
  * @returns {string}
  */
  function getDQMStr(text) {
    let regex = /\"(.+?)\"/g;
    let options = text.match(regex)
    let option = options[0]
    return option.substring(1, option.length - 1);
  }

  /**
  * ``
  * @param text
  * @returns {string}
  */
  function getDStr(text) {
    let regex = /\`(.+?)\`/g;
    let options = text.match(regex)
    let option = options[0]
    return option.substring(1, option.length - 1);
  }

  /**
  * .(
  * @param text
  * @returns {string}
  */
  function get2Str(text) {
    let regex = /\.(.+?)\(/g;
    let options = text.match(regex)
    let option = options[0]
    return option.substring(1, option.length - 1);
  }

  var count = 1;

  function initCount() {
    count = 1;
  }

  function getCount() {
    count++;
    return count.toString();
  }

  function getBlockBody(srcSpan) {
    var blockDiv = $('<div></div>');
    blockDiv.addClass('block-body')
    blockDiv.append(srcSpan)
    return blockDiv;
  }

  function getCodeBody(srcSpan) {
    var codeDiv = $('<div></div>');
    codeDiv.addClass('code-body')
    codeDiv.append(srcSpan)
    return codeDiv;
  }

  function skipEmptyElementForArray(arr){
    var a = [];  
    $.each(arr,function(i,v){
      var data = $.trim(v);
      if('' != data){
        a.push(data);
      }
    });
    return a;
  }

  function get3Str(text) {
    var start = text.indexOf("(")
    var end = text.lastIndexOf(")")
    return text.substring(start+1, end);
  }

  function getOptionFlag(action) {
    var flag = (
      action == "click" ||
      action == "doubleClick" ||
      action == "rightClick" ||
      action == "drag" ||
      action == "hover" ||
      action == "selectText" ||
      action == "selectTextAreaContent" ||
      action == "selectEditableContent" ||
      action == "typeText" ||
      action == "pressKey" );
    return flag ? true : false;
  }

  var testcafeMap = new Map(
    [
      ['click', ['selector', 'options']],
      ['doubleClick', ['selector', 'options']],
      ['rightClick', ['selector', 'options']],
      ['drag', ['selector', 'string', 'string', 'options']],
      ['hover', ['selector', 'options']],
      ['selectText', ['selector', 'string', 'string', 'options']],
      ['selectTextAreaContent', ['selector', 'string', 'string', 'string', 'string', 'options']],
      ['selectEditableContent', ['selector', 'selector', 'options']],
      ['typeText', ['selector', 'string', 'options']],
      ['pressKey', ['string', 'options']],
      ['navigateTo', ['string']],
      ['takeScreenshot', ['options']],
      ['takeElementScreenshot', ['selector', 'string', 'options']],
      ['setFilesToUpload', ['selector', 'string']],
      ['clearUpload', ['selector']],
      ['resizeWindow', ['string', 'string']],
      ['resizeWindowToFitDevice', ['string', 'options']],
      ['maximizeWindow', []],
      ['expect', ['string']],
      ['eql', ['string', 'string', 'options']],
      ['notEql', ['string', 'string', 'options']],
      ['ok', ['string', 'options']],
      ['notOk', ['string', 'options']],
      ['contains', ['string', 'string', 'options']],
      ['notContains', ['string', 'string', 'options']],
      ['typeOf', ['string', 'string', 'options']],
      ['notTypeOf', ['string', 'string', 'options']],
      ['gt', ['string', 'string', 'options']],
      ['gte', ['string', 'string', 'options']],
      ['lt', ['string', 'string', 'options']],
      ['lte', ['string', 'string', 'options']],
      ['within', ['string', 'string', 'string', 'options']],
      ['notWithin', ['string', 'string', 'string', 'options']],
      ['match', ['string', 'string', 'options']],
      ['notMatch', ['string', 'string', 'options']]
    ]
  );

  function getSpan(para) {
    return '<span class="exp-body item' + getCount() + '">' + para + '</span>';
  }

  soramame.displayCode  = function(codeText) {
    var line = skipEmptyElementForArray(codeText.split('\n'));

    var index = 0;
    while (index < line.length) {
      var li = $('<li></li>');
      initCount();
      if (line[index].trim().startWith("import")) {
        var srcSpan = 'import {' + getSpan(getBraceStr(line[index])) +'} from "' + getSpan(getDQMStr(line[index])) + '"; ';
  
        li.addClass('import-block');
        li.append(getBlockBody(srcSpan), getCodeBody(srcSpan));
      } else if (line[index].trim().startWith("fixture")) {
        var srcSpan = 'fixture' + getSpan('') +' `' + getSpan(getDStr(line[index])) + '` ';
        var codeOl = $('<ol></ol>');

        index++;
        if (line[index].trim().startWith(".page")) {
          var srcSpan1 = '.page' + ' `' + getSpan(getDStr(line[index])) + '`';
          var li_1 = $('<li></li>');
          li_1.addClass('hooks-block');
          li_1.append(getBlockBody(srcSpan1), getCodeBody(srcSpan1));
          codeOl.append(li_1);
        } else {
          index--;
        }
  
        li.addClass('fixture-block');
        li.append(getBlockBody(srcSpan), getCodeBody(srcSpan), codeOl, getBlockBody('; '), getCodeBody('; '));
      } else if (line[index].trim().startWith("test(")) {
        var srcSpan2 = 'test' + getSpan('') + ' ("' + getSpan(getDQMStr(line[index])) +'", async t => { ';
        var codeOl_1 = $('<ol></ol>');

        index++;
        if (line[index].trim().startWith("await t")) {
          var srcSpan_1 = 'await t ';
          var codeOl_2 = $('<ol></ol>');

          index++;
          while (line[index].trim().startWith(".")) {
            var action = get2Str(line[index]);
            var para = get3Str(line[index]).split(",");
            var spanList = '';
            for (var i = 0; i < testcafeMap.get(action).length; i++) {
              var pp = para.length > i ? para[i] : '';
              spanList += getSpan( spanList != '' && pp != '' ? ',' + pp : pp);
            }
            var srcSpan3 = '.' + action + '(' + spanList + ') ';

            var li_2 = $('<li></li>');
            li_2.addClass(action + '-block');
            li_2.append(getBlockBody(srcSpan3), getCodeBody(srcSpan3));
  
            codeOl_2.append(li_2);
            index++;
          }

          var li_2 = $('<li></li>');
          li_2.addClass('await-block');
          li_2.append(getBlockBody(srcSpan_1), getCodeBody(srcSpan_1), codeOl_2, getBlockBody('; '), getCodeBody('; '));

          codeOl_1.append(li_2);
        } else {
          index--;
        }

        li.addClass('test-block');
        li.append(getBlockBody(srcSpan2), getCodeBody(srcSpan2), codeOl_1, getBlockBody('}); '), getCodeBody('}); '));
      } else {
  
      }
  
      $("#code-edit").append(li);
  
      $('span.exp-body').click(function() {
        expDialog_hundle = $(this);
        openExpDialog(expDialog_hundle.text());
      })

      index++;
    }
  };

  soramame.codeText = function() {
    return getCodeBlock();
  };

  /** Express Line Editor for TestCafe.Block =============
    Using Modal.js of bootstrap
   */
  var openExpDialog = function(expBody) {
    $('#expModalDialog').modal();
    var textArea = $('#expModalText');
    //textArea.attr("size",(expBody.length < 10)? 10 : expBody.length * 2);
    textArea.val(expBody);
  };

  $('span.exp-body').click(function() {
    expDialog_hundle = $(this);
    openExpDialog(expDialog_hundle.text());
  })

  function Doc() {
    this.body = {innerText: ""};
  }

  Doc.prototype.open = function () {
    this.body.innerText = "";
  }

  Doc.prototype.close = function () {
  }

  Doc.prototype.write = function (txt) {
    this.body.innerText += txt;
  }

  Doc.prototype.writeln = function (txt) {
    this.body.innerText += txt + "\n";
  }

  $(document).ready(function(){
    $('#code-export').click();
  });

  $('#code-export').click(function() {
    var doc = new Doc();
    var dt = new TestCafeRenderer(doc);
    chrome.runtime.sendMessage({
      action: "get_items"
    }, function (response) {
      dt.items = response.items;
      dt.render(
        function (content) {
          SORAMAME_BLOCK.setCode(content);

          $("#code-edit").empty();
          SORAMAME_BLOCK.displayCode(content);
        }
      );
    });
  })

  $('#code-block').click(function() {
  })

  $('#code-serialize').click(function() {
    SORAMAME_BLOCK.setSerializeBlock()
  })

  $('#trash').dblclick(function() {
    SORAMAME_BLOCK.clearTrash();
  })

  /** When open dialog, focus on textbox for bootstrap3 */
  $('#expModalDialog').on('shown.bs.modal', function () {
    $('#expModalText').focus();
  });

  $('#btn_ok_expModalDialog').click(function() {
    var strTextBox = $('#expModalText').val();
    expDialog_hundle.text(strTextBox);
    var itemName = expDialog_hundle.attr('class').split(" ")[1];
    expDialog_hundle.parent().next().find('span.' + itemName).text(strTextBox)
    $('#expModalDialog').modal('hide');
  });

  /** add Single Global var. */
  if (typeof window.SORAMAME_BLOCK == "undefined") {
    window.SORAMAME_BLOCK = soramame;
  }

  /** connect for TestCafe.Block and jquery-sortable =============
   */

  $('ol.pallet-code').sortable({
    group: 'connect-area',
    drop: false,
    onDragStart: function ($item, container, _super) { //2015.08.16 update for jquery sortable v0.9.13
      // Duplicate items of the no drop area
      if(!container.options.drop) {
        $item.clone(true).insertAfter($item);
      }
      _super($item, container);
    }
  });

  $('ol.block').sortable({
    group: 'connect-area',
  });

  $('ol.trash-code').sortable({
    group: 'connect-area',
  });

})()

SORAMAME_BLOCK.app = {
  msg: "Hello SoraMame Block"
};
