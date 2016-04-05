(function () {
	angular.module('app.settings')
	.controller('SettingsController', SettingsController);

	function SettingsController ($scope, $ionicModal, $http, Database, salary, $translate, languages, tmhDynamicLocale, tax) {
		var vm = this;

		vm.userAccount = {};
		vm.userRegistration = {};
		vm.activeSalary = null;
		vm.salary = salary;
		vm.languages = languages;
		vm.tax = tax;
		vm.login = login;
		vm.closeLogin = closeLogin;
		vm.submitLoginRequest = submitLoginRequest;
		vm.logout = logout;
		vm.register = register;
		vm.closeRegistration = closeRegistration;
		vm.submitRegistrationRequest = submitRegistrationRequest;
		vm.save = save;
		vm.showEdit = showEdit;
		vm.taxEdit = taxEdit;
		vm.editSalary = editSalary;
		vm.changeLanguage = changeLanguage;
		vm.cancel = cancel;
		vm.cancelTaxEdit = cancelTaxEdit;
		vm.saveTaxEdit = saveTaxEdit;
		vm.selfPayment = {};
		vm.language = {};
		vm.edit = false;
		vm.tax_active = false;

		var tempSalary = null;
		var salaryTable = 'salary';
		var languageTable = 'languages';
		var taxTable = 'tax';

		function init () {
			if (vm.salary.length < 1) {
				vm.activeSalary = {};
				// vm.activeSalary.type = 'salary';
			}
			if (languages.length) {
				for (var i = 0; i < languages.length; i++) {
					vm.language.type = languages[0].type;
				}
			}
			if (tax.length) {
				for (var j = 0; j < tax.length; j++) {
					vm.activeTax = tax[0];
					if (tax[0].active === false) {
						vm.tax_active = false;
					} else {
						vm.tax_active = true;
					}
				}
			} else {
				vm.activeTax = [];
			}

		}

		function showLoginModal () {
			$ionicModal.fromTemplateUrl('Settings/templates/login.html', {
				scope: $scope
			}).then(function (modal) {
				vm.loginModal = modal;
				vm.loginModal.show();
			});
		}

		function showRegisterModal () {
			$ionicModal.fromTemplateUrl('Settings/templates/register.html', {
				scope: $scope
			}).then(function (modal) {
				vm.registerModal = modal;
				vm.registerModal.show();
			});
		}

		function showEditModal () {
			$ionicModal.fromTemplateUrl('Settings/templates/salaryModal.html', {
				scope: $scope
			}).then(function (modal) {
				vm.editModal = modal;
				vm.editModal.show();
			});
		}

		function showTaxModal () {
			$ionicModal.fromTemplateUrl('Settings/templates/taxModal.html', {
				scope: $scope
			}).then(function (modal) {
				vm.taxModal = modal;
				vm.taxModal.show();
			});
		}

		function save (item) {
			if (!item.id) {
				Database.insert(salaryTable, [item.amount, item.type]).then(function (response) {
					item.id = response.insertId;
				});
				vm.salary.push(item);
			}
			else {
				Database.update(salaryTable, item.id, [item.amount, item.type]);
			}
			vm.activeSalary = null;
			vm.editModal.remove();
		}

		function showEdit () {
			vm.activeTax = {};
			showEditModal();
		}

		function editSalary (salaryItem) {
			vm.activeSalary = salaryItem;
			tempSalary = angular.copy(salaryItem) || {};
			if (!vm.activeSalary) {
				vm.activeSalary = {};
				vm.activeSalary.type = 'commission';
			}
			vm.editviewOpen = true;
			showEditModal();
		}

		function taxEdit (taxItem) {
			getTax ().then(function () {
				if (tax.length) {
					vm.activeTax = tax[0];
					console.log('here',vm.activeTax);
				} else {
					vm.activeTax = {};
				}
				tempTax = angular.copy(vm.activeTax) || {};
				showTaxModal();
			});
		}

		function changeLanguage (language) {
			$translate.use(language.type).then(function (data) {
				if (language.type === 'es') {
					tmhDynamicLocale.set('es-ec');
				}
				else if (language.type === 'en') {
					tmhDynamicLocale.set('en-us');
				}
				Database.select(languageTable).then(function (response) {
					var items = [];

					for (var i = response.rows.length - 1; i >= 0; i--) {
						var item = response.rows.item(i);
						items.push(item);
					}
					for (var j = 0; j < items.length; j++) {
						language.id = items[0].id;
					}
					Database.update(languageTable, language.id, [language.type]);
				});
			}, function (error) {
					console.log("ERROR -> " + error);
			});
		}

		function cancel () {
			if (vm.activeSalary) {
				vm.activeSalary.type = tempSalary.type;
				vm.activeSalary.amount = tempSalary.amount;
				vm.activeSalary = null;
			}

			vm.editModal.remove();
		}

		function cancelTaxEdit () {
			if (vm.activeTax) {
				vm.activeTax.active = tempTax.active;
				vm.activeTax.percentage = tempTax.percentage;
				vm.activeTax = null;
			}
			vm.taxModal.remove();
		}

		function saveTaxEdit (item) {
			if (item.active === true) {
				vm.tax_active = true;
			} else {
				vm.tax_active = false;
			}
			item.active = item.active === false ? 0 : 1;
			console.log('before save', vm.activeTax);
			if (!item.id) {
				Database.insert(taxTable, [item.active, item.percentage]).then(function (response) {
					item.id = response.insertId;
				});
				vm.salary.push(item);
			}
			else {
				Database.update(taxTable, item.id, [item.active, item.percentage]);
			}

			vm.activeTax = null;
			// getTax ();
			vm.taxModal.remove();
		}

		function getTax () {
			return Database.select('tax').then(function (response) {
				var items = [];
				if (response.rows.length === 0) {
					return items;
				}
				for (var i = response.rows.length - 1; i >= 0; i--) {
					var item = response.rows.item(i);
					console.log(item);
					item.percentage = Number(item.percentage);
					item.active = item.active === 0 ? false : true;
					items.push(item);
				}
				console.log('get',items);
				tax = items;
			});
		}

		function login () {
			showLoginModal();
		}

		function closeLogin () {
			vm.loginModal.remove();
		}

		function submitLoginRequest () {
			if (!vm.userAccount.username || !vm.userAccount.password) {
				vm.userAccount.error = 'Username and Password Required';
				return;
			}

			$http.post('http://40.122.44.131/api/login', {
				username: vm.userAccount.username,
				password: vm.userAccount.password
			})
			.then(
				function loginSuccess (response) {
					console.log('REQUEST SUCCESS! ', response);
					if (response.data.error) {
						vm.userAccount.error = response.data.error.message;
					}
					else {
						vm.userAccount.token = response.data.token;
						vm.userAccount.user = response.data.user;
						vm.userAccount.error = null;
						vm.closeLogin();
					}
				},
				function loginError (response) {
					console.log('LOGIN ERROR ', response);
					vm.userAccount.error = response.data.message;
				}
			);
		}

		function logout () {
			vm.userAccount = {};
			vm.userRegistration = {};
		}

		function register () {
			showRegisterModal();
		}

		function closeRegistration () {
			vm.registerModal.remove();
		}

		function submitRegistrationRequest () {
			if (!vm.userRegistration.username || !vm.userRegistration.password) {
				vm.userRegistration.error = 'Username and Password Required.';
				return;
			}

			if (vm.userRegistration.password !== vm.userRegistration.confirmPassword) {
				vm.userRegistration.error = 'Passwords Do Not Match.';
				return;
			}

			$http.post('http://40.122.44.131/api/register', {
				username: vm.userRegistration.username,
				password: vm.userRegistration.password,
				email: vm.userRegistration.email,
				phone: vm.userRegistration.phone
			})
			.then(
				function registrationSuccess (response) {
					if (response.data.error) {
						vm.userRegistration.error = response.data.error;
					}
					else {
						vm.userRegistration.error = null;
						vm.userAccount.token = response.data.token;
						vm.userAccount.user = response.data.user;
						vm.closeRegistration();
					}
				},
				function registrationFailure (response) {
					vm.userRegistration.error = response.data.error;
				}
			);
		}

		init();
	}
})();
