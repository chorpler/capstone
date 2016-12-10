(function() {
	angular.module('app.income-statement')
		// .controller('IncomeStatementController', ['$ionicPopover', '$scope', '$state', '$q', '$ionicHistory', '$ionicModal', IncomeStatementController]);
		.controller('IncomeStatementController', IncomeStatementController);
	// .controller('IncomeStatementController', IncomeStatementController);

	// function IncomeStatementController (startDate, endDate, timeFrame, incomeStatement, Database, $ionicPopover, $scope, $state, $q, $ionicHistory, $ionicModal, user, IncomeStatementService) {
	// function IncomeStatementController(startDate, endDate, timeFrame, incomeStatement, Database, $ionicPopover, $scope, $state, $q, $ionicHistory, $ionicModal, user, IncomeStatementService) {
	// function IncomeStatementController(startDate, endDate, timeFrame, incomeStatement, Database, user, $ionicPopover, $scope, $state, $q, $ionicHistory, $ionicModal, IncomeStatementService) {
	function IncomeStatementController(startDate, endDate, timeFrame, incomeStatement, pdfService, Database, user, $filter, $ionicPopover, $scope, $state, $q, $ionicHistory, $ionicModal, $cordovaFile, $cordovaEmailComposer) {
	// function IncomeStatementController(startDate, endDate, timeFrame, incomeStatement, createPdf, Database, user, $ionicPopover, $scope, $state, $q, $ionicHistory, $ionicModal) {
		var vm = this;
		var win = window;

		win.cordovaFile = $cordovaFile;
		win.cordovaEmail = $cordovaEmailComposer;

		vm.vmScope = $scope;
		vm.openPopover = openPopover;
		vm.startDate = startDate;
		vm.endDate = endDate;
		vm.timeFrame = timeFrame;
		vm.incomeStatement = incomeStatement;
		vm.createPopupMenu = createPopupMenu;
		vm.closePopupMenu = closePopupMenu;
		vm.closeIncomeStatement = closeIncomeStatement;
		vm.generatePDF = generatePDF;
		vm.getUserInfo = getUserInfo;
		vm.createReport = createReport;
		vm.closePDFViewer = closePDFViewer;
		vm.emailPDF = emailPDF;
		vm.createPDFEmail = createPDFEmail;
		vm.createPDFPopupMenu = createPDFPopupMenu;
		vm.openPDFPopover = openPDFPopover;
		vm.closePDFPopupMenu = closePDFPopupMenu;
		vm.user = user;
		vm.groupBy = 'name';
		vm.ionicPopover = $ionicPopover;
		vm.getIncomeStatement = getIncomeStatement;
		vm.Database = Database;
		vm.createPDF = pdfService.createPdf;
		vm.pdfModal = {};
		vm.reportData = {};
		vm.pdfblob = null;
		vm.pdfFile = null;
		// vm.createPdf = pdfService.createPdf;
		// vm.isrService = IncomeStatementService;

		vm.totalIncome;
		vm.totalExpenses;
		vm.totalProfit;

		vm.change = change;
		vm.changeGroupBy = changeGroupBy;

		function init() {
			Log.l("IAR: Now running init...");
			Log.l("IAR: Now attempting to getUserInfo()...");
			getUserInfo();
			getIncomeStatement(vm.Database);
			vm.incomeStatement.incomeItems.sort(sortByName);
			vm.incomeStatement.expenseItems.sort(sortByName);
			calculateTotals();
			// setDefaultsForPdfViewer($scope);
			vm.createPopupMenu($scope);
			vm.generatePDF();
			vm.createPDFPopupMenu($scope);
			$scope.$on('$destroy', function() {
				Log.l("IncomeStatement.controller: Cleaning up scope and removing pdfModal...")
				vm.pdfModal.remove();
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
			Log.l("IA: showing PDFPopup Menu ...");
			$ionicPopover.fromTemplateUrl('IncomeStatement/templates/PDFPopupMenu.html', {
				scope: $scope
			}).then(function(popover) {
				Log.l("IA: now in function after ionicPopover.fromTemplateUrl('PDFPopupMenu') ...");
				$scope.pdfMenuPopover = popover;
				vm.pdfMenuPopover = popover;
				// popover.show(".income-statement-menu")
			});

			//Cleanup the popover when we're done with it!
			vm.vmScope.$on('$destroy', function() {
				Log.l("IA: now in scope.on('destroy') for pdfMenuPopover");
				vm.pdfMenuPopover.remove();
			});
			// Execute action on hidden popover
			vm.vmScope.$on('pdfMenuPopover.hidden', function() {
				Log.l("IA: now in scope.on('pdfMenuPopover.hidden')");
				// Execute action
			});
			// Execute action on remove popover
			vm.vmScope.$on('pdfMenuPopover.removed', function() {
				Log.l("IA: now in scope.on('pdfMenuPopover.removed')");
				// Execute action
			});
		}

		function openPDFPopover($event) {
			Log.l("IA: now in openPDFPopover()")
			// vm.popover.show($event);
			vm.pdfMenuPopover.show('.ion-android-menu');
			var headerbar = angular.element(".income-statement-bar");
			var hbar = $("ion-header-bar");
			var hbarheight = hbar.height();
			// var barHeight = headerbar.height();
			Log.l("IA: Menu bar height is %d px", hbarheight);
			var elPopover = $("#PopupMenu002");
			var popTop = elPopover.position().top;
			Log.l("elPopover has top " + popTop);
			var newPopTop = hbarheight + "px";
			elPopover.css("top", newPopTop);
			Log.l("elPopover now has top " + newPopTop);
		}

		function closePDFPopupMenu() {
			Log.l("IA: Now in closePDFMenu() ...");
			vm.pdfMenuPopover.hide();
			vm.closePDFViewer();
			vm.closePopupMenu();
		}

		function createPopupMenu($scope) {
			Log.l("IA: showing Popup Menu ...");
			$ionicPopover.fromTemplateUrl('IncomeStatement/templates/PopupMenu.html', {
				scope: $scope
			}).then(function(popover) {
				Log.l("IA: now in function after ionicPopover.fromTemplateUrl(PopupMenu) ...");
				$scope.popover = popover;
				vm.popover = popover;
				// popover.show(".income-statement-menu")
				//Cleanup the popover when we're done with it!
				vm.vmScope.$on('$destroy', function() {
					Log.l("IA: now in scope.on('destroy')");
					vm.popover.remove();
				});
				// Execute action on hidden popover
				vm.vmScope.$on('popover.hidden', function() {
					Log.l("IA: now in scope.on('popover.hidden')");
					// Execute action
				});
				// Execute action on remove popover
				vm.vmScope.$on('popover.removed', function() {
					Log.l("IA: now in scope.on('popover.removed')");
					// Execute action
				});
			});


			// //Cleanup the popover when we're done with it!
			// vm.vmScope.$on('$destroy', function() {
			// 	Log.l("IA: now in scope.on('destroy')");
			// 	vm.popover.remove();
			// });
			// // Execute action on hidden popover
			// vm.vmScope.$on('popover.hidden', function() {
			// 	Log.l("IA: now in scope.on('popover.hidden')");
			// 	// Execute action
			// });
			// // Execute action on remove popover
			// vm.vmScope.$on('popover.removed', function() {
			// 	Log.l("IA: now in scope.on('popover.removed')");
			// 	// Execute action
			// });
		}

		function openPopover($event) {
			Log.l("IA: now in scope.openPopover()")
			// vm.popover.show($event);
			vm.popover.show('.ion-android-menu');
			var headerbar = angular.element(".income-statement-bar");
			var hbar = $("ion-header-bar");
			var hbarheight = hbar.height();
			// var barHeight = headerbar.height();
			Log.l("IA: Menu bar height is %d px", hbarheight);
			var elPopover = $("#PopupMenu001");
			var popTop = elPopover.position().top;
			Log.l("elPopover has top " + popTop);
			var newPopTop = hbarheight + "px";
			elPopover.css("top", newPopTop);
			Log.l("elPopover now has top " + newPopTop);
			// vm.popover.positionView(".ion-android-menu", vm.popover);
			// vm.popover.show(".ion-android-menu");
			// vm.popover.positionView(".ion-android-menu", vm.popover);
		}

		function closePopupMenu() {
			Log.l("IA: now in scope.closePopupMenu()")
			vm.popover.hide();
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

		function createPDFEmail() {
			Log.l("IA: Now in createPDFEmail()...");
			$cordovaEmailComposer.isAvailable().then(function() {
				Log.l("IA: cordovaEmailComposer() is available!");
				var pdfmail = {
					to: '',
					attachments: [
					vm.pdfFileURL
					],
					subject: 'Income Statement PDF',
					body: 'Attached is the income statement PDF file from SEPI.',
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
				Log.l("IA: cordovaEmailComposer() is NOT available.");
			});
		}

		function generatePDF() {
			Log.l("IA: Now in generatePDF()");
			// Initialize the modal view.
			$ionicModal.fromTemplateUrl('IncomeStatement/templates/pdf-viewer.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function(modal) {
				$scope.modal = modal;
				vm.modal = modal;
				vm.pdfModal = modal;
				setDefaultsForPdfViewer($scope);
			});
		}

		function createReport() {
			Log.l("IAR: Now running createReport()...");
			// vm.createPdf(vm.incomeStatement, vm.user).then(function(pdf) {
			vm.createPDF(vm.incomeStatement, vm.user, vm.reportData).then(function(pdf) {
				Log.l("IAR: Now in function after IncomeStatementService.createPDF()...")
				var blob = new Blob([pdf], { type: 'application/pdf' });
				vm.pdfblob = blob;
				win.pdfblob = blob;
				vm.pdfFileURL = URL.createObjectURL(blob);
				win.pdfFileURL = vm.pdfFileURL;
				// vm.vmScope.pdfUrl = URL.createObjectURL(blob);
				vm.vmScope.pdfUrl = vm.pdfFileURL;
				$cordovaFile.createFile(cordova.file.dataDirectory, "IncomeStatement.pdf", true).then(function(success) {
					Log.l("Success creating PDF file!");
					Log.l(success);
					vm.pdfFile = success;
					win.pdfFile = success;
				}, function(error) {
					Log.l("Failed creating PDF file!");
					Log.e(error);
				});

				// Display the modal view
				vm.pdfModal.show();
			});
		}

		function setDefaultsForPdfViewer(pdfScope) {
			pdfScope.scroll = 0;
			pdfScope.loading = 'loading';

			pdfScope.onError = function(error) {
				Log.e(error);
			};

			pdfScope.onLoad = function() {
				pdfScope.loading = '';
			};

			pdfScope.onProgress = function(progress) {
				Log.l(progress);
			};
		}

/*		function base64ToUint8Array(base64) {
			var raw = atob(base64);
			var uint8Array = new Uint8Array(raw.length);
			for (var i = 0; i < raw.length; i++) {
				uint8Array[i] = raw.charCodeAt(i);
			}
			return uint8Array;
		}

		function createDocumentDefinition(report, user) {
			var isr = report;
			var items = isr.incomeItems.map(function(item) {
				return [item.name, item.amount];
			});
			var expitems = isr.expenseItems.map(function(item) {
				return [item.name, item.amount];
			});

			var userid = user.id;
			var orgname = user.name;
			var representative = user.representative;
			var address = user.address;
			var email = user.email;
			var phone = user.phone;
			var title = report.timeFrame + " Income Statement";
			var dateRange = isr.startDate + " - " + isr.endDate;
			var totalIncome = isr.totalIncome;
			var totalExpenses = isr.totalExpenses;
			var totalProfit = isr.totalProfit;

			var dd = {
				content: [
					{ text: title, style: 'header' },
					{ text: dateRange, alignment: 'right' },

					// { text: '', style: 'subheader'},
					{ text: 'ORGANIZATION', style: 'subheader' },
					orgname,
					representative,
					address,


					{ text: 'Income/Expenses', style: 'subheader' }, {
						style: 'itemsTable',
						table: {
							widths: ['*', 75],
							body: [
								[
									{ text: 'Name', style: 'itemsTableHeader' },
									{ text: 'Amount', style: 'itemsTableHeader' }
								]
							].concat(items).concat(expitems)
						}
					}, {
						style: 'totalsTable',
						table: {
							widths: ['*', 75],
							body: [
								[
									'Total Income',
									totalIncome,
								],
								[
									'Total Expenses',
									totalExpenses,
								],
								[
									'Total Profit',
									totalProfit,
								]
							]
						},
						layout: 'noBorders'
					},
				],
				styles: {
					header: {
						fontSize: 20,
						bold: true,
						margin: [0, 0, 0, 10],
						alignment: 'right'
					},
					subheader: {
						fontSize: 16,
						bold: true,
						margin: [0, 20, 0, 5]
					},
					itemsTable: {
						margin: [0, 5, 0, 15]
					},
					itemsTableHeader: {
						bold: true,
						fontSize: 13,
						color: 'black'
					},
					totalsTable: {
						bold: true,
						margin: [0, 30, 0, 0]
					}
				},
				defaultStyle: {}
			}
			return dd;
		}
*/

		init();
	}
})();

