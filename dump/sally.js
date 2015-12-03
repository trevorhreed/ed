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
      set: function(node, index){
        var range = doc.createRange(),
            sel = win.getSelection();
        range.selectNodeContents(node, index || 0);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    };

    function onSelectionChanged(){
      var current = win.getSelection(),
          range = current.getRangeAt(0);
      sel.type = current.type.toLowerCase();
      if(sel.type == 'range'){
        sel.start = current.anchorOffset;
        sel.end = current.focusOffset;
        sel.first = Math.min(sel.start, sel.end);
        sel.last = Math.max(sel.start, sel.end);
        sel.caret = -1;
      }else {
        sel.start = sel.end = sel.first = sel.last = -1;
        sel.caret = current.focusOffset;
        sel.caretNode = current.focusNode;
      }
    }

    doc.addEventListener('mouseup', onSelectionChanged);
    doc.addEventListener('keyup', onSelectionChanged);

    return sel;
  }
})();

var ed = (function(){

})();
