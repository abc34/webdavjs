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

    //MapTree
    var TreeMap=(function()
    {
      var vKey=Object.create(null);//value key
      var aKey=Object.create(null);//all selector key
      var fn0=function(t){var map=this.map;this.map=map&&map.get(t)||map.set(t,new Map()).get(t);};
      var fn1=function(key){if(key===aKey)return false;this.map=this.map.get(key)||null;return this.map&&true||false;};
      var fn2=function(t,key){if(Object.is(key,vKey))this.r.push(t);else t.forEach(fn2,this);};
      var fn3=function(key){if(key===aKey)return false;this.r.push(this.map);this.map=this.map.get(key)||null;return this.map&&true||false;};
      function TreeMap(){if(this instanceof TreeMap)this.init();else return new TreeMap();};
      TreeMap.ALL=aKey;//all selector key (like '*')
      TreeMap.prototype=
      {
        map: null,
        init: function(){this.map=new Map();},
        set: function(keys,value)
        {
          if(!Array.isArray(keys)||keys.length===0)return this;
          var arg={'map':this.map};
          keys.forEach(fn0,arg);
          arg.map.set(vKey,value);
          return this;
        },
        get: function(keys)
        {
          if(!Array.isArray(keys)||keys.length===0)return[];
          var arg={'map':this.map,'r':[],'m':[]};
          keys.every(fn1,arg);
          arg.map&&fn2.call(arg,arg.map);
          return arg.r;
        },
        has: function(keys)
        {
          if(!Array.isArray(keys)||keys.length===0)return false;
          var arg={'map':this.map};
          keys.every(fn1,arg);
          return arg.map&&true||false;
        },
        delete: function(keys)
        {
          if(!Array.isArray(keys)||keys.length===0)return false;
          var arg={'map':this.map,'r':[]};
          keys.every(fn3,arg);
          arg.map&&arg.map.clear();
          for(var r=arg.r,i=r.length-1;i>=0;i--){r[i].delete(keys[i]);if(r[i].size!==0)break;}
          return true;
        },
        hasValue: function(keys)
        {
          if(!Array.isArray(keys)||keys.length===0)return false;
          var arg={'map':this.map};
          keys.every(fn1,arg);
          return arg.map&&arg.map.has(vKey)||false;
        },
        getValue: function(keys)
        {
          if(!Array.isArray(keys)||keys.length===0)return;
          var arg={'map':this.map};
          keys.every(fn1,arg);
          if(arg.map===null)return;
          return arg.map.get(vKey);
        }
      };
      return TreeMap;
    })();



//*
    var r, map=new TreeMap();
    map.set(['a'],['a']);
    map.set(['a','b'],['b']);
    //map.set(['a','b1'],['b1']);
    map.set(['a','b','c'],['c']);
    map.set(['a','b','c1'],['c1']);
    debugger;
    r=map.get([TreeMap.ALL]);
    r=map.getValue(['a']);
    r=map.getValue(['a','b']);
    r=map.getValue(['a','c']);
    r=map.getValue([TreeMap.ALL]);
    r=map.hasValue(['a','b']);
    r=map.hasValue(['a','b','c2']);
    r=map.has(['a','b','c1']);
    r=map.has(['a','b','c2']);
    r=map.has(['a']);
    r=map.has([TreeMap.ALL]);
    map.delete(['a','b']);
    console.log(map);
//*/
    return;

  //set: function(el,type,handler,options)
  var Qevents = new TreeMap();
    







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
    defaultProp: {'once':false,'data':null,'handlerFn':null,'isDisabled':false,'removeFn':null},
    defaultFn: function(){return false;},
    removeFn: function(options){options.removeFn();},
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
        Qevents.delete([type,handler,el]);
      };
      el.addEventListener(type,options['handlerFn'],false);
      Qevents.set([type,handler,el],options);
    },
    remove: function(el,type,handler)
    {
      if(handler===false) handler=this.defaultFn;
      Qevents.get([type||TreeMap.ALL,handler||TreeMap.ALL,el||TreeMap.ALL]).forEach(this.removeFn);
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

