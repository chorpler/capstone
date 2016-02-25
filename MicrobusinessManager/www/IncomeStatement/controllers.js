(function () {
	angular.module('app.income-statement')
	.controller('IncomeStatementController', IncomeStatementController)

	function IncomeStatementController (startDate, endDate, timeFrame, incomeStatement, Database) {
		var vm = this;

		vm.startDate = startDate;
		vm.endDate = endDate;
		vm.timeFrame = timeFrame;
		vm.incomeStatement = incomeStatement;
		vm.groupBy = 'name';
		vm.totalIncome;
		vm.totalExpenses;
		vm.totalProfit;

		vm.change = change;
		vm.changeGroupBy = changeGroupBy;

		function init () {
			vm.incomeStatement.incomeItems.sort(sortByName);
			vm.incomeStatement.expenseItems.sort(sortByName);
			calculateTotals();
		}

		function change (startDate, timeFrame) {
			vm.startDate = startDate;
			vm.timeFrame = timeFrame;
			vm.endDate = moment(vm.startDate).endOf(vm.timeFrame.value);
			getIncomeStatement();
		}

		function changeGroupBy (groupBy) {
			vm.groupBy = groupBy;
			getIncomeStatement();
		}

		function getIncomeStatement () {
			Database.generateIncomeStatement(vm.startDate, vm.endDate, vm.groupBy).then(function (incomeStatement) {
				vm.incomeStatement = incomeStatement;
				vm.incomeStatement.incomeItems.sort(sortByName);
				vm.incomeStatement.expenseItems.sort(sortByName);
				calculateTotals();
			});
		}

		function calculateTotals () {
			vm.totalIncome = vm.incomeStatement.incomeItems.reduce(function (prev, curr) {
				return prev + curr.amount;
			}, 0);

			vm.totalExpenses = vm.incomeStatement.expenseItems.reduce(function (prev, curr) {
				return prev + curr.amount;
			}, 0);

			vm.totalProfit = vm.totalIncome - vm.totalExpenses;
		}

		function sortByName (a, b) {
			if (a.name < b.name) {
				return -1;
			}
			if (a.name > b.name) {
				return 1;
			}

			return 0;
		}

		init();
	}
})();