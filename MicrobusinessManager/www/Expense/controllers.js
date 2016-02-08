(function () {
angular.module('app.expenses')
.controller('ExpensesController', ExpensesController);

	function ExpensesController ($scope, $ionicModal, $filter, $ionicPopup, $q, Database, expenseItems, languages) {
		var vm = this;

		vm.log = expenseItems;
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
		var language = {};
		var expenseTable = 'expense';
		var title_delete, message_body;

		function init () {
			if (languages.length) {
				for (var i = 0; i < languages.length; i++) {
					language.type = languages[0].type;
				}
			}
			$ionicModal.fromTemplateUrl('Expense/templates/expensesEditModal.html', {
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
			var key = $filter('date')(vm.activeExpense.date, 'mediumDate');
			var oldKey = $filter('date')(tempExpense.date, 'mediumDate');

			if(oldKey === undefined) {
				oldKey = key;
			}

			vm.reformattedList[key] = vm.reformattedList[key] || [];

			if (!item.id) {
				Database.insert(expenseTable, [item.name, item.amount, item.comments, moment(item.date).format('YYYY-MM-DD HH:mm:ss')]).then(function (response) {
					item.id = response.insertId;
				});
				vm.reformattedList[key].push(item);

			} else {
				Database.update(expenseTable, item.id, [item.name, item.amount, item.comments, moment(item.date).format('YYYY-MM-DD HH:mm:ss')]);
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
			if (language.type === 'es') {
				title_delete = "Borrar Gasto";
				message_body = "Estas seguro?";
				cancel_button = "Cancelar";
			} else {
				title_delete = "Delete Expense";
				message_body = "Are you sure?";
				cancel_button = "Cancel";
			}
			var confirmPopup = $ionicPopup.confirm({
				title: title_delete,
				template: message_body,
				buttons: [
					{
						text: cancel_button,
						type: 'button-stable'},
					{
						text: '<b>Ok</b>',
						type: 'button-positive',
						onTap: function(e) {
							vm.deleteExpense(vm.activeExpense);
						}
					}
			]
			});
		}

		//Cleanup the modal when we're done with it!
		$scope.$on('$destroy', function() {
			vm.editModal.remove();
		});

		init();
	}
})();
