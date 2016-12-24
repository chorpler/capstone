(function() {
	angular.module('app.income-statement')
		.controller('IncomeStatementController', IncomeStatementController);

	function IncomeStatementController(startDate, endDate, timeFrame, incomeStatement, ISpdfService, IonicFiles, Database, user, formats, $filter, $ionicPopover, $scope, $state, $q, $ionicHistory, $ionicModal, $cordovaFile, $cordovaFileOpener2, $cordovaEmailComposer, $persist) {
		var vm = this;
		var win = window;
		win.vm = vm;
		win.sepi = win.sepi || {};
		win.sepi.scope = $scope;

		win.cordovaFile = $cordovaFile;
		win.cordovaEmail = $cordovaEmailComposer;
		win.persist = $persist;
		win.sepiDatabase = Database;

		var fileDirectory = cordova.file.dataDirectory;
		vm.fileDirectory = fileDirectory;
		win.sepi.fileDirectory = fileDirectory;

		vm.vmScope = $scope;
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
			getUserInfo();
			getIncomeStatement(vm.Database);
			vm.incomeStatement.incomeItems.sort(sortByName);
			vm.incomeStatement.expenseItems.sort(sortByName);
			calculateTotals();
			// setDefaultsForPdfViewer($scope);
			vm.createPopupMenu($scope).then(function(res) {
				return vm.createPDFModal($scope);
			}).then(function(res) {
				return vm.createPDFPopupMenu($scope);
			}).then(function(res) {
				Log.l("IAR: Init() now done!");
			})
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
			db.generateIncomeStatement(vm.startDate, vm.endDate, vm.groupBy).then(function(incomeStatement) {
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
			Database.select('user').then(function(response) {
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

		function createPDFPopupMenu($scope) {
			Log.l("IA: creating PDFPopup Menu ...");
			return $ionicPopover.fromTemplateUrl('IncomeStatement/templates/PDFPopupMenu.html', {
				scope: $scope
			}).then(function(popover) {
				Log.l("IA: now in function after ionicPopover.fromTemplateUrl('PDFPopupMenu') ...");
				$scope.pdfMenuPopover = popover;
				vm.pdfMenuPopover = popover;
			});

			//Cleanup the popover when we're done with it!
			$scope.$on('$destroy', function() {
				Log.l("IA: now in scope.on('destroy') for pdfMenuPopover");
				vm.pdfMenuPopover.remove();
			});
			// Execute action on hidden popover
			$scope.$on('pdfMenuPopover.hidden', function() {
				Log.l("IA: now in scope.on('pdfMenuPopover.hidden')");
				// Execute action
			});
			// Execute action on remove popover
			$scope.$on('pdfMenuPopover.removed', function() {
				Log.l("IA: now in scope.on('pdfMenuPopover.removed')");
				// Execute action
			});
		}

		function openPDFPopupMenu($event) {
			Log.l("IA: now in openPDFPopupMenu()")
			vm.pdfMenuPopover.show('.menu-button-pdf-viewer-income-statement');
		}

		function closePDFPopupMenu() {
			Log.l("IA: Now in closePDFMenu() ...");
			vm.pdfMenuPopover.hide();
			vm.closePDFViewer();
			vm.closePopupMenu();
		}

		function createPopupMenu($scope) {
			Log.l("IA: creating Popup Menu ...");
			return $ionicPopover.fromTemplateUrl('IncomeStatement/templates/PopupMenu.html', {
				scope: $scope
			}).then(function(popover) {
				Log.l("IA: now in function after ionicPopover.fromTemplateUrl(PopupMenu) ...");
				$scope.popupMenu = popover;
				vm.popupMenu = popover;
				$scope.$on('$destroy', function() {
					Log.l("IA: now in scope.on('destroy')");
					vm.popupMenu.remove();
				});
				// Execute action on hidden popover
				$scope.$on('popupMenu.hidden', function() {
					Log.l("IA: now in scope.on('popupMenu.hidden')");
					// Execute action
				});
				// Execute action on remove popover
				$scope.$on('popupMenu.removed', function() {
					Log.l("IA: now in scope.on('popupMenu.removed')");
					// Execute action
				});
			});
		}

		function showPopupMenu($event) {
			Log.l("IA: now in scope.showPopupMenu()")
			vm.popupMenu.show('.menu-button-income-statement');
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

		function closePDFViewer() {
			Log.l("IA: Now in closePDFViewer()...");
			// vm.pdfModal.hide();
			vm.pdfModal.hide();
		}

		function emailPDF() {
			Log.l("IA: Now in emailPDF()...");
			vm.createPDFEmail();
		}

		// function createPDFEmail() {
		// 	Log.l("IA: Now in createPDFEmail()...");
		// 	$cordovaEmailComposer.isAvailable().then(function() {
		// 		Log.l("IA: cordovaEmailComposer() is available!");
		// 		var pdfmail = {
		// 			to: '',
		// 			attachments: [
		// 			vm.pdfFileURL
		// 			],
		// 			subject: 'Income Statement PDF',
		// 			body: 'Attached is the income statement PDF file from SEPI.',
		// 			isHtml: true
		// 		};
		// 		$cordovaEmailComposer.open(pdfmail).then(function(success) {
		// 			Log.l("User sent e-mail successfully!");
		// 			Log.l("Now canceling PDF display!");
		// 			vm.closePDFViewer();
		// 		}, function(err) {
		// 			Log.l("User canceled e-mail!");
		// 			Log.l(err);
		// 		})
		// 	}, function() {
		// 		Log.l("IA: cordovaEmailComposer() is NOT available.");
		// 	});
		// }

		function createPDFEmail() {
			Log.l("IA: Now in createPDFEmail()...");
			// $cordovaEmailComposer.isAvailable().then(function() {
			var SocialSharing = IonicNative.SocialSharing;
			SocialSharing.canShareViaEmail().then(function() {
				Log.l("IA: SocialSharing() is available!");
				var to = [];
				var attachments = [ vm.pdfDataFileURL];
				var subject = "Income Statement PDF";
				var body = "Attached is the income statement PDF file from SEPI.";
				Log.l("Now attempting to email file:\n%s", vm.pdfFileName);
				SocialSharing.shareViaEmail(body, subject, to, [], [], attachments).then(function(res) {
				// $cordovaEmailComposer.open(pdfmail).then(function(success) {
					Log.l("User sent e-mail successfully!");
					Log.l("Now closing PDF display!");
					vm.closePDFViewer();
				}).catch(function(err) {
					Log.l("User canceled e-mail!");
					Log.l(err);
				});
			}, function() {
				Log.l("IA: SocialSharing() is NOT available.");
			});
		}

		function createPDFModal($scope) {
			Log.l("IA: Now in createPDFModal()");
			// Initialize the modal view.
			return $ionicModal.fromTemplateUrl('IncomeStatement/templates/pdf-viewer.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function(modal) {
				$scope.modal = modal;
				vm.modal = modal;
				$scope.pdfModal = modal;
				vm.pdfModal = modal;
				$scope.$on('$destroy', function() {
					Log.l("IncomeStatement.controller: Cleaning up scope and removing pdfModal...")
					vm.pdfModal.remove();
				});
				setDefaultsForPdfViewer($scope);
			});
		}

		// function createReport() {
		// 	Log.l("IAR: Now running createReport()...");
		// 	// vm.createPdf(vm.incomeStatement, vm.user).then(function(pdf) {
		// 	vm.popupMenu.hide();
		// 	vm.createPDF(vm.incomeStatement, vm.user, vm.reportData).then(function(pdf) {
		// 		Log.l("IAR: Now in function after IncomeStatementService.createPDF()...")
		// 		var blob = new Blob([pdf], { type: 'application/pdf' });
		// 		vm.pdfblob = blob;
		// 		win.pdfblob = blob;
		// 		vm.pdfFileURL = URL.createObjectURL(blob);
		// 		win.pdfFileURL = vm.pdfFileURL;
		// 		// vm.vmScope.pdfUrl = URL.createObjectURL(blob);
		// 		vm.vmScope.pdfUrl = vm.pdfFileURL;
		// 		$cordovaFile.writeFile(fileDirectory, "IncomeStatement.pdf", blob, true).then(function(success) {
		// 			Log.l("Success creating PDF file!");
		// 			Log.l(success);
		// 			vm.pdfFile = success;
		// 			win.pdfFile = success;
		// 		}, function(error) {
		// 			Log.l("Failed creating PDF file!");
		// 			Log.e(error);
		// 		});
		// 		// Display the modal view
		// 		vm.pdfModal.show();
		// 	});
		// }

		function createReport() {
			Log.l("IA: Now running createReport(). reformattedList is:\n%s",JSON.stringify(vm.reformattedList, false, 2));
			vm.popupMenu.hide();
			vm.pdfModal.show();
			vm.createIncomeStatementPdf(vm.incomeStatement, vm.user, vm.reportData).then(function(pdf) {
				Log.l("IA: Now in function after createIncomeStatementPdf()...")
				var blob = new Blob([pdf], { type: 'application/pdf' });
				vm.pdfblob = blob;
				win.pdfblob = blob;
				vm.pdfFileURL = URL.createObjectURL(blob);
				win.pdfFileURL = vm.pdfFileURL;
				vm.vmScope.pdfUrl = vm.pdfFileURL;
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
				Log.l("Done generating PDF and creating local URL for PDF.");
			}).catch(function(err) {
				Log.l("Error converting cordova URL to local URL!");
				Log.l(err);
			});
		}

		function setDefaultsForPdfViewer(pdfScope) {
			pdfScope.scroll = 0;
			pdfScope.loading = 'loading';
			pdfScope.pdfLoaded = false;

			pdfScope.onError = function(error) {
				Log.l("IA: Got pdfScope.onError!");
				Log.l(error);
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

