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

    function InventoryController () {
        var vm = this;

        vm.items = [{
            name: 'Soda',
            quantity: '100',
            costPerUnit: '1.20',
            totalCost: '120'
        }]
    }

    function ExpensesController () {

    }

    function ReportsController () {

    }

    function SettingsController () {

    }
})();

