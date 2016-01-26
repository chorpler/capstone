(function () {
	angular.module('app.settings')
	.config(config);

	function config ($stateProvider) {
		$stateProvider
		.state('app.settings', {
			url: '/settings',
			views: {
				'menuContent': {
					templateUrl: 'Settings/templates/settings.html',
					controller: 'SettingsController',
					controllerAs: 'settings'
				}
			}
		});
	}
})();