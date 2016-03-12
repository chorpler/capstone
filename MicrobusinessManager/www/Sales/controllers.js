(function () {
  angular.module('app.sales')
  .controller('SalesController', SalesController);

  function SalesController ($scope, $ionicModal, $q, products, Database, categories, CashBalance) {

    var vm = this;

    vm.products            = products;
    vm.categories          = categories;

    vm.addProduct          = addProduct;
    vm.removeProduct       = removeProduct;
    vm.checkout            = checkout;
    vm.cancelCheckout      = cancelCheckout;
    vm.overrideSaleTotal   = overrideSaleTotal;
    vm.saveSale            = saveSale;
    vm.resetSale           = resetSale;
    vm.editSaleProduct     = editSaleProduct;
    vm.doneEditSaleProduct = doneEditSaleProduct;
    vm.cancelEditSaleProduct = cancelEditSaleProduct;


    var saleTable = 'sale';
    var saleProductTable = 'saleproduct';
    vm.filters = {};
    var tempEditProduct    = null;
    var tempTotal = 0;
    function init () {
      vm.saleDate           = new Date();
      vm.saleTotal          = 0;
      vm.productCount       = 0;
      vm.saleProducts       = [];
      vm.error              = null;
      vm.currentEditProduct = null;
      vm.filter = '';
    }

    function showCheckoutModal () {
      $ionicModal.fromTemplateUrl('Sales/templates/checkoutModal.html', {
        scope: $scope,
        animation: 'slide-in-right'
      }).then(function (modal) {
        vm.checkoutModal = modal;
        vm.checkoutModal.show();
      });
    }

    function showEditModal () {
      $ionicModal.fromTemplateUrl('Sales/templates/saleProductEditModal.html', {
        scope: $scope,
        animation: 'slide-in-right'
      }).then(function (modal) {
        vm.saleProductEditModal = modal;
        vm.saleProductEditModal.show();
      });
    }

    function addProduct (product) {
      // Check inventory limit if applicable
      if (product.inventoryid) {
        if (product.count + 1 > product.limit) {
          // vm.error = '' + product.name + ' has only ' + product.limit + ' in inventory.  You cannot sell more than ' + product.limit;
          vm.productError = product;
          vm.error = true;
          return;
        }
      }
      product.count += 1;
      vm.productCount += 1;
      vm.saleTotal += product.saleprice;
      tempTotal = vm.saleTotal;
      console.log(tempTotal);
    }

    function removeProduct (product) {
      if (product.count > 0) {
        product.count -= 1;
        vm.productCount -= 1;
        vm.saleTotal -= product.saleprice;
        tempTotal = vm.saleTotal;
        console.log(tempTotal);
      }
    }

    function checkout () {
      function hasCount (product) {
        return product.count > 0;
      }

      vm.saleProducts = vm.products.filter(hasCount);

      showCheckoutModal();
    }

    function cancelCheckout () {
      vm.checkoutModal.remove();
    }

    function overrideSaleTotal (price) {
      if (price) {
        updateSalesPrices(tempTotal);
        tempTotal = price;
      }
    }

    function updateSalesPrices() {
      vm.saleProducts.forEach(function (product) {
        product.saleprice = parseFloat(((vm.saleTotal * ((product.saleprice * product.count) / tempTotal)) / product.count).toFixed(2));
      });
    }

    function editSaleProduct (product) {
      tempEditProduct = angular.copy(product);
      vm.currentEditProduct = product;
      showEditModal();
    }

    function doneEditSaleProduct () {
      vm.saleTotal = vm.saleProducts.reduce(function(total, product) {
        return total + (product.saleprice * product.count);
      }, 0);
      vm.saleTotal = parseFloat(vm.saleTotal.toFixed(2));

      tempTotal = vm.saleTotal;
      vm.saleProductEditModal.remove();
    }

    function cancelEditSaleProduct() {
      vm.currentEditProduct.count = tempEditProduct.count;
      vm.currentEditProduct.saleprice = tempEditProduct.saleprice;
      doneEditSaleProduct();
    }

    function saveSale () {
      Database.insert(saleTable, [vm.saleTotal, moment(vm.saleDate).format('YYYY-MM-DD HH:mm:ss')])
      .then(function (response) {
        CashBalance.updateCashBalance();
        return response.insertId;
      })
      .then(function (saleId) {
        var promises = [];

        vm.saleProducts.forEach(function (p) {
          promises.push(Database.insert(saleProductTable, [saleId, p.id, p.count]));

          // Decrement inventory if applicable
          if (p.inventoryid) {
            promises.push(Database.select('inventory', p.inventoryid)
              .then(function (response) {
                var inv = response.rows.item(0);

                var quantity = inv.quantity - p.count;
                p.limit = quantity;

                return Database.update('inventory', p.inventoryid, [
                  inv.name,
                  quantity,
                  p.id
                ]);
              })
            );
          }
        });

        $q.all(promises).then(function () {
          vm.checkoutModal.remove();
          resetSale();
        });
      });
    }

    function resetSale () {
      vm.error = null;
      vm.filter = '';
      vm.saleDate     = new Date();
      vm.saleTotal    = 0;
      vm.productCount = 0;
      vm.saleProducts = [];
      vm.products.forEach(function (product) {
        product.count = 0;
        product.saleprice = product.price;
      });
    }

    init();
  }
})();
