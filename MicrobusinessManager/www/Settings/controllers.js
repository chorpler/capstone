(function () {
	angular.module('app.settings')
	.controller('SettingsController', SettingsController);

	function SettingsController ($scope, $q, $ionicModal, $http, Database, salary, $translate, languages, tmhDynamicLocale, tax, user, $cordovaFileTransfer, $timeout, $ionicPopover, $persist) {
		var vm = this;

		var win = window;
		win.sepi = {};
		win.sepi.persist = $persist;

		vm.userAccount = {};
		vm.userRegistration = {};
		vm.activeSalary = null;
		vm.salary = salary;
		vm.languages = languages;
		vm.tax = tax;
		vm.login = login;
		vm.downloadCSVFile = downloadCSVFile;
		vm.closeUser = closeUser;
		vm.cancelUserEdit = cancelUserEdit;
		vm.saveUserEdit = saveUserEdit;
		vm.userEdit = userEdit;
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
		vm.submitted = false;
		vm.user_filled = false;
		vm.organization = user;
		vm.createPopupMenu = createPopupMenu;
		vm.showPopupMenu = showPopupMenu;
		vm.closePopupMenu = closePopupMenu;
		vm.createDownloadModal = createDownloadModal;
		vm.showDownloadModal =showDownloadModal;
		vm.closeDownloadModal = closeDownloadModal;
		vm.createExportModal = createExportModal;
		vm.showExportModal = showExportModal;
		vm.closeExportModal = closeExportModal;
		vm.exportSettings = exportSettings;
		vm.downloadModal = null;
		vm.exportModal = null;
		vm.downloadFile = {};
		vm.downloadProgress = 0;
		vm.fileChooser = window.fileChooser;


		var tempSalary = null;
		var salaryTable = 'salary';
		var languageTable = 'languages';
		var taxTable = 'tax';
		var userTable = 'user';

		function init () {
			console.log("Settings init!");
			if(vm.organization && vm.organization.name) {
				console.log("VM.organization: ");
				console.log(vm.organization);
				vm.user_filled = true;
			} else {
				console.log("No vm.organization!");
				vm.organization = {};
				vm.user_filled = false;
			}

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

			vm.createPopupMenu($scope);
			vm.createDownloadModal($scope);
			// vm.createExportModal($scope);

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

		function save (item, form, $event) {
			$event.stopPropagation();
			if (form && form.$invalid) {
				return;
			}
			vm.submitted = true;
			item.amount = item.amount && item.amount.replace ?
							Number(item.amount.replace(',','.')) : item.amount;
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
			vm.submitted = false;
		}

		function showEdit () {
			vm.activeTax = {};
			showEditModal();
		}

		function showUser () {
			vm.organization = {};
			showUserModal();
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
			vm.submitted = true;
			if (vm.activeTax) {
				vm.activeTax.active = tempTax.active;
				vm.activeTax.percentage = tempTax.percentage;
				// vm.activeTax = null;
			}
			vm.taxModal.remove();
			vm.submitted = false;
		}

		function saveTaxEdit (item, form, $event) {
			$event.stopPropagation();
			if (form && form.$invalid) {
				return;
			}
			vm.submitted = true;
			item.percentage = item.percentage && item.percentage.replace ?
								Number(item.percentage.replace(',','.')) : item.percentage;

			if (item.active === true) {
				vm.tax_active = true;
			} else {
				vm.tax_active = false;
			}
			item.active = item.active === false ? 0 : 1;
			if (!item.id) {
				Database.insert(taxTable, [item.active, item.percentage]).then(function (response) {
					item.id = response.insertId;
				});
			}
			else {
				Database.update(taxTable, item.id, [item.active, item.percentage]);
			}

			// vm.activeTax = null;
			// getTax ();
			vm.taxModal.remove();
			vm.submitted = false;
		}

		function getTax () {
			return Database.select('tax').then(function (response) {
				var items = [];
				if (response.rows.length === 0) {
					return items;
				}
				for (var i = response.rows.length - 1; i >= 0; i--) {
					var item = response.rows.item(i);
					item.percentage = Number(item.percentage);
					item.active = item.active === 0 ? false : true;
					items.push(item);
				}
				tax = items;
			});
		}

		function userEdit (userItem) {
			Log.l("Settings: Now in userEdit()");
			getUserData().then(function() {
				if (vm.organization && vm.organization.name) {
					vm.activeOrg = organization;
				} else {
					vm.activeOrg = {};
				}
				tempOrg = angular.copy(vm.activeOrg) || {};
				showUserModal();
			});
		}

		function showUserModal () {
			console.log("Now in showUserModal");
			$ionicModal.fromTemplateUrl('Settings/templates/userModal.html', {
				scope: $scope
			}).then(function (modal) {
				vm.userModal = modal;
				vm.userModal.show();
			});
		}

		function closeUser () {
			console.log("Now in closeUser");
			vm.userModal.remove();
		}

		function getUserData() {
			console.log("Now in getUserData");
			return Database.select('user').then(function (response) {
				var items = [];
				if (response.rows.length === 0) {
					return items;
				}
				for (var i = response.rows.length - 1; i >= 0; i--) {
					var item = response.rows.item(i);
					// var orgname = item.orgname;
					// var representative = item.representative;
					// var address = item.address;
					items.push(item);
				}
				// user = items;
				vm.organization = items[0];
				organization = items[0];
			});
		}

		function saveUserEdit (item, form, $event) {
			console.log("Now in saveUserEdit");
			$event.stopPropagation();
			if (form && form.$invalid) {
				return;
			}
			vm.submitted = true;
			if(!item.id) {
	 			Database.insert(userTable, [item.name, item.representative, item.street1, item.street2, item.city, item.state, item.postal, item.email, item.phone]).then(function(response) {
	 				item.id = response.insertId;
				});
			} else {
				Database.update(userTable, item.id, [item.name, item.representative, item.street1, item.street2, item.city, item.state, item.postal, item.email, item.phone]);
			}

			// vm.activeTax = null;
			// getTax ();
			vm.userModal.remove();
			vm.submitted = false;
		}

		function cancelUserEdit () {
			console.log("Now in cancelUserEdit");
			vm.submitted = true;
			vm.organization = {};
			vm.organization.name = tempOrg.name;
			vm.organization.representative = tempOrg.representative;
			vm.organization.street1 = tempOrg.street1;
			vm.organization.street2 = tempOrg.street2;
			vm.organization.city = tempOrg.city;
			vm.organization.state = tempOrg.state;
			vm.organization.postal = tempOrg.postal;
			vm.organization.email = tempOrg.email;
			vm.organization.phone = tempOrg.phone;
			// vm.activeTax = null;
			vm.userModal.remove();
			vm.submitted = false;
		}

		function createDownloadModal($scope) {
			Log.l("Settings: now in createDownloadModal() ...");
			$ionicModal.fromTemplateUrl('Settings/templates/download.html', {
				scope: $scope
			}).then(function (modal) {
				Log.l("Settings: created, now setting vm.downloadModal ...");
				vm.downloadModal = modal;
				$scope.$on('$destroy', function() {
					Log.l("Settings: now in scope.on('destroy')");
					vm.downloadModal.remove();
				});
				// vm.downloadModal.show();
			});
		}

		function showDownloadModal() {
			Log.l("Settings: now in showDownloadModal() ...");
			vm.popover.hide();
			vm.downloadModal.show();
		}

		function closeDownloadModal() {
			Log.l("Settings: now in closeDownload() ...");
			vm.downloadModal.hide();
		}
		
		function createExportModal($scope) {
			Log.l("Settings: now in createExportModal() ...");
			$ionicModal.fromTemplateUrl('Settings/templates/export.html', {
				scope: $scope
			}).then(function (modal) {
				Log.l("Settings: created, now setting vm.exportModal ...");
				vm.exportModal = modal;
				$scope.$on('$destroy', function() {
					Log.l("Settings: now in scope.on('destroy')");
					vm.exportModal.remove();
				});
				// vm.downloadModal.show();
			});
		}

		function showExportModal() {
			Log.l("Settings: now in showExportModal() ...");
			vm.popover.hide();
			vm.exportModal.show();
		}

		function closeExportModal() {
			Log.l("Settings: now in closeExportModal() ...");
			vm.exportModal.hide();
		}

		// Setttings model:
		// user: 
		function exportSettings() {
			Log.l("Settings: now in exportSettings() ...");
			var dbparams = Database.getDB();
			Log.l("exportSettings() got database results:");
			Log.l(dbparams);
			var exportSuccess = function(json, count) {
				Log.l("exportSettings(): Successfully exported " + count + " SQL statements to JSON.");
				Log.l(json);
				var ns = "mysepi";
				Log.l("Now trying to persist to 'database_json' ...");
				$persist.set(ns, 'database_json', JSON.stringify(json)).then(function(res) {
					Log.l("exportSettings(): Successfully persisted json database.");
					Log.l(res);
				}, function(err) {
					Log.l("exportSettings(): Could not persist json database!");
					Log.l(err);
				});
			};
			var exportFailure = function(err) {
				Log.l("exportSettings(): Failed to export DB to JSON.");
				Log.l(err);
			};
			cordova.plugins.sqlitePorter.exportDbToJson(dbparams, {successFn: exportSuccess, errorFn: exportFailure});
			// vm.fileChooser.open(function(res) {
			// 	var uri = res;
			// 	Log.l("Successfully chose file, uri:");
			// 	Log.l(uri);
			// }, function(err) {
			// 	Log.l("Error choosing file.");
			// 	Log.l(err);
			// });

		}
		
		function downloadCSVFile() {
			Log.l("Settings: now in downloadCSVFile() ...");
			if (!vm.downloadFile.fileurl) {
				vm.downloadFile.error = 'Please enter URL!';
				return;
			}

			var url = vm.downloadFile.fileurl;
			var filename = "importdata.csv";
			var targetPath = cordova.file.dataDirectory + filename;
			var trustHosts = true;
			var options = {};

			$cordovaFileTransfer.download(url, targetPath, options, trustHosts)
			.then(function(res) {
				Log.l("Successfully downloaded " + url);
			}, function(err) {
				Log.l("Error downloading " + url);
			}, function(progress) {
				$timeout(function() {
					$vm.downloadProgress = (progess.loaded / progress.total) * 100;
				});
			});
		
		}

		function importOldSettings() {
			
		}

		function createPopupMenu($scope) {
			Log.l("Settings: creating Popup Menu ...");
			$ionicPopover.fromTemplateUrl('Settings/templates/SettingsPopupMenu.html', {
				scope: $scope
			}).then(function(popover) {
				Log.l("Settings: now in function after ionicPopover.fromTemplateUrl(SettingsPopupMenu) ...");
				$scope.popover = popover;
				vm.popover = popover;
				// popover.show(".income-statement-menu")
				//Cleanup the popover when we're done with it!
				$scope.$on('$destroy', function() {
					Log.l("Settings: now in scope.on('destroy')");
					vm.popover.remove();
				});
				// Execute action on hidden popover
				$scope.$on('popover.hidden', function() {
					Log.l("Settings: now in scope.on('popover.hidden')");
					// Execute action
				});
				// Execute action on remove popover
				$scope.$on('popover.removed', function() {
					Log.l("Settings: now in scope.on('popover.removed')");
					// Execute action
				});
			});

		}

		function showPopupMenu($event) {
			Log.l("Settings: now in scope.openPopupMenu()")
			// vm.popover.show($event);
			vm.popover.show('.ion-more');
			var headerbar = angular.element(".income-statement-bar");
			var hbar = $("ion-header-bar");
			var hbarheight = hbar.height();
			// var barHeight = headerbar.height();
			Log.l("Settings: Menu bar height is %d px", hbarheight);
			var elPopover = $("#PopupMenu003");
			var popTop = elPopover.position().top;
			Log.l("elPopover has top " + popTop);
			var newPopTop = hbarheight + "px";
			elPopover.css("top", newPopTop);
			Log.l("elPopover now has top " + newPopTop);
			// vm.popover.positionView(".ion-android-menu", vm.popover);
			// vm.popover.show(".ion-android-menu");
			// vm.popover.positionView(".ion-android-menu", vm.popover);
		}

		function closePopupMenu() {
			Log.l("Settings: now in scope.closePopupMenu()")
			vm.popover.hide();
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
