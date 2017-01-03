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
    var map_the = new Map();//[type][handler][el]=>options
    var fn1=function(v){this.push(v);};
    var fn2=function(v){var t=this[0],r=this[1];if(t)(t=v.get(t))&&r.push(t);else v.forEach(fn1,r);};
    var Qevents = function(){};
    Qevents.prototype =
    {
      set: function(el,type,handler,options)
      {
        this.delete(el,type,handler);
        var map = map_the;
        map=map.get(type)    || map.set(type,new Map()).get(type);
        map=map.get(handler) || map.set(handler,new Map()).get(handler);
        map.set(el,options);
      },
      get: function(el,type,handler)
      {
        if(type===null || handler===null || el===null)
        {
         
  
          var res=[map_the],fn=function(t){var r=[];res.forEach(fn2,[t,r]);res=r;};
          [type,handler,el].forEach(fn);
          return res;
        }
        var map=map_the;
        return (map=map.get(type)) && (map=map.get(handler)) && map.has(el) && [map.get(el)] || [];
      },
      has: function(el,type,handler)
      {
        var map=map_the;
        return (map=map.get(type)) && (map=map.get(handler)) && !!map.get(el) || false;
      },
      delete: function(el,type,handler)
      {
        if(this.has(el,type,handler))
        {
          map_the.get(type).get(handler).delete(el);
          map_the.get(type).get(handler).size===0 && map_the.get(type).delete(handler);
          map_the.get(type).size===0 && map_the.delete(type);
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
  var eventListener =
  {
    defaultProp: {'once':false,'data':null,'handlerFn':null,'isDisabled':false, 'removeFn':null},
    defaultFn: function(){return false;},
    add: function(el,type,handler,options)
    {
      if(handler===false) handler=this.defaultFn;
      options=Object.assign(Object.assign({},this.defaultProp),options);
      options['handlerFn']=function(event)
      {
        if(options.isDisabled===true)return;
        options.once && options.removeFn();
        event.data=options.data;
        if(handler.apply(this,arguments) === false)
        {
          event.preventDefault();
          event.stopPropagation();
        }
      };
      options['removeFn']=function()
      {
        el.removeEventListener(type,options['handlerFn'],false);
        Qevents.delete(el,type,handler);
      };
      el.addEventListener(type,options['handlerFn'],false);
      Qevents.set(el,type,handler,options);
    },
    remove: function(el,type,handler)
    {
      if(handler===false) handler=this.defaultFn;
      Qevents.get(el||null,type||null,handler||null).forEach(function(options)
      {
        options.removeFn();
      });

    }
  };



  var q=function(sel,parent)
  {
    if(!(this instanceof q))return new q(sel,parent);
    if(parent instanceof q) parent=parent.el[0];
    else if(!(parent instanceof Element)) parent=null;
    
    if(sel instanceof q) sel=sel.el;
    else if(typeof sel === 'string') sel=queryScopedAll(sel,parent);
    else if(sel instanceof Object === false) sel=[];
    else if('forEach' in sel === false) sel=[sel];
    this.el=sel;
  };
  q.prototype = 
  {
    each: function(){return this.el.forEach.apply(this.el,arguments);},
    on: function(type, handler, options){
      this.each(function(el){eventListener.add(el,type,handler,options);});
      return this;
    },
    one: function(type, handler, options){
      options = options || {};
      options['once']=true;
      return this.on(type,handler,options);
    },
    off: function(type, handler){
      this.each(function(el){eventListener.remove(el,type,handler);});
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
          delete el.parentNode.removeChild(el);
          //eventListener.remove(el);
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

  q.prototype.eventListener=eventListener;//debug
  return q;
})();

