// A raw WebDAV interface
var WebDAV = {

  GET: function(url) { return this.request('GET', url, {}, null, 'text'); },
  PUT: function(url, data) { return this.request('PUT', url, {}, data, 'text'); },
  DELETE: function(url) { return this.request('DELETE', url, {}, null, 'text'); },
  MKCOL: function(url) { return this.request('MKCOL', url, {}, null, 'text'); },
  COPY: function(url, dest) { return this.request('COPY', url, {'Destination':dest}, null, 'text'); },
  MOVE: function(url, dest) { return this.request('MOVE', url, {'Destination':dest}, null, 'text'); },
  PROPFIND: function(url) {
    return this.request('PROPFIND', url, {'Depth': '1','Content-Type': 'text/xml; charset=UTF-8'},
      '<?xml version="1.0" encoding="utf-8" ?><D:propfind xmlns:D="DAV:"><D:allprop/></D:propfind>',
      'document');
  },

  //Request method.
  //verb: 'GET','PUT','DELETE','MKCOL','COPY','MOVE','PROPFIND','OPTIONS'
  //headers: {'Depth': '1'} ...
  //type:
  // '' or 'text'  - String,
  // 'arraybuffer' - ArrayBuffer,
  // 'blob'        - Blob,
  // 'document'    - html/xml,
  // 'json'        - json.
  //Return: promise object.
  request: function(verb, url, headers, data, type)
  {
    if(this.auth) headers['Authorization'] = this.auth;
    return new Promise(function (resolve, reject)
    {
      var xhr = new XMLHttpRequest(); if (!xhr) { return reject(new Error('Error on create the new XMLHttpRequest object')); }
      xhr.responseType = type || 'text';
      xhr.onload = function ()
      { 
        if (xhr.status >= 200 && xhr.status < 208)
          resolve({ source: xhr.response, responseURL: xhr.responseURL, type: xhr.responseType });
        else
          reject(new Error(xhr.status + ' ' + xhr.statusText));
      };
      xhr.onerror = function () { reject(new Error('Error: there was a network error.')); };
      xhr.onabort = function () { reject(new Error('Error: abort')); };
      xhr.open(verb, url);
      for (var header in headers) { xhr.setRequestHeader(header, headers[header]); }
      try { xhr.send(data); } catch (ex) { reject(new Error('WebDAV: ' + ex.message + '\nurl = ' + url)); }
    });
  }
};

// An Object-oriented API around WebDAV.
WebDAV.Fs = function(rootUrl, login, password)
{
  var fs = this;
  fs.rootUrl = rootUrl;
  fs.auth    = login && password?'Basic '+btoa(login+':'+password):null;
  fs.request = WebDAV.request;
  //bind static methods to this and define their as private
  var
   _GET     = WebDAV.GET.bind(this),
   _PUT     = WebDAV.PUT.bind(this),
   _DELETE  = WebDAV.DELETE.bind(this),
   _MKCOL   = WebDAV.MKCOL.bind(this),
   _COPY    = WebDAV.COPY.bind(this),
   _MOVE    = WebDAV.MOVE.bind(this),
  _PROPFIND = WebDAV.PROPFIND.bind(this);

  fs.request('OPTIONS', rootUrl, {}, null, 'text');

  this.file = function(href)
  {
    this.type  = 'file';
    this.url   = fs.urlFor(href, fs.rootUrl);
    this.name  = fs.nameFor(this.url);
    this.read  = function() { return _GET(this.url); };
    this.write = function(data) { return _PUT(this.url, data); };
    this.cp    = function(dest) { return _COPY(this.url, fs.urlFor(dest, this.url)); };
    this.mv    = function(dest) { return _MOVE(this.url, fs.urlFor(dest, this.url)); };
    this.rm    = function() { return _DELETE(this.url); };

    return this;
  };
  
  

  this.dir = function(href)
  {
    this.type = 'dir';
    this.url  = fs.urlFor(href, fs.rootUrl);
    this.name = fs.nameFor(this.url);
    this.children = function()
    {
      return _PROPFIND(this.url).then(function(doc)
      {
        var result = [];
        doc = doc.source.querySelector('multistatus');
        for(var i=1; i<doc.children.length; i++)
        {
          var response   = doc.children[i];
          var href       = response.querySelector('href').textContent;
          var collection = response.querySelector('collection');

          if(collection)
            result.push(new fs.dir(href));
          else
            result.push(new fs.file(href));
        }
        return Promise.resolve(result);
      });
    };
    this.mkdir = function(dest) { return _MKCOL(fs.urlFor(dest, this.url)); };
    this.cp    = function(dest) { return _COPY(this.url, fs.urlFor(dest, this.url)); };
    this.mv    = function(dest) { return _MOVE(this.url, fs.urlFor(dest, this.url)); };
    this.rm    = function() { return _DELETE(this.url); };

    return this;
  };
  
  

  this.urlFor = function(href, root)
  {
    return (/^http/.test(href) ? href : root + href);
  };
  this.nameFor = function(url)
  {
    url = decodeURIComponent(url);
    return url.replace(/.*\/(.*)/, '$1') || '.';
  };

  return this;
};
