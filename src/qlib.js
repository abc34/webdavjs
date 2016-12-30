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
        var map, eventHandler = (function(me){
            if(handler===false) return function(){return false;};
            return function(event)
            {
              options.once && me.delete(el,type,handler);
              event.data=options.data;
              return handler.apply(this,arguments);
            };})(this);
        options['handler'] = eventHandler;
        this.delete(el,type,handler);
        el.addEventListener(type,eventHandler,false);
        map = map_el;
        map=map[el] || (map[el]=new Map());
        map=map[handler] || (map[handler]={});
        map[type]=options;
      },
      get: function(el,type,handler)
      {
        var map = map_el[el]; map = map && map[handler];
        return map && map[type];
      },
      has: function(el,type,handler)
      {
        var map = map_el[el]; map = map && map[handler];
        return !!map && !!map[type];
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

  var queryScoped = (function()
  {//source: github.com/lski/scoped-queryselectorall
    var count=0;
    return function(sel,parent)
    {
      if(parent===null)
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



  var q=function(sel,parent)
  {
    if(!(this instanceof q))return new q(sel,parent);
    if(parent instanceof q) parent=parent.el[0];
    else if(!(parent instanceof Element)) parent=null;
    
    if(sel instanceof q) sel=sel.el;
    else if(typeof sel === 'string') sel=queryScoped(sel,parent);
    else if(!(sel instanceof NodeList || Array.isArray(sel)))
         if(sel) sel=[sel]; else sel=[];
    this.el=sel;
    this.each = this.el.forEach;
  };
  q.prototype = 
  {
    on: function(type, handler, data){
      this.el.forEach(function(el){Qevents.set(el,type,handler,{capture:false, once:false, data:data});});
      return this;
    },
    one: function(type, handler, data){
      this.el.forEach(function(el){Qevents.set(el,type,handler,{capture:false, once:true, data:data});});
      return this;
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
    //remove: function(sel){
    //  this.on('DOMContentLoaded',handler,null);
    //},
    


    ready: function(handler){
      this.once('DOMContentLoaded',handler);
      return this;
    },

    find: function(sel){
      return new q(queryScoped(sel,this.el[0]));
    }
  };

  return q;

})();

