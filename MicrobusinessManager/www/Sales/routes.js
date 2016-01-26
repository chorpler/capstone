(function () {
	angular.module('app.sales')
	.config(config);

	function config ($stateProvider) {
		$stateProvider
		.state('app.sales', {
			url: '/sales',
			cache: false,
			views: {
				'menuContent': {
					templateUrl: 'Sales/templates/sales.html',
					controller: 'SalesController',
					controllerAs: 'sales'
				}
			},
			resolve: {
				products: function products (Database) {
					var items = [];
					return Database.select('product')
					.then(function (response) {
						for (var i = response.rows.length - 1; i >= 0; i--) {
							var item = response.rows.item(i);
							item.price = Number(item.price);
							item.count = 0;
							items.push(item);
						}
						return items;
					});
				}
			}
		})
	}
})();