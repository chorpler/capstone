(function () {
    angular.module('app')
    .controller('AppController', AppController)
    .controller('SalesController', SalesController)
    .controller('ProductsController', ProductsController)
    .controller('InventoryController', InventoryController)
    .controller('ExpensesController', ExpensesController)
    .controller('ReportsController', ReportsController)
    .controller('SettingsController', SettingsController);

    function AppController () {

    }

    function SalesController () {

    }

    function ProductsController () {

    }

    function InventoryController ($scope, $ionicModal) {
        var vm = this;

        vm.items = [];
        vm.activeItem = null;
        vm.totalAssets = 0;
        vm.editModal = null;

        vm.editItem = editItem;
        vm.save = save;
        vm.cancel = cancel;
        vm.addNewItem = addNewItem;

        var tempItem = null;

        function init () {
            vm.items = [{
                id: '1',
                name: 'Soda',
                quantity: 100,
                unitCost: 1.20
            }, {
                id: '2',
                name: 'Chocolate',
                quantity: 150,
                unitCost: 1.00
            }];

            vm.totalAssets = vm.items.reduce(function (previousValue, currentItem) {
                return previousValue + (currentItem.quantity * currentItem.unitCost);
            }, 0);

            $ionicModal.fromTemplateUrl('templates/inventoryEditModal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                vm.editModal = modal;
            });
        }

        function editItem (item) {
            vm.activeItem = item;
            tempItem = angular.copy(item);
            vm.editModal.show();
        }

        function save (item) {
            vm.totalAssets += (vm.activeItem.quantity * vm.activeItem.unitCost)

            if (tempItem)
                vm.totalAssets -= (tempItem.quantity * tempItem.unitCost);

            if (!vm.activeItem.id) {
                vm.activeItem.id = Math.random() * 100;
                vm.items.push(vm.activeItem);
            }
            vm.activeItem = null;
            vm.editModal.hide();
        }

        function cancel () {
            if (vm.activeItem) {
                vm.activeItem.name = tempItem.name;
                vm.activeItem.quantity = tempItem.quantity;
                vm.activeItem.unitCost = tempItem.unitCost;
                vm.activeItem.linkInventory = tempItem.linkInventory;
                vm.activeItem = null;
            }

            vm.editModal.hide();
        }

        function addNewItem () {
            vm.editModal.show();
        }

        init();
    }

    function ExpensesController ($scope, $ionicModal) {
      var vm = this;

      vm.log = [];
      vm.activeExpense = null;
      vm.totalExpenses = 0;
      vm.editModal = null;

      vm.editExpense = editExpense;
      vm.save = save;
      vm.cancel = cancel;
      vm.addNewExpense = addNewExpense;

      var tempExpense = null;

      function init () {
          vm.log = [{
              id: '1',
              name: 'Rent',
              amount: 1500
          }, {
              id: '2',
              name: 'Power',
              amount: 50
          }];

          vm.totalExpenses = vm.log.reduce(function (previousValue, currentExpense) {
              return previousValue + currentExpense.amount;
          }, 0);

          $ionicModal.fromTemplateUrl('templates/expensesEditModal.html', {
              scope: $scope,
              animation: 'slide-in-up'
          }).then(function (modal) {
              vm.editModal = modal;
          });
      }

      function editExpense (expense) {
          vm.activeExpense = expense;
          tempExpense = angular.copy(expense);
          vm.editModal.show();
      }

      function save (expense) {
          vm.totalExpenses += vm.activeExpense.amount

          if (tempExpense)
              vm.totalExpenses -= tempExpense.amount;

          if (!vm.activeExpense.id) {
              vm.activeExpense.id = Math.random() * 100;
              vm.log.push(vm.activeExpense);
          }
          vm.activeExpense = null;
          vm.editModal.hide();
      }

      function cancel () {
          if (vm.activeExpense) {
              vm.activeExpense.name = tempExpense.name;
              vm.activeExpense.amount = tempExpense.amount;
              vm.activeExpense = null;
          }

          vm.editModal.hide();
      }

      function addNewExpense () {
          vm.editModal.show();
      }

      init();
    }

    function ReportsController () {

    }

    function SettingsController () {

    }
})();
