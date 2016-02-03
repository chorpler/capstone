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
			},
			resolve: {
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
				}
			}
		});
	}
})();
