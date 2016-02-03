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
			},
			resolve: {
				startDate: function ($window) {
					return moment($window.localStorage['MM_Reports_Start_Date']) || moment().startOf('month');
				},
				timeFrame: function ($window) {
					return $window.localStorage['MM_Reports_Timeframe'] || 'Day';
				},
				endDate: function (startDate, timeFrame) {
					return moment(startDate).endOf(timeFrame);
				},
				startingCash: function (startDate, timeFrame, Database) {
					return Database.calculateCashOnHand(null, startDate).then(function (response) {
						return response.rows.item(0).total;
					});
				},
				expenses: function (startDate, endDate, Database) {
					return Database.select('expense', null, null, null, startDate, endDate).then(function (response) {
						var items = [];
						if (response.rows.length === 0) {
							return items;
						}

						for (var i = response.rows.length - 1; i >= 0; i--) {
							var item = response.rows.item(i);
							item.amount = Number(item.amount);
							item.date = moment(item.date);
							items.push(item);
						};

						return items;
					});
				},
				sales: function (startDate, endDate, Database) {
					return Database.select('sale', null, null, null, startDate, endDate).then(function (response) {
						var items = [];
						if (response.rows.length === 0) {
							return items;
						}

						for (var i = response.rows.length - 1; i >= 0; i--) {
							var item = response.rows.item(i);
							item.date = moment(item.date);
							items.push(item);
						};

						return items;
					});
				}
			}
		})
	}
})();