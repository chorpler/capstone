(function () {
	angular.module('app.reports')
	.config(config);

	function config ($stateProvider) {
		$stateProvider
		.state('app.reports', {
			url: '/reports',
			cache: false,
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