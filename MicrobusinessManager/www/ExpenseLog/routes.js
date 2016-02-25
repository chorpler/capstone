(function () {
	angular.module('app.expenselog')
	.config(config);

	function config ($stateProvider) {
		$stateProvider.state('app.expenselog', {
			url: '/expenselog',
			cache: false,
			views: {
				'menuContent': {
					templateUrl: 'ExpenseLog/templates/expenselog.html',
					controller: 'ExpenseLogController',
					controllerAs: 'expenselog'
				}
			},
			resolve: {
				expenseItems: function (Database) {
					return Database.select('expense').then(function (response) {
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
						console.log(items);
						return items;
					});
				}
			}
		});
	}
})();
