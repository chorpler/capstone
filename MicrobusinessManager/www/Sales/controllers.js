(function () {
	angular.module('app.sales')
	.controller('SalesController', SalesController);

	function SalesController ($scope, $ionicModal, $q, products, Database) {
		var vm = this;

		vm.products            = products;
		vm.addProduct          = addProduct;
		vm.removeProduct       = removeProduct;
		vm.checkout            = checkout;
		vm.cancelCheckout      = cancelCheckout;
		vm.overrideSaleTotal   = overrideSaleTotal;
		vm.saveSale            = saveSale;
		vm.resetSale           = resetSale;
		vm.editSaleProduct     = editSaleProduct;
		vm.doneEditSaleProduct = doneEditSaleProduct;

		var saleTable = 'sale';
		var saleProductTable = 'saleproduct';

		function init () {
			vm.saleDate           = new Date();
			vm.saleTotal          = 0;
			vm.productCount       = 0;
			vm.saleProducts       = [];
			vm.currentEditProduct = null;

			$ionicModal.fromTemplateUrl('templates/checkoutModal.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function (modal) {
				vm.checkoutModal = modal;
			});

			$ionicModal.fromTemplateUrl('templates/saleProductEditModal.html', {
				scope: $scope,
				animation: 'slide-in-right'
			}).then(function (modal) {
				vm.saleProductEditModal = modal;
			});
		}

		function addProduct (product) {
			product.count += 1;
			vm.productCount += 1;
			vm.saleTotal += product.price;
		}

		function removeProduct (product) {
			if (product.count > 0) {
				product.count -= 1;
				vm.productCount -= 1;
				vm.saleTotal -= product.price;
			}
		}

		function checkout () {
			function hasCount (product) {
				return product.count > 0;
			}

			vm.saleProducts = vm.products.filter(hasCount);

			vm.checkoutModal.show();
		}

		function cancelCheckout () {
			vm.checkoutModal.hide();
		}

		function overrideSaleTotal (price) {
			vm.saleTotal = price;
		}

		function editSaleProduct (product) {
			vm.currentEditProduct = product;
			vm.saleProductEditModal.show();
		}

		function doneEditSaleProduct () {
			vm.saleProductEditModal.hide();
		}

		function saveSale () {
			Database.insert(saleTable, [vm.saleTotal, vm.saleDate.toString()])
			.then(function (response) {
				return response.insertId;
			})
			.then(function (saleId) {
				var promises = [];

				vm.saleProducts.forEach(function (p) {
					promises.push(Database.insert(saleProductTable, [saleId, p.id, p.count]));
				});

				$q.all(promises).then(function () {
					vm.checkoutModal.hide();
					resetSale();
				});
			});
		}

		function resetSale () {
			vm.saleDate     = new Date();
			vm.saleTotal    = 0;
			vm.productCount = 0;
			vm.saleProducts = [];
			vm.products.forEach(function (product) {
				product.count = 0;
			});
		}

		init();
	}
})();