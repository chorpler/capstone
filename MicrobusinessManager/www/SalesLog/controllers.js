(function () {
	angular.module('app.saleslog')
	.controller('SalesLogController', SalesLogController);

	function SalesLogController (SLpdfService, Database, timeFrame, startDate, endDate, languages, $filter, $ionicPopover, $q, $cordovaFile, $cordovaFileOpener2, $cordovaEmailComposer, $persist, $scope, $ionicModal, $ionicPopup, $ionicLoading, $timeout) {
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

		vm.startDate = startDate;
		vm.timeFrame = timeFrame;
		vm.endDate = endDate;
		vm.language = {};
		vm.change = change;
		vm.currentSale = null;
		vm.editSale = editSale;
		vm.deleteSale = deleteSale;
		vm.save = save;
		vm.cancel = cancel;
		vm.editModal = null;
		vm.showConfirm = showConfirm;
		vm.submitted = false;

		var tempSale = null;
		var saleTable = 'sale';
		var saleProductTable = 'saleproduct';

		vm.getUserInfo = getUserInfo;
		vm.createPopupMenu = createPopupMenu;
		vm.showPopupMenu = showPopupMenu;
		vm.closePopupMenu = closePopupMenu;
		vm.createSalesLogPdf = SLpdfService.createSalesLogPdf;
		vm.createPDFModal = createPDFModal;
		vm.closePDFViewer = closePDFViewer;
		vm.emailPDF = emailPDF;
		vm.createPDFEmail = createPDFEmail;
		vm.createPDFPopupMenu = createPDFPopupMenu;
		vm.openPDFPopover = openPDFPopover;
		vm.closePDFPopupMenu = closePDFPopupMenu;
		vm.pdfMenuPopover = null;
		vm.closeExpenseLog = closeExpenseLog;
		vm.setDefaultsForPdfViewer = setDefaultsForPdfViewer;
		// vm.initializeAllValues = initializeAllValues;
		vm.createReport = createReport;
		vm.user = null;
		vm.reportData = {};

		vm.pdfViewerTitle = "Sales Log";
		vm.pdfViewerNumber = 3;

		function init() {
			if (languages.length) {
				for (var i = 0; i < languages.length; i++) {
					vm.language.type = languages[0].type;
				}
			}

			vm.sales = [];
			vm.salesTotal = 0;
			vm.getUserInfo();
			vm.createPopupMenu($scope);
			vm.createPDFModal($scope);
			vm.createPDFPopupMenu($scope);
			loadSalesProducts().then(function(res) {
				Log.l("SL: Init function is done!");
			});
		}

		function showEditModal () {
			$ionicModal.fromTemplateUrl('SalesLog/templates/saleEditModal.html', {
				scope: $scope,
				animation: 'slide-in-right'
			}).then(function (modal) {
				vm.editModal = modal;
				vm.editModal.show();
			});
		}

		function loadSalesProducts () {
			var promises = [];
			return Database.select('sale', null, null, null, vm.startDate, vm.endDate)
			.then(function (response) {
				vm.sales.length = 0;
				vm.salesTotal = 0;
				for (var i = response.rows.length - 1; i >= 0; i--) {
					var sale = response.rows.item(i);
					sale.date = moment(sale.date);
					sale.products = [];

					vm.salesTotal += sale.amount;
					vm.sales.push(sale);

					promises.push(addProductsToSale(sale));
				}
				$q.all(promises).then(function(res) {
					vm.reportData.timeFrame = vm.timeFrame;
					vm.reportData.startDate = vm.startDate;
					vm.reportData.endDate = vm.endDate;
					vm.reportData.salesTotal = vm.salesTotal;
					Log.l("SL.loadSalesProducts(): Done adding products to sales. sales is now:\n%s", JSON.stringify(vm.sales, false, 2));
					win.sepi.salesLog = vm.sales;
				});
			});
		}

		function addProductsToSale (sale) {
			return Database.selectProductsForSale(sale.id)
			.then(function (response) {
				for (var i = response.rows.length - 1; i >= 0; i--) {
					var product = response.rows.item(i);
					sale.products.push(product);
				}
			});
		}

		function change (startDate, timeFrame) {
			vm.startDate = startDate;
			vm.timeFrame = timeFrame;
			vm.endDate = moment(vm.startDate).endOf(vm.timeFrame.value);
			loadSalesProducts();
		}

		function editSale (sale) {
			vm.currentSale = sale;
			tempSale = angular.copy(sale);
			vm.editViewOpen = true;
			showEditModal();
		}

		function save (editedSale, form, $event) {
			$event.stopPropagation();
			if (form && form.$invalid) {
				return;
			}

			vm.submitted = true;

			editedSale.amount = editedSale.amount && editedSale.amount.replace ?
								Number(editedSale.amount.replace(',','.')) : editedSale.amount;
			Database.update(saleTable, editedSale.id, [editedSale.amount, moment(editedSale.date).format('YYYY-MM-DD HH:mm:ss')])
				.then(function () {
					editedSale.products.forEach(function (saleProduct) {
						saleProduct.quantity = saleProduct.quantity && saleProduct.quantity.replace ?
												Number(saleProduct.quantity.replace(',','.')) : saleProduct.quantity;
						Database.update(saleProductTable, saleProduct.id, [
							saleProduct.saleid, saleProduct.productid, saleProduct.quantity
						]);
					});
				});

			vm.editModal.remove();
			vm.submitted = false;
		}

		function deleteSale (sale) {
			Database.remove(saleTable, sale.id)
			.then(function () {
				vm.editModal.remove();
				loadSalesProducts();
			});
		}

		function cancel () {
			if (vm.currentSale) {
				vm.currentSale = tempSale;
			}
			vm.editModal.remove();
		}

		function showConfirm () {
			var title_delete, message_body, cancel_button;
			/*
			if (vm.language.type === 'es') {
				title_delete = 'Borrar Venta';
				message_body = '¿Estás seguro?';
				cancel_button = 'Cancelar';
			}
			else {
				title_delete = 'Delete Sale';
				message_body = 'Are you sure?';
				cancel_button = 'Cancel';
			}
			*/

			title_delete = $filter('translate')("str_delete_sale");
			message_body = $filter('translate')("str_are_you_sure");
			cancel_button = $filter('translate')("str_cancel");

			$ionicPopup.confirm({
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
							vm.deleteSale(vm.currentSale);
						}
					}
				]
			});
		}

		// Cleanup the modal when we're done with it!
		$scope.$on('$destroy', function () {
			if (vm.editModal) {
				vm.editModal.remove();
			}
		});

		function getUserInfo() {
			Log.l("SL: in getUserInfo()...");
			Database.select('user').then(function(response) {
				var items = [];
				Log.l("SL: getUserInfo() done, retrieved " + response.rows.length + " items.");
				if (response.rows.length === 0) {
					return items;
				}
				for (var i = response.rows.length - 1; i >= 0; i--) {
					var item = response.rows.item(i);
					items.push(item);
				}
				Log.l("SL: getUserInfo() done, retrieved:");
				Log.l(JSON.stringify(items[0]));
				vm.user = items[0];
				return items[0];
			});
		}

		function createPopupMenu($scope) {
			Log.l("SL: creating Popup Menu ...");
			$ionicPopover.fromTemplateUrl('SalesLog/templates/PopupMenu.html', {
				scope: $scope
			}).then(function(popover) {
				Log.l("SL: now in function after ionicPopover.fromTemplateUrl(PopupMenu) ...");
				$scope.popover = popover;
				vm.popover = popover;
				vm.popupMenu = popover;

				$scope.$on('$destroy', function() {
					Log.l("SL: now in scope.on('destroy')");
					vm.popover.remove();
				});
				// Execute action on hidden popover
				$scope.$on('popover.hidden', function() {
					Log.l("SL: now in scope.on('popover.hidden')");
					// Execute action
				});
				// Execute action on remove popover
				$scope.$on('popover.removed', function() {
					Log.l("SL: now in scope.on('popover.removed')");
					// Execute action
				});
			});
		}

		function showPopupMenu($event) {
			Log.l("SL: now in scope.showPopupMenu()");
			vm.popupMenu.show('.menu-button-sales-log');
		}


		function closePopupMenu() {
			Log.l("SL: now in scope.closePopupMenu()")
			vm.popover.hide();
		}

		function createPDFPopupMenu($scope) {
			Log.l("SL: creating PDFPopupMenu ...");
			$ionicPopover.fromTemplateUrl('templates/PDFPopupMenu.html', {
				scope: $scope
			}).then(function(popover) {
				Log.l("SL: now in function after ionicPopover.fromTemplateUrl('PDFPopupMenu') ...");
				$scope.pdfMenuPopover = popover;
				vm.pdfMenuPopover = popover;
				// popover.show(".income-statement-menu")
			});

			//Cleanup the popover when we're done with it!
			$scope.$on('$destroy', function() {
				Log.l("SL: now in scope.on('destroy') for pdfMenuPopover");
				vm.pdfMenuPopover.remove();
			});
			// Execute action on hidden popover
			$scope.$on('pdfMenuPopover.hidden', function() {
				Log.l("SL: now in scope.on('pdfMenuPopover.hidden')");
				// Execute action
			});
			// Execute action on remove popover
			$scope.$on('pdfMenuPopover.removed', function() {
				Log.l("SL: now in scope.on('pdfMenuPopover.removed')");
				// Execute action
			});
		}

		function openPDFPopover($event) {
			Log.l("SL: now in openPDFPopover()")
			// vm.popover.show($event);
			vm.pdfMenuPopover.show('.menu-button-pdf-viewer');
			// var headerbar = angular.element(".income-statement-bar");
			// var hbar = $("ion-header-bar");
			// var hbarheight = hbar.height();
			// Log.l("SL: Menu bar height is %d px", hbarheight);
			// var elPopover = $("#PopupMenu002");
			// var popTop = elPopover.position().top;
			// Log.l("elPopover has top " + popTop);
			// var newPopTop = hbarheight + "px";
			// elPopover.css("top", newPopTop);
			// Log.l("elPopover now has top " + newPopTop);
		}

		function closePDFPopupMenu() {
			Log.l("SL: Now in closePDFMenu() ...");
			vm.pdfMenuPopover.hide();
			vm.closePDFViewer();
			vm.closePopupMenu();
		}

		function closePDFViewer() {
			Log.l("SL: Now in closePDFViewer()...");
			// vm.pdfModal.hide();
			vm.pdfModal.hide();
		}

		function emailPDF() {
			Log.l("SL: Now in emailPDF()...");
			vm.createPDFEmail();
		}

		function createPDFEmail() {
			Log.l("SL: Now in createPDFEmail()...");
			$cordovaEmailComposer.isAvailable().then(function() {
				Log.l("SL: cordovaEmailComposer() is available!");
				var pdfmail = {
					to: '',
					attachments: [
					vm.pdfFileURL
					],
					subject: 'Activity Log PDF',
					body: 'Attached is the expense log PDF file from SEPI.',
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
				Log.l("SL: cordovaEmailComposer() is NOT available.");
			});
		}

		function closeExpenseLog() {
			Log.l("SL: closing Expense Log ...");
			$state.go('app.reports');
		}

		function createPDFModal($scope) {
			Log.l("SL: Now in generatePDF()");
			// Initialize the modal view.
			$ionicModal.fromTemplateUrl('templates/pdf-viewer.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function(modal) {
				$scope.modal = modal;
				vm.modal = modal;
				vm.pdfModal = modal;
				vm.setDefaultsForPdfViewer($scope);
				vm.pdfScope.vm = vm;
			});
		}

		function createReport() {
			Log.l("SL: Now running createReport(). reformattedList is:\n%s",JSON.stringify(vm.reformattedList, false, 2));
			vm.popover.hide();
			vm.pdfModal.show();
			vm.createSalesLogPdf(vm.sales, vm.user, vm.reportData).then(function(pdf) {
				Log.l("SL: Now in function after createActivityLogPdf(), pdf is:\n%s", JSON.stringify(pdf));
				var blob = new Blob([pdf], { type: 'application/pdf' });
				vm.pdfblob = blob;
				win.pdfblob = blob;
				vm.pdfFileURL = URL.createObjectURL(blob);
				win.pdfFileURL = vm.pdfFileURL;
				vm.vmScope.pdfUrl = vm.pdfFileURL;
				vm.pdfScope.pdfUrl = vm.pdfFileURL;
				vm.pdfUrl = vm.pdfFileURL;
				vm.pdfLoaded = true;
				$scope.pdfLoaded = true;
				vm.pdfScope.pdfLoaded = true;
				$cordovaFile.writeFile(fileDirectory, "ExpenseLog.pdf", blob, true).then(function(res) {
					Log.l("SL: Success creating PDF file! Result:\n%s", JSON.stringify(res, false, 2));
					Log.l(res);
					vm.pdfFile = res;
					win.pdfFile = res;
					$timeout(function() { Log.l("Now applying scope..."); vm.pdfScope.$apply(); }, 1500);
				}, function(err) {
					Log.l("SL: Failed creating PDF file!");
					Log.e(err);
				});
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
				Log.l("SL: PDFViewer error event received!");
				Log.e(err);
			};

			pdfScope.onLoad = function() {
				Log.l("SL: PDFViewer onLoad event received!");
				pdfScope.loading = '';
				vm.pdfLoaded = true;
				vm.loading = '';
				pdfScope.pdfLoaded = true;
			};

			pdfScope.onProgress = function(progress) {
				Log.l("SL: PDFViewer progress event received! Progress event:\n%s", JSON.stringify(progress, false, 2));
				Log.l(progress);
			};
		}

		init();
	}
})();
