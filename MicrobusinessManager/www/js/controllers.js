(function () {
	angular.module('app')
	.controller('AppController', AppController);

	function AppController (CashBalance, $scope, $ionicPopover, Database) {
		var vm = this;

		vm.cashBalance = CashBalance;
		vm.showCash = showCash;
		vm.save = save;
		vm.cancel = cancel;
		vm.cashInfusion = {};

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

		function save (item) {
			Database.insert('cashInfusion', [item.amount,  moment(item.date).format('YYYY-MM-DD HH:mm:ss')])
			.then(function (response) {
				CashBalance.updateCashBalance();
				vm.cashInfusion = {};
				return response.insertId;
			});
			vm.cashInf.remove();
		}

		function cancel () {
			vm.cashInfusion = {};
			vm.cashInf.remove();
		}

		$scope.$on('$destroy', function() {
			vm.cashInf.remove();
		});

		init();
	}
})();
