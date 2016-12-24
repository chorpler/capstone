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
				},
/*				Database: function(Database) {
					var isrDB = Database;
					return isrDB;
				},*/
				user: function (Database) {
					return Database.select('user').then(function (response) {
						var items = [];
						if (response.rows.length === 0) {
							return items;
						}
						for (var i = response.rows.length - 1; i >= 0; i--) {
							var item = response.rows.item(i);
							var userid = item.id;
							var name = item.name;
							var representative = item.representative;
							var address = item.address;
							var email = item.email;
							var phone = item.phone;
							items.push(item);
						}
						// user = items;
						// organization = items;
						return items[0];
					});
				}
				,formats: function (Database) {
					return Database.select('formats').then(function (response) {
						var items = [];
						if (response.rows.length === 0) {
							return items;
						}
						for (var i = response.rows.length - 1; i >= 0; i--) {
							var item = response.rows.item(i);
							/* id, dateformat */
							items.push(item);
						}
						return items[0];
					});
				}

/*				,
				createPDF: pdfServiceProvider.createPDF*/
			}
		});
	}
})();
