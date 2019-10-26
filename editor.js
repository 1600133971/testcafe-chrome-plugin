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
      .replace(/;\s/g, ';\n\n')
      .replace(/`\s\./g, '`\n  .')
      .replace(/=>\s{\s/g, '=> {\n  ')
      .replace(/await\st\s\./g, 'await t\n    .')
      .replace(/\)\s\./g, ')\n    .')
      .replace(/\)\s\/\*/g, ')\n    /*')
      .replace(/\s\}\);/g, '\n});');
    }
    var data = $('.serialize .code-body').text().trim().replace(/\s+\n/g, "").replace(/\s\s+/g, " ");
    return bt(data);
  };

  soramame.setSerializeBlock  = function() {
    var codeText = getCodeBlock();
    $("pre code").text(codeText);

    $('pre code').each(function(i, block) {
      hljs.highlightBlock(block);
    });
  };

  soramame.setCode  = function(codeText) {
    $("pre code").text(codeText);
    $('pre code').each(function(i, block) {
      hljs.highlightBlock(block);
    });
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
    textArea.attr("size",(expBody.length < 10)? 10 : expBody.length * 2);
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
      dt.render(false,
        function (content) {
          SORAMAME_BLOCK.setCode(content);
        }
      );
    });
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
