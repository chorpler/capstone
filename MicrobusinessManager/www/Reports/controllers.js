(function () {
	angular.module('app.reports')
	.controller('ReportsController', ReportsController);

	function ReportsController ($scope, $ionicModal, $q, $state, Database, startDate, endDate, timeFrame, startingCash, 
								expenses, sales, cashInfusions, languages) {
		var vm = this;

		vm.loadIncomeStatement  = loadIncomeStatement;
		vm.closeIncomeStatement = closeIncomeStatement;
		vm.loadSalesReport      = loadSalesReport;
		vm.closeSalesReport     = closeSalesReport;
		vm.change 				= change;
		vm.stateGo				= stateGo;

		vm.sales        	= sales;
		vm.expenses     	= expenses;
		vm.cashInfusions	= cashInfusions;
		vm.startDate    	= startDate;
		vm.timeFrame		= timeFrame;
		vm.endDate			= endDate;
		vm.startingCash 	= startingCash;
		vm.endingCash		= 0;
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

		function stateGo (state) {
			console.log('app.reports.' + state);
			console.log($state);
			$state.go('app.' + state);
		}

		function loadSales () {
			return Database.select('sale', null, null, null, vm.startDate, vm.endDate)
			.then(function (response) {
				vm.sales.length = 0;
				vm.salesTotal = 0;
				for (var i = response.rows.length - 1; i >= 0; i--) {
					var sale = response.rows.item(i);
					sale.date = moment(sale.date);
					vm.salesTotal += sale.amount;
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
					vm.salesTotal += sale.amount;

					vm.sales.push(sale);
					addProductsToSale(sale);
				}
			});
		}

		function loadCashInfusions () {
			return Database.select('cashInfusion', null, null, null, vm.startDate, vm.endDate)
			.then(function (response) {
				vm.cashInfusions.length = 0;
				for (var i = response.rows.length - 1; i >= 0; i--) {
					var cashInfusion = response.rows.item(i);
					cashInfusion.date = moment(cashInfusion.date);
					vm.cashInfusions.push(cashInfusion);
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
			});;
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
			promises.push(loadCashInfusions());

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
				return prev + curr.amount;
			}, vm.endingCash);

			vm.endingCash = vm.cashInfusions.reduce(function (prev, curr) {
				return prev + curr.amount;
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
			vm.cashInfusions.forEach(function (cash) {
				cash.isExpense = false;
				cash.isCash = true;
			})

			vm.incomeStatement = vm.sales.concat(vm.expenses).concat(vm.cashInfusions);
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