(function () {
	angular.module('app.product')
	.controller('ProductsController', ProductsController);

		function ProductsController ($ionicModal, $scope, $q, $ionicPopup, Database, productItems) {
		var vm = this;

		vm.items = productItems;
		vm.activeItem = null;
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

		function init () {
			$ionicModal.fromTemplateUrl('templates/productEditModal.html', {
				scope: $scope,
				animation: 'slide-in-right'
			}).then(function (modal) {
				vm.editModal = modal;
			});
		}

		function editItem (item) {
			vm.activeItem = item;
			vm.editOpen = true;
			tempItem = angular.copy(item);
			vm.editModal.show();
		}

		function save (item) {
			var deferred = $q.defer();
			var inventoryItem;
			if (item.linkInventory) {
				deferred.promise = Database.select(inventoryTable, null, item.name).then(function (inventory) {
					if (inventory.rows.length > 0) {
						inventoryItem = inventory.rows.item(0);
						item.inventoryid = inventoryItem.id;
						deferred.resolve();
					} else {
						return Database.insert(inventoryTable, [item.name, item.quantity, item.cost, item.id]).then(function (response) {
						    item.inventoryid = response.insertId;
						    deferred.resolve();
						});
					}
				});
			} else if (tempItem.linkInventory !== item.linkInventory && item.inventoryid) {
				deferred.promise = Database.select(inventoryTable, item.inventoryid).then(function (inventory) {
					if (inventory.rows.length > 0) {
						inventoryItem = inventory.rows.item(0);
						Database.update(inventoryTable, inventoryItem.id, [inventoryItem.name, inventoryItem.quantity, inventoryItem.cost, null]);
						item.inventoryid = null;
						deferred.resolve();
					}
				})
			} else {
				deferred.resolve();
			}

			if (!item.id) {
				deferred.promise.then(function () {
					Database.insert(productTable, [item.name, item.price, item.inventoryid]).then(function (response) {
						item.id = response.insertId;
						vm.items.push(item);
						if (item.linkInventory)
							Database.update(inventoryTable, item.inventoryid, [item.name, item.quantity, item.cost, item.id]);
					});
				});
			} else {
				deferred.promise.then(function () {
					Database.update(productTable, item.id, [item.name, item.price, item.inventoryid]);
					if (item.linkInventory)
						Database.update(inventoryTable, item.inventoryid, [item.name, item.quantity, item.cost, item.id]);
				});
			}

			vm.activeItem = null;
			vm.editModal.hide();
		}

		function cancel () {
			if (vm.activeItem) {
				vm.activeItem.name = tempItem.name;
				vm.activeItem.quantity = tempItem.quantity;
				vm.activeItem.cost = tempItem.cost;
				vm.activeItem.linkInventory = tempItem.linkInventory;
				vm.activeItem.price = tempItem.price;
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
			if (item.inventoryid) {
				Database.select(inventoryTable, item.inventoryid).then(function (response) {
					if (response.rows.length > 0) {
						var inventoryItem = response.rows.item(0);
						Database.update(inventoryTable, inventoryItem.id, [inventoryItem.name, inventoryItem.quantity, inventoryItem.cost, null]);
					}
				})
			}
			Database.remove(productTable, item.id);
			vm.activeItem = null;
			vm.editModal.hide();
		}

		function clearSearch () {
			console.log('i am here');
			vm.search = '';
		}

		function showConfirm () {
			var confirmPopup = $ionicPopup.confirm({
				title: 'Delete Product Item',
				template: 'Are you sure?'
			});

			confirmPopup.then(function(res) {
				if(res) {
					vm.deleteItem(vm.activeItem);
				} else {
					console.log('You are not sure');
				}
			});
		}

		init();
	}
})();