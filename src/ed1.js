var sally = (function(){
  return function(doc, win){
    var sel = {
      start: -1,
      end: -1,
      first: -1,
      last: -1,
      caret: -1,
      caretNode: null,
      type: null,
      set: function(node){
        var range = doc.createRange(),
            newSel = win.getSelection();
        range.selectNode(node);
        newSel.removeAllRanges();
        newSel.addRange(range);
        onSelectionChanged();
      },
      setStart: function(node, index, collapse){
        var range = doc.createRange(),
            newSel = win.getSelection();
        range.setStart(node, index);
        if(collapse) range.collapse(true);
        newSel.removeAllRanges();
        newSel.addRange(range);
        onSelectionChanged();
      },
      setEnd: function(node, index){
        var range = doc.createRange(),
            newSel = win.getSelection();
        range.setEnd(node, index);
        if(collapse) range.collapse(true);
        newSel.removeAllRanges();
        newSel.addRange(range);
        onSelectionChanged();
      }
    };

    function onSelectionChanged(){
      var current = win.getSelection(),
          range = current.getRangeAt(0);
      sel.type = current.type.toLowerCase();
      sel.range = range;
      if(sel.type == 'range'){
        sel.start = current.anchorOffset;
        sel.end = current.focusOffset;
        sel.first = Math.min(sel.start, sel.end);
        sel.last = Math.max(sel.start, sel.end);
        sel.caret = -1;
        sel.caretNode = null;
      }else {
        sel.start = sel.end = sel.first = sel.last = -1;
      }
      sel.caret = current.focusOffset;
      sel.caretNode = current.focusNode;
    }

    doc.addEventListener('mouseup', onSelectionChanged);
    doc.addEventListener('keyup', onSelectionChanged);

    return sel;
  }
})();

var ed = (function(){

  var events = ['domsubtreemodified'],
      blockElements = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE']
      commands = {
        'B':   { type: 'exec',  name: 'bold' },
        'I':   { type: 'exec',  name: 'italic' },
        'U':   { type: 'exec',  name: 'underline' },
        'S':   { type: 'exec',  name: 'strikethrough' },
        'IMG': { type: 'image', name: 'insertImage' },
        'H1':  { type: 'block', name: 'H1' },
        'H2':  { type: 'block', name: 'H2' },
        'H3':  { type: 'block', name: 'H3' },
        'H4':  { type: 'block', name: 'H4' },
        'H5':  { type: 'block', name: 'H5' },
        'H6':  { type: 'block', name: 'H6' },
        'P':   { type: 'block', name: 'P' }
      };

  function err(msg){
    console.error(msg);
  }
  function warn(msg){
    console.warn(msg);
  }

  function createIframe(){
    var iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 0;
    return iframe;
  }

  function Ed(element, value){
    this.element = element;
    this.iframe = createIframe();
    this.element.appendChild(this.iframe);
    this.iframe.contentDocument.designMode = 'on';
    this.doc = this.iframe.contentDocument;
    this.win = this.iframe.contentWindow;
    this.selection = sally(this.doc, this.win);
    this.doc.head.innerHTML = '<style>p,h1,h2,h3,h4,h5,h6,blockquote{border:dashed 1px #ddd}img{max-width:100%;}</style>';
    this.doc.body.innerHTML = value || '';
    this.doc.addEventListener('keypress', function(e){
      var inBlock = ensureTextBlockElement('P');
      if(e.which == 13 && !inBlock){
        e.preventDefault();
      }
    }.bind(this));

    function insertBlockElement(topElement, newNode, before){
      if(topElement.nodeName == 'BODY' || (!before && !topElement.nextSibling)){
        topElement.ownerDocument.body.appendChild(newNode);
      }else{
        var anchorElement = before ? topElement : topElement.nextSibling;
        topElement.parentNode.insertBefore(newNode, anchorElement);
      }
    }

    var getTopElement = function(node){
      if(!node) return this.doc.body;
      var count = 0;
      while(
        count < 100 &&
        node.nodeName != 'BODY' &&
        node.parentNode &&
        node.parentNode.nodeName != 'BODY'
      ){
        node = node.parentNode;
      }
      return node;
    }.bind(this);

    var insertImage = function (urls){
      urls = [
        'http://findicons.com/files/icons/1003/poisson/256/1_fish.png',
        'http://icons.iconarchive.com/icons/fasticon/fish-toys/256/Red-Fish-icon.png'
      ];
      var node = this.selection.caretNode,
          topElement = getTopElement(node),
          figure = document.createElement('FIGURE');
      for(var i=0; i < urls.length; i++){
        var img = document.createElement('IMG');
        img.src = urls[i];
        figure.appendChild(img);
      }
      figure.appendChild(img);
      insertBlockElement(topElement, figure, this.selection.caret == 0);
    }.bind(this);

    var replaceBlockElement = function (tagName){
      if(blockElements.indexOf(tagName) == -1){
        return err('Disallowed tag name: ' + tagName);
      }
      if(!instance.selection.caretNode){
        return warn('No node selected.');
      }
      // TODO: what if topElement is the body element?
      var index = this.selection.caret,
          node = this.selection.caretNode,
          topElement = getTopElement(node),
          newNode = document.createElement(tagName);
      newNode.innerHTML = node.innerHTML;
      node.parentNode.replaceChild(newNode, node);
      this.selection.set(newNode);
    }.bind(this);

    var ensureTextBlockElement = function (tagName){
      var node = this.selection.caretNode;
          topElement = getTopElement(node);
      if(
        topElement.nodeName == 'BODY' ||
        blockElements.indexOf(topElement.nodeName) == -1
      ){
        var newNode = document.createElement(tagName);
        newNode.innerHTML = '<br/>';
        insertBlockElement(topElement, newNode, this.selection.caret == 0);
        this.selection.setStart(newNode, 0);
        var evt = document.createEvent('Event');
        evt.initEvent('keypress', true, true);
        this.element.dispatchEvent(evt);
        console.log(e);
        return false;
      }else{
        return true;
      }
    }.bind(this);

    this.html = function(value){
      if(value !== void 0){
        this.doc.body.innerHTML = value;
      }
      return this.doc.body.innerHTML;
    }

    this.exec = function(key, value){
      var command = commands[key];
      value = value || command.value || '';
      if(command.type == 'exec'){
        this.doc.execCommand(command.name, false, value);
      }else if(command.type == 'block'){
        replaceBlockElement(this, command.name);
      }else if(command.type == 'image'){
        insertImage(this, value);
      }
      this.win.focus();
    }

    this.on = function(event, handler, useCapture){
      if(event.toLowerCase() == 'contentupdate'){
        this.doc.body.addEventListener('DOMSubtreeModified', function(){
          handler = typeof handler == 'function' ? handler : function(){};
          handler(this.doc.body.innerHTML);
        }.bind(this), !!useCapture);
        handler(this.doc.body.innerHTML);
      }
    }
  }

  function create(selector, value){
    var editorElement = document.querySelector(selector);
    return new Ed(editorElement, value);
  }

  function createAll(selector, value){
    var editorElements = document.querySelectorAll(selector);
    return editorElements.map(function(editorElement){
      return new Ed(editorElement, value);
    });
  }

  return {
    'create': create,
    'createAll': createAll
  }

})();















var tmp_storage = (function(){

  function breakBlockElement(instance, tagName){
    /*
    if(blockElements.indexOf(tagName) == -1){
      err('Disallowed tag name: ' + tagName);
    }
    var node = instance.selection.caretNode;
    console.dir(node);
    var queue = [], stack = [], html = '';
    while(node && node != instance.doc.body){
      if(node.nodeType == Node.ELEMENT_NODE){
        queue.push(node.nodeName);
      }
      node = node.parentNode;
    }
    queue.map(function(tagName){
      html += '</' + tagName + '>';
      return tagName;
    }).reverse().map(function(tagName){
      html += '<' + tagName + '>';
    });
    console.log(html);
    */
  }





















  var selection,
      editorElm,
      doc, iframeEl,
      commands = {
        'b':   { name: 'bold' },
        'i':   { name: 'italic' },
        'u':   { name: 'underline' },
        's':   { name: 'strikethrough' },
        'img': { name: 'insertImage' },
        '': {}
        //'h1': {},        'h2': {},        'h3': {},        'h4': {},        'h5': {},        'h6': {},        'ul': {},        'ol': {},        'a': {},        'unlink': {},        'blockquote': {},        'indent': {},        'outdent': {},        'hr': {},        'justifyLeft': {},        'justifyCenter': {},        'justifyFull': {},        'justifyRight': {},        'removeFormat': {},        'cut': {},        'copy': {},        'paste': {},        'selectAll': {},        'undo': {},        'redo': {}
      };
  function _command(key, value){
    var command = commands[key],
        name = command.name,
        value = value || command.value || '';
    doc.execCommand(name, false, value);
    iframeEl.contentWindow.focus();
  }

  function _create(selector){
    var editorEl = document.getElementById(id);
    editorEl.contentEditable = true;
    iframeEl = document.createElement('iframe');
    iframeEl.style.width = '100%';
    iframeEl.style.height = '100%';
    //iframeEl.style.border = '0';
    editorEl.appendChild(iframeEl);
    selection = sally(iframeEl.contentDocument, iframeEl.contentWindow);
    iframeEl.contentDocument.designMode = 'on';
    doc = iframeEl.contentDocument;
    $('<link rel="stylesheet" href="editor.css" />').appendTo(doc.head);
    doc.addEventListener('mouseup', function(e){
      $('p', doc).removeClass('active');
      $(selection.caretNode).closest('p').addClass('active');
    });
    doc.addEventListener('keyup', function(e){
      $('p', doc).removeClass('active');
      $(selection.caretNode).closest('p').addClass('active');
    });
    doc.addEventListener('keydown', function(e){
      if(e.which == 13){
        var start = selection.caret,
            end = selection.caretNode.textContent.length,
            pre = selection.caretNode.textContent.substring(0, start),
            post = selection.caretNode.textContent.substring(start, end);
        selection.caretNode.textContent = pre;
        if(!selection.caretNode.textContent) selection.caretNode.innerHTML = '<br/>';
        var p = document.createElement('P');
        p.innerText = post;
        if(!p.innerText) p.innerHTML = '<br/>';
        var currentNode = selection.caretNode.parentNode != doc.body
          ? selection.caretNode.parentNode
          : selection.caretNode;
        if(currentNode.nextSibling){
          currentNode.parentNode.insertBefore(p, currentNode.nextSibling);
        }else{
          currentNode.parentNode.appendChild(p);
        }
        selection.set(p);
        //if(p.innerHTML == '&nbsp;') p.innerHTML = '';
        e.preventDefault();
      }
    });
    doc.body.innerHTML = '<p>Hello From The wide, Wide World, People!</p>';
  }

  function _html(content){
    if(content !== void 0){
      doc.body.innerHTML = content;
    }
    return doc.body.innerHTML;
  }

  function _text(content){
    if(content !== void 0){
      doc.body.innerText = content;
    }
    return doc.body.innerText;
  }

  function _on(event, handler, useCapture){
    if(event.toLowerCase() == 'domsubtreemodified'){
      doc.body.addEventListener(event, function(){
        handler = typeof handler == 'function' ? handler : function(){};
        handler(doc.body);
      }, !!useCapture)
    }
  }

  return {
    create: _create,
    command: _command,
    html: _html,
    on: _on
  }

})();
