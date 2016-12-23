(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":2}],2:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
var xlsx = require('xlsx'),
	path = require('path');

/* initial code from http://sheetjs.com/demos/writexlsx.html */

// simple type function that works for arrays
function type(obj) { return Object.prototype.toString.call(obj).slice(8, -1);}

function fixExtension(filename){
	var ext = path.extname(filename);

	if(ext === '.xlsx') return filename;

	return filename.slice(0, -ext.length) + '.xlsx';
}

function Workbook(sheets){

	Object.defineProperty(this, "sheets", {
		"enumerable" : false,
		"writable" : true,
		"value" : []
	});

	// what kind of argument did we get?
	if(sheets === void(0)){
		this.sheets = [];
	} else if(type(sheets) === "String"){
		// string, treat as filename and try to open
		var name = sheets;

		name = fixExtension(name);

		var wb = xlsx.readFile(name);
		this.sheets = parse(wb);

	} else if(type(sheets) === "Array"){
		for(var i = 0; i < sheets.length; i++){
			this.sheets[i] = sheets[i];
		}
	} else if(type(sheets) === "Uint8Array"){
		var wb = xlsx.read(data, {type: 'binary'});

		this.sheets = parse(wb);
	} else {
		// treat it as a worksheet object
		this.sheets[0] = sheets;
	}

	var name;

	for(var i = 0; i < this.sheets.length; i++){
		name = this.sheets[i].name;
		addSheetProperty(this, name, i);
	}
}

function addSheetProperty(wb, S, i){
	Object.defineProperty(wb, S, {
		"enumerable" : true,
		"writable" : false,
		"value" : wb.sheets[i]
	});
}

/* turn an xslx workbook into a Workbook object */
function parse(workbook){

	var ws, name, range;
	var sheets = [];

	var sheet, cell, c;

	for(var i = 0; i < workbook.SheetNames.length; i++){
		name = workbook.SheetNames[i];
		ws = workbook.Sheets[name];
		range = xlsx.utils.decode_range(ws['!ref']);

		// create new Worksheet object
		sheets[i] = new Worksheet(name, range.e.r);

		sheet = sheets[i];
		for (z in ws) {
			/* all keys that do not begin with "!" correspond to cell addresses */
			if(z[0] === '!') continue;

			cell = ws[z];
			c = xlsx.utils.decode_cell(z);

			sheet[c.r][c.c] = cell.v;

		}

		// copy data
		/*
		for(var R = range.s.r; R < range.e.r; R++){
			for(var C = range.s.c; C < range.e.c; C++){
				sheets[R][C] = cell.v;
			}
		}
		*/
	}

	return sheets;
}

/* add an existing sheet to the Workbook or create a new one with the given name
 */
Workbook.prototype.add = function(sheet){

	if(typeof sheet == "string"){
		var name = sheet;
		sheet = new Worksheet(name);
	}
	this.sheets.push(sheet);

	return sheet;
}

/* turn a Workbook object into something xlsx can understand */
Workbook.prototype.objectify = function(){

	var wb = {
		"SheetNames" : [],
		"Sheets" : {}
	};

	var sheet, name, object;

	for(var i = 0; i < this.sheets.length; i++){
		sheet = this.sheets[i];
		name = sheet.name;
		object = sheet.objectify();

		wb.SheetNames.push(name);
		wb.Sheets[name] = object;
	}

	return wb;
}

function fixName(name){

	name = name.replace(/(^\W+)|(\W+$)/g, '');
	name = name.replace(/\W+/g, '-');

	return name;
}

Workbook.prototype.save = function(name){

	if(this.sheets.length > 0){
		name = name || fixName(this.sheets[0].name);
	}

	var filename = fixExtension(name);

	wb = this.objectify();

	// "xlsx" or "xlsm"
	xlsx.writeFile(wb, filename, {bookType:'xlsx', bookSST:true, type: 'binary'});
}

Workbook.prototype.push = Workbook.prototype.add;

var DEFAULT_ROWS = 100000;

function Worksheet(name, rows){

	rows = rows || DEFAULT_ROWS;

	Object.defineProperty(this, "name", {
		"enumerable" : false,
		"writable" : true,
		"value" : name
	});

	Object.defineProperty(this, "data", {
		"enumerable" : false,
		"writable" : true,
		"value" : []
	});

	Object.defineProperty(this, "length", {
		"enumerable" : false,
		"writable" : true,
		"value" : 0
	});


	var self = this;
	if(type(rows) === "Array"){
		var r = Math.max(DEFAULT_ROWS, rows.length)

		for(var R = 0; R < r; R++){
			if(R < rows.length && type(rows[R]).endsWith("Array")){
				this.data[R] = rows[R];

				this.length = (R + 1);
			} else {
				this.data[R] = [];
			}
			addRowProperty(this, R);
		}

	} else {
		for(var R = 0; R < rows; R++){
			this.data[R] = [];
			addRowProperty(this, R);
		}
	}
}

function addRowProperty(ws, R){
	Object.defineProperty(ws, R, {
		"enumerable" : true,
		"get" : function(){
			if(R >= ws.length) ws.length = (R + 1);
			return ws.data[R];
		},
		"set" : function(value){
			if(R >= ws.length) ws.length = (R + 1);

			if(type(value).endsWith("Array"))
				ws.data[R] = value.slice();
			else
				ws.data[R] = [value];
		}
	});
}

/* turn a Worksheet object into something xlsx can understand */
Worksheet.prototype.objectify = function(){

	var ws = {};

	// create base range object
	var range = {s: {c:0, r:0}, e: {c:0, r:this.length }};

	// iterate through our dense array
	for(var R = 0; R != this.length; ++R) {
		for(var C = 0; C != this.data[R].length; ++C) {

			// add data
			var cell = {v: this.data[R][C] };
			if(cell.v == null) continue;

			// update column range, if necessary
			if(range.e.c < C) range.e.c = C;
			if(range.e.r < R) range.e.r = R;

			// set the type
			if(typeof cell.v === 'number') cell.t = 'n';
			else if(typeof cell.v === 'boolean') cell.t = 'b';
			else if(cell.v instanceof Date) {
				cell.t = 'n'; cell.z = xlsx.SSF._table[14];
				cell.v = datenum(cell.v);
			}
			else cell.t = 's';

			// generate encoded location
			var cell_ref = xlsx.utils.encode_cell({c:C,r:R});

			// add the cell to the worksheet
			ws[cell_ref] = cell;
		}
	}

	// encode and set range
	ws['!ref'] = xlsx.utils.encode_range(range);

	return ws;
}

/* create a new workbook containing only this sheet with the same name
 */
Worksheet.prototype.save = function(name){
	var workbook = new Workbook(this);
	workbook.save(name);

	return workbook;
}

module.exports = {
	"Workbook" : Workbook,
	"Worksheet" : Worksheet
}

},{"path":1,"xlsx":undefined}]},{},[3]);
