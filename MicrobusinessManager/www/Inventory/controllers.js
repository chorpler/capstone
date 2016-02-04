(function () {
	angular.module('app.inventory')
	.controller('InventoryController', InventoryController);

	function InventoryController ($scope, $ionicModal, $q, $ionicPopup, Database, inventoryItems) {
		var vm = this;

		vm.items = inventoryItems;
		vm.activeItem = null;
		vm.totalAssets = 0;
		vm.editModal = null;
		vm.editOpen = false;

		vm.editItem = editItem;
		vm.save = save;
		vm.cancel = cancel;
		vm.addNewItem = addNewItem;
		vm.deleteItem = deleteItem;
		vm.clearSearch = clearSearch;
		vm.showConfirm = showConfirm;

		var tempItem = null;
		var productTable = 'product';
		var inventoryTable = 'inventory';
		var expenseTable = 'expense';

		function init () {
			// updateTotal();

			$ionicModal.fromTemplateUrl('Inventory/templates/inventoryEditModal.html', {
				scope: $scope,
				animation: 'slide-in-right'
			}).then(function (modal) {
				vm.editModal = modal;
			});

		}

		function editItem (item) {
			vm.editOpen = true;
			vm.activeItem = item;
			tempItem = angular.copy(item);
			vm.editModal.show();
		}

		function save (item) {
			var deferred = $q.defer();
			var inventoryItem;
			if (item.linkProduct) {
				deferred.promise = Database.select(productTable, null, item.name).then(function (product) {
					if (product.rows.length > 0) {
						productItem = product.rows.item(0);
						item.productid = productItem.id;
						deferred.resolve();
					} else {
						return Database.insert(productTable, [item.name, item.price, item.id]).then(function (response) {
							item.productid = response.insertId;
							deferred.resolve();
						});
					}
				});
			} else if (tempItem.linkProduct !== item.linkProduct && item.productid) {
				deferred.promise = Database.select(productTable, item.productid).then(function (product) {
					if (product.rows.length > 0) {
						productItem = product.rows.item(0);
						Database.update(productTable, productItem.id, [productItem.name, productItem.price, null]);
						item.productid = null;
						deferred.resolve();
					}
				});
			} else {
				deferred.resolve();
			}

			if (!item.id) {
				deferred.promise.then(function () {
					Database.select(inventoryTable, null, item.name).then(function (inventoryItem) {
						if (inventoryItem.rows.length > 0) {
							var oldItem = inventoryItem.rows.item(0);
							item.quantity += oldItem.quantity;
							item.id = oldItem.id;
							for (var i = vm.items.length - 1; i >= 0; i--) {
								if (vm.items[i].id === item.id) {
									vm.items[i].quantity = item.quantity;
								}
							};
							Database.update(inventoryTable, item.id, [item.name, item.quantity, item.productid]);
							if (item.linkProduct)
								Database.update(productTable, item.productid, [item.name, item.price, item.id]);
						} else {
							vm.items.push(item);
							Database.insert(inventoryTable, [item.name, item.quantity, item.productid]).then(function (response) {
								item.id = response.insertId;
								if (item.linkProduct)
									Database.update(productTable, item.productid, [item.name, item.price, item.id]);
							});
						}
					});

					Database.insert(expenseTable, [item.name, item.cost, item.comments, moment(item.date).format('YYYY-MM-DD HH:mm:ss')]);
					// updateTotal();
				});
			} else {
				deferred.promise.then(function () {
					Database.update(inventoryTable, item.id, [item.name, item.quantity, item.productid]);
					if (item.linkProduct)
						Database.update(productTable, item.productid, [item.name, item.price, item.id]);
				});
				// updateTotal();
			}

			vm.activeItem = null;
			vm.editModal.hide();
		}

		function cancel () {
			if (vm.activeItem) {
				vm.activeItem.name = tempItem.name;
				vm.activeItem.quantity = tempItem.quantity;
				vm.activeItem.cost = tempItem.cost;
				vm.activeItem.comments = tempItem.comments;
				vm.activeItem.price = tempItem.price;
				vm.activeItem.linkInventory = tempItem.linkInventory;
				vm.activeItem = null;
			}

			vm.editModal.hide();
		}

		function addNewItem () {
			vm.editOpen = false;
			vm.activeItem = {};
			tempItem = {};
			vm.editModal.show();
		}

		function deleteItem (item) {
			vm.items.splice(vm.items.indexOf(item), 1);
			vm.activeItem = null;
			if (item.productid) {
				Database.select(productTable, item.productid).then(function (response) {
					if (response.rows.length > 0) {
						var productItem = response.rows.item(0);
						Database.update(productTable, productItem.id, [productItem.name, productItem.price, null]);
					}
				});
			}
			Database.remove(inventoryTable, item.id);
			// updateTotal();
			vm.editModal.hide();
		}

		function updateTotal () {
			vm.totalAssets = vm.items.reduce(function (previousValue, currentItem) {
				return previousValue + (currentItem.quantity * currentItem.cost);
			}, 0);
		}

		function clearSearch () {
			vm.search = '';
		}

		function showConfirm () {
			var confirmPopup = $ionicPopup.confirm({
				title: 'Delete Inventory Item',
				template: 'Are you sure? If you delete it, you will need to go to expenses and update the corresponding entry.'
			});

			confirmPopup.then(function(res) {
				if(res) {
					vm.deleteItem(vm.activeItem);
				}
			});
		}

		//Cleanup the modal when we're done with it!
		$scope.$on('$destroy', function() {
			vm.editModal.remove();
		});

		init();
	}
})();
