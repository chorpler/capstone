/*jslint indent: 2 */

(function factory(root) {
	"use strict";

	// Copyright (c) 2014 Tristan Cavelier <t.cavelier@free.fr>
	// This program is free software. It comes without any warranty, to
	// the extent permitted by applicable law. You can redistribute it
	// and/or modify it under the terms of the Do What The Fuck You Want
	// To Public License, Version 2, as published by Sam Hocevar. See
	// http://www.wtfpl.net/ for more details.

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Base64_encoding_and_decoding

	/*
	 * Just include this file into your web page with a <script> tag.
	 *
	 * How to use:
	 *
	 *     var sB64 = base64.encodeText("my text");
	 *     console.log(base64.decodeAsText(sB64)); // logs "my text"
	 *
	 * API:
	 *
	 * - base64.encodeText(sText) : sBase64
	 * - base64.encodeBinaryString(sBinaryString) : sBase64
	 * - base64.encodeBinaryArrayBuffer(aArrayBuffer) : sBase64
	 * - base64.decodeAsText(sBase64, [nBlocksSize]) : sText
	 * - base64.decodeAsBinaryString(sBase64, [nBlocksSize]) : sBinaryString
	 * - base64.decodeAsArrayBuffer(sBase64, [nBlocksSize]) : aArrayBuffer
	 * - base64.decodeAsDataURL(sBase64, [nBlocksSize]) : sDataURL
	 */

	/*global Uint8Array, URL, Blob */

	var timestat          = {} ;
	timestat.FREE         = 0  ;
	timestat.HIGHLIGHTED  = 1  ;
	timestat.ALLOCATED    = 2  ;
	timestat.PREALLOCATED = 4  ;

	var hourtype = {};
	// hourtype.UNALLOCATED   = {"label": "Unallocated Time"           , "value": "unallocated"   } ;
	// hourtype.ALLOCATION    = {"label": "Allocating time"            , "value": "allocation"    } ;
	// hourtype.WORKORDER     = {"label": "Work Order"                  , "value": "workorder"     } ;
	// hourtype.TRAVEL        = {"label": "Travel"                     , "value": "travel"        } ;
	// hourtype.AUTHORIZATION = {"label": "Getting authorization"      , "value": "authorization" } ;
	hourtype.LUNCH         = {"label": "Lunch"                      , "value": "lunch"         } ;
	hourtype.OVERTIME      = {"label": "Overtime"                   , "value": "overtime"      } ;
	hourtype.FORGOTSHIFT   = {"label": "Forgot to log in to shift"  , "value": "forgot"        } ;
	hourtype.MEETING       = {"label": "Meeting"                    , "value": "meeting"       } ;
	hourtype.PARTS         = {"label": "OffSite Task"               , "value": "offsite"         } ;
	hourtype.SICK          = {"label": "Sick time"                  , "value": "sick"          } ;
	hourtype.OTHER         = {"label": "Other"                      , "value": "other"         } ;
	var hourtypearray      = [];
	for(var key in hourtype) {
		hourtypearray.push(hourtype[key]);
	}

	var base64 = {};

	function charCodeToUint6(nChr) {
		return (
			nChr > 64 && nChr < 91 ? nChr - 65 : (
				nChr > 96 && nChr < 123 ? nChr - 71 : (
					nChr > 47 && nChr < 58 ? nChr + 4 : (
						nChr === 43 ? 62 : (
							nChr === 47 ? 63 : 0
						)
					)
				)
			)
		);
	}

	base64.charCodeToUint6 = charCodeToUint6;

	function base64DecodeAsUint8Array(sBase64, nBlocksSize) {
		/*jslint regexp: true, bitwise: true */
		var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx,
			sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""),
			nInLen = sB64Enc.length,
			nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2,
			taBytes = new Uint8Array(nOutLen);

		for (nInIdx = 0; nInIdx < nInLen; nInIdx += 1) {
			nMod4 = nInIdx & 3;
			nUint24 |= charCodeToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
			if (nMod4 === 3 || nInLen - nInIdx === 1) {
				for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3 += 1, nOutIdx += 1) {
					taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
				}
				nUint24 = 0;
			}
		}

		return taBytes;
	}

	function base64DecodeAsArrayBuffer(sBase64, nBlocksSize) {
		return base64DecodeAsUint8Array(sBase64, nBlocksSize).buffer;
	}

	base64.decodeAsArrayBuffer = base64DecodeAsArrayBuffer;

	function base64DecodeAsBinaryString(sBase64, nBlocksSize) {
		var i, l, ua = base64DecodeAsUint8Array(sBase64, nBlocksSize), s = "";
		for (i = 0, l = ua.length; i < l; i += 1) {
			s += String.fromCharCode(ua[i]);
		}
		return s;
	}

	base64.decodeAsBinaryString = base64DecodeAsBinaryString;

	function base64DecodeAsDataURL(sBase64, nBlocksSize) {
		return URL.createObjectURL(new Blob([
			base64DecodeAsUint8Array(sBase64, nBlocksSize).buffer
		], {"type": "application/octet-stream"}));
	}

	base64.decodeAsDataURL = base64DecodeAsDataURL;

	function utf8Uint8ArrayToString(aBytes) {
		/*jslint plusplus: true, bitwise: true */
		var sView = "", nPart, nLen = aBytes.length, nIdx;

		for (nIdx = 0; nIdx < nLen; ++nIdx) {
			nPart = aBytes[nIdx];
			sView += String.fromCharCode(
				nPart > 251 && nPart < 254 && nIdx + 5 < nLen ? /* six bytes */ (
					/* (nPart - 252 << 32) is not possible in ECMAScript! So...: */
					(nPart - 252) * 1073741824 + (aBytes[++nIdx] - 128 << 24) + (aBytes[++nIdx] - 128 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
				) : nPart > 247 && nPart < 252 && nIdx + 4 < nLen ? /* five bytes */ (
					(nPart - 248 << 24) + (aBytes[++nIdx] - 128 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
				) : nPart > 239 && nPart < 248 && nIdx + 3 < nLen ? /* four bytes */ (
					(nPart - 240 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
				) : nPart > 223 && nPart < 240 && nIdx + 2 < nLen ? /* three bytes */ (
					(nPart - 224 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
				) : nPart > 191 && nPart < 224 && nIdx + 1 < nLen ? /* two bytes */ (
					(nPart - 192 << 6) + aBytes[++nIdx] - 128
				) : /* nPart < 127 ? */ /* one byte */ nPart
			);
		}

		return sView;
	}

	base64.utf8Uint8ArrayToString = utf8Uint8ArrayToString;

	function base64DecodeAsText(sBase64, nBlocksSize) {
		return utf8Uint8ArrayToString(
			base64DecodeAsUint8Array(sBase64, nBlocksSize)
		);
	}

	base64.decodeAsText = base64DecodeAsText;

	function uint6ToCharCode(nUint6) {
		return (
			nUint6 < 26 ? nUint6 + 65 : (
				nUint6 < 52 ? nUint6 + 71 : (
					nUint6 < 62 ? nUint6 - 4 : (
						nUint6 === 62 ? 43 : (
							nUint6 === 63 ? 47 : 65
						)
					)
				)
			)
		);
	}

	base64.uint6ToCharCode = uint6ToCharCode;

	function base64EncodeUint8Array(aBytes) {
		/*jslint bitwise: true */
		var nMod3 = 2, sB64Enc = "", nLen = aBytes.length, nUint24 = 0, nIdx;

		for (nIdx = 0; nIdx < nLen; nIdx += 1) {
			nMod3 = nIdx % 3;
			if (nIdx > 0 && (nIdx * 4 / 3) % 76 === 0) { sB64Enc += "\r\n"; }
			nUint24 |= aBytes[nIdx] << (16 >>> nMod3 & 24);
			if (nMod3 === 2 || aBytes.length - nIdx === 1) {
				sB64Enc += String.fromCharCode(uint6ToCharCode(nUint24 >>> 18 & 63), uint6ToCharCode(nUint24 >>> 12 & 63), uint6ToCharCode(nUint24 >>> 6 & 63), uint6ToCharCode(nUint24 & 63));
				nUint24 = 0;
			}
		}

		return sB64Enc.substr(0, sB64Enc.length - 2 + nMod3) + (nMod3 === 2 ? '' : nMod3 === 1 ? '=' : '==');
	}

	function base64EncodeArrayBuffer(aBytes) {
		return base64EncodeUint8Array(new Uint8Array(aBytes));
	}

	base64.encodeArrayBuffer = base64EncodeArrayBuffer;

	function base64EncodeBinaryString(sBytes) {
		var i, l, ua = new Uint8Array(l);
		for (i = 0, l = sBytes.length; i < l; i += 1) {
			ua = sBytes.charCodeAt(i);
		}
		return base64EncodeUint8Array(ua);
	}

	base64.encodeBinaryString = base64EncodeBinaryString;

	function stringToUtf8Uint8Array(sDOMStr) {
		/*jslint plusplus: true, bitwise: true */

		var aBytes, nChr, nStrLen = sDOMStr.length, nArrLen = 0, nMapIdx, nIdx, nChrIdx;

		/* mapping... */

		for (nMapIdx = 0; nMapIdx < nStrLen; nMapIdx += 1) {
			nChr = sDOMStr.charCodeAt(nMapIdx);
			nArrLen += nChr < 0x80 ? 1 : nChr < 0x800 ? 2 : nChr < 0x10000 ? 3 : nChr < 0x200000 ? 4 : nChr < 0x4000000 ? 5 : 6;
		}

		aBytes = new Uint8Array(nArrLen);

		/* transcription... */

		for (nIdx = 0, nChrIdx = 0; nIdx < nArrLen; nChrIdx += 1) {
			nChr = sDOMStr.charCodeAt(nChrIdx);
			if (nChr < 128) {
				/* one byte */
				aBytes[nIdx++] = nChr;
			} else if (nChr < 0x800) {
				/* two bytes */
				aBytes[nIdx++] = 192 + (nChr >>> 6);
				aBytes[nIdx++] = 128 + (nChr & 63);
			} else if (nChr < 0x10000) {
				/* three bytes */
				aBytes[nIdx++] = 224 + (nChr >>> 12);
				aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
				aBytes[nIdx++] = 128 + (nChr & 63);
			} else if (nChr < 0x200000) {
				/* four bytes */
				aBytes[nIdx++] = 240 + (nChr >>> 18);
				aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
				aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
				aBytes[nIdx++] = 128 + (nChr & 63);
			} else if (nChr < 0x4000000) {
				/* five bytes */
				aBytes[nIdx++] = 248 + (nChr >>> 24);
				aBytes[nIdx++] = 128 + (nChr >>> 18 & 63);
				aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
				aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
				aBytes[nIdx++] = 128 + (nChr & 63);
			} else { /* if (nChr <= 0x7fffffff) */
				/* six bytes */
				aBytes[nIdx++] = 252 + /* (nChr >>> 32) is not possible in ECMAScript! So...: */ (nChr / 1073741824);
				aBytes[nIdx++] = 128 + (nChr >>> 24 & 63);
				aBytes[nIdx++] = 128 + (nChr >>> 18 & 63);
				aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
				aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
				aBytes[nIdx++] = 128 + (nChr & 63);
			}
		}

		return aBytes;
	}

	base64.stringToUtf8Uint8Array = stringToUtf8Uint8Array;

	function base64EncodeText(sText) {
		return base64EncodeUint8Array(stringToUtf8Uint8Array(sText));
	}

	base64.encodeText = base64EncodeText;

	Object.defineProperty(base64, "toScript", {
		"configurable": true,
		"enumerable": false,
		"writable": true,
		"value": function () {
			return "(" + factory.toString() + "(this));";
		}
	});

	root.base64        = base64;
	root.timestat      = timestat;
	root.hourtype      = hourtype;
	root.hourtypearray = hourtypearray;

}(this));

(function factory(root) {
	"use strict";
	var u = {};

	function blankOutObject(obj) {
		var retObj = null;
		if(typeof object == 'object') {
			for(var key in obj) {
				delete obj[key];
			}
			retObj = obj;
		} else {
			retObj = null;
		}
		return retObj;
	}

	function isFunction(arg) {
		if(isDefined(arg))
			return typeof arg === 'function';
		else
			return false;
		// return typeof arg != 'undefined' && typeof arg === 'function';
	}

	function isNumber(arg) {
		if(isDefined(arg))
			return typeof arg === 'number';
		else
			return false;
		// return typeof arg != 'undefined' && typeof arg === 'number';
	}

	function isBoolean(arg) {
		if(isDefined(arg))
			return typeof arg === 'boolean';
		else
			return false;
		// return typeof arg != 'undefined' && typeof arg === 'number';
	}

	function isString(arg) {
		if(isDefined(arg))
			return typeof arg === 'string';
		else
			return false;
		// return typeof arg != 'undefined' && typeof arg === 'string';
	}

	var isArray = Array.isArray;

	/**
	 * @ngdoc function
	 * @name angular.isObject
	 * @module ng
	 * @kind function
	 *
	 * @description
	 * Determines if a reference is an `Object`. Unlike `typeof` in JavaScript, `null`s are not
	 * considered to be objects. Note that JavaScript arrays are objects.
	 *
	 * @param {*} value Reference to check.
	 * @returns {boolean} True if `value` is an `Object` but not `null`.
	 */
	function isObject(value) {
		// http://jsperf.com/isobject4
		return value !== null && typeof value === 'object';
	}

	function isUndefined(arg) {
		var retVal = true;
		try {
			if(typeof arg === 'undefined') {
				retVal = true;
			} else {
				retVal = false;
			}
		} catch(err) {
			console.log("Error while running isUndefined!");
			console.error(err);
		} finally {
			return retVal;
		}
		// return arg === void 0;
		// if(isDefined(arg))
		// 	return false;
		// else
		// 	return true;
		// return typeof arg == 'undefined';
	}

	function isDefined(arg) {
		// if(typeof arg == 'undefined')
		// 	return false;
		// else
		// 	return true;
		// return typeof arg != 'undefined';
		return arg !== void 0;
	}

	function isRegExp(value) {
		return toString.call(value) === '[object RegExp]';
	}

	function sizeOfObject(arg) {
		if(isObject(arg)) {
			var i = 0;
			for(var key in arg) {
				i++;
			}
			return i;
		} else {
			return -1;
		}
		// 	return false;
		// else
		// 	return true;
		// return typeof arg != 'undefined';
	}

		/**
	 * Set or clear the hashkey for an object.
	 * @param obj object
	 * @param h the hashkey (!truthy to delete the hashkey)
	 */
	function setHashKey(obj, h) {
		if (h) {
			obj.$$hashKey = h;
		} else {
			delete obj.$$hashKey;
		}
	}

	var slice = [].slice;

	function sliceArgs(args, startIndex) {
		return slice.call(args, startIndex || 0);
	}

	function baseExtend(dst, objs, deep) {
		var h = dst.$$hashKey;

		for (var i = 0, ii = objs.length; i < ii; ++i) {
			var obj = objs[i];
			if (!isObject(obj) && !isFunction(obj)) continue;
			var keys = Object.keys(obj);
			for (var j = 0, jj = keys.length; j < jj; j++) {
				var key = keys[j];
				var src = obj[key];

				if (deep && isObject(src)) {
					if (!isObject(dst[key])) dst[key] = isArray(src) ? [] : {};
					baseExtend(dst[key], [src], true);
				} else {
					dst[key] = src;
				}
			}
		}

		setHashKey(dst, h);
		return dst;
	}

	/**
	* @ngdoc function
	* @name angular.merge
	* @module ng
	* @kind function
	*
	* @description
	* Deeply extends the destination object `dst` by copying own enumerable properties from the `src` object(s)
	* to `dst`. You can specify multiple `src` objects. If you want to preserve original objects, you can do so
	* by passing an empty object as the target: `var object = angular.merge({}, object1, object2)`.
	*
	* Unlike {@link angular.extend extend()}, `merge()` recursively descends into object properties of source
	* objects, performing a deep copy.
	*
	* @param {Object} dst Destination object.
	* @param {...Object} src Source object(s).
	* @returns {Object} Reference to `dst`.
	*/
	function merge(dst) {
		return baseExtend(dst, slice.call(arguments, 1), true);
	}

	function arrayRotate(arr, amt, reverse) {
		var amount = 1;
		if(typeof amt != 'undefind' && typeof amt == 'number') {
			amount = amt;
		}
		if (reverse) {
			for(var i = 0; i < amount; i++) {
				arr.unshift(arr.pop());
			}
		}	else {
			for(var i = 0; i < amount; i++) {
				arr.push(arr.shift());
			}
		}
		return arr;
	}

	function sparseLength(array) {
		var len = 0;
		for (var key in array) {
			if (test[key] != undefined) len++;
		}
		return len;
	}

	function lastElement(array) {
		var retVal = null;
		if(!Array.isArray(array)) {
			retVal = null;
		} else if(array.length == 0) {
			retVal = null;
		} else {
			var len = array.length;
			retVal = array[len - 1];
		}
		return retVal;
	}

	function toArray(list) {
		return Array.prototype.slice.call(list || [], 0);
	}

	function titlecaseLowercaseWords(a,b,c,d,e) {
		return b+c.toUpperCase()+d+e;
	}

	function titleCase(str) {
		var wordsRx = /(^|\s)([a-z])([a-z]*)(\s|$)/g;
		return str.replace(wordsRx, titlecaseLowercaseWords);
	}




	u.isFunc    = isFunction     ;
	u.isNum     = isNumber       ;
	u.isBool    = isBoolean      ;
	u.isStr     = isString       ;
	u.isArr     = isArray        ;
	u.isObj     = isObject       ;
	u.isUndef   = isUndefined    ;
	u.isDef     = isDefined      ;
	u.sizeOf    = sizeOfObject   ;
	u.merge     = merge          ;
	u.blankOut  = blankOutObject ;
	u.slice     = slice          ;
	u.rotate    = arrayRotate    ;
	u.salength  = sparseLength   ;
	u.last      = lastElement    ;
	u.toArray   = toArray        ;
	u.titleCase = titleCase      ;

	Object.defineProperty(u, "toScript", {
		"configurable": true,
		"enumerable": false,
		"writable": true,
		"value": function () {
			return "(" + factory.toString() + "(this));";
		}
	});

	root.u = u;
}(this));

function globalizeFunc(funcName) {
	if(u.isUndef(window[funcName])) {
		window[funcName] = u[funcName];
	}
}

var fns = ['isFunc', 'isNum', 'isBool', 'isStr', 'isArr', 'isObj', 'isUndef', 'isDef', 'sizeOf', 'merge', 'blankOut', 'slice', 'rotate', 'salength', 'last', 'toArray', 'titleCase'];

for(var name in fns) {
	globalizeFunc(fns[name]);
}
