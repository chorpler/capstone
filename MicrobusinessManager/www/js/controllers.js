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

    function ProductsController ($ionicModal, $scope, $q, Database) {
        var vm = this;

        vm.items = [];
        vm.activeItem = null;
        vm.editModal = null;
        vm.editOpen = false;

        vm.editItem = editItem;
        vm.save = save;
        vm.cancel = cancel;
        vm.addNewItem = addNewItem;
        vm.deleteItem = deleteItem;

        var tempItem = null;
        var productTable = 'product';
        var inventoryTable = 'inventory';

        function init () {
            vm.items = [];

            Database.select(productTable).then(function (response) {
                for (var i = response.rows.length - 1; i >= 0; i--) {
                    var item = response.rows.item(i);
                    item.price = Number(item.price);
                    vm.items.push(response.rows.item(i));
                };
                console.log(vm.items);
            });

            $ionicModal.fromTemplateUrl('templates/productEditModal.html', {
                scope: $scope,
                animation: 'slide-in-up'
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
            if (item.linkInventory) {
                deferred.promise = Database.select(inventoryTable, null, item.name).then(function (inventory) {
                    if (inventory.rows.length > 0) {
                        item.inventoryid = inventory.rows.item(0).id;
                        deferred.resolve();
                    } else {
                        Database.insert(inventoryTable, [item.name, item.quantity, item.cost]).then(function (response) {
                            item.inventoryid = response.insertId;
                            deferred.resolve();
                        });
                    }
                });
            } else {
                deferred.resolve();
            }

            if (!item.id) {
                deferred.promise.then(function () {
                    Database.insert(productTable, [item.name, item.price, item.inventoryid]).then(function (response) {
                        item.id = response.insertId;
                        vm.items.push(item);
                    });
                });
            } else {
                deferred.promise.then(function () {
                    Database.update(productTable, item.id, [item.name, item.price, item.inventoryid]);
                });
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
            Database.remove(productTable, item.id);
            vm.activeItem = null;
            vm.editModal.hide();
        }

        init();
    }

    function InventoryController ($scope, $ionicModal) {
        var vm = this;

        vm.items = [];
        vm.activeItem = null;
        vm.totalAssets = 0;
        vm.editModal = null;
        vm.editOpen = false;

        vm.editItem = editItem;
        vm.save = save;
        vm.cancel = cancel;
        vm.addNewItem = addNewItem;
        vm.deleteItem = deleteItem;

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

            $ionicModal.fromTemplateUrl('templates/inventoryEditModal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                vm.editModal = modal;
            });

            updateTotal();
        }

        function editItem (item) {
            vm.editOpen = true;
            vm.activeItem = item;
            tempItem = angular.copy(item);
            vm.editModal.show();
        }

        function save (item) {
            if (!vm.activeItem.id) {
                vm.activeItem.id = Math.random() * 100;
                vm.items.push(vm.activeItem);
            }

            updateTotal();
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
            vm.editOpen = false;
            vm.activeItem = {};
            tempItem = {};
            vm.editModal.show();
        }

        function deleteItem () {
            vm.items.splice(vm.items.indexOf(vm.activeItem), 1);
            vm.activeItem = null;
            updateTotal();
            vm.editModal.hide();
        }

        function updateTotal () {
            vm.totalAssets = vm.items.reduce(function (previousValue, currentItem) {
                return previousValue + (currentItem.quantity * currentItem.unitCost);
            }, 0);
        }

        init();
    }

    function ExpensesController ($scope, $ionicModal, $filter) {
      var vm = this;

      vm.log = [];
      vm.activeExpense = null;
      vm.editviewOpen = false;
      vm.totalExpenses = 0;
      vm.editModal = null;
      vm.date = Date.now();

      vm.editExpense = editExpense;
      vm.save = save;
      vm.cancel = cancel;
      vm.addNewExpense = addNewExpense;
      vm.deleteExpense = deleteExpense;
      vm.getKeys = getKeys;

      var tempExpense = null;

      function init () {
          vm.log = [{
              id: '1',
              name: 'Rent',
              amount: 1500,
              comments: 'Jan Rent',
              dateExpense: new Date(2016, 01, 13)
          }, {
              id: '2',
              name: 'Power',
              amount: 50,
              comments: 'I just paid half',
              dateExpense: new Date(2016, 0, 12)
          }];


          $ionicModal.fromTemplateUrl('templates/expensesEditModal.html', {
              scope: $scope,
              animation: 'slide-in-right'
          }).then(function (modal) {
              vm.editModal = modal;
          });

          vm.reformattedList = {};

          vm.log.forEach(function (record) {
            var key = $filter('date')(record.dateExpense, 'mediumDate');
            vm.reformattedList[key] = vm.reformattedList[key] || [];
            vm.reformattedList[key].push(record);
          });

          updateTotal();
      }

      function editExpense (expense) {
          vm.activeExpense = expense;
          tempExpense = angular.copy(expense);
          vm.editviewOpen = true;
          vm.editModal.show();
      }

      function save (expense) {
        var key = $filter('date')(vm.activeExpense.dateExpense, 'mediumDate');
        var oldKey = $filter('date')(tempExpense.dateExpense, 'mediumDate');

        if(oldKey === undefined) {
          oldKey = key;
        }

        vm.reformattedList[key] = vm.reformattedList[key] || [];
        if (!vm.activeExpense.id) {
            vm.activeExpense.id = Math.random() * 100;
            vm.reformattedList[key].push(vm.activeExpense);
        }

        if (key !== oldKey) {
            vm.reformattedList[key].push(vm.activeExpense);
            vm.reformattedList[oldKey].splice(vm.reformattedList[oldKey].indexOf(vm.activeExpense), 1);
        }

        if (vm.reformattedList[oldKey].length === 0) {
          delete vm.reformattedList[oldKey];
        }

        vm.activeExpense = null;
        updateTotal();
        vm.editModal.hide();
      }

      function cancel () {
          if (vm.activeExpense) {
              vm.activeExpense.name = tempExpense.name;
              vm.activeExpense.amount = tempExpense.amount;
              vm.activeExpense.comments = tempExpense.comments;
              vm.activeExpense.dateExpense = tempExpense.dateExpense;
              vm.activeExpense = null;
          }

          vm.editModal.hide();
      }

      function addNewExpense () {
          tempExpense = {};
          vm.editviewOpen = false;
          vm.editModal.show();
      }

      function deleteExpense (expense) {
        var key = $filter('date')(expense.dateExpense, 'mediumDate');
        vm.reformattedList[key].splice(vm.reformattedList[key].indexOf(expense), 1);
        if (vm.reformattedList[key].length === 0) {
          delete vm.reformattedList[key];
        }
        vm.activeExpense = null;
        updateTotal();
        vm.editModal.hide();
      }

      function updateTotal () {
        vm.totalExpenses = 0;
        angular.forEach(vm.reformattedList, function (reports) {
          vm.totalExpenses += reports.reduce(function (previousValue, currentExpense) {
              return previousValue + currentExpense.amount;
          }, 0);
        });
      }

      function getKeys (obj) {
        return Object.keys(obj);
      }
      init();
    }

    function ReportsController () {

    }

    function SettingsController ($scope, $ionicModal, $http) {
      var vm = this;

      vm.userAccount = {};
      vm.selfPayment = {};

      $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
      }).then(function(modal) {
        vm.loginModal = modal;
      });

      function init () {
        vm.selfPayment.method = 'salary';
      }

      vm.closeLogin = function() {
        vm.loginModal.hide();
      };

      vm.login = function() {
        vm.loginModal.show();
      };

      vm.submitLoginRequest = function() {
        $http.post('http://localhost:8000/api/login', {
          username: vm.userAccount.username,
          password: vm.userAccount.password
        })
        .then(
          function success(response) {
            console.log('REQUEST SUCCESS! ', response);
            if(response.data.error) {
              vm.userAccount.error = response.data.error.message;
            }
            else {
              vm.userAccount.token = response.token;
              vm.userAccount.error = null;
              vm.closeLogin();
            }
          },
          function error(response) {
            console.log('LOGIN ERROR ', response);
            vm.userAccount.error = response.data.message;
          }
        );
      }

      vm.logout = function() {
        vm.userAccount.token = null;
      }

      init();
    }
})();
