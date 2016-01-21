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

        function showConfirm () {
          var confirmPopup = $ionicPopup.confirm({
            title: 'Delete Inventory Item',
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
        vm.showConfirm = showConfirm;

        var tempItem = null;
        var productTable = 'product';
        var inventoryTable = 'inventory';

        function init () {
            updateTotal();

            $ionicModal.fromTemplateUrl('templates/inventoryEditModal.html', {
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
                })
            } else {
              deferred.resolve();
            }

            if (!item.id) {
                deferred.promise.then(function () {
                    vm.items.push(item);
                    Database.insert(inventoryTable, [item.name, item.quantity, item.cost, item.productid]).then(function (response) {
                        item.id = response.insertId;
                        if (item.linkProduct)
                          Database.update(productTable, item.productid, [item.name, item.price, item.id]);
                    });
                    updateTotal();
                });
            } else {
                deferred.promise.then(function () {
                    Database.update(inventoryTable, item.id, [item.name, item.quantity, item.cost, item.productid]);
                    if (item.linkProduct)
                      Database.update(productTable, item.productid, [item.name, item.price, item.id]);
                });
                updateTotal();
            }

            vm.activeItem = null;
            vm.editModal.hide();
        }

        function cancel () {
            if (vm.activeItem) {
                vm.activeItem.name = tempItem.name;
                vm.activeItem.quantity = tempItem.quantity;
                vm.activeItem.cost = tempItem.cost;
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
              })
            }
            Database.remove(inventoryTable, item.id);
            updateTotal();
            vm.editModal.hide();
        }

        function updateTotal () {
            vm.totalAssets = vm.items.reduce(function (previousValue, currentItem) {
                return previousValue + (currentItem.quantity * currentItem.cost);
            }, 0);
        }

        function showConfirm () {
          var confirmPopup = $ionicPopup.confirm({
            title: 'Delete Inventory Item',
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

    function ExpensesController ($scope, $ionicModal, $filter, $ionicPopup) {
      var vm = this;

      vm.log = [];
      vm.activeExpense = null;
      vm.editviewOpen = false;
      vm.totalExpenses = 0;
      vm.editModal = null;
      vm.expenses = '';
      vm.date = Date.now();

      vm.editExpense = editExpense;
      vm.save = save;
      vm.cancel = cancel;
      vm.addNewExpense = addNewExpense;
      vm.deleteExpense = deleteExpense;
      vm.getKeys = getKeys;
      vm.clearSearch = clearSearch;
      vm.showConfirm = showConfirm;

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

      function clearSearch () {
        console.log('i am here');
        vm.search = '';
      }

      function showConfirm () {
        var confirmPopup = $ionicPopup.confirm({
          title: 'Delete Expense',
          template: 'Are you sure?'
        });

        confirmPopup.then(function(res) {
          if(res) {
            vm.deleteExpense(vm.activeExpense);
          } else {
            console.log('You are not sure');
          }
        });
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

      vm.closeLogin = function closeLogin() {
        vm.loginModal.hide();
      };

      vm.login = function login() {
        vm.loginModal.show();
      };

      vm.submitLoginRequest = function submitLoginRequest() {

        if(!vm.userAccount.username || !vm.userAccount.password) {
          vm.userAccount.error = 'Username and Password Required';
          return;
        }

        $http.post('http://40.122.44.131/api/login', {
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
              vm.userAccount.token = response.data.token;
              vm.userAccount.user = response.data.user;
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

      vm.logout = function logout() {
        vm.userAccount = {};
        vm.userRegistration = {};
      }

      vm.userRegistration = {};

       $ionicModal.fromTemplateUrl('templates/register.html', {
        scope: $scope
      }).then(function(modal) {
        vm.registerModal = modal;
      });

      vm.register = function register() {
        vm.registerModal.show();
      };

      vm.closeRegistration = function closeRegistration() {
        vm.registerModal.hide();
      }

      vm.submitRegistrationRequest = function submitRegistrationRequest() {
        console.log('SUBMIT REGISTRATION QUEST');

        if(!vm.userRegistration.username || !vm.userRegistration.password) {
          vm.userRegistration.error = 'Username and Password Required.';
          return;
        }

        if(vm.userRegistration.password !== vm.userRegistration.confirmPassword) {
          vm.userRegistration.error = 'Passwords Do Not Match.'
          return;
        }

        $http.post('http://40.122.44.131/api/register', {
          username: vm.userRegistration.username,
          password: vm.userRegistration.password,
          email: vm.userRegistration.email,
          phone: vm.userRegistration.phone
        })
        .then(
          function(response) {
            console.log('REGISTRATION SUCCESS!! ', response);
            if(response.data.error) {
              vm.userRegistration.error = response.data.error;
            }
            else {
              vm.userRegistration.error = null;
              vm.userAccount.token = response.data.token;
              vm.userAccount.user = response.data.user;
              vm.closeRegistration();
            }
          },
          function(response) {
            console.log('REGISTRATION ERROR!! ', response);
            vm.userRegistration.error = response.data.error;
          }
        );
      }

      init();
    }
})();
