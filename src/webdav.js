// A raw WebDAV interface
var WebDAV = {

  GET: function(url) { return this.request('GET', url, {}, null, 'text'); },
  PROPFIND: function(url) { return this.request('PROPFIND', url, {Depth: "1"}, null, 'document'); },
  MKCOL: function(url) { return this.request('MKCOL', url, {}, null, 'text'); },
  DELETE: function(url) { return this.request('DELETE', url, {}, null, 'text'); },
  PUT: function(url, data) { return this.request('PUT', url, {}, data, 'text'); },

  //verb: 'GET', 'PROPFIND', 'MKCOL', 'DELETE', 'PUT', 'MOVE' ...
  //headers: {'Depth': '1'} ...
  //type:
  // '' or 'text'  - plain text,
  // 'arraybuffer' - ArrayBuffer,
  // 'blob'        - Blob,
  // 'document'    - html,
  // 'json'        - json,
  //Return: promise object.
  request: function(verb, url, headers, data, type)
  {
    return new Promise(function (resolve, reject)
    {
      var xhr = new XMLHttpRequest(); if (!xhr) { return reject(new Error('Error on create the new XMLHttpRequest object')); }
      xhr.responseType = type || 'text';
      xhr.onload = function ()
      { 
        if (xhr.status >= 200 && xhr.status < 300)
           resolve({ source: xhr.response, responseURL: xhr.responseURL, type: xhr.responseType });
        else
          reject(new Error('Error: error code:' + xhr.statusText));
      };
      xhr.onerror = function () { reject(new Error('Error: there was a network error.')); };
      xhr.onabort = function () { reject(new Error('Error: abort')); };
      xhr.open(verb || 'GET', url);
      xhr.setRequestHeader('Content-Type', 'text/xml; charset=UTF-8');
      for (var header in headers) { xhr.setRequestHeader(header, headers[header]); }
      try { xhr.send(data); } catch (ex) { reject(new Error('getScriptFile(url): ' + ex.message + '\nurl = ' + url)); }
    });
  }
};

// An Object-oriented API around WebDAV.
WebDAV.Fs = function(rootUrl)
{
  this.rootUrl = rootUrl;
  var fs = this;
  
  this.file = function(href)
  {
    this.type = 'file';

    this.url = fs.urlFor(href);

    this.name = fs.nameFor(this.url);

    this.read = function()
    {
      return WebDAV.GET(this.url);
    };

    this.write = function(data)
    {
      return WebDAV.PUT(this.url, data);
    };

    this.rm = function()
    {
      return WebDAV.DELETE(this.url);
    };

    return this;
  };
  
  

  this.dir = function(href)
  {
    this.type = 'dir';

    this.url = fs.urlFor(href);

    this.name = fs.nameFor(this.url);

    this.children = function()
    {
      var childrenFunc = function(doc)
      {
        var result = [];
        for(var i=0; i<doc.children.length; i++)
        {
          var response       = doc.children[i];
          //var href         = response.getElementsByTagName('D:href')[0].firstChild.nodeValue;
          //var propstat     = response.getElementsByTagName('D:propstat')[0];
          //var prop         = propstat.getElementsByTagName('D:prop')[0];
          //var resourcetype = prop.getElementsByTagName('D:resourcetype')[0];
          //var collection   = resourcetype.getElementsByTagName('D:collection')[0];

          var href       = response.querySelector('href').textContent;
          var collection = response.querySelector('collection');

          if(collection)
            result.push(new fs.dir(href));
          else
            result.push(new fs.file(href));
        }
        return result;
      };

      return WebDAV.PROPFIND(this.url).then(function(doc)
      {
        return Promise.resolve(childrenFunc(doc.source.children[0]));
      });

    };

    this.rm = function()
    {
      return WebDAV.DELETE(this.url);
    };
    
    this.mkdir = function()
    {
      return WebDAV.MKCOL(this.url);
    };

    return this;
  };
  
  

  this.urlFor = function(href)
  {
    return (/^http/.test(href) ? href : this.rootUrl + href);
  };
  
  this.nameFor = function(url)
  {
    url = decodeURIComponent(url);
    return url.replace(/.*\/(.*)/, '$1') || '.';
  };

  return this;
};
