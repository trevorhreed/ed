var editor = (function(){
  var selection,
      editorElm,
      doc, iframeEl,
      commands = {
        'b':   { name: 'bold' },
        'i':   { name: 'italic' },
        'u':   { name: 'underline' },
        's':   { name: 'strikethrough' },
        'img': { name: 'insertImage' },
        'h1': {},        'h2': {},        'h3': {},        'h4': {},        'h5': {},        'h6': {},        'ul': {},        'ol': {},        'a': {},        'unlink': {},        'blockquote': {},        'indent': {},        'outdent': {},        'hr': {},        'justifyLeft': {},        'justifyCenter': {},        'justifyFull': {},        'justifyRight': {},        'removeFormat': {},        'cut': {},        'copy': {},        'paste': {},        'selectAll': {},        'undo': {},        'redo': {}
      };
  function _command(key, value){
    var command = commands[key],
        name = command.name,
        value = value || command.value || '';
    console.log(key + ' | ' + name + ' | ' + value);
    doc.execCommand(name, false, value);
    iframeEl.contentWindow.focus();
  }

  function _create(id){
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
    })
    doc.addEventListener('keypress', function(e){
      console.dir(selection.caretNode);
    })
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
