(function() {
	angular.module('app.income-statement')
		.controller('IncomeStatementController', IncomeStatementController);

	function IncomeStatementController(startDate, endDate, timeFrame, incomeStatement, ISpdfService, IonicFiles, Database, user, formats, $filter, $ionicPopover, $ionicPopup, $scope, $rootScope, $state, $q, $ionicHistory, $ionicModal, $cordovaFile, $cordovaFileOpener2, $cordovaEmailComposer, $persist) {
		var vm = this;
		var win = window;
		win.vm = vm;
		vm.scope = $scope;
		vm.vmScope = $scope;
		var rs = $rootScope;
		var code = rs.code || {};
		win.sepi = win.sepi || {};
		win.sepi.filter = $filter;
		vm.scopes = vm.scopes || {};
		vm.scopes.root = $rootScope;
		vm.scopes.incomestatement = $scope;
		vm.formats = formats;

		win.cordovaFile = $cordovaFile;
		win.cordovaEmail = $cordovaEmailComposer;
		win.persist = $persist;
		win.sepiDatabase = Database;

		var fileDirectory = cordova.file.syncedDataDirectory || cordova.file.dataDirectory;
		vm.fileDirectory = fileDirectory;
		win.sepi.fileDirectory = fileDirectory;

		vm.showPopupMenu = showPopupMenu;
		vm.startDate = startDate;
		vm.endDate = endDate;
		vm.timeFrame = timeFrame;
		vm.incomeStatement = incomeStatement;
		vm.createPopupMenu = createPopupMenu;
		vm.closePopupMenu = closePopupMenu;
		vm.closeIncomeStatement = closeIncomeStatement;
		vm.createPDFModal = createPDFModal;
		vm.getUserInfo = getUserInfo;
		vm.createReport = createReport;
		vm.closePDFViewer = closePDFViewer;
		vm.emailPDF = emailPDF;
		vm.createPDFEmail = createPDFEmail;
		vm.createPDFPopupMenu = createPDFPopupMenu;
		vm.openPDFPopupMenu = openPDFPopupMenu;
		vm.closePDFPopupMenu = closePDFPopupMenu;
		vm.user = user;
		vm.formats = formats;
		vm.groupBy = 'name';
		vm.ionicPopover = $ionicPopover;
		vm.getIncomeStatement = getIncomeStatement;
		vm.Database = Database;
		vm.createIncomeStatementPdf = ISpdfService.createIncomeStatementPdf;
		vm.pdfModal = {};
		vm.reportData = {};
		vm.pdfblob = null;
		vm.pdfFile = null;

		vm.totalIncome;
		vm.totalExpenses;
		vm.totalProfit;

		vm.change = change;
		vm.changeGroupBy = changeGroupBy;

		vm.pdfViewerTitle = "Income Statement";
		vm.pdfViewerNumber = 1;

		function init() {
			Log.l("IAR: Now running init...");
			Log.l("IAR: Now attempting to getUserInfo()...");
			win.formats = vm.formats;
			getUserInfo().then(function(res) {
				return getIncomeStatement(vm.Database);
			}).then(function(res) {
				vm.incomeStatement.incomeItems.sort(sortByName);
				vm.incomeStatement.expenseItems.sort(sortByName);
				calculateTotals();
				return vm.createPopupMenu(vm.scopes.incomestatement);
			}).then(function(res) {
			// 	return vm.createPDFModal($scope);
			// }).then(function(res) {
			// 	return vm.createPDFPopupMenu($scope);
			// }).then(function(res) {
				Log.l("IAR: Init() now done!");
			});
		}

		function change(startDate, timeFrame) {
			vm.startDate = startDate;
			vm.timeFrame = timeFrame;
			vm.endDate = moment(vm.startDate).endOf(vm.timeFrame.value);
			getIncomeStatement(vm.Database);
		}

		function changeGroupBy(groupBy) {
			vm.groupBy = groupBy;
			getIncomeStatement(vm.Database);
		}

		function getIncomeStatement(db) {
			return db.generateIncomeStatement(vm.startDate, vm.endDate, vm.groupBy).then(function(incomeStatement) {
				vm.incomeStatement = incomeStatement;
				vm.incomeStatement.incomeItems.sort(sortByName);
				vm.incomeStatement.expenseItems.sort(sortByName);
				Log.l("getIncomeStatement(): Got income statement. It is:");
				Log.l(JSON.stringify(vm.incomeStatement));
				calculateTotals();
				var rdat = {};
				rdat.timeFrame = vm.timeFrame;
				rdat.startDate = vm.startDate;
				rdat.endDate = vm.endDate;
				rdat.totalIncome = vm.totalIncome;
				rdat.totalExpenses = vm.totalExpenses;
				rdat.totalProfit = vm.totalProfit;
				Log.l("getIncomeStatement(): report data is:");
				Log.l(JSON.stringify(rdat));
				vm.reportData = rdat;
			});
		}

		function getUserInfo() {
			Log.l("ISR: in getUserInfo()...")
			// return 
			return Database.select('user').then(function(response) {
				var items = [];
				Log.l("ISR: getUserInfo() done, retrieved " + response.rows.length + " items.");
				if (response.rows.length === 0) {
					return items;
				}
				for (var i = response.rows.length - 1; i >= 0; i--) {
					var item = response.rows.item(i);
					items.push(item);
				}
				// user = items;
				// organization = items;
				Log.l("ISR: getUserInfo() done, retrieved:");
				Log.l(JSON.stringify(items[0]));
				return items[0];
			});
		}

		function calculateTotals() {
			vm.totalIncome = vm.incomeStatement.incomeItems.reduce(function(prev, curr) {
				return prev + curr.amount;
			}, 0);

			vm.totalExpenses = vm.incomeStatement.expenseItems.reduce(function(prev, curr) {
				return prev + curr.amount;
			}, 0);

			vm.totalProfit = vm.totalIncome - vm.totalExpenses;
		}

		function sortByName(a, b) {
			if (a.name < b.name) {
				return -1;
			}
			if (a.name > b.name) {
				return 1;
			}

			return 0;
		}

		function createPopupMenu($scope) {
			Log.l("IA: creating Popup Menu ...");
			var d = $q.defer();
			$ionicPopover.fromTemplateUrl('IncomeStatement/templates/PopupMenu.html', {
				scope: $scope
			}).then(function(popupMenu) {
				Log.l("IA: now in function after ionicPopover.fromTemplateUrl(PopupMenu) ...");
				$scope.popupMenu = popupMenu;
				vm.popupMenu = popupMenu;
				$scope.$on('$destroy', function() {
					Log.l("IA: now in scope.on('destroy')");
					vm.popupMenu.remove();
				});
				// Execute action on hidden popupMenu
				$scope.$on('popupMenu.hidden', function() {
					Log.l("IA: now in scope.on('popupMenu.hidden')");
					// Execute action
				});
				// Execute action on remove popupMenu
				$scope.$on('popupMenu.removed', function() {
					Log.l("IA: now in scope.on('popupMenu.removed')");
					// Execute action
				});
				d.resolve(vm.popupMenu);
			}).catch(function(err) {
				Log.l("IA: Error creating popupMenu!");
				Log.l(err);
				d.reject(err);
			});
			return d.promise;
		}

		function showPopupMenu($event) {
			Log.l("IA: now in scope.showPopupMenu()")
			// var menuElement = angular.element(document).find('.menu-button-income-statement');
			var menuElement = document.querySelector('.menu-button-income-statement');
			vm.popupMenu.show(menuElement);
			// vm.popupMenu.show('.menu-button-income-statement');
		}

		function closePopupMenu() {
			Log.l("IA: now in scope.closePopupMenu()")
			vm.popupMenu.hide();
		}

		function closeIncomeStatement() {
			Log.l("IA: closing Income Statement ...");
			$state.go('app.reports');
			// $ionicHistory.goBack();
		}

		function createPDFPopupMenu($scope) {
			Log.l("IA: creating PDFPopup Menu ...");
			var d = $q.defer();
			$ionicPopover.fromTemplateUrl('IncomeStatement/templates/PDFPopupMenu.html', {
				scope: $scope
			}).then(function(pdfPopupMenu) {
				Log.l("IA: now in function after ionicPopover.fromTemplateUrl('PDFPopupMenu') ...");
				$scope.pdfPopupMenu = pdfPopupMenu;
				vm.pdfPopupMenu = pdfPopupMenu;

				//Cleanup the popover when we're done with it!
				$scope.$on('$destroy', function() {
					Log.l("IA: now in scope.on('destroy') for pdfPopupMenu");
					vm.pdfPopupMenu.remove();
				});
				// Execute action on hidden popover
				$scope.$on('pdfPopupMenu.hidden', function() {
					Log.l("IA: now in scope.on('pdfPopupMenu.hidden')");
					// Execute action
				});
				// Execute action on remove popover
				$scope.$on('pdfPopupMenu.removed', function() {
					Log.l("IA: now in scope.on('pdfPopupMenu.removed')");
					// Execute action
				});
				Log.l("IA: Now done creating pdfPopupMenu.");
				Log.l(vm.pdfPopupMenu);
				d.resolve(vm.pdfPopupMenu);
			}).catch(function(err) {
				Log.l("IA: Error creating pdfPopupMenu!");
				Log.l(err);
				d.reject(err);
			});
			return d.promise;
		}

		function openPDFPopupMenu($event) {
			Log.l("IA: now in openPDFPopupMenu(), pdfPopupmenu is:");
			Log.l(vm.pdfPopupmenu);
			// var menuElement = angular.element(document).find('.menu-button-pdf-viewer-income-statement');
			var menuElement = document.querySelector('.menu-button-pdf-viewer-income-statement');
			vm.pdfPopupMenu.show(menuElement);
			// vm.pdfPopupMenu.show('.menu-button-pdf-viewer-income-statement');
		}

		function closePDFPopupMenu() {
			Log.l("IA: Now in closePDFMenu() ...");
			vm.pdfPopupMenu.hide();
		}

		function closePDFViewer() {
			Log.l("IA: Now in closePDFViewer()...");
			// vm.pdfModal.hide();
			vm.pdfPopupMenu.remove();
			vm.pdfModal.remove();
			vm.closePopupMenu();
		}

		function emailPDF() {
			Log.l("IA: Now in emailPDF()...");
			vm.createPDFEmail();
		}

		function createPDFEmail() {
			Log.l("IA: Now in createPDFEmail()...");
			var SocialSharing = IonicNative.SocialSharing;
			SocialSharing.canShareViaEmail().then(function() {
				Log.l("IA: SocialSharing() is available!");
				var to = [];
				var attachments = [ vm.pdfDataFileURL ];
				var subject = "Income Statement PDF";
				var body = "Attached is the income statement PDF file from SEPI.";
				Log.l("Now attempting to email file:\n%s", vm.pdfFileName);
				SocialSharing.shareViaEmail(body, subject, to, [], [], attachments).then(function(res) {
					Log.l("User sent e-mail successfully!");
					// Log.l("Now closing PDF display!");
					// vm.closePDFViewer();
				}).catch(function(err) {
					Log.l("User canceled e-mail!");
					Log.l(err);
				});
			}, function() {
				Log.l("IA: SocialSharing() is NOT available.");
				var title = $filter('translate')("str_error").toUpperCase();
				var text = $filter('translate')("str_email_not_available");
				rs.code.showPopupAlert(title, text);
			});
		}

		function createPDFModal($scope) {
			Log.l("IA: Now in createPDFModal()");
			var d = $q.defer();
			// Initialize the modal view.
			$ionicModal.fromTemplateUrl('IncomeStatement/templates/pdf-viewer.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function(pdfModal) {
				Log.l("IA: Now in function after ionicModal.fromTemplateUrl(pdfViewer)...");
				$scope.pdfModal = pdfModal;
				vm.pdfModal = pdfModal;
				$scope.$on('$destroy', function() {
					Log.l("IA: now in scope.on('destroy') for pdfModal")
					vm.pdfModal.remove();
				});
				// Execute action on hidden pdfModal
				$scope.$on('pdfModal.hidden', function() {
					Log.l("IA: now in scope.on('pdfModal.hidden')");
					// Execute action
				});
				// Execute action on remove pdfModal
				$scope.$on('pdfModal.removed', function() {
					Log.l("IA: now in scope.on('pdfModal.removed')");
					// Execute action
				});
				return createPDFPopupMenu($scope);
			}).then(function(res) {
				setDefaultsForPdfViewer($scope);
				Log.l("IA: Done creating pdfModal and pdfPopupMenu!");
				d.resolve(res);
			}).catch(function(err) {
				Log.l("IA: Error creating PDF modal!");
				Log.l(err);
				d.reject(err);
			});
			return d.promise;
		}

		function createReport() {
			Log.l("IA: Now running createReport(). reformattedList is:\n%s",JSON.stringify(vm.reformattedList, false, 2));
			vm.popupMenu.hide();
			createPDFModal(vm.scopes.incomestatement).then(function(res) {
				// vm.pdfModal.show();
				return vm.createIncomeStatementPdf(vm.incomeStatement, vm.user, vm.reportData);
			}).then(function(pdf) {
				Log.l("IA: Now in function after createIncomeStatementPdf()...")
				var blob = new Blob([pdf], { type: 'application/pdf' });
				vm.pdfblob = blob;
				win.pdfblob = blob;
				vm.pdfFileURL = URL.createObjectURL(blob);
				win.pdfFileURL = vm.pdfFileURL;
				return $cordovaFile.writeFile(fileDirectory, "IncomeStatement.pdf", blob, true);
			}).then(function(res) {
				Log.l("IA: Success creating PDF file!");
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
				vm.scopes.incomestatement.pdfUrl = vm.pdfFileURL;
				vm.pdfModal.show();
				Log.l("Done generating PDF and creating local URL for PDF.");
			}).catch(function(err) {
				Log.l("IA: Failed creating PDF file!");
				Log.l(err);
			});
		}

		function setDefaultsForPdfViewer(pdfScope) {
			pdfScope.scroll = 0;
			vm.pdfScope = pdfScope;
			vm.pdfLoaded = false;
			pdfScope.pdfLoaded = false;
			pdfScope.loadingVar = "PDF Creating...";
			pdfScope.loading = 'loading';
			vm.loading = pdfScope.loading;
			pdfScope.pdfViewerTitle = vm.pdfViewerTitle;
			pdfScope.pdfViewerNumber = vm.pdfViewerNumber;

			pdfScope.onError = function(err) {
				Log.l("IA: Got pdfScope.onError!");
				Log.l(err);
			};

			pdfScope.onLoad = function() {
				Log.l("IA: Got pdfScope.onLoad!");
				pdfScope.loading = '';
				pdfScope.pdfLoaded = true;
			};

			pdfScope.onProgress = function(progress) {
				Log.l("IA: Got pdfScope.onProgress!");
				Log.l(progress);
			};
		}

		init();
	}
})();

