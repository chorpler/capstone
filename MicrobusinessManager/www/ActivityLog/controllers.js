(function () {
	angular.module('app.activitylog')
	.controller('ActivityLogController', ActivityLogController);

	function ActivityLogController (timeFrame, startDate, endDate, startingCash, expenses, sales, cashInfusions, Database, $q) {
		var vm = this;

		vm.startDate 		= startDate;
		vm.timeFrame 		= timeFrame;
		vm.endDate 			= endDate;
		vm.sales 			= sales;
		vm.expenses 		= expenses;
		vm.cashInfusions 	= cashInfusions;
		vm.startingCash 	= startingCash;
		vm.endingCash		= 0;
		vm.incomeStatement	= [];
		vm.language = {};

		vm.change = change;

		function init () {
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
			promises.push(loadSales());

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

		init();
	}
})()