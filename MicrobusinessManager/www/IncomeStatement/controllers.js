(function () {
	angular.module('app.income-statement')
	.controller('IncomeStatementController', ['IncomeStatementService', '', IncomeStatementController])

	function IncomeStatementController (startDate, endDate, timeFrame, incomeStatement, Database, $scope, $state, $q, $ionicPopover, $ionicHistory, $ionicModal, IncomeStatementService) {
		var vm = this;

		setDefaultsForPdfViewer($scope);


		vm.startDate = startDate;
		vm.endDate = endDate;
		vm.timeFrame = timeFrame;
		vm.incomeStatement = incomeStatement;
		vm.showPopupMenu = showPopupMenu;
		vm.closeIncomeStatement = closeIncomeStatement;
		vm.generatePDF = generatePDF;
		vm.getUserInfo = getUserInfo;
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
			vm.generatePDF();
			$scope.$on('$destroy', function() {
				Log.l("IncomeStatement.controller: Cleaning up scope and removing pdfModal...")
				vm.pdfModal.remove();
			});
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

		function getUserInfo(Database) {
			return Database.select('user').then(function (response) {
				var items = [];
				if (response.rows.length === 0) {
					return items;
				}
				for (var i = response.rows.length - 1; i >= 0; i--) {
					var item = response.rows.item(i);
					items.push(item);
				}
				// user = items;
				// organization = items;
				return items[0];
			});
		},

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
			Log.l("IA: showing Popup Menu ...");
			$ionicPopover.fromTemplateUrl('IncomeStatement/templates/PopupMenu.html', {
				scope: $scope
			}).then(function(popover) {
				Log.l("IA: now in function after ionicPopover.fromTemplateUrl() ...")
				$scope.popover = popover;
				vm.popover = popover;
				// popover.show(".income-statement-menu")
			});


			$scope.openPopover = function($event) {
				Log.l("IA: now in scope.openPopover()")
				vm.popover.show($event);
				var headerbar = angular.element(".income-statement-bar");
				var barHeight = headerbar.height();
				Log.l("IA: Menu bar is " + barHeight + "px height");
				var elPopover = $("#PopupMenu001");
				var popTop = elPopover.position().top;
				Log.l("elPopover has top " + popTop);
				var newPopTop = barHeight + 1 + "px";
				elPopover.css("top", newPopTop);
				Log.l("elPopover now has top " + newPopTop);
				// vm.popover.positionView(".ion-android-menu", vm.popover);
				// vm.popover.show(".ion-android-menu");
				// vm.popover.positionView(".ion-android-menu", vm.popover);
			};
			$scope.closePopover = function() {
				Log.l("IA: now in scope.closePopover()")
				vm.popover.hide();
			};
			
			//Cleanup the popover when we're done with it!
			$scope.$on('$destroy', function() {
				Log.l("IA: now in scope.on('destroy')");
				vm.popover.remove();
			});
			// Execute action on hidden popover
			$scope.$on('popover.hidden', function() {
				Log.l("IA: now in scope.on('popover.hidden')");
			// Execute action
			});
			// Execute action on remove popover
			$scope.$on('popover.removed', function() {
				Log.l("IA: now in scope.on('popover.removed')");
			// Execute action
			});
		}

		function closeIncomeStatement() {
			Log.l("IA: closing Income Statement ...");
			$ionicHistory.goBack();
		}

		function generatePDF() {
			Log.l("IA: Now in generatePDF()");
			// Initialize the modal view.
			$ionicModal.fromTemplateUrl('IncomeStatement/templates/pdf-viewer.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function (modal) {
				vm.modal = modal;
				vm.pdfModal = modal;
			});
		}

		function createReport() {
			IncomeStatementService.createPdf(invoice).then(function(pdf) {
				var blob = new Blob([pdf], {type: 'application/pdf'});
				$scope.pdfUrl = URL.createObjectURL(blob);

				// Display the modal view
				vm.modal.show();
			});

		}

		function setDefaultsForPdfViewer($scope) {
			$scope.scroll = 0;
			$scope.loading = 'loading';

			$scope.onError = function (error) {
				Log.e(error);
			};

			$scope.onLoad = function () {
				$scope.loading = '';
			};

			$scope.onProgress = function (progress) {
				Log.l(progress);
			};
		}

		init();
	}
})();
