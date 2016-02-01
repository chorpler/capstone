(function () {
angular.module('app.salary')
.controller('salaryController', salaryController);

	function salaryController ($scope, $ionicModal, $filter, $ionicPopup, $q, Database, salaryItems, salary) {
		var vm = this;

		vm.log = salaryItems;
		vm.salary = salary;
		vm.activeExpense = null;
		vm.editviewOpen = false;
		vm.totalExpenses = 0;
		vm.editModal = null;
		vm.expenses = '';
		vm.cashAvailable = 600;
		vm.date = Date.now();

		vm.editExpense = editExpense;
		vm.save = save;
		vm.cancel = cancel;
		vm.addNewExpense = addNewExpense;
		vm.deleteExpense = deleteExpense;
		vm.getKeys = getKeys;
		vm.clearSearch = clearSearch;
		vm.showConfirm = showConfirm;
		vm.showAlert = showAlert;
		vm.showAlertCommission = showAlertCommission;

		var tempExpense = null;
		var expenseTable = 'expense';
		var salaryTable = 'salary';

		function init () {

			for (var i = 0; i < salary.length; i++) {
				vm.expectedSalary = salary[i].amount;
				vm.paymentType = salary[i].type;
			}

			$ionicModal.fromTemplateUrl('Salary/templates/salaryEditModal.html', {
				scope: $scope,
				animation: 'slide-in-right'
			}).then(function (modal) {
				vm.editModal = modal;
			});

			vm.reformattedList = {};

			vm.log.forEach(function (record) {
				var key = $filter('date')(record.date, 'mediumDate');
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

		function save (item) {
			if (item === null) {
				item = {};
				item.name = 'My Salary';
				if (vm.paymentType === 'commission') {
					item.amount = vm.cashAvailable * (vm.expectedSalary/100);
				} else {
					item.amount = vm.expectedSalary;
				}
				item.date = new Date();
				item.comments = 'my salary';
				item.type = 'salary';
				vm.activeExpense = item;
				tempExpense = item;
			}

			var key = $filter('date')(vm.activeExpense.date, 'mediumDate');
			var oldKey = $filter('date')(tempExpense.date, 'mediumDate');

			if(oldKey === undefined) {
				oldKey = key;
			}

			vm.reformattedList[key] = vm.reformattedList[key] || [];

			if (!item.id) {
				Database.insert(expenseTable, [item.name, item.amount, item.comments, moment(item.date).format('YYYY-MM-DD HH:mm:ss'), item.type]).then(function (response) {
					item.id = response.insertId;
				});
				vm.reformattedList[key].push(item);

			} else {
				Database.update(expenseTable, item.id, [item.name, item.amount, item.comments, moment(item.date).format('YYYY-MM-DD HH:mm:ss'), item.type]);
				if (key !== oldKey) {
					vm.reformattedList[key].push(item);
				}
			}

			if (key !== oldKey) {
				vm.reformattedList[oldKey].splice(vm.reformattedList[oldKey].indexOf(item), 1);
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
				vm.activeExpense.date = tempExpense.date;
				vm.activeExpense = null;
			}

			vm.editModal.hide();
		}

		function addNewExpense () {
			tempExpense = {};
			vm.editviewOpen = false;
			vm.editModal.show();
		}

		function deleteExpense (item) {
			var key = $filter('date')(item.date, 'mediumDate');
			vm.reformattedList[key].splice(vm.reformattedList[key].indexOf(item), 1);
			if (vm.reformattedList[key].length === 0) {
				delete vm.reformattedList[key];
			}
			Database.remove(expenseTable, item.id);
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
			vm.search = '';
		}

		function showConfirm () {
			var confirmPopup = $ionicPopup.confirm({
				title: 'Delete Salary Record',
				template: 'Are you sure?'
			});

			confirmPopup.then(function(res) {
				if(res) {
					vm.deleteExpense(vm.activeExpense);
				}
			});
		}

		function showAlert () {
			var alertPopup = $ionicPopup.alert({
				title: 'Insufficient Funds!',
				template: 'You only have on hand $' + vm.cashAvailable + '. Please adjust your salary.'
			});

			alertPopup.then(function(res) {
				console.log('none');
			});
		}

		function showAlertCommission () {
			var alertPopup = $ionicPopup.alert({
				title: 'Cash on Hand!',
				template: 'You have on hand $' + vm.cashAvailable + '.'
			});

			alertPopup.then(function(res) {
				console.log('none');
			});
		}

		init();
	}
})();
