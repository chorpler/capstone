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

    function ProductsController ($ionicModal, $scope) {
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

        function init () {
             vm.items = [{
                id: '1',
                name: 'Soda',
                salesPrice: 3.00
            }, {
                id: '2',
                name: 'Chocolate',
                salesPrice: 2.50
            }];

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
                vm.activeItem.salesPrice = tempItem.salesPrice;
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

      $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
      }).then(function(modal) {
        vm.loginModal = modal;
      });

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

    }
})();
