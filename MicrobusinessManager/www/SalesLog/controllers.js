(function () {
	angular.module('app.expenselog')
	.controller('SalesLogController', SalesLogController);

	function SalesLogController ($scope, $ionicModal, Database, timeFrame, startDate, endDate) {
		var vm = this;

		vm.startDate = startDate;
		vm.timeFrame = timeFrame;
		vm.endDate = endDate;
		vm.language = {};
		vm.change = change;
		vm.currentSale = null;
		vm.editSale = editSale;
		vm.save = save;
		vm.cancel = cancel;
		vm.editModal = null;

		var tempSale = null;
		var saleTable = 'sale';
		var saleProductTable = 'saleproduct';

		function init () {
			vm.sales = [];
			vm.salesTotal = 0;
			loadSalesProducts();

			$ionicModal.fromTemplateUrl('SalesLog/templates/saleEditModal.html', {
				scope: $scope,
				animation: 'slide-in-right'
			}).then(function (modal) {
				vm.editModal = modal;
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
			vm.editModal.show();
		}

		function save (editedSale) {
			Database.update(saleTable, editedSale.id, [editedSale.date, editedSale.amount]);

			editedSale.products.forEach(function (saleProduct) {
				Database.update(saleProductTable, saleProduct.id, [
					saleProduct.saleid, saleProduct.productid, saleProduct.quantity
				]);
			});
		}

		function cancel () {
			if (vm.currentSale) {
				vm.currentSale = tempSale;
			}
			vm.editModal.hide();
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
