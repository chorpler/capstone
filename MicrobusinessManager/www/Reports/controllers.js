(function () {
	angular.module('app.reports')
	.controller('ReportsController', ReportsController);

	function ReportsController ($scope, $ionicModal, $window, $q, Database, startDate, endDate, timeFrame, startingCash, expenses, sales) {
		var vm = this;

		vm.loadIncomeStatement  = loadIncomeStatement;
		vm.closeIncomeStatement = closeIncomeStatement;
		vm.loadSalesReport      = loadSalesReport;
		vm.closeSalesReport     = closeSalesReport;
		vm.change 				= change;

		vm.sales        = [];
		vm.expenses     = [];
		vm.startDate    = startDate;
		vm.timeFrame	= timeFrame;
		vm.endDate		= endDate;
		vm.startingCash = startingCash;
		vm.endingCash	= 0;
		vm.expenses 	= expenses;
		vm.sales 		= sales;

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

			vm.endingCash = calculateEndCash();
		}

		function loadSales () {
			return Database.select('sale', null, null, vm.startDate, vm.endDate)
			.then(function (response) {
				vm.sales.length = 0;
				for (var i = response.rows.length - 1; i >= 0; i--) {
					var sale = response.rows.item(i);
					sale.date = moment(sale.date);
					vm.sales.push(sale);
				}
			});
		}

		function loadExpenses () {
			return Database.select('expense', null, null, vm.startDate, vm.endDate)
			.then(function (response) {
				vm.expenses.length = 0;
				for (var i = response.rows.length - 1; i >= 0; i--) {
					var expense = response.rows.item(i);
					vm.expenses.push(expense);
				}
			});
		}

		function loadSalesProducts () {
			return Database.select('sale', null, null, vm.startDate, vm.endDate)
			.then(function (response) {
				vm.sales.length = 0;
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

		function change (startDate, timeFrame) {
			var promises = [];
			vm.startDate = startDate;
			vm.timeFrame = timeFrame;
			vm.endDate = moment(vm.startDate).endOf(vm.timeFrame);
			promises.push(Database.calculateCashOnHand(null, vm.startDate).then(function (response) {
				vm.startingCash = response.rows.item(0) ? response.rows.item(0).total : 0;
			}));

			promises.push(loadExpenses());

			promises.push(loadSales());

			$q.all(promises).then(calculateEndCash);
		}

		function calculateEndCash () {
			vm.endingCash = vm.startingCash;

			vm.endingCash = vm.expenses.reduce(function (prev, curr) {
				return prev - curr.amount;
			}, vm.endingCash);

			vm.endingCash = vm.sales.reduce(function (prev, curr) {
				return prev + curr.total;
			}, vm.endingCash);

			return vm.endingCash;
		}

		init();
	}
})();