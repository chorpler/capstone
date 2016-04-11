(function () {
angular.module('app.salary')
.controller('salaryController', salaryController);

	function salaryController ($scope, $ionicModal, $filter, $ionicPopup, $q, Database, salaryItems, salary, cashOnHand, languages, CashBalance) {
		var vm = this;

		vm.log = salaryItems;
		vm.salary = salary;
		vm.activeExpense = null;
		vm.editviewOpen = false;
		vm.totalExpenses = 0;
		vm.editModal = null;
		vm.expenses = '';
		vm.showErrorAlert = false;
		vm.commission = null;
		vm.cashAvailable = cashOnHand;
		vm.date = Date.now();
		vm.submitted = false;

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
		vm.showCommissionInfo = showCommissionInfo;
		vm.adjustExpectedSalary = adjustExpectedSalary;

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

			vm.reformattedList = {};

			vm.log.forEach(function (record) {
				var key = $filter('date')(record.date, 'mediumDate');
				vm.reformattedList[key] = vm.reformattedList[key] || [];
				vm.reformattedList[key].push(record);
			});
			getCommission();
			updateTotal();
		}

		function editExpense (expense) {
			vm.activeExpense = expense;
			// vm.activeExpense.amount = Number(expense.amount);
			tempExpense = angular.copy(expense);
			vm.editviewOpen = true;
			showEditModal();
		}

		function save (item, fromSalary, form, $event) {
			if (!fromSalary) {
				$event.stopPropagation();
				if (form && form.$invalid) {
					return;
				}
			}
			vm.submitted = true;
			if (item) {
				item.amount = item.amount && item.amount.replace ?
				Number(item.amount.replace(',','.')) : item.amount;
			}

			if (item === null) {
				item = {};
				if (vm.paymentType === 'commission') {
					if (language.type === 'es') {
						item.name = 'Mi Comisión';
						item.comments = 'Mi comisión de ' + vm.expectedSalary + '%';
					} else {
						item.name = 'My Commission';
						item.comments = 'my commission of ' + vm.expectedSalary + '%';
					}
					getCommission();
					item.amount = vm.commission && vm.commission.replace ?
									Number(vm.commission.replace(',', '.')) : vm.commission;
					item.amount = Math.round(	item.amount * 100) / 100;

				} else {
					if (language.type === 'es') {
						item.name = 'Mi Salario';
						item.comments = 'mi salario';
					} else {
						item.name = 'My Salary';
						item.comments = 'my salary';
					}
					item.amount = Number(vm.expectedSalary);
				}
				item.expType = 'variable';
				item.date = new Date();
				item.type = 'salary';
				vm.activeExpense = item;
				tempExpense = item;
				vm.submitted = false;
			}

			if (item.amount === 0 && vm.paymentType === 'commission') {
				var title = '';
				var body = '';
				if (language.type === 'es') {
					title = 'No haz hecho ninguna venta!';
					body = 'Tu comisión sería igual a $0. Haz minimo una venta primero.';
				} else {
					title = 'You haven\'t made any sales yet!';
					body = 'Your current commission would be $0. Please make a sale first.';
				}
				return $ionicPopup.alert({
					title: title,
					template: body
				});
			}

			var key = $filter('date')(vm.activeExpense.date, 'mediumDate');
			var oldKey = $filter('date')(tempExpense.date, 'mediumDate');

			if(oldKey === undefined) {
				oldKey = key;
			}

			vm.reformattedList[key] = vm.reformattedList[key] || [];

			if (!item.id) {
				Database.insert(expenseTable, [item.name, item.amount, item.expType, item.comments, moment(item.date).format('YYYY-MM-DD HH:mm:ss'), item.type]).then(function (response) {
					CashBalance.updateCashBalance();
					item.id = response.insertId;
				});
				vm.reformattedList[key].push(item);

			} else {
				var calc = vm.activeExpense.amount - tempExpense.amount;
				if (calc > 0 && calc > vm.cashAvailable) {
						vm.showErrorAlert = true;
						return;
				} else {
					Database.update(expenseTable, item.id, [item.name, item.amount, item.expType, item.comments, moment(item.date).format('YYYY-MM-DD HH:mm:ss'), item.type])
					.then(CashBalance.updateCashBalance);
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
			getCommission();
			if (vm.editModal)
				vm.editModal.remove();
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

			vm.editModal.remove();
		}

		function addNewExpense () {
			tempExpense = {};
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
			updateCashonHand();
			getCommission();
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

		function adjustExpectedSalary () {
			vm.showAdjust = false;
			vm.expectedSalary = vm.expectedSalary && vm.expectedSalary.replace ?
								Number(vm.expectedSalary.replace(',','.')) : vm.expectedSalary;
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
				message_body = "¿Estás seguro?";
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
			vm.cashAvailableAlert = $filter('number')(vm.cashAvailable, 2);
			if (language.type === 'es') {
				title_funds = "Fondos Insuficientes!";
				message_body = "Solamente tienes disponible $";
				message_body_2 = ". Porfavor ajusta tu sueldo.";
			} else {
				title_funds = "Insufficient Funds!";
				message_body = "You only have on hand $";
				message_body_2 = ". Please adjust your salary.";
			}
			var alertPopup = $ionicPopup.alert({
				title: title_funds,
				template: message_body + vm.cashAvailableAlert + message_body_2
			});

			alertPopup.then(function(res) {
				console.log('none');
			});
		}

		function showCommissionInfo () {
			var displayCommission = $filter('number')(vm.commission, 2);
			if (language.type === 'es') {
				title_funds = "Información de Comisión!";
				message_body = " que equivale a ";
			} else {
				title_funds = "Commission Info!";
				message_body = " that equals to";
			}
			var alertPopup = $ionicPopup.alert({
				title: title_funds,
				template: vm.expectedSalary + '%'  + message_body + ' $' + displayCommission + '.'
			});

			alertPopup.then(function(res) {
				console.log('none');
			});
		}

		function showAlertCommission () {
				vm.cashAvailableAlert = $filter('number')(vm.cashAvailable, 2);
			if (language.type === 'es') {
				title_funds = "Fondos Insuficientes!";
				message_body = "Solamente tienes disponible $";
				message_body_2 = " y tu comisión del ";
				message_body_3 = "% equivale a $";
				message_body_4 =" Porfavor ajusta tu commisión en la página de configuraciones.";
			} else {
				title_funds = "Insufficient Funds!";
				message_body = "You have on hand $";
				message_body_2 = " and your commission of ";
				message_body_3 = "% equals to $";
				message_body_4 =" Please go to the settings page and adjust your commission.";
			}
			var alertPopup = $ionicPopup.alert({
				title: title_funds,
				template: message_body + vm.cashAvailableAlert + message_body_2 + vm.expectedSalary + message_body_3 + vm.commission + '.' + message_body_4
			});

			alertPopup.then(function(res) {
				console.log('none');
			});
		}

		var showEditModal  = function () {
			$ionicModal.fromTemplateUrl('Salary/templates/salaryEditModal.html', {
				scope: $scope,
				animation: 'slide-in-right'
			}).then(function (modal) {
				vm.editModal = modal;
				vm.editModal.show();
			});
		};

		function updateCashonHand () {
			Database.calculateCashOnHand().then(function (response) {
				vm.cashAvailable = response.rows.item(0).total;
			});
		}

		function getCommission () {
			Database.getCommission().then(function (response) {
				 vm.commission = response.commission;
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
