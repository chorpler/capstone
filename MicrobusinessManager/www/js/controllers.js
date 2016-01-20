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
      var vm = this;

    }

    function SalesController ($scope, $ionicModal, $q, Database) {
      var vm = this;

      vm.addProduct        = addProduct;
      vm.removeProduct     = removeProduct;
      vm.checkout          = checkout;
      vm.cancelCheckout    = cancelCheckout;
      vm.overrideSaleTotal = overrideSaleTotal;
      vm.saveSale          = saveSale;
      vm.resetSale         = resetSale;

      var productTable = 'product';

      function init() {
        console.log('INIT!!!');
        vm.saleDate     = new Date();
        vm.saleTotal    = 0;
        vm.productCount = 0;
        vm.products     = [];
        vm.saleProducts = [];

        $ionicModal.fromTemplateUrl('templates/checkoutModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            vm.checkoutModal = modal;
        });

        Database.select(productTable)
          .then(function(response) {
          for (var i = response.rows.length - 1; i >= 0; i--) {
              var item = response.rows.item(i);
              item.price = Number(item.price);
              item.count = 0;
              vm.products.push(item);
          };
        });
      }

      function addProduct(product) {
        product.count += 1;
        vm.productCount += 1;
        vm.saleTotal += product.price;
      }

      function removeProduct(product) {
        if (product.count > 0) {
          product.count -= 1;
          vm.productCount -= 1;
          vm.saleTotal -= product.price;
        }
      }

      function checkout() {
        function hasCount(product) {
          return product.count > 0;
        }

        vm.saleProducts = vm.products.filter(hasCount);

        vm.checkoutModal.show();
      }

      function cancelCheckout() {
        vm.checkoutModal.hide();
      }

      function overrideSaleTotal(price) {
        vm.saleTotal = price;
      }

      function saveSale() {
        // TODO: Save into sqlite
        vm.checkoutModal.hide();
        resetSale();
      }

      function resetSale() {
        vm.saleDate     = new Date();
        vm.saleTotal    = 0;
        vm.productCount = 0;
        vm.saleProducts = [];
        vm.products.forEach(function(product) {
          product.count = 0;
        });
      }

      init();
    }

    function ProductsController ($ionicModal, $scope, $q, Database, productItems) {
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
            if (item.linkInventory) {
                deferred.promise = Database.select(inventoryTable, null, item.name).then(function (inventory) {
                    if (inventory.rows.length > 0) {
                        var inventoryItem = inventory.rows.item(0);
                        item.inventoryid = inventoryItem.id;
                        deferred.resolve();
                    } else {
                        return Database.insert(inventoryTable, [item.name, item.quantity, item.cost, item.id]).then(function (response) {
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
                        Database.update(inventoryTable, item.inventoryid, [item.name, item.quantity, item.cost, item.id]);
                    });
                });
            } else {
                deferred.promise.then(function () {
                    Database.update(productTable, item.id, [item.name, item.price, item.inventoryid]);
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
            Database.remove(productTable, item.id);
            vm.activeItem = null;
            vm.editModal.hide();
        }

        init();
    }

    function InventoryController ($scope, $ionicModal, $q, Database, inventoryItems) {
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
            if (item.linkProduct) {
                deferred.promise = Database.select(productTable, null, item.name).then(function (product) {
                    if (product.rows.length > 0) {
                        var productItem = product.rows.item(0);
                        item.productid = productItem.id;
                        deferred.resolve();
                    } else {
                        return Database.insert(productTable, [item.name, item.price, item.id]).then(function (response) {
                            item.productid = response.insertId;
                            deferred.resolve();
                        });
                    }
                });
            } else {
                deferred.resolve();
            }

            if (!item.id) {
                deferred.promise.then(function () {
                    Database.insert(inventoryTable, [item.name, item.quantity, item.cost, item.productid]).then(function (response) {
                        item.id = response.insertId;
                        vm.items.push(item);
                        Database.update(productTable, item.productid, [item.name, item.price, item.id]);
                        updateTotal();
                    });
                });
            } else {
                deferred.promise.then(function () {
                    Database.update(inventoryTable, item.id, [item.name, item.quantity, item.cost, item.productid]);
                    Database.update(productTable, item.productid, [item.name, item.price, item.id]);
                    updateTotal();
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
            Database.remove(inventoryTable, item.id);
            updateTotal();
            vm.editModal.hide();
        }

        function updateTotal () {
            vm.totalAssets = vm.items.reduce(function (previousValue, currentItem) {
                return previousValue + (currentItem.quantity * currentItem.cost);
            }, 0);
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
      vm.userRegistration = {};

      vm.login = login;
      vm.closeLogin = closeLogin;
      vm.submitLoginRequest = submitLoginRequest;
      vm.logout = logout;
      vm.register = register;
      vm.closeRegistration = closeRegistration;
      vm.submitRegistrationRequest = submitRegistrationRequest;
      vm.selfPayment = {};

      function init () {
        vm.selfPayment.method = 'salary';

        $ionicModal.fromTemplateUrl('templates/login.html', {
          scope: $scope
        }).then(function(modal) {
          vm.loginModal = modal;
        });

        $ionicModal.fromTemplateUrl('templates/register.html', {
          scope: $scope
        }).then(function(modal) {
          vm.registerModal = modal;
        });
      }

      function login() {
        vm.loginModal.show();
      };

      function closeLogin() {
        vm.loginModal.hide();
      };

      function submitLoginRequest() {
        if(!vm.userAccount.username || !vm.userAccount.password) {
          vm.userAccount.error = 'Username and Password Required';
          return;
        }

        $http.post('http://40.122.44.131/api/login', {
          username: vm.userAccount.username,
          password: vm.userAccount.password
        })
        .then(
          function loginSuccess(response) {
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
          function loginError(response) {
            console.log('LOGIN ERROR ', response);
            vm.userAccount.error = response.data.message;
          }
        );
      };

      function logout() {
        vm.userAccount = {};
        vm.userRegistration = {};
      }

      function register() {
        vm.registerModal.show();
      };

      function closeRegistration() {
        vm.registerModal.hide();
      }

      function submitRegistrationRequest() {
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
          function registrationSuccess(response) {
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
          function registrationFailure(response) {
            vm.userRegistration.error = response.data.error;
          }
        );
      }

      init();
    }
})();
