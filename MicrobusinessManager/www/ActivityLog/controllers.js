
(function () {
	angular.module('app.activitylog')
	.controller('ActivityLogController', ActivityLogController);

	function ActivityLogController ($filter, $ionicPopover, $log, $scope, $rootScope, $state, $q, $ionicHistory, $ionicModal, $ionicPopup, $cordovaFile, $cordovaFileOpener2, $persist, IonicFiles, ALpdfService, timeFrame, startDate, endDate, startingCash, expenses, sales, cashInfusions, Database, formats) {
		var vm = this;

		var win = window;
		win.vm = vm;
		var rs = $rootScope;
		var code = rs.code || {};
		win.sepi = win.sepi || {};

		var fileDirectory = cordova.file.syncedDataDirectory || cordova.file.dataDirectory;
		vm.fileDirectory = fileDirectory;

		$scope.vm = vm;
		win.cFile = $cordovaFile;
		win.sepi.fileDirectory = fileDirectory;

		vm.scopes = vm.scopes || {};
		vm.scopes.root = $rootScope;
		vm.scopes.activitylog = $scope;

		vm.formats = formats;
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
		vm.openPDFPopupMenu = openPDFPopupMenu;
		vm.closePDFPopupMenu = closePDFPopupMenu;
		vm.pdfPopupMenu = null;
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
			win.formats = vm.formats;
			vm.endingCash = calculateEndCash();
			vm.getUserInfo().then(function(res) {
				return vm.createPopupMenu(vm.scopes.activitylog);
			}).then(function(res) {
				// return vm.createPDFModal($scope);
			// }).then(function(res) {
				// return vm.createPDFPopupMenu($scope);
			// }).then(function(res) {
				return vm.initializeAllValues();
			}).then(function(res) {
				Log.l("AL: init() is done!");
			});
		}

		function getUserInfo() {
			Log.l("AL: in getUserInfo()...");
			return Database.select('user').then(function(response) {
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
			var d = $q.defer();
		 $ionicPopover.fromTemplateUrl('ActivityLog/templates/PopupMenu.html', {
				scope: $scope
			}).then(function(popupMenu) {
				Log.l("AL: now in function after ionicPopover.fromTemplateUrl(PopupMenu) ...");
				$scope.popupMenu = popupMenu;
				vm.popupMenu = popupMenu;

				$scope.$on('$destroy', function() {
					Log.l("AL: now in scope.on('destroy')");
					vm.popupMenu.remove();
				});
				// Execute action on hidden popupMenu
				$scope.$on('popupMenu.hidden', function() {
					Log.l("AL: now in scope.on('popupMenu.hidden')");
					// Execute action
				});
				// Execute action on remove popupMenu
				$scope.$on('popupMenu.removed', function() {
					Log.l("AL: now in scope.on('popupMenu.removed')");
					// Execute action
				});
				d.resolve(vm.popupMenu);
			}).catch(function(err) {
				Log.l("AL: Error creating popupMenu!");
				Log.l(err);
				d.reject(err);
			});
			return d.promise;
		}

		function showPopupMenu($event) {
			Log.l("AL: now in showPopupMenu()")
			// var menuElement = angular.element(document).find('.menu-button-activity-log');
			var menuElement = document.querySelector('.menu-button-activity-log');
			vm.popupMenu.show(menuElement);
			// vm.popupMenu.show('.menu-button-activity-log');
		}


		function closePopupMenu() {
			Log.l("AL: now in scope.closePopupMenu()")
			vm.popupMenu.hide();
		}

		function createPDFPopupMenu($scope) {
			Log.l("AL: Now in createPDFPopupMenu() ...");
			var d = $q.defer();
			$ionicPopover.fromTemplateUrl('ActivityLog/templates/PDFPopupMenu.html', {
				scope: $scope
			}).then(function(pdfPopupMenu) {
				Log.l("AL: now in function after ionicPopover.fromTemplateUrl('PDFPopupMenu') ...");
				$scope.pdfPopupMenu = pdfPopupMenu;
				vm.pdfPopupMenu = pdfPopupMenu;
				// pdfPopupMenu.show(".income-statement-menu")
				//Cleanup the pdfPopupMenu when we're done with it!
				$scope.$on('$destroy', function() {
					Log.l("AL: now in scope.on('destroy') for pdfPopupMenu");
					vm.pdfPopupMenu.remove();
				});
				// Execute action on hidden pdfPopupMenu
				$scope.$on('pdfPopupMenu.hidden', function() {
					Log.l("AL: now in scope.on('pdfPopupMenu.hidden')");
					// Execute action
				});
				// Execute action on remove pdfPopupMenu
				$scope.$on('pdfPopupMenu.removed', function() {
					Log.l("AL: now in scope.on('pdfPopupMenu.removed')");
					// Execute action
				});
				Log.l("AL: Now done creating pdfPopupMenu.");
				Log.l(vm.pdfPopupMenu);
				d.resolve(vm.pdfPopupMenu);
			}).catch(function(err) {
				Log.l("AL: Error creating pdfPopupMenu!");
				Log.l(err);
				d.reject(err);
			});
			return d.promise;
		}

		function openPDFPopupMenu($event) {
			Log.l("AL: now in openPDFPopupMenu(), pdfPopupmenu is:");
			Log.l(vm.pdfPopupmenu);
			// var menuElement = angular.element(document).find('.menu-button-pdf-viewer-activity-log');
			var menuElement = document.querySelector('.menu-button-pdf-viewer-activity-log');
			vm.pdfPopupMenu.show(menuElement);
			// vm.pdfPopupMenu.show('.menu-button-pdf-viewer-activity-log');
		}

		function closePDFPopupMenu() {
			Log.l("AL: Now in closePDFMenu() ...");
			vm.pdfPopupMenu.hide();
		}

		function closePDFViewer() {
			Log.l("AL: Now in closePDFViewer()...");
			// vm.pdfModal.hide();
			vm.pdfPopupMenu.remove();
			vm.pdfModal.remove();
			vm.closePopupMenu();
		}

		function emailPDF() {
			Log.l("AL: Now in emailPDF()...");
			vm.createPDFEmail();
		}

		function createPDFEmail() {
			Log.l("AL: Now in createPDFEmail()...");
			var SocialSharing = IonicNative.SocialSharing;
			SocialSharing.canShareViaEmail().then(function() {
				Log.l("AL: SocialSharing() is available!");
				var to = [];
				var attachments = [ vm.pdfDataFileURL];
				var subject = "Activity Log PDF";
				var body = "Attached is the activity log PDF file from SEPI.";
				Log.l("Now attempting to email file:\n%s", vm.pdfFileName);
				SocialSharing.shareViaEmail(body, subject, to, [], [], attachments).then(function(res) {
					Log.l("User sent e-mail successfully!");
					Log.l("Now closing PDF display!");
					// vm.closePDFPopupMenu();
				}).catch(function(err) {
					Log.l("User canceled e-mail!");
					Log.l(err);
				});
			}, function() {
				Log.l("AL: SocialSharing() is NOT available.");
				var title = $filter('translate')("str_error").toUpperCase();
				var text = $filter('translate')("str_email_not_available");
				rs.code.showPopupAlert(title, text);
			});
		}

		function closeActivityLog() {
			Log.l("AL: closing Activity Log ...");
			$state.go('app.reports');
			// $ionicHistory.goBack();
		}

		function createPDFModal($scope) {
			Log.l("AL: Now in createPDFModal()");
			var d = $q.defer();
			// Initialize the modal view.
			$ionicModal.fromTemplateUrl('ActivityLog/templates/pdf-viewer.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function(pdfModal) {
				Log.l("AL: Now in function after ionicModal.fromTemplateUrl(pdfViewer)...");
				$scope.pdfModal = pdfModal;
				vm.pdfModal = pdfModal;
				$scope.$on('$destroy', function() {
					Log.l("AL: now in scope.on('destroy') for pdfModal");
					vm.pdfModal.remove();
				});
				// Execute action on hidden popover
				$scope.$on('pdfModal.hidden', function() {
					Log.l("AL: now in scope.on('pdfModal.hidden')");
					// Execute action
				});
				// Execute action on remove popover
				$scope.$on('pdfModal.removed', function() {
					Log.l("AL: now in scope.on('pdfModal.removed')");
					// Execute action
				});
				return createPDFPopupMenu($scope);
			}).then(function(res) {
				setDefaultsForPdfViewer($scope);
				Log.l("AL: Done creating pdfModal and pdfPopupMenu!");
				d.resolve(res);
			}).catch(function(err) {
				Log.l("AL: Error creating PDF modal!");
				Log.l(err);
				d.reject(err);
			});
			return d.promise;
		}

		function createReport() {
			Log.l("AL: Now running createReport()...");
			vm.popupMenu.hide();
			createPDFModal(vm.scopes.activitylog).then(function(res) {
				return vm.pdfModal.show();
			}).then(function(res) {
				return vm.createActivityLogPdf(vm.incomeStatement, vm.user, vm.reportData);
			}).then(function(pdf) {
				Log.l("AL: Now in function after createActivityLogPdf()...")
				var blob = new Blob([pdf], { type: 'application/pdf' });
				vm.pdfblob = blob;
				win.pdfblob = blob;
				vm.pdfFileURL = URL.createObjectURL(blob);
				win.pdfFileURL = vm.pdfFileURL;
				return $cordovaFile.writeFile(fileDirectory, "ActivityLog.pdf", blob, true);
			}).then(function(res) {
				Log.l("AL: Success creating PDF file!");
				Log.l(res);
				vm.pdfFile = res;
				win.pdfFile = res;
				var cordovaURL = res.target.localURL;
				return IonicFiles.convertToDataURL(cordovaURL);
			}).then(function(res) {
				vm.pdfLocalFileURL = res;
				vm.pdfDataFileURL = res;
				win.pdfLocalFileURL = res;
				win.pdfDataFileURL = res;
				vm.scopes.activitylog.pdfUrl = vm.pdfFileURL;
				vm.pdfUrl = vm.pdfFileURL;
				Log.l("Done generating PDF and creating local URL for PDF.");
			}).catch(function(err) {
				Log.l("AL: Failed creating PDF file!");
				Log.l(err);
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
				Log.l(err);
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
