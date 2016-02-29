(function () {
	angular.module('app.inventory')
	.config(config);

	function config ($stateProvider) {
		$stateProvider
		.state('app.inventory', {
			cache: false,
			url: '/inventory',
			views: {
				'menuContent': {
					templateUrl: 'Inventory/templates/inventory.html',
					controller: 'InventoryController',
					controllerAs: 'inventory'
				}
			},
			resolve: {
				inventoryItems: function (Database, $q) {
					var deferred = $q.defer();
					return Database.select('inventory').then(function (response) {
						var items = {};

						if (response.rows.length === 0) {
							deferred.resolve();
						}

						for (var i = response.rows.length - 1; i >= 0; i--) {
							var item = response.rows.item(i);
							item.cost = Number(item.cost);
							item.linkProduct = item.productid !== null && item.productid !== undefined;
							if (item.linkProduct) {
								Database.select('product', item.productid).then(function (product) {
									items[product.rows.item(0).inventoryid].price = Number(product.rows.item(0).price);
									items[product.rows.item(0).inventoryid].category = product.rows.item(0).category;
									deferred.resolve();
								});
							} else {
								deferred.resolve();
							}
							items[item.id] = item;
						};
						return deferred.promise.then(function () {
							return Object.keys(items).map(function (key) {
								return items[key];
							});
						});
					});
				},
				categories: function (Database) {
					return Database.select('category').then(function (response) {
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
