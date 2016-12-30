(function () {
	angular.module('app.saleslog')
	.controller('SalesLogController', SalesLogController);

	function SalesLogController (SLpdfService, Database, timeFrame, startDate, endDate, languages, formats, $filter, $ionicPopover, $q, $cordovaFile, $cordovaFileOpener2, $cordovaEmailComposer, $persist, $scope, $rootScope, $ionicModal, $ionicPopup, $ionicLoading, $timeout, IonicFiles) {
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
		vm.scopes.saleslog = $scope;
		vm.formats = formats;

		win.cordovaFile = $cordovaFile;
		win.cordovaEmail = $cordovaEmailComposer;
		win.persist = $persist;
		win.sepiDatabase = Database;

		var fileDirectory = cordova.file.syncedDataDirectory || cordova.file.dataDirectory;
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
		vm.openPDFPopupMenu = openPDFPopupMenu;
		vm.closePDFPopupMenu = closePDFPopupMenu;
		vm.pdfPopupMenu = null;
		vm.closeSalesLog = closeSalesLog;
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

			win.formats = vm.formats;

			vm.sales = [];
			vm.salesTotal = 0;
			vm.getUserInfo().then(function(res) {
			}).then(function(res) {
				return vm.createPopupMenu($scope);
			// }).then(function(res) {
			// 	return vm.createPDFModal($scope);
			// }).then(function(res) {
			// 	return vm.createPDFPopupMenu($scope);
			}).then(function(res) {
				return loadSalesProducts();
			}).then(function(res) {
				Log.l("SL: Init() finished!");
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
			return Database.select('user').then(function(response) {
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
			var d = $q.defer();
			$ionicPopover.fromTemplateUrl('SalesLog/templates/PopupMenu.html', {
				scope: $scope
			}).then(function(popupMenu) {
				Log.l("SL: now in function after ionicPopover.fromTemplateUrl(PopupMenu) ...");
				$scope.popupMenu = popupMenu;
				vm.popupMenu = popupMenu;
				$scope.$on('$destroy', function() {
					Log.l("SL: now in scope.on('destroy')");
					vm.popupMenu.remove();
				});
				// Execute action on hidden popupMenu
				$scope.$on('popupMenu.hidden', function() {
					Log.l("SL: now in scope.on('popupMenu.hidden')");
					// Execute action
				});
				// Execute action on remove popupMenu
				$scope.$on('popupMenu.removed', function() {
					Log.l("SL: now in scope.on('popupMenu.removed')");
					// Execute action
				});
				d.resolve(vm.popupMenu);
			}).catch(function(err) {
				Log.l("SL: Error creating popupMenu!");
				Log.l(err);
				d.reject(err);
			});
			return d.promise;
		}

		function showPopupMenu($event) {
			Log.l("SL: now in scope.showPopupMenu()");
			// var menuElement = angular.element(document).find('.menu-button-sales-log');
			var menuElement = document.querySelector('.menu-button-sales-log');
			vm.popupMenu.show(menuElement);
			// vm.popupMenu.show('.menu-button-sales-log');
		}

		function closePopupMenu() {
			Log.l("SL: now in scope.closePopupMenu()")
			vm.popupMenu.hide();
		}

		function createPDFPopupMenu($scope) {
			Log.l("SL: creating PDFPopupMenu ...");
			var d = $q.defer();
			$ionicPopover.fromTemplateUrl('SalesLog/templates/PDFPopupMenu.html', {
				scope: $scope
			}).then(function(pdfPopupMenu) {
				Log.l("SL: now in function after ionicPopover.fromTemplateUrl('PDFPopupMenu') ...");
				$scope.pdfPopupMenu = pdfPopupMenu;
				vm.pdfPopupMenu = pdfPopupMenu;

				//Cleanup the popover when we're done with it!
				$scope.$on('$destroy', function() {
					Log.l("SL: now in scope.on('destroy') for pdfPopupMenu");
					vm.pdfPopupMenu.remove();
				});
				// Execute action on hidden popover
				$scope.$on('pdfPopupMenu.hidden', function() {
					Log.l("SL: now in scope.on('pdfPopupMenu.hidden')");
					// Execute action
				});
				// Execute action on remove popover
				$scope.$on('pdfPopupMenu.removed', function() {
					Log.l("SL: now in scope.on('pdfPopupMenu.removed')");
					// Execute action
				});
				Log.l("SL: Now done creating pdfPopupMenu.");
				Log.l(vm.pdfPopupMenu);
				d.resolve(vm.pdfPopupMenu);
			}).catch(function(err) {
				Log.l("SL: Error creating pdfPopupMenu!");
				Log.l(err);
				d.reject(err);
			});
			return d.promise;
		}

		function openPDFPopupMenu($event) {
			Log.l("SL: now in openPDFPopupMenu(), pdfPopupmenu is:");
			Log.l(vm.pdfPopupmenu);
			// var menuElement = angular.element(document).find('.menu-button-pdf-viewer-sales-log');
			var menuElement = document.querySelector('.menu-button-pdf-viewer-sales-log');
			vm.pdfPopupMenu.show(menuElement);
			// vm.pdfPopupMenu.show('.menu-button-pdf-viewer-sales-log');
		}

		function closePDFPopupMenu() {
			Log.l("SL: Now in closePDFMenu() ...");
			vm.pdfPopupMenu.hide();
		}

		function closePDFViewer() {
			Log.l("SL: Now in closePDFViewer()...");
			// vm.pdfModal.hide();
			vm.pdfPopupMenu.remove();
			vm.pdfModal.remove();
			vm.closePopupMenu();
		}

		function emailPDF() {
			Log.l("SL: Now in emailPDF()...");
			vm.createPDFEmail();
		}

		function createPDFEmail() {
			Log.l("SL: Now in createPDFEmail()...");
			var SocialSharing = IonicNative.SocialSharing;
			SocialSharing.canShareViaEmail().then(function() {
				Log.l("SL: SocialSharing() is available!");
				var to = [];
				var attachments = [ vm.pdfDataFileURL ];
				var subject = "Sales Log PDF";
				var body = "Attached is the sales log PDF file from SEPI.";
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
				Log.l("SL: SocialSharing() is NOT available.");
				var title = $filter('translate')("str_error").toUpperCase();
				var text = $filter('translate')("str_email_not_available");
				rs.code.showPopupAlert(title, text);
			});
		}

		function closeSalesLog() {
			Log.l("SL: closing Expense Log ...");
			$state.go('app.reports');
		}

		function createPDFModal($scope) {
			Log.l("SL: Now in generatePDF()");
			var d = $q.defer();
			// Initialize the modal view.
			$ionicModal.fromTemplateUrl('SalesLog/templates/pdf-viewer.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function(pdfModal) {
				Log.l("SL: Now in function after ionicModal.fromTemplateUrl(pdfViewer)...");
				$scope.pdfModal = pdfModal;
				vm.pdfModal = pdfModal;
				$scope.$on('$destroy', function() {
					Log.l("SL: now in scope.on('destroy') for pdfModal")
					vm.pdfModal.remove();
				});
				// Execute action on hidden pdfModal
				$scope.$on('pdfModal.hidden', function() {
					Log.l("SL: now in scope.on('pdfModal.hidden')");
					// Execute action
				});
				// Execute action on remove pdfModal
				$scope.$on('pdfModal.removed', function() {
					Log.l("SL: now in scope.on('pdfModal.removed')");
					// Execute action
				});
				return createPDFPopupMenu($scope);
			}).then(function(res) {
				setDefaultsForPdfViewer($scope);
				Log.l("SL: Done creating pdfModal and pdfPopupMenu!");
				d.resolve(res);
			}).catch(function(err) {
				Log.l("SL: Error creating PDF modal!");
				Log.l(err);
				d.reject(err);
			});
			return d.promise;
		}

		function createReport() {
			Log.l("SL: Now running createReport(). reformattedList is:\n%s",JSON.stringify(vm.reformattedList, false, 2));
			vm.popupMenu.hide();
			createPDFModal(vm.scopes.saleslog).then(function(res) {
				vm.pdfModal.show();
				return vm.createSalesLogPdf(vm.sales, vm.user, vm.reportData);
			}).then(function(pdf) {
				Log.l("SL: Now in function after createSalesLogPdf()...")
				var blob = new Blob([pdf], { type: 'application/pdf' });
				vm.pdfblob = blob;
				win.pdfblob = blob;
				vm.pdfFileURL = URL.createObjectURL(blob);
				win.pdfFileURL = vm.pdfFileURL;
				vm.vmScope.pdfUrl = vm.pdfFileURL;
				return $cordovaFile.writeFile(fileDirectory, "IncomeStatement.pdf", blob, true);
			}).then(function(res) {
				Log.l("SL: Success creating PDF file!");
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
				Log.l("SL: Failed creating PDF file!");
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
				Log.l("SL: Got pdfScope.onError!");
				Log.l(err);
			};

			pdfScope.onLoad = function() {
				Log.l("SL: Got pdfScope.onLoad!");
				pdfScope.loading = '';
				pdfScope.pdfLoaded = true;
			};

			pdfScope.onProgress = function(progress) {
				Log.l("SL: Got pdfScope.onProgress!");
				Log.l(progress);
			};
		}

		init();
	}
})();
