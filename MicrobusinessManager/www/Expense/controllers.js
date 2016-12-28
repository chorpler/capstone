(function() {
	angular.module('app.expenses')
		.controller('ExpensesController', ExpensesController);

	function ExpensesController($scope, $rootScope, $ionicModal, $ionicListDelegate, $filter, $ionicPopup, $q, Database, expenseItems, languages, CashBalance) {
		var vm = this;

		var win = window;
		win.vm = vm;
		vm.log = expenseItems;
		vm.activeExpense = null;
		vm.editviewOpen = false;
		vm.totalExpenses = 0;
		vm.editModal = null;
		vm.expenses = '';
		vm.date = Date.now();
		vm.activeExpense = {};
		vm.submitted = false;
		vm.scopes = vm.scopes || {};
		vm.scopes.expense = $scope;
		vm.scopes.expenses = $scope;
		var rs = $rootScope;

		vm.editExpense = editExpense;
		vm.save = save;
		vm.cancel = cancel;
		vm.addNewExpense = addNewExpense;
		vm.clickedDeleteExpense = clickedDeleteExpense;
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

		function init() {
			Log.l("Expenses: init() is started.");
			if (languages.length) {
				for (var i = 0; i < languages.length; i++) {
					language.type = languages[0].type;
				}
			}

			vm.ischecked = false;
			Log.l("Expenses: init() about to run updateTotal().");
			updateTotal();
			Log.l("Expenses: init() finished.");
		}

		function showEditModal($scope) {
			var d = $q.defer();
			$ionicModal.fromTemplateUrl('Expense/templates/expensesEditModal.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function(editModal) {
				vm.editModal = editModal;
				vm.editModal.show();
				d.resolve(vm.editModal);
			}).catch(function(err) {
				Log.l("Expense: Error creating editModal!");
				Log.l(err);
				d.reject(err);
			});
			return d.promise;
		}

		function editExpense(expense) {
			vm.activeExpense = expense;
			tempExpense = angular.copy(expense);
			vm.editviewOpen = true;
			showEditModal(vm.scopes.expenses);
		}

		function save(item, form, $event) {
			Log.l("Expense: Now in save() ...");
			$event.stopPropagation();
			var dateField = $('#expensesDateInput');
			dateField.blur();
			if (form && form.$invalid) {
				Log.l("Expense.save(): Form invalid!");
				return;
			}

			vm.submitted = true;

			item.amount = item.amount && item.amount.replace ? Number(item.amount.replace(',', '.')) : item.amount;

			var insertData = [item.name, item.amount, item.expType, item.comments, moment(item.date).format("YYYY-MM-DD HH:mm:ss"), "other"];

			Log.l("Expense.save(): Now inserting data:\n%s", JSON.stringify(insertData));
			Database.insert(expenseTable, insertData).then(function(response) {
				Log.l("Expense.save(): Done inserting, now updating cash balance...");
				CashBalance.updateCashBalance();
				Log.l("Expense.save(): Done updating cash balance, now selecting 'exp' from Database...");
				item.id = response.insertId;
				vm.log = [];
				return Database.select('exp');
			}).then(function(response) {
				Log.l("Expense.save(): Done selecting, now updating ...");
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
			// showAlert();
			vm.submitted = false;
		}

		function cancel() {
			Log.l("Expenses: expense edit canceled.");
			vm.submitted = true;
			vm.activeExpense = null;
			vm.editModal.remove();
			vm.submitted = false;
		}

		function addNewExpense(expense) {
			Log.l("Expenses: addNewExpense started...");
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
			showEditModal(vm.scopes.expenses);
		}

		function clickedDeleteExpense(item) {
			Log.l("Expenses.clickedDeleteExpense() called with parameter:");
			Log.l(item);
			$ionicListDelegate.closeOptionButtons();
			var title = $filter('translate')("str_delete_expense_title");
			var text = $filter('translate')("str_delete_expense_text");
			rs.code.showPopupYesNo(title, text).then(function(yesOrNo) {
				if(yesOrNo) {
					// User chose yes
					Log.l("Deleting expense.");
					deleteExpense(item);
				} else {
					// User chose no
					Log.l("Expense not deleted.");
				}
			});
		}

		function deleteExpense(item) {
			var itemIndex = vm.log.indexOf(item);
			Log.l("Now deleting expense.log[%d] (%s).", itemIndex, item.name);
			vm.log.splice(itemIndex, 1);
			Database.remove(expenseTable, item.id).then(function(res) {
				return CashBalance.updateCashBalance();
			}).then(function(res) {
				updateTotal();
			}).catch(function(err) {
				Log.l("Error deleting expense %s.", item.name);
				Log.l(err);
			});
			Log.l("Done with function deleteExpense().");
		}

		function updateTotal() {
			vm.totalExpenses = 0;
			angular.forEach(vm.reformattedList, function(reports) {
				vm.totalExpenses += reports.reduce(function(previousValue, currentExpense) {
					return previousValue + currentExpense.amount;
				}, 0);
			});
		}

		function getKeys(obj) {
			return Object.keys(obj);
		}

		function clearSearch() {
			vm.search = '';
		}

		function isCheckboxChecked() {
			vm.ischecked = true;
		}

		function showConfirm(expense) {
			var title = $filter('translate')("str_important");
			var text = $filter('translate')("str_this_is_new_expense");
			var btnContinue = $filter('translate')("str_continue");
			var btnCancel = $filter('translate')("str_cancel");
			var confirmPopup = $ionicPopup.confirm({
				title: title,
				template: text,
				buttons: [{
						text: btnCancel,
						type: 'button-stable'
					},
					{
						text: '<b>' + btnContinue + '</b>',
						type: 'button-positive',
						onTap: function(e) {
							vm.addNewExpense(expense);
						}
					}
				]
			});
		}

		function showAlert() {
			var title = $filter('translate')("str_success");
			var text = $filter('translate')("str_message_expense_recorded");
			// if (language.type === 'es') {
			// 	title_funds = "Buenas Noticias!";
			// 	message_body = "Gasto se ha guardado exitosamente. Si deseas verlo o editarlo, ve al Registro de Gastos en Reportes.";
			// } else {
			// 	title_funds = "Success!";
			// 	message_body = "Expense has been recorded. If you want to see or edit it, go to the Expenses Log under Reports.";
			// }
			var alertPopup = $ionicPopup.alert({
				title: title,
				template: text
			});

			alertPopup.then(function(res) {
				Log.l('Expense: showed succesful expense message.');
			});
		}

		init();
	}
})();
