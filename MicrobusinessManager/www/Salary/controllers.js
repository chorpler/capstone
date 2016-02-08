(function () {
angular.module('app.salary')
.controller('salaryController', salaryController);

	function salaryController ($scope, $ionicModal, $filter, $ionicPopup, $q, Database, salaryItems, salary, cashOnHand, languages) {
		var vm = this;

		vm.log = salaryItems;
		vm.salary = salary;
		vm.activeExpense = null;
		vm.editviewOpen = false;
		vm.totalExpenses = 0;
		vm.editModal = null;
		vm.expenses = '';
		vm.showErrorAlert = false;
		vm.cashAvailable = cashOnHand;
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
		var language = {};
		var title_delete, message_body, message_body_2, title_funds;
		var expenseTable = 'expense';
		var salaryTable = 'salary';

		function init () {
			if (languages.length) {
				for (var k = 0; k < languages.length; k++) {
					language.type = languages[0].type;
				}
			}
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
				if (vm.paymentType === 'commission') {
					if (language.type === 'es') {
						item.name = 'Mi Comisión';
						item.comments = 'Mi comisión de' + vm.expectedSalary + '% de ' + vm.cashAvailable;
					} else {
						item.name = 'My Commission';
						item.comments = 'my commission of ' + vm.expectedSalary + '% of ' + vm.cashAvailable;
					}
					item.amount = vm.cashAvailable * (vm.expectedSalary/100);
				} else {
					if (language.type === 'es') {
						item.name = 'Mi Salario';
						item.comments = 'mi salario';
					} else {
						item.name = 'My Salary';
						item.comments = 'my salary';
					}
					item.amount = vm.expectedSalary;
				}
				item.date = new Date();
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
				var calc = vm.activeExpense.amount - tempExpense.amount;
				if (calc > 0 && calc > vm.cashAvailable) {
						vm.showErrorAlert = true;
						return;
				} else {
					Database.update(expenseTable, item.id, [item.name, item.amount, item.comments, moment(item.date).format('YYYY-MM-DD HH:mm:ss'), item.type]);
					if (key !== oldKey) {
						vm.reformattedList[key].push(item);
					}
				}
			}

			if (key !== oldKey) {
				vm.reformattedList[oldKey].splice(vm.reformattedList[oldKey].indexOf(item), 1);
			}

			if (vm.reformattedList[oldKey].length === 0) {
				delete vm.reformattedList[oldKey];
			}

			updateCashonHand();
			vm.activeExpense = null;
			vm.showErrorAlert = false;
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
				vm.showErrorAlert = false;
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
			updateCashonHand();
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
				title_delete = "Borrar Registro de Sueldo";
				message_body = "Estas seguro?";
				cancel_button = "Cancelar";
			} else {
				title_delete = "Delete Salary Record";
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

		function showAlert () {
			if (language.type === 'es') {
				title_funds = "Insuficientes Fondos!";
				message_body = "Solamnete tienes disponible $";
				message_body_2 = ". Porfavor ajusta tu sueldo.";
			} else {
				title_funds = "Insufficient Funds!";
				message_body = "You only have on hand $";
				message_body_2 = ". Please adjust your salary.";
			}
			var alertPopup = $ionicPopup.alert({
				title: title_funds,
				template: message_body + vm.cashAvailable + message_body_2
			});

			alertPopup.then(function(res) {
				console.log('none');
			});
		}

		function showAlertCommission () {
			if (language.type === 'es') {
				title_funds = "Fondos Disponibles";
				message_body = "Tienes disponible $";
			} else {
				title_delete = "Cash on Hand!";
				message_body = "You have on hand $";
			}
			var alertPopup = $ionicPopup.alert({
				title: title_funds,
				template: message_body + vm.cashAvailable + '.'
			});

			alertPopup.then(function(res) {
				console.log('none');
			});
		}

		function updateCashonHand () {
			Database.calculateCashOnHand().then(function (response) {
				vm.cashAvailable = response.rows.item(0).total;
			});
		}

		//Cleanup the modal when we're done with it!
		$scope.$on('$destroy', function() {
			vm.editModal.remove();
		});

		init();
	}
})();
