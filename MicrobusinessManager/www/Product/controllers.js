(function () {
	angular.module('app.products')
	.controller('ProductsController', ProductsController);

		function ProductsController ($ionicModal, $scope, $q, $ionicPopup, Database, productItems, languages, categories, $ionicPopover) {
		var vm = this;

		vm.items = productItems;
		vm.categories = categories;
		vm.activeItem = null;
		vm.editModal = null;
		vm.editOpen = false;
		vm.editCategory = false;
		vm.show = false;
		vm.choose = false;
		vm.enterCat = false;
		vm.pick = '';

		vm.editItem = editItem;
		vm.save = save;
		vm.cancel = cancel;
		vm.addNewItem = addNewItem;
		vm.deleteItem = deleteItem;
		vm.clearSearch = clearSearch;
		vm.showConfirm = showConfirm;
		vm.chooseCategories = chooseCategories;
		vm.chooseCategory = chooseCategory;
		vm.closePopover = closePopover;
		vm.closePopoverCancel = closePopoverCancel;

		var tempItem = null;
		var queryCategories = false;
		var language = {};
		var title_delete, message_body;
		var productTable = 'product';
		var inventoryTable = 'inventory';
		var expenseTable = 'expense';

		function init () {
			if (languages.length) {
				for (var i = 0; i < languages.length; i++) {
					language.type = languages[0].type;
				}
			}
			$ionicModal.fromTemplateUrl('Product/templates/productEditModal.html', {
				scope: $scope,
				animation: 'slide-in-right'
			}).then(function (modal) {
				vm.editModal = modal;
			});

			$ionicPopover.fromTemplateUrl('Product/templates/productCategories.html', {
			    scope: $scope,
			}).then(function(popover) {
			    vm.prodCategories = popover;
			});
		}

		function editItem (item) {
			vm.activeItem = item;
			vm.editOpen = true;
			vm.enterCat = true;
			vm.editCategory = true;
			vm.pick = 'choose';
			tempItem = angular.copy(item);
			vm.editModal.show();
		}

		function save (item) {
			console.log(item);
			var deferred = $q.defer();
			var inventoryItem;
			if (item.linkInventory && item.inventoryid) {
				deferred.resolve();
			} else if (item.linkInventory) {
				deferred.promise = Database.select(inventoryTable, null, item.name).then(function (inventory) {
					if (inventory.rows.length > 0) {
						inventoryItem = inventory.rows.item(0);
						item.inventoryid = inventoryItem.id;
						deferred.resolve();
					} else {
						return Database.insert(inventoryTable, [item.name, item.quantity, item.id]).then(function (response) {
						    item.inventoryid = response.insertId;
						    Database.insert(expenseTable, [item.name, item.cost, item.comments, moment(item.date).format('YYYY-MM-DD HH:mm:ss')]);
						    deferred.resolve();
						});
					}
				});
			} else if (tempItem.linkInventory !== item.linkInventory && item.inventoryid) {
				deferred.promise = Database.select(inventoryTable, item.inventoryid).then(function (inventory) {
					if (inventory.rows.length > 0) {
						inventoryItem = inventory.rows.item(0);
						Database.update(inventoryTable, inventoryItem.id, [inventoryItem.name, inventoryItem.quantity, null]);
						item.inventoryid = null;
						deferred.resolve();
					}
				})
			} else {
				deferred.resolve();
			}

			if (!item.id) {
				deferred.promise.then(function () {
					Database.insert(productTable, [item.name, item.price, item.category, item.inventoryid]).then(function (response) {
						item.id = response.insertId;
						vm.items.push(item);
						if (item.linkInventory)
							Database.update(inventoryTable, item.inventoryid, [item.name, item.quantity, item.id]);
					});
				});
			} else {
				deferred.promise.then(function () {
					Database.update(productTable, item.id, [item.name, item.price, item.category, item.inventoryid]);
					if (item.linkInventory)
						Database.update(inventoryTable, item.inventoryid, [item.name, item.quantity, item.id]);
				});
			}

			vm.activeItem = null;
			vm.editModal.hide();
			vm.show = false;
			queryCategories = true;
		}

		function cancel () {
			if (vm.activeItem) {
				vm.activeItem.name = tempItem.name;
				vm.activeItem.quantity = tempItem.quantity;
				vm.activeItem.cost = tempItem.cost;
				vm.activeItem.category = tempItem.category;
				vm.activeItem.comments = tempItem.comments;
				vm.activeItem.date = tempItem.date;
				vm.activeItem.linkInventory = tempItem.linkInventory;
				vm.activeItem.price = tempItem.price;
				vm.pick = '';
				vm.show = false;
				vm.activeItem = null;
			}

			vm.editModal.hide();
		}

		function addNewItem () {
			vm.editOpen = false;
			vm.editCategory = false;
			vm.enterCat = false;
			vm.show = false;
			vm.choose = false;
			vm.pick = '';
			vm.activeItem = {};
			tempItem = {};
			vm.editModal.show();
		}

		function chooseCategories ($event) {
			if (queryCategories) {
				getCategories();
			}
			vm.prodCategories.show($event);
		}

		function chooseCategory ($event) {
			if (vm.editCategory) {
				vm.choose = true;
			}
			vm.show = false;
			vm.editCategory = false;
			chooseCategories($event);
		}

		function closePopover () {
			vm.prodCategories.hide();
		}

		function closePopoverCancel () {
			if (!vm.editCategory && !vm.editOpen) {
				vm.pick = '';
				vm.choose = false;
				vm.show = false;
			} else if (vm.editOpen && vm.activeItem.category === '') {
				vm.pick = '';
			}
			vm.prodCategories.hide();
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
			vm.search = '';
		}

		function getCategories () {
			vm.categories = [];

			Database.select('category').then(function (response) {
				var items = [];
				if (response.rows.length === 0) {
					return items;
				}
				for (var i = response.rows.length - 1; i >= 0; i--) {
					var item = response.rows.item(i);
					vm.categories.push(item);
				}
			});
			queryCategories = false;
		}

		function showConfirm () {
			if (language.type === 'es') {
				title_delete = "Borrar Producto";
				message_body = "¿Estás seguro?";
				cancel_button = "Cancelar";
			} else {
				title_delete = "Delete Product Item";
				message_body = "Are you sure?";
				cancel_button = "Cancel";
			}
			var confirmPopup = $ionicPopup.confirm({
				title: title_delete,
				template: message_body,
				buttons: [
					{
						text: cancel_button,
						type: 'button-stable'},
					{
						text: '<b>Ok</b>',
						type: 'button-positive',
						onTap: function(e) {
							vm.deleteItem(vm.activeItem);
						}
					}
			]
			});
		}

		//Cleanup the modal when we're done with it!
		$scope.$on('$destroy', function() {
			if (vm.editModal)
				vm.editModal.remove();
			if (vm.prodCategories)
				vm.prodCategories.remove();
		});

		init();
	}
})();
