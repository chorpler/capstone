(function () {
	angular.module('app.expenselog')
	// .controller('ExpenseLogController', ['ELpdfService', ExpenseLogController]);
	.controller('ExpenseLogController', ExpenseLogController);

	function ExpenseLogController (ELpdfService, Database, timeFrame, startDate, endDate, languages, CashBalance, $scope, $rootScope, $ionicModal, $ionicPopup, $filter, $ionicPopover, $q, $cordovaFile, $cordovaFileOpener2, $cordovaEmailComposer, $persist, IonicFiles) {
		var vm = this;

		var win = window;
		win.vm = vm;
		vm.scope = $scope;
		vm.vmScope = $scope;

		win.sepi = win.sepi || {};
		win.sepi.filter = $filter;

		var fileDirectory = cordova.file.dataDirectory;
		vm.fileDirectory = fileDirectory;
		win.sepi.fileDirectory = fileDirectory;

		vm.log = [];
		vm.reformattedList = {};
		vm.activeExpense = null;
		vm.editviewOpen = false;
		vm.totalExpenses = 0;
		vm.editModal = null;
		vm.expenses = '';
		vm.startDate = startDate;
		vm.endDate = endDate;
		vm.timeFrame = timeFrame;
		vm.date = Date.now();
		vm.submitted = false;

		vm.editExpense = editExpense;
		vm.save = save;
		vm.cancel = cancel;
		vm.addNewExpense = addNewExpense;
		vm.deleteExpense = deleteExpense;
		vm.getKeys = getKeys;
		vm.clearSearch = clearSearch;
		vm.showConfirm = showConfirm;
		vm.isCheckboxChecked = isCheckboxChecked;
		vm.change = change;

		vm.getUserInfo = getUserInfo;
		vm.createPopupMenu = createPopupMenu;
		vm.showPopupMenu = showPopupMenu;
		vm.closePopupMenu = closePopupMenu;
		vm.createExpenseLogPdf = ELpdfService.createExpenseLogPdf;
		vm.createPDFModal = createPDFModal;
		vm.closePDFViewer = closePDFViewer;
		vm.emailPDF = emailPDF;
		vm.createPDFEmail = createPDFEmail;
		vm.createPDFPopupMenu = createPDFPopupMenu;
		vm.openPDFPopupMenu = openPDFPopupMenu;
		vm.closePDFPopupMenu = closePDFPopupMenu;
		vm.pdfMenuPopover = null;
		vm.closeExpenseLog = closeExpenseLog;
		vm.setDefaultsForPdfViewer = setDefaultsForPdfViewer;
		// vm.initializeAllValues = initializeAllValues;
		vm.createReport = createReport;
		vm.user = null;
		vm.reportData = {};

		vm.pdfViewerTitle = "Expense Log";
		vm.pdfViewerNumber = 4;

		var tempExpense = null;
		var language = {};
		var expenseTable = 'expense';
		var title_delete, message_body, cancel_button;

		function init () {
			if (languages.length) {
				for (var i = 0; i < languages.length; i++) {
					language.type = languages[0].type;
				}
			}
			vm.getUserInfo().then(function(res) {
				return vm.createPopupMenu($scope);
			}).then(function(res) {
				return vm.createPDFModal($scope);
			}).then(function(res) {
				return vm.createPDFPopupMenu($scope);
			}).then(function(res) {
				return loadExpenseItems(Database, startDate, endDate);
			}).then(function(res) {
				Log.l("EL: Init() finished!");
			});
		}

		function showEditModal () {
			$ionicModal.fromTemplateUrl('ExpenseLog/templates/expenseEditModal.html', {
				scope: $scope,
				animation: 'slide-in-right'
			}).then(function (modal) {
				vm.editModal = modal;
				vm.editModal.show();
			});
		}

		function loadExpenseItems (Database, startDate, endDate) {
			return Database.select('expense', null, null, null, startDate, endDate)
			.then(function (response) {
				var items = [];
				vm.reformattedList = {};
				vm.log = items;
				vm.reportData.timeFrame = vm.timeFrame;
				vm.reportData.startDate = vm.startDate;
				vm.reportData.endDate = vm.endDate;
				vm.reportData.totalExpenses = vm.totalExpenses;


				if (response.rows.length === 0) {
					updateTotal();
					return;
				}

				for (var i = response.rows.length - 1; i >= 0; i--) {
					var item = response.rows.item(i);
					item.amount = Number(item.amount);
					item.date = moment(item.date).toDate();
					items.push(item);
				}

				vm.log.forEach(function (record) {
					var key = $filter('date')(record.date, 'mediumDate');
					vm.reformattedList[key] = vm.reformattedList[key] || [];
					vm.reformattedList[key].push(record);
				});

				vm.ischecked = false;

				updateTotal();
			});
		}

		function change (startDate, timeFrame) {
			vm.startDate = startDate;
			vm.timeFrame = timeFrame;
			vm.endDate = moment(vm.startDate).endOf(vm.timeFrame.value);
			loadExpenseItems(Database, vm.startDate, vm.endDate);
		}

		function editExpense (expense) {
			vm.activeExpense = expense;
			tempExpense = angular.copy(expense);
			vm.editviewOpen = true;
			showEditModal();
		}

		function save (item, form, $event) {
			$event.stopPropagation();
			if (form && form.$invalid) {
				return;
			}

			vm.submitted = true;

			item.amount = Number(item.amount.replace(',', '.'));
			var key = $filter('date')(vm.activeExpense.date, 'mediumDate');
			var oldKey = $filter('date')(tempExpense.date, 'mediumDate');

			if (oldKey === undefined) {
				oldKey = key;
			}

			vm.reformattedList[key] = vm.reformattedList[key] || [];

			Database.update(expenseTable, item.id, [
				item.name,
				item.amount,
				item.expType,
				item.comments,
				moment(item.date).format('YYYY-MM-DD HH:mm:ss'),
				item.type
			]);

			if (key !== oldKey) {
				vm.reformattedList[key].push(item);
				vm.reformattedList[oldKey].splice(vm.reformattedList[oldKey].indexOf(item), 1);
			}

			if (vm.reformattedList[oldKey].length === 0) {
				delete vm.reformattedList[oldKey];
			}

			vm.ischecked = false;
			vm.activeExpense = null;
			updateTotal();
			vm.editModal.remove();
			vm.submitted = false;
		}

		function cancel () {
			vm.submitted = true;
			if (vm.activeExpense) {
				vm.activeExpense.name = tempExpense.name;
				vm.activeExpense.amount = tempExpense.amount;
				vm.activeExpense.expType = tempExpense.expType;
				vm.activeExpense.comments = tempExpense.comments;
				vm.activeExpense.date = tempExpense.date;
				vm.activeExpense = null;
			}

			vm.editModal.remove();
			vm.submitted = false;
		}

		function addNewExpense () {
			tempExpense = {};
			vm.editviewOpen = false;
			showEditModal();
		}

		function deleteExpense (item) {
			var key = $filter('date')(item.date, 'mediumDate');
			vm.reformattedList[key].splice(vm.reformattedList[key].indexOf(item), 1);
			if (vm.reformattedList[key].length === 0) {
				delete vm.reformattedList[key];
			}
			Database.remove(expenseTable, item.id);
			vm.activeExpense = null;
			updateTotal();
			vm.editModal.remove();
			CashBalance.updateCashBalance();
		}

		function updateTotal () {
			vm.totalExpenses = 0;
			angular.forEach(vm.reformattedList, function (reports) {
				vm.totalExpenses += reports.reduce(function (previousValue, currentExpense) {
					return previousValue + currentExpense.amount;
				}, 0);
			});
			vm.reportData.totalExpenses = vm.totalExpenses;
		}

		function getKeys (obj) {
			return Object.keys(obj);
		}

		function clearSearch () {
			vm.search = '';
		}

		function isCheckboxChecked () {
			vm.ischecked = true;
		}

		function showConfirm () {
			if (language.type === 'es') {
				title_delete = 'Borrar Gasto';
				message_body = '¿Estás seguro?';
				cancel_button = 'Cancelar';
			}
			else {
				title_delete = 'Delete Expense';
				message_body = 'Are you sure?';
				cancel_button = 'Cancel';
			}

			var confirmPopup = $ionicPopup.confirm({
				title: title_delete,
				template: message_body,
				buttons: [
					{
						text: cancel_button,
						type: 'button-stable'},
					{
						text: '<b>Ok</b>',
						type: 'button-positive',
						onTap: function (e) {
							vm.deleteExpense(vm.activeExpense);
						}
					}
				]
			});
		}

		// Cleanup the modal when we're done with it!
		$scope.$on('$destroy', function () {
			if (vm.editModal)
				vm.editModal.remove();
		});

		function getUserInfo() {
			Log.l("EL: in getUserInfo()...");
			return Database.select('user').then(function(response) {
				var items = [];
				Log.l("EL: getUserInfo() done, retrieved " + response.rows.length + " items.");
				if (response.rows.length === 0) {
					return items;
				}
				for (var i = response.rows.length - 1; i >= 0; i--) {
					var item = response.rows.item(i);
					items.push(item);
				}
				Log.l("EL: getUserInfo() done, retrieved:");
				Log.l(JSON.stringify(items[0]));
				vm.user = items[0];
				return items[0];
			});
		}

		function createPopupMenu($scope) {
			Log.l("EL: showing Popup Menu ...");
			return $ionicPopover.fromTemplateUrl('ExpenseLog/templates/PopupMenu.html', {
				scope: $scope
			}).then(function(popover) {
				Log.l("EL: now in function after ionicPopover.fromTemplateUrl(PopupMenu) ...");
				$scope.popover = popover;
				vm.popover = popover;
				$scope.popupMenu = popover;
				vm.popupMenu = popover;

				$scope.$on('$destroy', function() {
					Log.l("EL: now in scope.on('destroy')");
					vm.popupMenu.remove();
				});
				// Execute action on hidden popover
				$scope.$on('popupMenu.hidden', function() {
					Log.l("EL: now in scope.on('popover.hidden')");
					// Execute action
				});
				// Execute action on remove popover
				$scope.$on('popupMenu.removed', function() {
					Log.l("EL: now in scope.on('popover.removed')");
					// Execute action
				});
			});
		}

		function showPopupMenu($event) {
			Log.l("EL: now in scope.showPopupMenu()");
			vm.popupMenu.show('.menu-button-expense-log');
		}


		function closePopupMenu() {
			Log.l("EL: now in scope.closePopupMenu()")
			vm.popupMenu.hide();
		}

		function createPDFPopupMenu($scope) {
			Log.l("EL: creating PDFPopupMenu ...");
			return $ionicPopover.fromTemplateUrl('ExpenseLog/templates/PDFPopupMenu.html', {
				scope: $scope
			}).then(function(popover) {
				Log.l("EL: now in function after ionicPopover.fromTemplateUrl('PDFPopupMenu') ...");
				$scope.pdfMenuPopover = popover;
				vm.pdfMenuPopover = popover;
				// popover.show(".income-statement-menu")
			});

			//Cleanup the popover when we're done with it!
			$scope.$on('$destroy', function() {
				Log.l("EL: now in scope.on('destroy') for pdfMenuPopover");
				vm.pdfMenuPopover.remove();
			});
			// Execute action on hidden popover
			$scope.$on('pdfMenuPopover.hidden', function() {
				Log.l("EL: now in scope.on('pdfMenuPopover.hidden')");
				// Execute action
			});
			// Execute action on remove popover
			$scope.$on('pdfMenuPopover.removed', function() {
				Log.l("EL: now in scope.on('pdfMenuPopover.removed')");
				// Execute action
			});
		}

		function openPDFPopupMenu($event) {
			Log.l("EL: now in openPDFPopupMenu()")
			vm.pdfMenuPopover.show('.menu-button-pdf-viewer-expense-log');
			// var headerbar = angular.element(".income-statement-bar");
			// var hbar = $("ion-header-bar");
			// var hbarheight = hbar.height();
			// Log.l("EL: Menu bar height is %d px", hbarheight);
			// var elPopover = $("#PopupMenu002");
			// var popTop = elPopover.position().top;
			// Log.l("elPopover has top " + popTop);
			// var newPopTop = hbarheight + "px";
			// elPopover.css("top", newPopTop);
			// Log.l("elPopover now has top " + newPopTop);
		}

		function closePDFPopupMenu() {
			Log.l("EL: Now in closePDFMenu() ...");
			vm.pdfMenuPopover.hide();
			vm.closePDFViewer();
			vm.closePopupMenu();
		}

		function closePDFViewer() {
			Log.l("EL: Now in closePDFViewer()...");
			// vm.pdfModal.hide();
			vm.pdfModal.hide();
		}

		function emailPDF() {
			Log.l("EL: Now in emailPDF()...");
			vm.createPDFEmail();
		}

		function createPDFEmail() {
			Log.l("EL: Now in createPDFEmail()...");
			// $cordovaEmailComposer.isAvailable().then(function() {
			var SocialSharing = IonicNative.SocialSharing;
			SocialSharing.canShareViaEmail().then(function() {
				Log.l("EL: SocialSharing() is available!");
				var to = [];
				var attachments = [ vm.pdfDataFileURL];
				var subject = "Expense Log PDF";
				var body = "Attached is the expense log PDF file from SEPI.";
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
				Log.l("EL: SocialSharing() is NOT available.");
			});
		}

		function closeExpenseLog() {
			Log.l("EL: closing Expense Log ...");
			$state.go('app.reports');
		}

		function createPDFModal($scope) {
			Log.l("EL: Now in generatePDF()");
			// Initialize the modal view.
			return $ionicModal.fromTemplateUrl('ExpenseLog/templates/pdf-viewer.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function(modal) {
				$scope.modal = modal;
				vm.modal = modal;
				vm.pdfModal = modal;
				vm.setDefaultsForPdfViewer($scope);
			});
		}

		function createReport() {
			Log.l("EL: Now running createReport(). reformattedList is:\n%s",JSON.stringify(vm.reformattedList, false, 2));
			vm.popupMenu.hide();
			vm.pdfModal.show();
			vm.createExpenseLogPdf(vm.reformattedList, vm.user, vm.reportData).then(function(pdf) {
				Log.l("EL: Now in function after createExpenseLogPdf()...")
				var blob = new Blob([pdf], { type: 'application/pdf' });
				vm.pdfblob = blob;
				win.pdfblob = blob;
				vm.pdfFileURL = URL.createObjectURL(blob);
				win.pdfFileURL = vm.pdfFileURL;
				vm.vmScope.pdfUrl = vm.pdfFileURL;
				return $cordovaFile.writeFile(fileDirectory, "ExpenseLog.pdf", blob, true);
			}).then(function(res) {
				Log.l("EL: Success creating PDF file!");
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
		}
		init();
	}
})();
