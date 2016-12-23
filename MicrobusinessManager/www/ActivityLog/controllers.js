
(function () {
	angular.module('app.activitylog')
	.controller('ActivityLogController', ActivityLogController);

	// function ActivityLogController ($filter, $ionicPopover, $scope, $state, $q, $ionicHistory, $ionicModal, $cordovaFile, $cordovaFileOpener2, $cordovaEmailComposer, $persist, ALpdfService, timeFrame, startDate, endDate, startingCash, expenses, sales, cashInfusions, Database, $q) {
	// function ActivityLogController ($filter, $ionicPopover, $scope, $state, $q, $ionicHistory, $ionicModal, $cordovaFile, $cordovaFileOpener2, IonicNative, $persist, ALpdfService, timeFrame, startDate, endDate, startingCash, expenses, sales, cashInfusions, Database, $q) {
	function ActivityLogController ($filter, $ionicPopover, $scope, $state, $q, $ionicHistory, $ionicModal, $cordovaFile, $cordovaFileOpener2, $persist, ALpdfService, timeFrame, startDate, endDate, startingCash, expenses, sales, cashInfusions, Database, $q) {
		var vm = this;

		var win = window;
		win.vm = vm;
		win.cFile = $cordovaFile;

		win.sepi = win.sepi || {};
		
		var fileDirectory = cordova.file.dataDirectory;
		vm.fileDirectory = fileDirectory;
		win.sepi.fileDirectory = fileDirectory;

		$scope.vm = vm;

		vm.startDate = startDate;
		vm.timeFrame = timeFrame;
		vm.endDate = endDate;
		vm.sales = sales;
		vm.expenses = expenses;
		vm.cashInfusions = cashInfusions;
		vm.startingCash = startingCash;
		vm.endingCash	= 0;
		vm.incomeStatement = [];
		vm.language = {};
		vm.getUserInfo = getUserInfo;
		vm.createPopupMenu = createPopupMenu;
		vm.showPopupMenu = showPopupMenu;
		vm.closePopupMenu = closePopupMenu;
		vm.createActivityLogPdf = ALpdfService.createActivityLogPdf;
		vm.prepareIncomeStatement = prepareIncomeStatement;
		vm.createPDFModal = createPDFModal;
		vm.closePDFViewer = closePDFViewer;
		vm.emailPDF = emailPDF;
		vm.createPDFEmail = createPDFEmail;
		vm.createPDFPopupMenu = createPDFPopupMenu;
		vm.openPDFPopover = openPDFPopover;
		vm.closePDFPopupMenu = closePDFPopupMenu;
		vm.pdfMenuPopover = null;
		vm.closeActivityLog = closeActivityLog;
		vm.setDefaultsForPdfViewer = setDefaultsForPdfViewer;
		vm.initializeAllValues = initializeAllValues;

		vm.createReport = createReport;
		vm.user = null;
		vm.vmScope = $scope;

		vm.change = change;

		vm.pdfViewerTitle = "Activity Log";
		vm.pdfViewerNumber = 2;

		function init () {
			vm.endingCash = calculateEndCash();
			vm.getUserInfo();
			vm.createPopupMenu($scope);
			vm.createPDFModal($scope);
			vm.createPDFPopupMenu($scope);
			vm.initializeAllValues().then(function(res) {
				Log.l("AL: init() is done!");
			});
		}

		function getUserInfo() {
			Log.l("AL: in getUserInfo()...");
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

		function initializeAllValues() {
			Log.l("AL: now in initializeAllValues() ...");
			return $q.when(vm.change(vm.startDate, vm.timeFrame));
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
				Log.l("loadSales(): Total %0.2f.", vm.salesTotal);
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
				Log.l("loadExpenses(): Total %0.2f.", vm.totalExpenses);
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
				Log.l("loadCashInfusions(): Total %0.2f.", vm.totalCashInfusions);
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
			Log.l("Now in ActivityLog.prepareIncomeStatement()...");
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
			Log.l("AL.prepareIncomeStatement(): incomeStatement is:");
			Log.l(vm.incomeStatement);
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
				vm.popupMenu = popover;

				$scope.$on('$destroy', function() {
					Log.l("AL: now in scope.on('destroy')");
					vm.popover.remove();
				});
				// Execute action on hidden popover
				$scope.$on('popover.hidden', function() {
					Log.l("AL: now in scope.on('popover.hidden')");
					// Execute action
				});
				// Execute action on remove popover
				$scope.$on('popover.removed', function() {
					Log.l("AL: now in scope.on('popover.removed')");
					// Execute action
				});
			});
		}

		function showPopupMenu($event) {
			Log.l("AL: now in scope.openPopover()")
			vm.popupMenu.show('.menu-button-activity-log');
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
			Log.l("AL: creating PDFPopupMenu ...");
			$ionicPopover.fromTemplateUrl('templates/PDFPopupMenu.html', {
				scope: $scope
			}).then(function(popover) {
				Log.l("AL: now in function after ionicPopover.fromTemplateUrl('PDFPopupMenu') ...");
				$scope.pdfMenuPopover = popover;
				vm.pdfMenuPopover = popover;
				// popover.show(".income-statement-menu")
			});

			//Cleanup the popover when we're done with it!
			$scope.$on('$destroy', function() {
				Log.l("AL: now in scope.on('destroy') for pdfMenuPopover");
				vm.pdfMenuPopover.remove();
			});
			// Execute action on hidden popover
			$scope.$on('pdfMenuPopover.hidden', function() {
				Log.l("AL: now in scope.on('pdfMenuPopover.hidden')");
				// Execute action
			});
			// Execute action on remove popover
			$scope.$on('pdfMenuPopover.removed', function() {
				Log.l("AL: now in scope.on('pdfMenuPopover.removed')");
				// Execute action
			});
		}

		function openPDFPopover($event) {
			Log.l("AL: now in openPDFPopover()")
			// vm.popover.show($event);
			vm.pdfMenuPopover.show('.menu-button-pdf-viewer');
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
			// $cordovaEmailComposer.isAvailable().then(function() {
			var SocialSharing = IonicNative.SocialSharing;
			SocialSharing.canShareViaEmail().then(function() {
				Log.l("AL: SocialSharing() is available!");
				var to = [];
				var attachments = [ vm.pdfDataFileURL];
				var subject = "Activity Log PDF";
				var body = "Attached is the activity log PDF file from SEPI.";
				Log.l("Now attempting to email file:\n%s", vm.pdfFileName);
				SocialSharing.shareViaEmail(body, subject, to, [], [], attachments).then(function(res) {
				// $cordovaEmailComposer.open(pdfmail).then(function(success) {
					Log.l("User sent e-mail successfully!");
					Log.l("Now canceling PDF display!");
					vm.closePDFViewer();
				}).catch(function(err) {
					Log.l("User canceled e-mail!");
					Log.l(err);
				});
			}, function() {
				Log.l("AL: SocialSharing() is NOT available.");
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
				vm.setDefaultsForPdfViewer($scope);
			});
		}

		function convertToDataURL(cordovaURL) {
			Log.l("AL: Now in convertToDataURL()...");
			var dir = fileDirectory;
			var fname = "ActivityLog.pdf";
			var d = $q.defer();
			convertToFileEntry(cordovaURL).then(function(res) {
				var pdfFileEntry = res;
				var fileName = pdfFileEntry.name;
				vm.pdfFileName = fileName;
				window.pdfFileName = fileName;
				var fileDir  = pdfFileEntry.filesystem.root.toURL();
				var localURL = pdfFileEntry.toURL();
				Log.l("convertToDataURL(): Resolved cordova URL:\n%s\n%s", cordovaURL);
				return $cordovaFile.readAsDataURL(fileDir, fileName);
			}).then(function(res) {
				Log.l("convertToDataURL(): Success converting %s, data url is length %d.", fname, res.length);
				d.resolve(res);
			}).catch(function(err) {
				Log.l("convertToDataURL(): Error reading %s/%s.", dir, fname);
				Log.l(err);
				d.reject(err);
			});
			return d.promise;
		}

		function convertToFileEntry(cordovaURL) {
			Log.l("AL: Now in convertToLocalURL() ...");
			var d = $q.defer();
			resolveLocalFileSystemURL(cordovaURL, function(res) {
				var fileEntry = res;
				Log.l("Converted cordova URL to FileEntry:\n%s", cordovaURL);
				Log.l(fileEntry);
				win.localFileEntry = res;
				d.resolve(fileEntry);
			}, function(err) {
				Log.l("Error during convertToLocalURL()!");
				d.reject(err);
			});
			return d.promise;
		}

		function convertToLocalURL(cordovaURL) {
			Log.l("AL: Now in convertToLocalURL() ...");
			var d = $q.defer();
			resolveLocalFileSystemURL(cordovaURL, function(res) {
				var localURL = res.toURL();
				Log.l("Converted cordova URL to local URL:\n%s\n%s", cordovaURL, localURL);
				win.localFileEntry = res;
				d.resolve(localURL);
			}, function(err) {
				Log.l("Error during convertToLocalURL()!");
				d.reject(err);
			});
			return d.promise;
		}

		function createReport() {
			Log.l("AL: Now running createReport()...");
			vm.popover.hide();
			vm.pdfModal.show();
			vm.createActivityLogPdf(vm.incomeStatement, vm.user, vm.reportData).then(function(pdf) {
				Log.l("AL: Now in function after createActivityLogPdf()...")
				var blob = new Blob([pdf], { type: 'application/pdf' });
				vm.pdfblob = blob;
				win.pdfblob = blob;
				vm.pdfFileURL = URL.createObjectURL(blob);
				win.pdfFileURL = vm.pdfFileURL;
				// vm.vmScope.pdfUrl = URL.createObjectURL(blob);
				vm.vmScope.pdfUrl = vm.pdfFileURL;
				$cordovaFile.writeFile(fileDirectory, "ActivityLog.pdf", blob, true).then(function(res) {
					Log.l("AL: Success creating PDF file!");
					Log.l(res);
					vm.pdfFile = res;
					win.pdfFile = res;
					var cordovaURL = res.target.localURL;
					convertToDataURL(cordovaURL).then(function(res) {
						vm.pdfLocalFileURL = res;
						vm.pdfDataFileURL = res;
						win.pdfLocalFileURL = res;
						win.pdfDataFileURL = res;
						Log.l("Done generating PDF and creating local URL for PDF.");
					}).catch(function(err) {
						Log.l("Error converting cordova URL to local URL!");
					});
				}, function(err) {
					Log.l("AL: Failed creating PDF file!");
					Log.e(err);
				});
			});
		}

		function setDefaultsForPdfViewer(pdfScope) {
			pdfScope.scroll = 0;
			pdfScope.pdfLoaded = false;
			pdfScope.loading = 'loading';
			vm.loading = pdfScope.loading;
			pdfScope.pdfViewerTitle = vm.pdfViewerTitle;
			pdfScope.pdfViewerNumber = vm.pdfViewerNumber;

			pdfScope.onError = function(err) {
				Log.l("AL: Got pdfScope.onError!");
				Log.e(err);
			};

			pdfScope.onLoad = function() {
				Log.l("AL: Got pdfScope.onLoad!");
				pdfScope.loading = '';
				pdfScope.pdfLoaded = true;
			};

			pdfScope.onProgress = function(progress) {
				Log.l("AL: Got pdfScope.onProgress!");
				Log.l(progress);
			};
		}

		init();
	}
})()
