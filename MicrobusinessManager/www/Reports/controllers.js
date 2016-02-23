(function () {
	angular.module('app.reports')
	.controller('ReportsController', ReportsController);

	function ReportsController ($scope, $state, $ionicModal, $window, $q, Database, startDate, endDate, timeFrame, startingCash, expenses, sales, languages) {
		var vm = this;

		vm.loadIncomeStatement  = loadIncomeStatement;
		vm.closeIncomeStatement = closeIncomeStatement;
		vm.loadSalesReport      = loadSalesReport;
		vm.closeSalesReport     = closeSalesReport;
		vm.openExpenseLog       = openExpenseLog;
		vm.change 				      = change;

		vm.sales        = [];
		vm.expenses     = [];
		vm.startDate    = startDate;
		vm.timeFrame	= timeFrame;
		vm.endDate		= endDate;
		vm.startingCash = startingCash;
		vm.endingCash	= 0;
		vm.expenses 	= expenses;
		vm.sales 		= sales;
		vm.incomeStatement	= [];
		vm.incomeStatementModal = null;
		vm.salesReportModal = null;
		vm.salesTotal = 0;
		vm.language = {};

		var currentReport = '';
		var INCOME_STATEMENT = 'income';
		var SALES_REPORT = 'sales';

		function init () {
			if (languages.length) {
				for (var i = 0; i < languages.length; i++) {
					vm.language.type = languages[0].type;
				}
			}

			vm.endingCash = calculateEndCash();
			prepareIncomeStatement();
		}

		function loadSales () {
			return Database.select('sale', null, null, null, vm.startDate, vm.endDate)
			.then(function (response) {
				vm.sales.length = 0;
				vm.salesTotal = 0;
				for (var i = response.rows.length - 1; i >= 0; i--) {
					var sale = response.rows.item(i);
					sale.date = moment(sale.date);
					vm.salesTotal += sale.total;
					vm.sales.push(sale);
				}
			});
		}

		function loadExpenses () {
			return Database.select('expense', null, null, null, vm.startDate, vm.endDate)
			.then(function (response) {
				vm.expenses.length = 0;
				for (var i = response.rows.length - 1; i >= 0; i--) {
					var expense = response.rows.item(i);
					expense.amount = Number(expense.amount);
					expense.date = moment(expense.date);
					vm.expenses.push(expense);
				}
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
					vm.salesTotal += sale.total;

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
			currentReport = INCOME_STATEMENT;
			$ionicModal.fromTemplateUrl('Reports/templates/incomeStatement.html', {
				scope: $scope,
				animation: 'slide-in-right'
			}).then(function (modal) {
				vm.incomeStatementModal = modal;
				vm.incomeStatementModal.show();
			});
		}

		function closeIncomeStatement () {
			// vm.incomeStatementModal.hide();
			vm.incomeStatementModal.remove().then(function () {
				vm.incomeStatementModal = null;
			});
			currentReport = '';
			vm.sales = [];
			vm.expenses = [];
		}

		function loadSalesReport () {
			loadSalesProducts()
			.then(function () {
				currentReport = SALES_REPORT;
				$ionicModal.fromTemplateUrl('Reports/templates/salesReport.html', {
					scope: $scope,
					animation: 'slide-in-right'
				}).then(function (modal) {
					vm.salesReportModal = modal;
					vm.salesReportModal.show();
				});
			});
		}

		function closeSalesReport () {
			vm.sales = [];
			vm.salesReportModal.remove().then(function () {
				vm.salesReportModal = null;
			});
		}

		function openExpenseLog () {
			console.log('OPEN EXPENSE LOG>>');
			$state.go('app.expenselog');
		}

		function change (startDate, timeFrame) {
			var promises = [];
			vm.startDate = startDate;
			vm.timeFrame = timeFrame;
			vm.endDate = moment(vm.startDate).endOf(vm.timeFrame.value);
			promises.push(Database.calculateCashOnHand(null, vm.startDate).then(function (response) {
				vm.startingCash = response.rows.item(0) ? response.rows.item(0).total : 0;
			}));

			promises.push(loadExpenses());

			switch (currentReport) {
				case INCOME_STATEMENT:
					promises.push(loadSales());
					break;
				case SALES_REPORT:
					promises.push(loadSalesProducts());
					break;
			}

			$q.all(promises).then(calculateEndCash).then(prepareIncomeStatement);
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

		function prepareIncomeStatement () {
			vm.sales.forEach(function (sale) {
				sale.isExpense = false;
			});
			vm.expenses.forEach(function (expense) {
				expense.isExpense = true;
			});

			vm.incomeStatement = vm.sales.concat(vm.expenses);
			vm.incomeStatement.sort(function (a, b) {
				if (a.date < b.date) {
					return -1;
				}

				if (a.date > b.date) {
					return 1;
				}

				return 0;
			});
		}

		//Cleanup the modal when we're done with it!
		$scope.$on('$destroy', function() {
			if (vm.incomeStatementModal)
				vm.incomeStatementModal.remove();
			if (vm.salesReportModal)
				vm.salesReportModal.remove();
		});

		init();
	}
})();
