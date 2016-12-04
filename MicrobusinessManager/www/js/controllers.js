(function () {
	angular.module('app')
	// .controller('AppController', ['$scope', '$q', '$ionicModal', 'ReportService', AppController]);
	.controller('AppController', AppController);

	function AppController (CashBalance, $scope, $ionicPopover, Database) {
		var vm = this;

		vm.cashBalance = CashBalance;
		// vm.reportService = ReportService;
		vm.showCash = showCash;
		vm.save = save;
		vm.cancel = cancel;
		vm.cashInfusion = {};
		vm.submitted = false;

		function init () {

		}

		function showCash ($event) {
			vm.cashInfusion.date = new Date();
			$ionicPopover.fromTemplateUrl('Cash/templates/cash.html', {
		  	scope: $scope,
			}).then(function(popover) {
				vm.cashInf = popover;
				vm.cashInf.show($event);
			});
		}

		function save (item, form, $event) {
			$event.stopPropagation();
			if (form && form.$invalid) {
				return;
			}
			vm.submitted = true;
			item.amount = item.amount && item.replace ? Number(item.amount.replace(',', '.')) : item.amount;
			Database.insert('cashInfusion', [item.amount,  moment(item.date).format('YYYY-MM-DD HH:mm:ss')])
			.then(function (response) {
				CashBalance.updateCashBalance();
				vm.cashInfusion = {};
				return response.insertId;
			});
			vm.cashInf.remove();
			vm.submitted = false;
		}

		function cancel () {
			vm.submitted = true;
			vm.cashInfusion = {};
			vm.cashInf.remove();
			vm.submitted = false;
		}

		$scope.$on('$destroy', function() {
			vm.cashInf.remove();
		});

		init();
	}
})();
