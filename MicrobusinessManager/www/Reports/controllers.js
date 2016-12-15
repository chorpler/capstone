(function () {
	angular.module('app.reports')
	.controller('ReportsController', ReportsController);

	function ReportsController ($state, $ionicPopover, $ionicHistory) {
		var vm = this;

		vm.stateGo = stateGo;
		vm.showPopupMenu = showPopupMenu;
		vm.closeIncomeStatement = closeIncomeStatement;

		function stateGo (state) {
			var appstate = 'app.' + state;
			Log.l("Going to state " + appstate);
			$state.go(appstate);
		}

		function showPopupMenu() {
			console.log("Reports: showing Popup Menu ...");
		}

		function closeIncomeStatement() {
			console.log("Reports: closing Income Statement ...");
			$ionicHistory.goBack();
		}
	}
})();
