(function () {
	angular.module('app.inventory')
	.controller('InventoryController', InventoryController);

	function InventoryController ($scope, $ionicModal, $q, $ionicPopup, Database, inventoryItems, languages, categories, $ionicPopover, CashBalance) {

		var vm = this;

		vm.categories = categories;
		vm.items = inventoryItems;
		vm.activeItem = null;
		vm.totalAssets = 0;
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
			// updateTotal();
			if (languages.length) {
				for (var i = 0; i < languages.length; i++) {
					language.type = languages[0].type;
				}
			}
			$ionicModal.fromTemplateUrl('Inventory/templates/inventoryEditModal.html', {
				scope: $scope,
				animation: 'slide-in-right'
			}).then(function (modal) {
				vm.editModal = modal;
			});
			$ionicPopover.fromTemplateUrl('Inventory/templates/productInventoryCategories.html', {
			    scope: $scope,
			}).then(function(popover) {
			    vm.prodCategories = popover;
			});

		}

		function editItem (item) {
			vm.editOpen = true;
			vm.editCategory = true;
			vm.enterCat = true;
			vm.pick = 'choose';
			vm.activeItem = item;
			tempItem = angular.copy(item);
			vm.editModal.show();
		}

		function save (item) {
			var deferred = $q.defer();
			var productItem;
			if (item.linkProduct && item.productid) {
				deferred.resolve();
			} else if (item.linkProduct) {
				deferred.promise = Database.select(productTable, null, item.name).then(function (product) {
					if (product.rows.length > 0) {
						productItem = product.rows.item(0);
						item.productid = productItem.id;
						deferred.resolve();
					} else {
						return Database.insert(productTable, [item.name, item.price, item.category, item.id]).then(function (response) {
							item.productid = response.insertId;
							deferred.resolve();
						});
					}
				});
			} else if (tempItem.linkProduct !== item.linkProduct && item.productid) {
				deferred.promise = Database.select(productTable, item.productid).then(function (product) {
					if (product.rows.length > 0) {
						productItem = product.rows.item(0);
						Database.update(productTable, productItem.id, [productItem.name, productItem.price, item.category, null]);
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
								Database.update(productTable, item.productid, [item.name, item.price, item.category, item.id]);
						} else {
							vm.items.push(item);
							Database.insert(inventoryTable, [item.name, item.quantity, item.productid]).then(function (response) {
								item.id = response.insertId;
								if (item.linkProduct)
									Database.update(productTable, item.productid, [item.name, item.price, item.category, item.id]);
							});
						}
					});

					item.expType = 'variable';
					Database.insert(expenseTable, [item.name, item.cost, item.expType, item.comments, moment(item.date).format('YYYY-MM-DD HH:mm:ss')])
					.then(CashBalance.updateCashBalance);
					// updateTotal();
				});
			} else {
				deferred.promise.then(function () {
					Database.update(inventoryTable, item.id, [item.name, item.quantity, item.productid]);
					if (item.linkProduct)
						Database.update(productTable, item.productid, [item.name, item.price, item.category, item.id]);
				});
				// updateTotal();
			}

			vm.activeItem = null;
			queryCategories = true;
			vm.editModal.hide();
		}

		function cancel () {
			if (vm.activeItem) {
				vm.activeItem.name = tempItem.name;
				vm.activeItem.quantity = tempItem.quantity;
				vm.activeItem.cost = tempItem.cost;
				vm.activeItem.category = tempItem.category;
				vm.activeItem.comments = tempItem.comments;
				vm.activeItem.price = tempItem.price;
				vm.activeItem.linkInventory = tempItem.linkInventory;
				vm.activeItem = null;
				vm.pick = '';
				vm.show = false;
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
			vm.activeItem.date = new Date();
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
			if (vm.activeItem.category === '' || vm.activeItem.category === undefined) {
				vm.enterCat = false;
			} else {
				vm.enterCat = true;
			}
			vm.show = false;
			vm.editCategory = false;
			chooseCategories($event);
		}

		function closePopover () {
			vm.prodCategories.hide();
		}

		function closePopoverCancel () {
			if (!vm.editCategory && !vm.editOpen && !vm.enterCat) {
				vm.pick = '';
				vm.choose = false;
				vm.show = false;
			} else if (vm.editOpen && vm.activeItem.category === '') {
				vm.pick = '';
			}
			vm.prodCategories.hide();
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

		function deleteItem (item) {
			vm.items.splice(vm.items.indexOf(item), 1);
			vm.activeItem = null;
			if (item.productid) {
				Database.select(productTable, item.productid).then(function (response) {
					if (response.rows.length > 0) {
						var productItem = response.rows.item(0);
						Database.update(productTable, productItem.id, [productItem.name, productItem.price, productItem.category, null]);
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
			if (language.type === 'es') {
				title_delete = "Borrar Artículo de Inventario";
				message_body = "¿Estás seguro? Si lo borras, tendrás que ir a Gastos y actualizar el correspondiente registro";
				cancel_button = "Cancelar";
			} else {
				title_delete = "Delete Inventory Item";
				message_body = "Are you sure? If you delete it, you will need to go to expenses and update the corresponding entry.";
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
						text: 'Ok',
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
