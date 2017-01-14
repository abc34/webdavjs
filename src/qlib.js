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
      var vKey=Object.create(null);//value selector key
      var aKey=Object.create(null);//all selector key
      var fn0=function(key){var map=this.map,t=map&&map.get(key)||map.set(key,new Map()).get(key);t._parent=this.map;t._key=key;this.map=t;};
      var fn1=function(key){
        var m=[],t;
        if(Object.is(key,aKey))
          for(t in this.map)
            (t=this.map[t])&&t.forEach(fn2,m);
        else
          for(t in this.map)
            (t=this.map[t])&&t.has(key)&&m.push(t.get(key));
        this.map=m;
        return m.length>0;
      };
      var fn2=function(t,key){if(Object.is(key,vKey)===false)this.push(t);};
      var fn3=function(t,key){if(Object.is(key,vKey))this.push(t);else t.forEach(fn3,this);};
      var fn4=function(t){t.clear();while(t.size===0&&t._parent){t._parent.delete(t._key);t=t._parent;}};
      function TreeMap(){if(this instanceof TreeMap)this.init();else return new TreeMap();};
      TreeMap.ALL=aKey;//all selector (like '*')
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
          var arg={'map':[this.map]},r=[];
          if(keys.every(fn1,arg))
            arg.map.forEach(fn3,r);
          return r;
        },
        has: function(keys)
        {
          if(!Array.isArray(keys)||keys.length===0)return false;
          var arg={'map':[this.map]};
          return keys.every(fn1,arg);
        },
        delete: function(keys)
        {
          if(!Array.isArray(keys)||keys.length===0)return[];
          var arg={'map':[this.map]};
          if(keys.every(fn1,arg))
            arg.map.forEach(fn4);
          return true;
        },
        hasValue: function(keys)
        {
          if(!Array.isArray(keys)||keys.length===0)return false;
          var arg={'map':[this.map]};
          return keys.every(fn1,arg)&&arg.map[0].has(vKey);
        },
        getValue: function(keys)
        {
          if(!Array.isArray(keys)||keys.length===0)return;
          var arg={'map':[this.map]};
          if(keys.every(fn1,arg))
            return arg.map[0].get(vKey);
        }
      };
      return TreeMap;
    })();



/*
    var r, map=new TreeMap();
    map.set(['a'],['a']);
    //map.set(['a','b'],['b']);
    //map.set(['a','b1'],['b1']);
    map.set(['a','b','c'],['c']);
    map.set(['a','b','c1'],['c1']);
    map.set(['a','c','c1'],['cc1']);
    map.set(['b','c','c2'],['cc2']);
    debugger;
    r=map.get(['a']);
    r=map.get(['a','b']);
    r=map.get(['a',TreeMap.ALL]);
    r=map.get([TreeMap.ALL]);
    r=map.getValue(['a']);
    r=map.getValue(['a','b']);
    r=map.getValue(['a','c']);
    r=map.getValue([TreeMap.ALL]);
    r=map.hasValue(['a','b']);
    r=map.hasValue(['a','b','c2']);
    r=map.has(['a']);
    r=map.has(['a','b']);
    r=map.has(['a','b','c1']);
    r=map.has(['a','b','c2']);
    r=map.has([TreeMap.ALL]);
    map.delete(['a','b']);
    map.delete(['b','c','c2']);
    map.delete([TreeMap.ALL]);
    console.log(map);
*/
    //return;

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
  var Qevents = TreeMap();
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

