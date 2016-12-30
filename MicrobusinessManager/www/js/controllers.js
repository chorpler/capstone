(function () {
	angular.module('app')
	// .controller('AppController', ['$scope', '$q', '$ionicModal', 'ReportService', AppController]);
	.controller('AppController', AppController);

	function AppController (CashBalance, $q, $scope, $rootScope, $filter, $ionicPopover, $cordovaSQLite, $ionicPopup, $timeout, Database, $cordovaSQLitePorter, $cordovaFile) {
		var vm = this;
		var win = window;
		
		win.DB = Database;
		win.scope = $scope;
		win.cSQL = $cordovaSQLite;
		win.cSQLP = $cordovaSQLitePorter;
		win.cFile = $cordovaFile;
		rs = $rootScope;
		win.rs = rs;
		rs.code = {};
		// rs.code.getDateFormat = getDateFormat;
		rs.code.showPopupAlert = showPopupAlert;
		rs.code.showPopupAlertPromise = showPopupAlertPromise;
		rs.code.showPopupConfirm = showPopupConfirm;
		rs.code.showPopupCustomConfirm = showPopupCustomConfirm;
		rs.code.showPopupYesNo = showPopupYesNo;
		rs.code.showInnerPopupYesNo = showInnerPopupYesNo;

		var formats = Database.getFormats();

		vm.cashBalance = CashBalance;
		// vm.reportService = ReportService;
		vm.showCash = showCash;
		vm.save = save;
		vm.cancel = cancel;
		vm.cashInfusion = {};
		vm.submitted = false;

		function init () {
			win.formats = {dateformat:"MMM D, YYYY"};
			win.dateformat = win.formats.dateformat;
			// getDateFormat().then(function(res) {
			// 	Log.l("Init(): Done with getDateFormat(), result is:\n%s", JSON.stringify(res));
			// 	win.formats = res;
			// 	win.dateFormat = res.dateformat || "YYYY-MM-DD";
			// });
		}

		// function getDateFormat() {
		// 	return Database.select('formats').then(function (res) {
		// 		var formats = [];
		// 		if (res.rows.length === 0) {
		// 			return {id: 1, dateformat: "YYYY-MM-DD"};
		// 		}
		// 		for (var i = res.rows.length - 1; i >= 0; i--) {
		// 			var item = res.rows.item(i);
		// 			formats.push(item);
		// 		}
		// 		Log.l("SEPI: formats configured as %s.", JSON.stringify(formats[0]));
		// 		return formats[0];
		// 	});
		// }

		function showCash ($event) {
			vm.cashInfusion.date = new Date();
			$ionicPopover.fromTemplateUrl('Cash/templates/cash.html', {
		  	scope: $scope,
			}).then(function(popover) {
				vm.cashInf = popover;
				vm.cashInf.show($event);
			});
		}

		function save (item, form, $event) {
			$event.stopPropagation();
			if (form && form.$invalid) {
				return;
			}
			vm.submitted = true;
			item.amount = item.amount && item.replace ? Number(item.amount.replace(',', '.')) : item.amount;
			Database.insert('cashInfusion', [item.amount, moment(item.date).format('YYYY-MM-DD HH:mm:ss')])
			.then(function (response) {
				CashBalance.updateCashBalance();
				vm.cashInfusion = {};
				return response.insertId;
			});
			vm.cashInf.remove();
			vm.submitted = false;
		}

		function cancel () {
			vm.submitted = true;
			vm.cashInfusion = {};
			vm.cashInf.remove();
			vm.submitted = false;
		}

		$scope.$on('$destroy', function() {
			vm.cashInf.remove();
		});

		function showPopupAlert(title, text, timer) {
			var alertPopup = $ionicPopup.alert({
					title: title,
					template: text,
					cssClass: 'PopupAlert'
				});

			alertPopup.then(function(res) {
				Log.l("Successfully showed popup alert, title '%s'.", title);
			}).catch(function(err) {
				Log.l("Error showing popup alert, title '%s'!", title);
				Log.e(err);
			});
			if(timer && typeof timer == 'number') {
				$timeout(function() {
					alertPopup.close();
				}, timer);
			}
		}

		function showPopupAlertPromise(title, text) {
			var alertPopup = $ionicPopup.alert({
					title: title,
					template: text,
					cssClass: 'PopupAlert'
				});

			var d = $q.defer();
			alertPopup.then(function(res) {
				Log.l("Successfully showed popup alert, title '%s'.", title);
				d.resolve(true);
			}).catch(function(err) {
				Log.l("Error showing popup alert, title '%s'!", title);
				Log.e(err);
				d.resolve(false);
			});
			return d.promise;
		}

		/**
		 * showPopupConfirm() - A replacement for the crappy default JavaScript confirm() function. Standard Cancel and OK buttons.
		 * @param  {String} title      The title to use for the confirm popup.
		 * @param  {String} text       The text to display. Can be in HTML, no problem.
		 * @return {Boolean}            Returns true if the user tapped the OK/Yes button and false if the user tapped Cancel/No.
		 */
		function showPopupConfirm(title, text) {
			// A confirm dialog
			var confirmPopup = $ionicPopup.confirm({
					title: title,
					template: text,
					cssClass: 'PopupConfirm'
				});
			var d = $q.defer();
			confirmPopup.then(function(res) {
				if(res) {
					d.resolve(true);
				} else {
					d.resolve(false);
				}
			}).catch(function(err) {
				Log.l("showPopupConfirm(%s, %s) had error? Weird.", title, text);
				Log.e(err);
				d.resolve(false);
			});
			return d.promise;
		}

		/**
		 * showPopupCustomConfirm() - A replacement for the crappy default JavaScript confirm() function. Customized buttons.
		 * @param  {String} title      The title to use for the confirm popup.
		 * @param  {String} text       The text to display. Can be in HTML, no problem.
		 * @param  {Array}  arrButtons An array of objects containing the buttons to use.  Each object contains text, type (color), and onTap.
		 * @return {Boolean}            Returns true if the user tapped the OK/Yes button and false if the user tapped Cancel/No.
		 */
		function showPopupCustomConfirm(title, text, arrButtons, variable) {
			$scope = rs = scope1 = rscope = scope = $rootScope;
			// A confirm dialog
			// Needs 
			$scope.vars.CustomConfirmPopup = $ionicPopup.show({
				title: title,
				template: text,
				cssClass: 'PopupConfirm',
				buttons: arrButtons
			});
			/* Example contents of arrButtons, for default Cancel and custom Save buttons.
			 * Since this is a confirm popup (albeit customized), make sure you only have 
			 * true and false return values! (This one is from the more complex popup,
			 * $ionicPopup.show(), but it's useful for its custom buttons, so it is included here
			 * even though it doens't just return true/false.)
			*/
			// [{text: 'Cancel'},
			//  {text: '<b>Save</b>',
			//   type: 'button-positive',
			//   onTap: function(e) {
			// 					if (!$scope.data.wifi) {
			// 						//don't allow the user to close unless he enters wifi password
			// 						e.preventDefault();
			// 					} else {
			// 						return $scope.data.wifi;
			// 					}
			// 				}
			// }]
			var d = $q.defer();
			$scope.vars.CustomConfirmPopup.then(function(res) {
				// if(res) {
				// 	d.resolve(true);
				// } else {
				// 	d.resolve(false);
				// }
				d.resolve(res);
			}).catch(function(err) {
				Log.l("showPopupCustomConfirm(%s, %s, %s) had error? Weird.", title, text, arrButtons);
				Log.e(err);
				d.resolve(false);
			});
			return d.promise;
		}

		function showPopupYesNo(title, text) {
			var btnYes = $filter('translate')("str_yes");
			var btnNo = $filter('translate')("str_no");
			var arrButtons = [
				{text: btnNo, type: 'button-calm', onTap: function(e) { return false;}},
				{text: btnYes, type: 'button-assertive', onTap: function(e) { return true;}}
			];
			var yesnopopup = $ionicPopup.show({
				title: title,
				template: text,
				cssClass: 'PopupConfirm',
				buttons: arrButtons
			});
			return yesnopopup;
			// return rs.code.showPopupCustomConfirm(title, text, arrButtons);
		}

		function showInnerPopupYesNo(title, text) {
			var btnYes = $filter('translate')("str_yes");
			var btnNo = $filter('translate')("str_no");
			var arrButtons = [
				{text: btnNo, type: 'button-calm', onTap: function(e) { return false;}},
				{text: btnYes, type: 'button-assertive', onTap: function(e) { return true;}}
			];
			var yesnoconfirm = $ionicPopup.confirm({
				title: title,
				template: text,
				cssClass: 'PopupConfirm',
				buttons: arrButtons
			});
			return yesnoconfirm;
		}


		init();
	}
})();
