(function () {
	angular.module('app.products')
	.config(config);

	function config ($stateProvider) {
		$stateProvider
		.state('app.products', {
			cache: false,
			url: '/products',
			views: {
				'menuContent': {
					templateUrl: 'Product/templates/products.html',
					controller: 'ProductsController',
					controllerAs: 'products'
				}
			},
			resolve: {
				productItems: function (Database, $q) {
					var deferred = $q.defer();
					var promises = [];
					return Database.select('product').then(function (response) {
						var items = {};

						if (response.rows.length === 0) {
							deferred.resolve();
						}

						for (var i = response.rows.length - 1; i >= 0; i--) {
							var item = response.rows.item(i);
							item.price = Number(item.price);
							item.linkInventory = item.inventoryid !== null && item.inventoryid !== undefined;
							items[item.id] = item;
							if (item.linkInventory) {
								promises.push(Database.select('inventory', item.inventoryid).then(function (inventory) {
									items[inventory.rows.item(0).productid].quantity = inventory.rows.item(0).quantity;
								}));
							}
						};
						return $q.all(promises).then(function () {
							return Object.keys(items).map(function (key) {
								return items[key];
							});
						});
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
