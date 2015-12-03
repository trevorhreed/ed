var ed = (function(){


  function Ed(element, options){
    this.element = element;
    this.element.innerHTML = options.value;
    this.element.classList.add('__ed_instance');

    var style = document.createElement('STYLE');
    style.innerHTML = '.__ed_instance{padding:5px;outline:none} .__ed_instance p{border:dotted 1px #aaa;outline:none}';
    document.head.appendChild(style);
  }
  Ed.prototype.on = function(event, handler, useCapture){
    if(event.toLowerCase() == 'contentupdate'){
      this.element.addEventListener('DOMSubtreeModified', function(){
        handler = typeof handler == 'function' ? handler : function(){};
        handler(this.element.innerHTML);
      }.bind(this), !!useCapture);
    }
  }
  Ed.prototype.exec = function(key, value){

  }

  function create(selector, options){
    options = options || {};
    options.value = options.value || '<p contentEditable="true"><br/></p>';
    console.log('value: ' + options.value);
    options.showBlocks = options.showBlocks || true;
    return new Ed(
      document.querySelector(selector),
      options
    );
  }

  return {
    'create': create,
  }

})();
