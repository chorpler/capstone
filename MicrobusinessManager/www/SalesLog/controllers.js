(function () {
	angular.module('app.expenselog')
	.controller('SalesLogController', SalesLogController);

	function SalesLogController ($scope, $ionicModal, Database, timeFrame, startDate, endDate) {
		var vm = this;

		vm.startDate = startDate;
		vm.timeFrame = timeFrame;
		vm.endDate = endDate;
		vm.language = {};
		vm.loadSalesProducts = loadSalesProducts;

		function init () {
			vm.sales = [];
			vm.salesTotal = 0;
			loadSalesProducts();
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

		// TODO: SHOW THE SALE EDIT MODAL

		// Cleanup the modal when we're done with it!
		$scope.$on('$destroy', function () {
			if (vm.incomeStatementModal) {
				vm.incomeStatementModal.remove();
			}
			if (vm.salesReportModal) {
				vm.salesReportModal.remove();
			}
		});

		init();
	}
})();
