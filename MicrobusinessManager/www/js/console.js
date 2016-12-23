window.win = window;

window.s1 = function(res) {
	Log.l("Success! Storing in res1!");
	Log.l(res);
	window.res1 = res;
}
window.e1 = function(err) {
	Log.l("Error! Storing in err1!");
	Log.l(err);
	window.err1 = err;
}

window.prog1 = function(prog) {
	Log.l("Progress! Storing in prog1!");
	Log.l(prog);
	window.prog1 = prog;
}

window.resFns = {
	successFn: s1,
	errorFn: e1,
	progressFn: prog1
}

window.torf1 = function(res) {
	if(res) {
		Log.l("Result was true!");
	} else {
		Log.l("Result was false!");
	}
	window.res1 = res;
}

