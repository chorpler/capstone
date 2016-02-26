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
			$ionicPopover.fromTemplateUrl('Cash/templates/cash.html', {
			    scope: $scope,
			}).then(function(popover) {
			    vm.cashInf = popover;
			});
		}

		function showCash ($event) {
			vm.cashInfusion.date = new Date();
			vm.cashInf.show($event);
		}

		function save (item) {
			Database.insert('cashInfusion', [item.amount,  moment(item.date).format('YYYY-MM-DD HH:mm:ss')])
			.then(function (response) {
        CashBalance.updateCashBalance();
				vm.cashInfusion = {};
        return response.insertId;
      });
			vm.cashInf.hide();
		}

		function cancel () {
			vm.cashInfusion = {};
			vm.cashInf.hide();
		}

		$scope.$on('$destroy', function() {
			vm.cashInf.remove();
		});

		init();
	}
})();
