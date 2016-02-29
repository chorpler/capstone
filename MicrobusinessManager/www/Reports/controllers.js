(function () {
	angular.module('app.reports')
	.controller('ReportsController', ReportsController);

	function ReportsController ($state) {
		var vm = this;

		vm.stateGo = stateGo;

		function stateGo (state) {
			$state.go('app.' + state);
		}
	}
})();
