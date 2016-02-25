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

          function pushProduct (product) {
            product.price = Number(product.price);
            product.count = 0;
            product.limit = "N/A";

            if (product.inventoryid) {
              Database.select('inventory', product.inventoryid)
                .then(function (response) {
                  var inventoryItem = response.rows.item(0);
                  product.limit = inventoryItem.quantity;
                  items.push(product);
                });
            }
            else {
              items.push(product);
            }
          }

          return Database.select('product')
          .then(function (response) {
            for (var i = response.rows.length - 1; i >= 0; i--) {
              var item = response.rows.item(i);
              pushProduct(item);
            }
            return items;
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
						return items;
					});
				},
      }
    });
  }
})();
