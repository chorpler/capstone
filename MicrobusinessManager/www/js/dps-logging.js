// 2015-09-15
// Version 0.9.37 by David Sargeant
// Modified from somebody's post someplace
//
// Keep the correct line number displayed in console output, but also add whatever
// else you like, like a timestamp or something. Also enables debugging flags to be
// easily turned on and off without having to comment/uncomment every console.log()
// line.
// Output sample:
//  5/10 1:13:52.553  hi                                    a.js:100
//  5/10 1:13:52.553  err                                   b.js:200

var Log = {
		/* If this value is not set to true, no output at all will occur for Log.d() */
		debug: true,

		/* If this value is not set to true, no output at all will occur for Log.l() */
		log: true,

		/* If this value is not set to true, no output at all will occur for Log.w() */
		warn: true,

		/* If this value is not set to true, no output at all will occur for Log.e() */
		error: true,

		/* If this value is not set to true, no output will occur for Log.t() */
		table: true,

		/*
		 * @comment Log.d, Log.l, and Log.e functions are using bind and property accesser
		 * @see http://ejohn.org/blog/javascript-getters-and-setters/
		 *
		 * General logger (equivalent to console.log)
		 * Log.l(logData1, logData2, ...)
		 *  --> console.log( getLogHead(), logData1, logData2, ...)
		 */
		get l() {
				if (!this.log) return _emptyFunc;
				// console.log("Now a log")
				// return console.log.bind( console, this._getLogHeader());
				return console.log.bind(console);
		},

		/* Debug logger (equivalent to console.debug)
		 * Log.d(logData1, logData2, ...)
		 *  --> console.debug( getLogHead(), logData1, logData2, ...)
		 */
		get d() {
				if (!this.debug) return _emptyFunc;
				// return console.debug.bind( console, this._getLogHeader() );
				return console.debug.bind(console);
		},

		/* Error logger (equivalent to console.error)
		 * Log.e(logData1, logData2, ...)
		 *  --> console.error( getLogHead(), logData1, logData2, ...)
		 */
		get e() {
				// return console.error.bind( console, this._getLogHeader() );
				if (!this.error) return _emptyFunc;
				return console.error.bind(console);
		},

		/* Warn logger (equivalent to console.warn)
		 * Log.w(logData1, logData2, ...)
		 *  --> console.warn( getLogHead(), logData1, logData2, ...)
		 */
		get w() {
				// return console.warn.bind( console, this._getLogHeader() );
				if (!this.warn) return _emptyFunc;
				return console.warn.bind(console);
		},

		/* Table logger (equivalent to console.table)
		 * Log.t(tableData, ...)
		 *  --> console.table( getLogHead(), tableData, ...)
		 */
		get t() {
				// return console.table.bind( console, this._getLogHeader() );
				if (!this.table) return _emptyFunc;
				return console.table.bind(console);
		},

		/**
		 * get current time in 01/31 23:59:59.999 format
		 */
		_getLogHeader: function() {
				// var now = moment();
				var now = new Date();
				this._dtNow = now;
				// var millisec = Date.now();
				// this._dtNow.setTime( millisec );
				//toLocaleString is 2013/01/31 23:59:59
				// return this._dtNow.toLocaleString().slice( 5 ) + '.' + ('000' + millisec).slice( -3 ) + ' ';
				return this._dtNow.toLocaleString() + " ";
				// return this._dtNow.format("YYYY-MM-DD HH:MM:ss.SSS");
		},
		// _dtNow: moment(),
		_dtNow: new Date(),
		_emptyFunc: function() {}
};
