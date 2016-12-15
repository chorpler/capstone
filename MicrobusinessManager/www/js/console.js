window.s1 = function(res) {
	Log.l("Success!");
	Log.l(res);
	window.res1 = res;
}
window.e1 = function(err) {
	Log.l("Error!");
	Log.l(err);
	window.err1 = err;
}

window.torf1 = function(res) {
	if(res) {
		Log.l("Result was true!");
	} else {
		Log.l("Result was false!");
	}
	window.res1 = res;
}



window.torf1 = function(res) {  if(res) {   Log.l("Result was true!");  } else {   Log.l("Result was false!");  }  window.res1 = res; }
