(function () {
	angular.module('app.income-statement')
	.config(config);

	function config ($stateProvider) {
		$stateProvider
		.state('app.income-statement', {
			url: '/income-statement',
			cache: false,
			views: {
				'menuContent': {
					templateUrl: 'IncomeStatement/templates/incomeStatement.html',
					controller: 'IncomeStatementController',
					controllerAs: 'income'
				}
			},
			resolve: {
				timeFrame: function () {
					return { id: 'reports_header_day', value: 'day'};
				},
				startDate: function (timeFrame) {
					return moment().startOf('day');
				},
				endDate: function (startDate, timeFrame) {
					return moment(startDate).endOf(timeFrame.value);
				},
				incomeStatement: function (startDate, endDate, Database) {
					return Database.generateIncomeStatement(startDate, endDate, 'name').then(function (incomeStatement) {
						return incomeStatement;
					});
				}
			}
		});
	}
})();