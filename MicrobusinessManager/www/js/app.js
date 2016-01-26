(function () {
	angular.module('app', [
		'ionic', 
		'ngCordova',
		'app.expenses',
		'app.inventory',
		'app.products',
		'app.reports',
		'app.sales',
		'app.settings'

	])
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
		});

		// if none of the above states are matched, use this as the fallback
		$urlRouterProvider.otherwise('app/inventory');
	}
})();
