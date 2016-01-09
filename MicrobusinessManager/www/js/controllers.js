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
            vm.editModal.show();
        }

        function deleteItem (item) {
            vm.items.splice(vm.items.indexOf(item), 1);
        }

        init();
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

    function ExpensesController () {

    }

    function ReportsController () {

    }

    function SettingsController () {

    }
})();

