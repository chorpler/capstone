(function () {
	angular.module('app.reports')
	.controller('ReportsController', ReportsController);

	function ReportsController ($scope, $ionicModal, Database) {
		var vm = this;

		vm.loadIncomeStatement  = loadIncomeStatement;
		vm.closeIncomeStatement = closeIncomeStatement;
		vm.loadSalesReport      = loadSalesReport;
		vm.closeSalesReport     = closeSalesReport;

		vm.sales        = [];
		vm.expenses     = [];

		function init () {
			$ionicModal.fromTemplateUrl('Reports/templates/incomeStatement.html', {
				scope: $scope,
				animation: 'slide-in-right'
			}).then(function (modal) {
				vm.incomeStatementModal = modal;
			});

			$ionicModal.fromTemplateUrl('Reports/templates/salesReport.html', {
				scope: $scope,
				animation: 'slide-in-right'
			}).then(function (modal) {
				vm.salesReportModal = modal;
			});
		}

		function loadSales () {
			Database.select('sale')
			.then(function (response) {
				for (var i = response.rows.length - 1; i >= 0; i--) {
					var sale = response.rows.item(i);
					sale.date = new Date(sale.date);
					vm.sales.push(sale);
				}
			});
		}

		function loadExpenses () {
			Database.select('expense')
			.then(function (response) {
				for (var i = response.rows.length - 1; i >= 0; i--) {
					var expense = response.rows.item(i);
					vm.expenses.push(expense);
				}
			});
		}

		function loadSalesProducts () {
			return Database.select('sale')
			.then(function (response) {
				for (var i = response.rows.length - 1; i >= 0; i--) {
					var sale = response.rows.item(i);
					sale.date = new Date(sale.date);
					sale.products = [];

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

		function loadIncomeStatement () {
			loadSales();
			loadExpenses();
			vm.incomeStatementModal.show();
		}

		function closeIncomeStatement () {
			vm.incomeStatementModal.hide();
			vm.sales = [];
			vm.expenses = [];
		}

		function loadSalesReport () {
			loadSalesProducts()
			.then(function () {
				vm.salesReportModal.show();
			});
		}

		function closeSalesReport () {
			vm.sales = [];
			vm.salesReportModal.hide();
		}

		init();
	}
})();