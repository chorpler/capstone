
(function () {
	angular.module('app.activitylog')
	.controller('ActivityLogController', ActivityLogController);

	function ActivityLogController ($filter, $ionicPopover, $scope, $state, $q, $ionicHistory, $ionicModal, $cordovaFile, $cordovaFileOpener2, $cordovaEmailComposer, $persist, pdfService, timeFrame, startDate, endDate, startingCash, expenses, sales, cashInfusions, Database, $q) {
		var vm = this;

		var win = window;
		win.vm = vm;

		vm.startDate 		= startDate;
		vm.timeFrame 		= timeFrame;
		vm.endDate 			= endDate;
		vm.sales 			= sales;
		vm.expenses 		= expenses;
		vm.getUserInfo = getUserInfo;
		vm.cashInfusions 	= cashInfusions;
		vm.startingCash 	= startingCash;
		vm.endingCash		= 0;
		vm.incomeStatement	= [];
		vm.language = {};
		vm.createPopupMenu = createPopupMenu;
		vm.showPopupMenu = showPopupMenu;
		vm.closePopupMenu = closePopupMenu;
		vm.createActivityLogPdf = pdfService.createActivityLogPdf;
		vm.createPDFModal = createPDFModal;
		vm.closePDFViewer = closePDFViewer;
		vm.emailPDF = emailPDF;
		vm.createPDFEmail = createPDFEmail;
		vm.createPDFPopupMenu = createPDFPopupMenu;
		vm.openPDFPopover = openPDFPopover;
		vm.closePDFPopupMenu = closePDFPopupMenu;

		// vm.showPDFModal = showPDFModal;
		vm.createReport = createReport;
		vm.user = null;
		vm.vmScope = $scope;

		vm.change = change;

		vm.pdfViewerTitle = "Activity Log";
		vm.pdfViewerNumber = 2;

		function init () {
			vm.endingCash = calculateEndCash();
			getUserInfo();
			createPopupMenu($scope);
			createPDFModal($scope);
			createPDFPopupMenu($scope);
			prepareIncomeStatement();
		}

		function getUserInfo() {
			Log.l("AL: in getUserInfo()...")
			// return 
			Database.select('user').then(function(response) {
				var items = [];
				Log.l("AL: getUserInfo() done, retrieved " + response.rows.length + " items.");
				if (response.rows.length === 0) {
					return items;
				}
				for (var i = response.rows.length - 1; i >= 0; i--) {
					var item = response.rows.item(i);
					items.push(item);
				}
				Log.l("AL: getUserInfo() done, retrieved:");
				Log.l(JSON.stringify(items[0]));
				vm.user = items[0];
				return items[0];
			});
		}

		function loadSales () {
			return Database.select('sale', null, null, null, vm.startDate, vm.endDate)
			.then(function (response) {
				vm.sales.length = 0;
				vm.salesTotal = 0;
				for (var i = response.rows.length - 1; i >= 0; i--) {
					var sale = response.rows.item(i);
					sale.date = moment(sale.date);
					sale.amount = Number(sale.amount);
					vm.salesTotal += sale.amount;
					vm.sales.push(sale);
				}
			});
		}

		function loadExpenses () {
			return Database.select('expense', null, null, null, vm.startDate, vm.endDate)
			.then(function (response) {
				vm.expenses.length = 0;
				vm.totalExpenses = 0;
				for (var i = response.rows.length - 1; i >= 0; i--) {
					var expense = response.rows.item(i);
					expense.amount = Number(expense.amount);
					vm.totalExpenses += expense.amount;
					expense.date = moment(expense.date);
					vm.expenses.push(expense);
				}
			});
		}

		function loadCashInfusions () {
			return Database.select('cashInfusion', null, null, null, vm.startDate, vm.endDate)
			.then(function (response) {
				vm.cashInfusions.length = 0;
				vm.totalCashInfusions = 0;
				for (var i = response.rows.length - 1; i >= 0; i--) {
					var cashInfusion = response.rows.item(i);
					cashInfusion.date = moment(cashInfusion.date);
					cashInfusion.amount = Number(cashInfusion.amount);
					vm.totalCashInfusions += cashInfusion.amount;
					vm.cashInfusions.push(cashInfusion);
				}
			});
		}

		function change (startDate, timeFrame) {
			var promises = [];
			vm.startDate = startDate;
			vm.timeFrame = timeFrame;
			vm.endDate = moment(vm.startDate).endOf(vm.timeFrame.value);
			promises.push(Database.calculateCashOnHand(null, vm.startDate).then(function (response) {
				vm.startingCash = response.rows.item(0) ? response.rows.item(0).total : 0;
			}));

			promises.push(loadExpenses());
			promises.push(loadCashInfusions());
			promises.push(loadSales());

			$q.all(promises).then(calculateEndCash).then(prepareIncomeStatement);
		}

		function calculateEndCash () {
			vm.endingCash = vm.startingCash;

			vm.endingCash = vm.expenses.reduce(function (prev, curr) {
				return prev - curr.amount;
			}, vm.endingCash);

			vm.endingCash = vm.sales.reduce(function (prev, curr) {
				return prev + curr.amount;
			}, vm.endingCash);

			vm.endingCash = vm.cashInfusions.reduce(function (prev, curr) {
				return prev + curr.amount;
			}, vm.endingCash);

			return vm.endingCash;
		}

		function prepareIncomeStatement () {
			vm.sales.forEach(function (sale) {
				sale.isExpense = false;
			});
			vm.expenses.forEach(function (expense) {
				expense.isExpense = true;
			});
			vm.cashInfusions.forEach(function (cash) {
				cash.isExpense = false;
				cash.isCash = true;
			})

			vm.incomeStatement = vm.sales.concat(vm.expenses).concat(vm.cashInfusions);
			vm.incomeStatement.sort(function (a, b) {
				if (a.date < b.date) {
					return -1;
				}

				if (a.date > b.date) {
					return 1;
				}

				return 0;
			});
			var rdat = {};
			rdat.timeFrame = vm.timeFrame;
			rdat.startDate = vm.startDate;
			rdat.endDate = vm.endDate;
			rdat.cashInfusions = vm.cashInfusions;
			rdat.startingCash = vm.startingCash;
			rdat.endingCash = vm.endingCash;
			rdat.totalSales = vm.salesTotal;
			rdat.totalExpenses = vm.totalExpenses;
			rdat.totalCashInfusions = vm.totalCashInfusions;
			Log.l("getIncomeStatement(): report data and incomeStatement are:");
			Log.l(JSON.stringify(rdat));
			Log.l(vm.incomeStatement);
			vm.reportData = rdat;
		}

		function createPopupMenu($scope) {
			Log.l("AL: showing Popup Menu ...");
			$ionicPopover.fromTemplateUrl('ActivityLog/templates/PopupMenu.html', {
				scope: $scope
			}).then(function(popover) {
				Log.l("AL: now in function after ionicPopover.fromTemplateUrl(PopupMenu) ...");
				$scope.popover = popover;
				vm.popover = popover;
				// popover.show(".income-statement-menu")
				//Cleanup the popover when we're done with it!
				vm.vmScope.$on('$destroy', function() {
					Log.l("AL: now in scope.on('destroy')");
					vm.popover.remove();
				});
				// Execute action on hidden popover
				vm.vmScope.$on('popover.hidden', function() {
					Log.l("AL: now in scope.on('popover.hidden')");
					// Execute action
				});
				// Execute action on remove popover
				vm.vmScope.$on('popover.removed', function() {
					Log.l("AL: now in scope.on('popover.removed')");
					// Execute action
				});
			});
		}

		function showPopupMenu($event) {
			Log.l("AL: now in scope.openPopover()")
			vm.popover.show('.ion-more');
/*
			var headerbar = angular.element(".income-statement-bar");
			var hbar = $("ion-header-bar");
			var hbarheight = hbar.height();
			Log.l("AL: Menu bar height is %d px", hbarheight);
			var elPopover = $("#PopupMenu004");
			var popTop = elPopover.position().top;
			Log.l("elPopover has top " + popTop);
			var newPopTop = hbarheight + "px";
			elPopover.css("top", newPopTop);
			Log.l("elPopover now has top " + newPopTop);
*/
			// vm.popover.positionView(".ion-android-menu", vm.popover);
			// vm.popover.show(".ion-android-menu");
			// vm.popover.positionView(".ion-android-menu", vm.popover);
		}


		function closePopupMenu() {
			Log.l("AL: now in scope.closePopupMenu()")
			vm.popover.hide();
		}

		function createPDFPopupMenu($scope) {
			Log.l("AL: showing PDFPopup Menu ...");
			$ionicPopover.fromTemplateUrl('templates/PDFPopupMenu.html', {
				scope: $scope
			}).then(function(popover) {
				Log.l("AL: now in function after ionicPopover.fromTemplateUrl('PDFPopupMenu') ...");
				$scope.pdfMenuPopover = popover;
				vm.pdfMenuPopover = popover;
				// popover.show(".income-statement-menu")
			});

			//Cleanup the popover when we're done with it!
			vm.vmScope.$on('$destroy', function() {
				Log.l("AL: now in scope.on('destroy') for pdfMenuPopover");
				vm.pdfMenuPopover.remove();
			});
			// Execute action on hidden popover
			vm.vmScope.$on('pdfMenuPopover.hidden', function() {
				Log.l("AL: now in scope.on('pdfMenuPopover.hidden')");
				// Execute action
			});
			// Execute action on remove popover
			vm.vmScope.$on('pdfMenuPopover.removed', function() {
				Log.l("AL: now in scope.on('pdfMenuPopover.removed')");
				// Execute action
			});
		}

		function openPDFPopover($event) {
			Log.l("AL: now in openPDFPopover()")
			// vm.popover.show($event);
			vm.pdfMenuPopover.show('.ion-more');
			// var headerbar = angular.element(".income-statement-bar");
			// var hbar = $("ion-header-bar");
			// var hbarheight = hbar.height();
			// Log.l("AL: Menu bar height is %d px", hbarheight);
			// var elPopover = $("#PopupMenu002");
			// var popTop = elPopover.position().top;
			// Log.l("elPopover has top " + popTop);
			// var newPopTop = hbarheight + "px";
			// elPopover.css("top", newPopTop);
			// Log.l("elPopover now has top " + newPopTop);
		}

		function closePDFPopupMenu() {
			Log.l("AL: Now in closePDFMenu() ...");
			vm.pdfMenuPopover.hide();
			vm.closePDFViewer();
			vm.closePopupMenu();
		}

		function closePDFViewer() {
			Log.l("AL: Now in closePDFViewer()...");
			// vm.pdfModal.hide();
			vm.pdfModal.hide();
		}

		function emailPDF() {
			Log.l("AL: Now in emailPDF()...");
			vm.createPDFEmail();
		}

		function createPDFEmail() {
			Log.l("AL: Now in createPDFEmail()...");
			$cordovaEmailComposer.isAvailable().then(function() {
				Log.l("AL: cordovaEmailComposer() is available!");
				var pdfmail = {
					to: '',
					attachments: [
					vm.pdfFileURL
					],
					subject: 'Activity Log PDF',
					body: 'Attached is the activity log PDF file from SEPI.',
					isHtml: true
				};
				$cordovaEmailComposer.open(pdfmail).then(function(success) {
					Log.l("User sent e-mail successfully!");
					Log.l("Now canceling PDF display!");
					vm.closePDFViewer();
				}, function(err) {
					Log.l("User canceled e-mail!");
					Log.l(err);
				})
			}, function() {
				Log.l("AL: cordovaEmailComposer() is NOT available.");
			});
		}


		function closeActivityLog() {
			Log.l("AL: closing Activity Log ...");
			$state.go('app.reports');
			// $ionicHistory.goBack();
		}

		function createPDFModal($scope) {
			Log.l("AL: Now in generatePDF()");
			// Initialize the modal view.
			$ionicModal.fromTemplateUrl('templates/pdf-viewer.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function(modal) {
				$scope.modal = modal;
				vm.modal = modal;
				vm.pdfModal = modal;
				setDefaultsForPdfViewer(vm);
			});
		}

		function createReport() {
			Log.l("AL: Now running createReport()...");
			vm.popover.hide();
			vm.pdfModal.show();
			// vm.createPdf(vm.incomeStatement, vm.user).then(function(pdf) {
			vm.createActivityLogPdf(vm.incomeStatement, vm.user, vm.reportData).then(function(pdf) {
				Log.l("AL: Now in function after createActivityLogPdf()...")
				var blob = new Blob([pdf], { type: 'application/pdf' });
				vm.pdfblob = blob;
				win.pdfblob = blob;
				vm.pdfFileURL = URL.createObjectURL(blob);
				win.pdfFileURL = vm.pdfFileURL;
				// vm.vmScope.pdfUrl = URL.createObjectURL(blob);
				vm.vmScope.pdfUrl = vm.pdfFileURL;
				$cordovaFile.writeFile(cordova.file.externalDataDirectory, "ActivityLog.pdf", blob, true).then(function(res) {
					Log.l("AL: Success creating PDF file!");
					Log.l(res);
					vm.pdfFile = res;
					win.pdfFile = res;
				}, function(err) {
					Log.l("AL: Failed creating PDF file!");
					Log.e(err);
				});
			});
		}

		function setDefaultsForPdfViewer(pdfScope) {
			pdfScope.scroll = 0;
			pdfScope.loading = 'loading';
			vm.loading = pdfScope.loading;
			pdfScope.pdfViewerTitle = vm.pdfViewerTitle;
			pdfScope.pdfViewerNumber = vm.pdfViewerNumber;

			pdfScope.onError = function(err) {
				Log.e(err);
			};

			pdfScope.onLoad = function() {
				pdfScope.loading = '';
			};

			pdfScope.onProgress = function(progress) {
				Log.l(progress);
			};

			// pdfScope.scroll = 0;
			// pdfScope.loading = 'loading';

			// pdfScope.onError = function(err) {
			// 	Log.e(err);
			// };

			// pdfScope.onLoad = function() {
			// 	pdfScope.loading = '';
			// };

			// pdfScope.onProgress = function(progress) {
			// 	Log.l(progress);
			// };
		}

		init();
	}
})()
