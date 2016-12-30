/*!
 * Q like jQuery JavaScript Library v0.0.1
 * https://example.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * https://jquery.org/license
 *
 * Date: 2016-12-28T14:30Z
 */
var Q = (function()
{
  "use strict";

  var Qevents = (function()
  {
    var map_el = new WeakMap();
    var Qevents = function(){};
    Qevents.prototype =
    {
      set: function(el,type,handler,options)
      {
        this.delete(el,type,handler);
        el.addEventListener(type,options['handler'],false);
        var map = map_el;
        map=map[el] || (map[el]=new Map());
        map=map[handler] || (map[handler]={});
        map[type]=options;
      },
      get: function(el,type,handler)
      {
        var map=map_el;
        return (map=map[el]) && (map=map[handler]) && map[type] || undefined;
      },
      has: function(el,type,handler)
      {
        var map=map_el;
        return (map=map[el]) && (map=map[handler]) && !!map[type] || false;
      },
      delete: function(el,type,handler)
      {
        if(this.has(el,type,handler))
        {
          el.removeEventListener(type,this.get(el,type,handler)['handler'],false);
          delete map_el[el][handler][type];
        }
      }
    };
    return new Qevents();
  })();

  var queryScopedAll = (function()
  {//source: github.com/lski/scoped-queryselectorall
    var count=0;
    return function(sel,parent)
    {
      if(!parent)
        return document.querySelectorAll(sel);
      var name='data-'+(+new Date())+'-selector-id',value=count++;
      parent.setAttribute(name,value);
      sel=parent.querySelectorAll('['+name+'="'+value+'"] '+sel);
      parent.removeAttribute(name);
      return sel;
    }
  })();

  var appendFunc = function(item)
  {//recursive append items to this
    if(item.forEach)
      item.forEach(appendFunc,this);
    else if(typeof(item) === 'string')
      this.insertAdjacentHTML('beforeend', item);
    else
      this.appendChild(item);
  };
  var appendToDocFrag = function()
  {//source: developer.mozilla.org/ru/docs/Web/API/ParentNode/append
    var items = Array.prototype.slice.call(arguments);
    var doc = document.createDocumentFragment();
    var el = document.createElement("null");
    items.forEach(appendFunc,el);
    while (el.firstChild)
      doc.appendChild(el.firstChild);
    return doc;
  };
  var handlerFunc =
  {
    defaults: {'once':false,'data':null,'handler':null,'isProcessed':true},
    get: function(type,handler,options)
    {
      if('isProcessed' in options === false)
        for(var key in this.defaults)
          {!(key in options) && (options[key]=this.defaults[key]);}
      if(handler === false)return function(event){event.preventDefault();event.stopPropagation();}
      return function(event)
      {
        options.once && Qevents.delete(this,type,handler);
        event.data=options.data;
        if(handler.apply(this,arguments) === false)
        {
          event.preventDefault();
          event.stopPropagation();
        }
      }
    }
  };



  var q=function(sel,parent)
  {
    if(!(this instanceof q))return new q(sel,parent);
    if(parent instanceof q) parent=parent.el[0];
    else if(!(parent instanceof Element)) parent=null;
    
    if(sel instanceof q) sel=sel.el;
    else if(typeof sel === 'string') sel=queryScopedAll(sel,parent);
    else if(!(sel instanceof NodeList || Array.isArray(sel)))
         { sel=sel && [sel] || []; }
    this.el=sel;
    this.each = this.el.forEach;
  };
  q.prototype = 
  {
    on: function(type, handler, options){
      options = options || {};
      options['handler']=handlerFunc.get(type,handler,options);
      this.el.forEach(function(el){Qevents.set(el,type,handler,options);});
      return this;
    },
    one: function(type, handler, options){
      options = options || {'once': true};
      return this.on(type,handler,options);
    },
    off: function(type, handler){
      this.el.forEach(function(el){Qevents.delete(el,type,handler);});
      return this;
    },

    append: function(){
      var doc = appendToDocFrag.apply(null,arguments);
      this.el.forEach(function(el){el.append(doc.cloneNode(true));});
      return this;
    },
    remove: function(sel){
      if(arguments.length===0)
        this.el.forEach(function(el){
          el.parentNode.removeChild(el);
        });
      else 
        this.el.forEach(function(el){
          new q(queryScopedAll(sel,el)).remove();
        });
    },
    


    ready: function(handler){
      return this.one('DOMContentLoaded',handler);
    },

    find: function(sel){
      return new q(queryScopedAll(sel,this.el[0]));
    }
  };

  return q;
})();

