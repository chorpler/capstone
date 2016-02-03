(function () {
	angular.module('app.salary')
	.config(config);

	function config ($stateProvider) {
		$stateProvider
		.state('app.salary', {
			url: '/salary',
			cache: false,
			views: {
				'menuContent': {
					templateUrl: 'Salary/templates/salary.html',
					controller: 'salaryController',
					controllerAs: 'salary'
				}
			},
			resolve: {
				salaryItems: function (Database) {
					return Database.select('expense', null, null, 'salary').then(function (response) {
						var items = [];
						if (response.rows.length === 0) {
							return items;
						}
						for (var i = response.rows.length - 1; i >= 0; i--) {
							var item = response.rows.item(i);
							item.amount = Number(item.amount);
							item.date = moment(item.date).toDate();
							items.push(item);
						}
						return items;
					});
				},
				salary: function (Database) {
					return Database.select('salary').then(function (response) {
						var items = [];
						if (response.rows.length === 0) {
							return items;
						}
						for (var i = response.rows.length - 1; i >= 0; i--) {
							var item = response.rows.item(i);
							item.amount = Number(item.amount);
							items.push(item);
						}
						return items;
					});
				},
				cashOnHand: function (Database) {
					return Database.calculateCashOnHand().then(function (response) {
						return response.rows.item(0).total;
					});
				}
			}
		});
	}
})();
