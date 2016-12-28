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
  var Qevents=function(){};
  Qevents.prototype =
  {
    map: new WeakMap(),
    set: function(el,event,handler,options,data)
    {
      var opt = {'el': el, 'type': event, 'handler': handler, 'options': options, 'data':data};
      this.has(el,event,handler,options) && this.delete(el,event,handler,options);
      el.addEventListener(event,handler,options);
      //if(options.once)return;
      var map_ev = this.map.has(el)?this.map.get(el):new Map();
      var map_ha = map_ev.has(event)?map_ev.get(event):new Map();
      var map_op = map_ha.has(handler)?map_ha.get(handler):new Map();
      map_op.set('1'+options.capture+'2'+options.once,opt);
      map_ha.set(handler,map_op);
      map_ev.set(event,map_ha);
      this.map.set(el,map_ev);
    },
    get: function(el,event,handler,options)
    {
      var map = this.map.get(el); if(!map) return undefined;
          map = this.map.get(event); if(!map) return undefined;
          map = this.map.get(handler); if(!map) return undefined;
      return map.get('1'+options.capture+'2'+options.once);
    },
    has: function(el,event,handler,options)
    {
      var map = this.map.get(el); if(!map) return false;
          map = this.map.get(event); if(!map) return false;
          map = this.map.get(handler); if(!map) return false;
      return map.has('1'+options.capture+'2'+options.once);
    },
    delete: function(el,event,handler,options)
    {
      var map_ev = this.map.get(el); if(!map_ev) return;
      var map_ha = map_ev.get(event); if(!map_ha) return;
      var map_op = map_ha.get(handler); if(!map_op) return;
      var opt = map_op.get('1'+options.capture+'2'+options.once);
      el.removeEventListener(opt.type,opt.handler,opt.options);
      map_op.delete('1'+options.capture+'2'+options.once);
      map_op.size===0 && map_ha.delete(handler);
      map_ha.size===0 && map_ev.delete(event);
      map_ev.size===0 && this.map.delete(el);
    }
  };
  Qevents=new Qevents();

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
    var span = document.createElement("span");
    items.forEach(appendFunc,span);
    while (span.firstChild)
      doc.appendChild(span.firstChild);
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
         if(sel) sel=[sel]; else sel=[null];
    this.el=sel;
  };
  q.prototype = 
  {
    on: function(event, handler, data){
      this.el.forEach(function(el){Qevents.set(el,event,handler,{capture:false, once:false},data);});
    },
    once: function(event, handler, data){
      this.el.forEach(function(el){Qevents.set(el,event,handler,{capture:false, once:true},data);});
    },
    off: function(event, handler, data){
      this.el.forEach(function(el){Qevents.delete(el,event,handler,{capture:false, once:false},data);});
    },

    append: function(){
      var doc = appendToDocFrag.apply(null,arguments);
      this.el.forEach(function(el){el.append(doc.cloneNode(true));});
    },
    //remove: function(sel){
    //  this.on('DOMContentLoaded',handler,null);
    //},
    


    ready: function(handler){
      this.on('DOMContentLoaded',handler,null);
    },

    find: function(sel){
      return new q(queryScoped(sel,this.el[0]));
    }
  };

  return q;

})();

