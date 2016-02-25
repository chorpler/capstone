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

    var saleTable = 'sale';
    var saleProductTable = 'saleproduct';
    vm.filters = {};
    console.log(vm.filters);

    function init () {
      vm.saleDate           = new Date();
      vm.saleTotal          = 0;
      vm.productCount       = 0;
      vm.saleProducts       = [];
      vm.error              = null;
      vm.currentEditProduct = null;
      vm.filter = '';
      $ionicModal.fromTemplateUrl('Sales/templates/checkoutModal.html', {
        scope: $scope,
        animation: 'slide-in-right'
      }).then(function (modal) {
        vm.checkoutModal = modal;
      });

      $ionicModal.fromTemplateUrl('Sales/templates/saleProductEditModal.html', {
        scope: $scope,
        animation: 'slide-in-right'
      }).then(function (modal) {
        vm.saleProductEditModal = modal;
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
          vm.checkoutModal.hide();
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
      });
    }

    init();
  }
})();
