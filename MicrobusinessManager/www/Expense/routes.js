(function () {
	angular.module('app.expenses')
	.config(config);

	function config ($stateProvider) {
		$stateProvider
		.state('app.expenses', {
			url: '/expenses',
			cache: false,
			views: {
				'menuContent': {
					templateUrl: 'Expense/templates/expenses.html',
					controller: 'ExpensesController',
					controllerAs: 'expenses'
				}
			},
			resolve: {
				expenseItems: function (Database) {
					return Database.select('exp').then(function (response) {
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
				languages: function (Database) {
					return Database.select('languages').then(function (response) {
						var items = [];
						if (response.rows.length === 0) {
							return items;
						}
						for (var i = response.rows.length - 1; i >= 0; i--) {
							var item = response.rows.item(i);
							items.push(item);
						}
						return items;
					});
				}
			}
		});
	}
})();
