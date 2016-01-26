(function () {
	angular.module('app.reports')
	.config(config);

	function config ($stateProvider) {
		$stateProvider
		.state('app.reports', {
			url: '/reports',
			views: {
				'menuContent': {
					templateUrl: 'Reports/templates/reports.html',
					controller: 'ReportsController',
					controllerAs: 'reports'
				}
			}
		})
	}
})();