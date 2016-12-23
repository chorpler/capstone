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
				},
				user: function (Database) {
					return Database.select('user').then(function (response) {
						var items = [];
						if (response.rows.length === 0) {
							return items;
						}
						for (var i = response.rows.length - 1; i >= 0; i--) {
							var item = response.rows.item(i);
							/* id, name, representative, street1, street2, city, state, postal, email, phone */
							items.push(item);
						}
						return items[0];
					});
				},
				tax: function (Database) {
					return Database.select('tax').then(function (response) {
						var items = [];
						if (response.rows.length === 0) {
							return items;
						}
						for (var i = response.rows.length - 1; i >= 0; i--) {
							var item = response.rows.item(i);
							item.percentage = Number(item.percentage);
							item.active = item.active === 0 ? false : true;
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
				},
				formats: function (Database) {
					return Database.select('formats').then(function (response) {
						var items = [];
						if (response.rows.length === 0) {
							return items;
						}
						for (var i = response.rows.length - 1; i >= 0; i--) {
							var item = response.rows.item(i);
							/* id, dateformat */
							items.push(item);
						}
						return items[0];
					});
				}
			}
		});
	}
})();
