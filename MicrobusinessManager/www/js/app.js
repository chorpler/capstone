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
			url: '/products',
			views: {
				'menuContent': {
					templateUrl: 'templates/products.html',
					controller: 'ProductsController',
					controllerAs: 'products'
				}
			}
		})
		.state('app.inventory', {
			url: '/inventory',
			views: {
				'menuContent': {
					templateUrl: 'templates/inventory.html',
					controller: 'InventoryController',
					controllerAs: 'inventory'
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
