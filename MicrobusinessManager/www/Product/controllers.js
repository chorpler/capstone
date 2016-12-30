(function () {
	angular.module('app.products')
	.controller('ProductsController', ProductsController);

	function ProductsController ($ionicModal, $scope, $rootScope, $q, $timeout, $ionicPopup, Database, productItems, languages, categories, $ionicPopover, CashBalance) {

		var vm = this;
		vm.scopes = vm.scopes || {};
		vm.scopes.product = $scope;
		var rs = $rootScope;
		win.vm = vm;
		win.rs = rs;
		win.iPO = $ionicPopover;

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
		vm.submitted = false;

		vm.editItem = editItem;
		vm.save = save;
		vm.cancel = cancel;
		vm.removeEditModal = removeEditModal;
		vm.addNewItem = addNewItem;
		vm.deleteItem = deleteItem;
		vm.clearSearch = clearSearch;
		vm.showConfirm = showConfirm;
		vm.showEditModal = showEditModal;
		vm.createCategoriesPopup = createCategoriesPopup;
		vm.showCategoriesPopup = showCategoriesPopup;
		vm.chooseCategories = chooseCategories;
		vm.chooseCategory = chooseCategory;
		vm.removePopover = removePopover;
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
			Log.l("Product: done with init().");
		}

		// function createEditModal($scope) {
		// 	Log.l("Product: Now in createEditModal()");
		// 	var d = $q.defer();
		// 	// Initialize the modal view.
		// 	$ionicModal.fromTemplateUrl('ActivityLog/templates/pdf-viewer.html', {
		// 		scope: $scope,
		// 		animation: 'slide-in-up'
		// 	}).then(function(pdfModal) {
		// 		Log.l("Product: Now in function after ionicModal.fromTemplateUrl(pdfViewer)...");
		// 		$scope.pdfModal = pdfModal;
		// 		vm.pdfModal = pdfModal;
		// 		$scope.$on('$destroy', function() {
		// 			Log.l("Product: now in scope.on('destroy') for pdfModal");
		// 			vm.pdfModal.remove();
		// 		});
		// 		// Execute action on hidden popover
		// 		$scope.$on('pdfModal.hidden', function() {
		// 			Log.l("Product: now in scope.on('pdfModal.hidden')");
		// 			// Execute action
		// 		});
		// 		// Execute action on remove popover
		// 		$scope.$on('pdfModal.removed', function() {
		// 			Log.l("Product: now in scope.on('pdfModal.removed')");
		// 			// Execute action
		// 		});
		// 		return createPDFPopupMenu($scope);
		// 	}).then(function(res) {
		// 		setDefaultsForPdfViewer($scope);
		// 		Log.l("Product: Done creating pdfModal and pdfPopupMenu!");
		// 		d.resolve(res);
		// 	}).catch(function(err) {
		// 		Log.l("Product: Error creating PDF modal!");
		// 		Log.l(err);
		// 		d.reject(err);
		// 	});
		// 	return d.promise;
		// }

		function showEditModal ($scope) {
			Log.l("Product: Now in showEditModal()");
			// var d = $q.defer();
			$ionicModal.fromTemplateUrl('Product/templates/productEditModal.html', {
				scope: $scope,
				animation: 'slide-in-right'
			}).then(function (editModal) {
				Log.l("Product: editModal created. Showing.");
				vm.editModal = editModal;
				vm.editModal.show();
				// vm.editModal.show();
				$scope.$on('$destroy', function() {
					Log.l("Product: now in scope.on('destroy') for editModal");
					vm.editModal.remove();
				});
				// Execute action on hidden popover
				$scope.$on('editModal.hidden', function() {
					Log.l("Product: now in scope.on('editModal.hidden')");
					// Execute action
				});
				// Execute action on remove popover
				$scope.$on('editModal.removed', function() {
					Log.l("Product: now in scope.on('editModal.removed')");
					// Execute action
				});
				// return createCategoriesPopup($scope);
			// }).then(function(res) {
				// Log.l("Product: Done creating editModal and categoriesPopup!");
				// d.resolve(res);
			}).catch(function(err) {
				Log.l("Product: Error creating editModal!");
				Log.l(err);
				// d.reject(err);
			});
			// return d.promise;
		}

		function createCategoriesPopup($event) {
			Log.l("Product: Now in createCategoriesPopup() ...");
			// var d = $q.defer();
			$ionicPopover.fromTemplateUrl('Product/templates/productCategories.html', {
				scope: $scope
			}).then(function(categoriesPopup) {
				Log.l("Product: now in function after ionicPopover.fromTemplateUrl('productCategories') ...");
				$scope.categoriesPopup = categoriesPopup;
				vm.categoriesPopup = categoriesPopup;
				vm.showCategoriesPopup($event);
				//Cleanup the categoriesPopup when we're done with it!
				$scope.$on('$destroy', function() {
					Log.l("Product: now in scope.on('destroy') for categoriesPopup");
					vm.categoriesPopup.remove();
				});
				// Execute action on hidden categoriesPopup
				$scope.$on('categoriesPopup.hidden', function() {
					Log.l("Product: now in scope.on('categoriesPopup.hidden')");
					// Execute action
				});
				// Execute action on remove categoriesPopup
				$scope.$on('categoriesPopup.removed', function() {
					Log.l("Product: now in scope.on('categoriesPopup.removed')");
					// Execute action
				});
				Log.l("Product: Now done creating categoriesPopup.");
				Log.l(vm.categoriesPopup);
				// d.resolve(vm.categoriesPopup);
			}).catch(function(err) {
				Log.l("Product: Error creating categoriesPopup!");
				Log.l(err);
				// d.reject(err);
			});
			// return d.promise;
		}

		function showCategoriesPopup($event) {
			Log.l("Product: now in showCategoriesPopup(), categoriesPopup is:");
			Log.l(vm.categoriesPopup);
			vm.categoriesPopup.show($event).then(function(res) {
				Log.l("Done showing categoriesPopup!");
				Log.l(res);
			});
			// var menuElement = angular.element(document).find('.product_categories_popup_target');
			// var menuElement = document.querySelector('.product_categories_popup_target');
			// vm.categoriesPopup.show(menuElement);
			// vm.categoriesPopup.show('.product_categories_popup_target');
		}

		function editItem (item) {
			vm.activeItem = item;
			vm.activeItem.date = vm.activeItem.date || new Date();
			vm.editOpen = true;
			vm.enterCat = true;
			vm.editCategory = true;
			vm.pick = 'choose';
			tempItem = angular.copy(item);
			showEditModal(vm.scopes.product);
		}

		function save (item, form, $event) {
			Log.l("Product.save(): Started, item is:");
			Log.l(item);
			window.item1 = item;
			$event.stopPropagation();
			if (form && form.$invalid) {
				return;
			}

			vm.submitted = true;

			item.price = item.price && item.price.replace ? Number(item.price.replace(',', '.')) : item.price;
			item.quantity = item.quantity && item.quantity.replace ? Number(item.quantity.replace(',', '.')) : item.quantity;
			item.cost = item.cost && item.cost.replace ? Number(item.cost.replace(',', '.')) : item.cost;

			var deferred = $q.defer();
			var inventoryItem;
			if (item.linkInventory && item.inventoryid) {
				Log.l("Product.save(): linkInventory and item.inventoryid are truthy, resolving immediately.");
				deferred.resolve();
			} else if (item.linkInventory) {
				deferred.promise = Database.select(inventoryTable, null, item.name).then(function (inventory) {
					if (inventory.rows.length > 0) {
						inventoryItem = inventory.rows.item(0);
						item.inventoryid = inventoryItem.id;
						Log.l("Product.save(): Found item in database, inventoryID = %d", inventoryItem.id);
						deferred.resolve();
					} else {
						var insertData = [item.name, item.quantity, item.id];
						Log.l("Product.save(): Item not found in database, inserting:\n%s", JSON.stringify(insertData));
						return Database.insert(inventoryTable, insertData).then(function (response) {
							item.inventoryid = response.insertId;
							item.expType = 'variable';
							var expenseData = [item.name, item.cost, item.expType, item.comments, moment(item.date).format('YYYY-MM-DD HH:mm:ss')];
							Log.l("Product.save(): Item inserted into DB, now inserting into expenseTable:\n%s", JSON.stringify(expenseData));
							Database.insert(expenseTable, expenseData).then(CashBalance.updateCashBalance);
							deferred.resolve();
						});
					}
				});
			} else if (tempItem.linkInventory !== item.linkInventory && item.inventoryid) {
				Log.l("Product.save(): Item updated, saving to inventory:");
				Log.l(item);
				deferred.promise = Database.select(inventoryTable, item.inventoryid).then(function (inventory) {
					if (inventory.rows.length > 0) {
						inventoryItem = inventory.rows.item(0);
						Database.update(inventoryTable, inventoryItem.id, [inventoryItem.name, inventoryItem.quantity, null]);
						item.inventoryid = null;
						deferred.resolve();
					}
				})
			} else {
				Log.l("Product.save(): Item unchanged?");
				deferred.resolve();
			}

			if (!item.id) {
				Log.l("Product.save(): New item, inserting into DB...");
				deferred.promise.then(function () {
					var insertData = [item.name, item.price, item.category, item.inventoryid];
					Log.l(insertData);
					Database.insert(productTable, insertData).then(function (response) {
						Log.l("Product.save(): new item inserted.");
						item.id = response.insertId;
						vm.items.push(item);
						if (item.linkInventory) {
							Log.l("Product.save(): item.linkInventory truthy, updating inventory table:");
							var updateData = [item.name, item.quantity, item.id];
							Log.l(updateData);
							Database.update(inventoryTable, item.inventoryid, updateData);
							Log.l("Product.save(): Done updating inventory table.");
						}
					});
				});
			} else {
				deferred.promise.then(function () {
					Log.l("Product.save(): Not a new item. Updating productTable with:");
					var updateData = [item.name, item.price, item.category, item.inventoryid];
					Log.l(updateData);
					Database.update(productTable, item.id, updateData);
					if (item.linkInventory) {
						var updateData2 = [item.name, item.quantity, item.id];
						Log.l("Product.save(): Updating inventory with:")
						Log.l(updateData2);
						Database.update(inventoryTable, item.inventoryid, updateData2);
					}
				});
			}

			vm.activeItem = null;
			// vm.removePopover();
			vm.removeEditModal();
			// vm.editModal.remove();
			vm.show = false;
			queryCategories = true;
			// cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			vm.submitted = false;
			Log.l("Product.save(): End of function.");
		}

		function cancel () {
			Log.l("Product.cancel(): Starting...");
			vm.submitted = true;
			if (vm.activeItem) {
				Log.l("Product.cancel(): found vm.activeItem, restoring to original...");
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
				if(cordova && cordova.plugins && cordova.plugins.Keyboard) {
					Log.l("Product.cancel(): Keyboard plugin exists, hiding it...");
					cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
				}
			}

			// vm.editModal.remove();
			Log.l("Product.cancel(): About to call vm.removeEditModal() ...");
			vm.removeEditModal();
			vm.submitted = false;
			Log.l("Product.cancel(): Done with function!");
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
			showEditModal(vm.scopes.product);
		}



		function chooseCategories ($event) {
			if (queryCategories) {
				getCategories();
			}
			// $ionicPopover.fromTemplateUrl('Product/templates/productCategories.html', {
			//     scope: $scope,
			// }).then(function(prodCategories) {
			//     vm.prodCategories = prodCategories;
			//     vm.prodCategories.show($event);
			// });
			createCategoriesPopup($event);
		}

		function chooseCategory ($event) {
			if (vm.editCategory) {
				vm.choose = true;
			}
			if (vm.activeItem.category && vm.choose === false) {
				vm.activeItem.category = '';
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

		function removePopover() {
			Log.l("Product: Now in removePopover()...");
			if(vm.categoriesPopup) {
				Log.l("Product: found vm.categoriesPopup, remove...");
				vm.categoriesPopup.hide().then(function(res) {
					Log.l("categoriesPopup hidden");
					Log.l(res);
					vm.categoriesPopup.remove().then(function(res) {
						Log.l("categoriesPopup removed!");
						Log.l(res);
					});
				});
			} else {
				Log.l("Product.removePopover(): Not removing, vm.categoriesPopup not found!");
			}
		}

		function closePopover () {
			// vm.removePopover();
			Log.l("Product: Now in closePopover()...");
			if(vm.categoriesPopup) {
				Log.l("Product: found vm.categoriesPopup, hiding...");
				// vm.categoriesPopup.hide();
				vm.removePopover();
			}
		}

		function closePopoverCancel () {
			if (!vm.editCategory && !vm.editOpen && !vm.enterCat) {
				vm.pick = '';
				vm.choose = false;
				vm.show = false;
			} else if (vm.editOpen && vm.activeItem.category === '') {
				vm.pick = '';
			}
			if(cordova && cordova.plugins && cordova.plugins.Keyboard) {
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
			}
			vm.closePopover();
		}

		function removeEditModal() {
			vm.removePopover();
			if(vm.editModal) {
				vm.editModal.remove();
			}
			$timeout(function() { vm.categoriesPopup.hide(); }, 500);
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
			removeEditModal();
			// vm.editModal.remove();
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
			if (vm.editModal) {
				removeEditModal();
			}
				// vm.editModal.remove();
			if (vm.prodCategories) {
				removePopover();
			}
			if (vm.categoriesPopup) {
				removePopover();
			}
				// vm.prodCategories.remove();
		});

		init();
	}
})();
