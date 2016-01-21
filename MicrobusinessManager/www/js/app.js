(function () {
    angular.module('app', ['ionic', 'ngCordova'])
    .run(run)
    .config(config);

    function run ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }

            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
        });
    }

    function config ($stateProvider, $urlRouterProvider) {
		$stateProvider
		.state('app', {
			url: '/app',
			abstract: true,
			templateUrl: 'templates/menu.html',
			controller: 'AppController',
			controllerAs: 'app'
		})
		.state('app.sales', {
			url: '/sales',
			views: {
				'menuContent': {
					templateUrl: 'templates/sales.html',
					controller: 'SalesController',
					controllerAs: 'sales'
				}
			}
		})
		.state('app.products', {
			cache: false,
			url: '/products',
			views: {
				'menuContent': {
					templateUrl: 'templates/products.html',
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
					        		items[inventory.rows.item(0).productid].cost = Number(inventory.rows.item(0).cost);
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
				}
			}
		})
		.state('app.inventory', {
			cache: false,
			url: '/inventory',
			views: {
				'menuContent': {
					templateUrl: 'templates/inventory.html',
					controller: 'InventoryController',
					controllerAs: 'inventory'
				}
			},
			resolve: {
				inventoryItems: function (Database, $q) {
					var deferred = $q.defer();
					var promises = [];
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
					        	promises.push(Database.select('product', item.productid).then(function (product) {
					        		items[product.rows.item(0).inventoryid].price = Number(product.rows.item(0).price);
					        		deferred.resolve();
					        	}));
					        } else {
					        	deferred.resolve();
					        }
					        items[item.id] = item;
					    };
					    return $q.all(promises).then(function () {
					    	return Object.keys(items).map(function (key) {
					    		return items[key];
					    	});
					    });
					});
				}
			}
		})
		.state('app.expenses', {
			url: '/expenses',
			views: {
				'menuContent': {
					templateUrl: 'templates/expenses.html',
					controller: 'ExpensesController',
					controllerAs: 'expenses'
				}
			}
		})
		.state('app.reports', {
			url: '/reports',
			views: {
				'menuContent': {
					templateUrl: 'templates/reports.html',
					controller: 'ReportsController',
					controllerAs: 'reports'
				}
			}
		})
		.state('app.settings', {
			url: '/settings',
			views: {
				'menuContent': {
					templateUrl: 'templates/settings.html',
					controller: 'SettingsController',
					controllerAs: 'settings'
				}
			}
		});

		// if none of the above states are matched, use this as the fallback
		$urlRouterProvider.otherwise('app/inventory');
	}
})();
