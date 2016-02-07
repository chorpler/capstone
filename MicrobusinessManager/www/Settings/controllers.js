(function () {
	angular.module('app.settings')
	.controller('SettingsController', SettingsController);

	function SettingsController ($scope, $ionicModal, $http, Database, salary, $translate, languages) {
		var vm = this;

		vm.userAccount = {};
		vm.userRegistration = {};
		vm.activeSalary = null;
		vm.salary = salary;
		vm.languages = languages;
		vm.login = login;
		vm.closeLogin = closeLogin;
		vm.submitLoginRequest = submitLoginRequest;
		vm.logout = logout;
		vm.register = register;
		vm.closeRegistration = closeRegistration;
		vm.submitRegistrationRequest = submitRegistrationRequest;
		vm.save = save;
		vm.showEdit = showEdit;
		vm.editSalary = editSalary;
		vm.changeLanguage = changeLanguage;
		vm.cancel = cancel;
		vm.selfPayment = {};
		vm.language = {};
		vm.edit = false;
		var tempSalary = null;

		var salaryTable = 'salary';
		var languageTable = 'languages';

		function init () {
			if (vm.salary.length < 1) {
				vm.activeSalary = {};
				vm.activeSalary.type = 'salary';
			}
			if (languages.length) {
				for (var i = 0; i < languages.length; i++) {
					vm.language.type = languages[0].type;
				}
			} else {
				var language = {};
				vm.language.type = 'es';
				language.type = vm.language.type;
				Database.insert(languageTable, [language.type]).then(function (response) {
					language.id = response.insertId;
				});
				vm.languages.push(language);
			}

			$ionicModal.fromTemplateUrl('Settings/templates/login.html', {
				scope: $scope
			}).then(function (modal) {
				vm.loginModal = modal;
			});

			$ionicModal.fromTemplateUrl('Settings/templates/register.html', {
				scope: $scope
			}).then(function (modal) {
				vm.registerModal = modal;
			});

			$ionicModal.fromTemplateUrl('Settings/templates/salaryModal.html', {
				scope: $scope
			}).then(function (modal) {
				vm.editModal = modal;
			});
		}

		function save (item) {

			if (!item.id) {
				Database.insert(salaryTable, [item.amount, item.type]).then(function (response) {
					item.id = response.insertId;
				});
				vm.salary.push(item);
			} else {
				Database.update(salaryTable, item.id, [item.amount, item.type]);
			}
			vm.activeSalary = null;
			vm.editModal.hide();
		}

		function showEdit () {
			vm.editModal.show();
		}

		function editSalary (salaryItem) {
			vm.activeSalary = salaryItem;
			tempSalary = angular.copy(salaryItem);
			vm.editviewOpen = true;
			vm.editModal.show();
		}

		function changeLanguage (language) {
			// language.id = 1;
			$translate.use(language.type).then(function(data) {
        console.log("SUCCESS -> " + data);
				if (!language.id) {
					Database.insert(languageTable, [language.type]).then(function (response) {
						language.id = response.insertId;
					});
					vm.languages.push(language);
				} else {
					Database.update(languageTable, language.id, [language.type]);
				}

      }, function(error) {
          console.log("ERROR -> " + error);
      });
		}

		function cancel () {
			if (vm.activeSalary) {
				vm.activeSalary.type = tempSalary.type;
				vm.activeSalary.amount = tempSalary.amount;
				vm.activeSalary = null;
			}

			vm.editModal.hide();
		}


		function login () {
			vm.loginModal.show();
		};

		function closeLogin () {
			vm.loginModal.hide();
		};

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
		};

		function logout () {
			vm.userAccount = {};
			vm.userRegistration = {};
		}

		function register () {
			vm.registerModal.show();
		};

		function closeRegistration () {
			vm.registerModal.hide();
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
