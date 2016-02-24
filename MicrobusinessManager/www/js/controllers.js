(function () {
	angular.module('app')
	.controller('AppController', AppController);

	function AppController (CashBalance) {
		var vm = this;

		vm.cashBalance = CashBalance;
	}
})();
