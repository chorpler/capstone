(function () {
	angular.module('app.expenselog')
	.controller('SalesLogController', SalesLogController);

	function SalesLogController ($scope, $ionicModal, $ionicPopup, Database, timeFrame, startDate, endDate, languages) {
		var vm = this;

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

		var tempSale = null;
		var saleTable = 'sale';
		var saleProductTable = 'saleproduct';

		function init () {
			if (languages.length) {
				for (var i = 0; i < languages.length; i++) {
					vm.language.type = languages[0].type;
				}
			}

			vm.sales = [];
			vm.salesTotal = 0;
			loadSalesProducts();
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

					addProductsToSale(sale);
				}
			});
		}

		function addProductsToSale (sale) {
			Database.selectProductsForSale(sale.id)
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

		function save (editedSale) {
			Database.update(saleTable, editedSale.id, [editedSale.amount, moment(editedSale.date).format('YYYY-MM-DD HH:mm:ss')])
				.then(function () {
					editedSale.products.forEach(function (saleProduct) {
						Database.update(saleProductTable, saleProduct.id, [
							saleProduct.saleid, saleProduct.productid, saleProduct.quantity
						]);
					});
				});

			vm.editModal.remove();
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

		init();
	}
})();
