(function () {
angular.module('app.expenses')
.controller('ExpensesController', ExpensesController);

	function ExpensesController ($scope, $ionicModal, $filter, $ionicPopup, $q, Database, expenseItems, languages, CashBalance) {
		var vm = this;

		vm.log = expenseItems;
		vm.activeExpense = null;
		vm.editviewOpen = false;
		vm.totalExpenses = 0;
		vm.editModal = null;
		vm.expenses = '';
		vm.date = Date.now();
		vm.activeExpense = {};

		vm.editExpense = editExpense;
		vm.save = save;
		vm.cancel = cancel;
		vm.addNewExpense = addNewExpense;
		vm.deleteExpense = deleteExpense;
		vm.getKeys = getKeys;
		vm.clearSearch = clearSearch;
		vm.showConfirm = showConfirm;
		vm.showAlert = showAlert;
		vm.isCheckboxChecked = isCheckboxChecked;

		var tempExpense = null;
		var language = {};
		var expenseTable = 'expense';
		var important_title, message_body;

		function init () {
			if (languages.length) {
				for (var i = 0; i < languages.length; i++) {
					language.type = languages[0].type;
				}
			}
			

			vm.ischecked = false;
			updateTotal();
		}

		function showEditModal () {
			$ionicModal.fromTemplateUrl('Expense/templates/expensesEditModal.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function (modal) {
				vm.editModal = modal;
				vm.editModal.show();
			});
		}

		function editExpense (expense) {
			vm.activeExpense = expense;
			tempExpense = angular.copy(expense);
			vm.editviewOpen = true;
			showEditModal();
		}

		function save (item) {

			Database.insert(expenseTable, [item.name, item.amount, item.expType, item.comments, moment(item.date).format('YYYY-MM-DD HH:mm:ss'), 'other']).then(function (response) {
				CashBalance.updateCashBalance();
				item.id = response.insertId;
			});

			vm.log = [];

			Database.select('exp').then(function (response) {
				var items = [];
				if (response.rows.length === 0) {
					return items;
				}
				for (var i = response.rows.length - 1; i >= 0; i--) {
					var item = response.rows.item(i);
					item.amount = Number(item.amount);
					vm.log.push(item);
				}
			});

			vm.activeExpense = null;
			vm.ischecked = false;
			vm.editModal.remove();
			showAlert();
		}

		function cancel () {
			vm.activeExpense = null;
			vm.editModal.remove();
		}

		function addNewExpense (expense) {
			tempExpense = {};
			vm.activeExpense = {};
			if (expense != null) {
				vm.activeExpense.name = expense.name;
				vm.activeExpense.expType = expense.expType;
				vm.ischecked = true;
				vm.activeExpense.amount = expense.amount;
			}
			vm.activeExpense.date = new Date();
			vm.editviewOpen = false;
			showEditModal();
		}

		function deleteExpense (item) {
			var key = $filter('date')(item.date, 'mediumDate');
			vm.reformattedList[key].splice(vm.reformattedList[key].indexOf(item), 1);
			if (vm.reformattedList[key].length === 0) {
				delete vm.reformattedList[key];
			}
			Database.remove(expenseTable, item.id).then(CashBalance.updateCashBalance);
			vm.activeExpense = null;
			updateTotal();
			vm.editModal.remove();
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
		function isCheckboxChecked () {
    	vm.ischecked = true;
		}

		function showConfirm (expense) {
			if (language.type === 'es') {
				important_title = "Importante!";
				message_body = "Este es un nuevo gasto. No estas editando un registro de un gasto pasado." +
				" Hemos llenado este formulario con los datos de tu más reciente gasto que coincide con este nombre.";
				cancel_button = "Cancelar";
				continue_button = "Continuar";
			} else {
				important_title = "Important!";
				message_body = "This is a new expense. You are not editing a past expense." +
				" We have pre-filled this form with the information of the most recent expense that matches this expense's name.";
				continue_button = "Continue";
				cancel_button = "Cancel";
			}
			var confirmPopup = $ionicPopup.confirm({
				title: important_title,
				template: message_body,
				buttons: [
					{
						text: cancel_button,
						type: 'button-stable'},
					{
						text: '<b>' +continue_button + '</b>',
						type: 'button-positive',
						onTap: function(e) {
							vm.addNewExpense(expense);
						}
					}
			]
			});
		}

		function showAlert () {
			if (language.type === 'es') {
				title_funds = "Buenas Noticias!";
				message_body = "Tu Gasto se ha guardado exitosamente. Si deseas verlo o editarlo, ve al Registro de Gastos en Reportes.";
			} else {
				title_funds = "Success!";
				message_body = "Your Expense has been recorded. If you want to see or edit it, go to the Expenses Log under Reports.";
			}
			var alertPopup = $ionicPopup.alert({
				title: title_funds,
				template: message_body
			});

			alertPopup.then(function(res) {
				console.log('none');
			});
		}

		//Cleanup the modal when we're done with it!
		$scope.$on('$destroy', function() {
			if (vm.editModal)
				vm.editModal.remove();
		});

		init();
	}
})();
