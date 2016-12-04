(function () {
	angular.module('app.income-statement')
	.controller('IncomeStatementController', IncomeStatementController)

	function IncomeStatementController (startDate, endDate, timeFrame, incomeStatement, Database, $scope, $state, $q, $ionicPopover, $ionicHistory) {
		var vm = this;

		vm.startDate = startDate;
		vm.endDate = endDate;
		vm.timeFrame = timeFrame;
		vm.incomeStatement = incomeStatement;
		vm.showPopupMenu = showPopupMenu;
		vm.closeIncomeStatement = closeIncomeStatement;
		vm.generatePDF = generatePDF;
		vm.groupBy = 'name';
		vm.ionicPopover = $ionicPopover;

		vm.totalIncome;
		vm.totalExpenses;
		vm.totalProfit;

		vm.change = change;
		vm.changeGroupBy = changeGroupBy;

		function init () {
			vm.showPopupMenu();
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

		function showPopupMenu() {
			console.log("IA: showing Popup Menu ...");
			$ionicPopover.fromTemplateUrl('IncomeStatement/templates/PopupMenu.html', {
				scope: $scope
			}).then(function(popover) {
				console.log("IA: now in function after ionicPopover.fromTemplateUrl() ...")
				$scope.popover = popover;
				vm.popover = popover;
				// popover.show(".income-statement-menu")
			});


			$scope.openPopover = function($event) {
				console.log("IA: now in scope.openPopover()")
				vm.popover.show($event);
				var headerbar = angular.element(".income-statement-bar");
				var barHeight = headerbar.height();
				console.log("IA: Menu bar is " + barHeight + "px height");
				var elPopover = $("#PopupMenu001");
				var popTop = elPopover.position().top;
				console.log("elPopover has top " + popTop);
				var newPopTop = barHeight + 1 + "px";
				elPopover.css("top", newPopTop);
				console.log("elPopover now has top " + newPopTop);
				// vm.popover.positionView(".ion-android-menu", vm.popover);
				// vm.popover.show(".ion-android-menu");
				// vm.popover.positionView(".ion-android-menu", vm.popover);
			};
			$scope.closePopover = function() {
				console.log("IA: now in scope.closePopover()")
				vm.popover.hide();
			};
			
			//Cleanup the popover when we're done with it!
			$scope.$on('$destroy', function() {
				console.log("IA: now in scope.on('destroy')");
				vm.popover.remove();
			});
			// Execute action on hidden popover
			$scope.$on('popover.hidden', function() {
				console.log("IA: now in scope.on('popover.hidden')");
			// Execute action
			});
			// Execute action on remove popover
			$scope.$on('popover.removed', function() {
				console.log("IA: now in scope.on('popover.removed')");
			// Execute action
			});
		}

		function closeIncomeStatement() {
			console.log("IA: closing Income Statement ...");
			$ionicHistory.goBack();
		}

		function generatePDF() {
			console.log("IA: Now in generatePDF()");
		}



		init();
	}
})();
