(function () {
	angular.module('app.settings')
	.controller('SettingsController', SettingsController);

	function SettingsController ($scope, $rootScope, $q, $ionicModal, $filter, $http, Database, salary, $translate, languages, tmhDynamicLocale, tax, user, formats, $cordovaFile, $cordovaFileTransfer, $timeout, $ionicPopover, $ionicPopup, $persist, $cordovaSQLitePorter) {
		var vm = this;

		var win = window;
		win.sepi = {};
		win.sepi.persist = $persist;
		win.sepi.scope = $scope;
		win.sepi.db = Database;
		win.sepi.cFT = $cordovaFileTransfer;
		var rs = $rootScope;
		rs = $rootScope;
		vm.code = rs.code;
		win.sepi.code = $rootScope.code;
		win.sepi.rs = $rootScope;
		win.cSQLP = $cordovaSQLitePorter;
		win.cFT = $cordovaFileTransfer;

		win.vm = vm;

		// var fileDirectory = fileDirectory;
		var fileDirectory = cordova.file.dataDirectory;
		vm.fileDirectory = fileDirectory;
		win.sepi.fileDirectory = fileDirectory;

		vm.userAccount = {};
		vm.userRegistration = {};
		vm.activeSalary = null;
		vm.salary = salary;
		vm.languages = languages;
		vm.tax = tax;
		vm.login = login;
		vm.formats = formats;
		vm.downloadCSVFile = downloadCSVFile;
		vm.jsonImportIsGood = jsonImportIsGood;
		vm.closeUser = closeUser;
		vm.cancelUserEdit = cancelUserEdit;
		vm.saveUserEdit = saveUserEdit;
		vm.userEdit = userEdit;
		vm.closeFormats = closeFormats;
		vm.cancelFormatsEdit = cancelFormatsEdit;
		vm.saveFormatsEdit = saveFormatsEdit;
		vm.formatsEdit = formatsEdit;
		vm.showFormatsModal = showFormatsModal;
		vm.closeLogin = closeLogin;
		vm.submitLoginRequest = submitLoginRequest;
		vm.logout = logout;
		vm.register = register;
		vm.closeRegistration = closeRegistration;
		vm.submitRegistrationRequest = submitRegistrationRequest;
		vm.readImportSpreadsheet = readImportSpreadsheet;
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
		vm.importOldSettings = importOldSettings;
		vm.wipeLocalDatabase = wipeLocalDatabase;
		vm.saveExportSpreadsheet = saveExportSpreadsheet;
		// vm.showPopupYesNo = showPopupYesNo;
		vm.downloadModal = null;
		vm.exportModal = null;
		vm.downloadFile = {};
		vm.downloadProgress = 0;
		vm.fileChooser = window.fileChooser;
		vm.jsonImport = {};
		vm.workbook = null;

		// win.showPopupYesNo = vm.showPopupYesNo;


		var tempSalary = null;
		var salaryTable = 'salary';
		var languageTable = 'languages';
		var taxTable = 'tax';
		var userTable = 'user';
		var formatsTable = 'formats';

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



			// vm.downloadFile.fileurl = "https://docs.google.com/spreadsheets/d/17SAlhDDJXnb60X6xZwKx7BGiaoVsnl6uEtqNCJo_Mv4/pub?output=xlsx";
			vm.downloadFile.fileurl = "https://docs.google.com/spreadsheets/d/11KQKk92RJFsi7N7EC6pzXtxwEXhXWhrxaIaoyrhri6U/pub?output=xlsx";

			// vm.createPopupMenu($scope);
			// vm.createDownloadModal($scope);
			// vm.createExportModal($scope);

			vm.DB = Database.getDB();
			win.DB1 = vm.DB;
		}

		// function showPopupYesNo(title, text) {
		// 	var arrButtons = [
		// 		{text: 'No', type: 'button-calm', onTap: function(e) { return false;}},
		// 		{text: 'Yes', type: 'button-assertive', onTap: function(e) { return true;}}
		// 	];
		// 	var yesnopopup = $ionicPopup.show({
		// 		title: title,
		// 		template: text,
		// 		cssClass: 'PopupConfirm',
		// 		buttons: arrButtons
		// 	});

		// 	return yesnopopup;
		// }

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

		function formatsEdit () {
			Log.l("Settings: Now in formatsEdit()");
			getFormatsData().then(function() {
				if (vm.formats && vm.formats.dateformat) {
					vm.dateFormat = vm.formats.dateFormat;
				} else {
					vm.dateFormat = "YYYY-MM-DD";
				}
				vm.tempFormats = angular.copy(vm.formats) || {dateformat: "YYYY-MM-DD"};
				vm.showFormatsModal();
			});
		}

		function showFormatsModal () {
			console.log("Now in showFormatsModal");
			$ionicModal.fromTemplateUrl('Settings/templates/formatsModal.html', {
				scope: $scope
			}).then(function (modal) {
				vm.formatsModal = modal;
				vm.formatsModal.show();
			});
		}

		function closeFormats () {
			console.log("Now in closeUser");
			vm.formatsModal.remove();
		}

		function getFormatsData() {
			console.log("Now in getFormatsData");
			return Database.select('formats').then(function (response) {
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
				vm.formats = items[0];
				formats = vm.formats;
			});
		}

		function saveFormatsEdit (item, form, $event) {
			console.log("Settings: now in saveFormatsEdit");
			$event.stopPropagation();
			if (form && form.$invalid) {
				return;
			}
			vm.submitted = true;
			if(!item.id) {
	 			Database.insert(formatsTable, [item.dateformat]).then(function(res) {
	 				item.id = res.insertId;
				});
			} else {
				Database.update(formatsTable, item.id, [item.dateformat]);
			}

			// vm.activeTax = null;
			// getTax ();
			vm.formatsModal.remove();
			vm.submitted = false;
		}

		function cancelFormatsEdit () {
			console.log("Now in cancelUserEdit");
			vm.submitted = true;
			vm.formats = {};
			vm.formats.dateformat = vm.tempFormats.dateformat;
			// vm.activeTax = null;
			vm.formatsModal.remove();
			vm.submitted = false;
		}

		function createDownloadModal($scope) {
			Log.l("Settings: now in createDownloadModal() ...");
			$ionicModal.fromTemplateUrl('Settings/templates/download.html', {
				scope: $scope
			}).then(function (modal) {
				Log.l("Settings: created, now setting vm.downloadModal ...");
				vm.downloadModal = modal;
				vm.downloadModal.show();
				$scope.$on('$destroy', function() {
					Log.l("Settings: now in scope.on('destroy')");
					vm.downloadModal.remove();
				});
				// vm.downloadModal.show();
			});
		}

		function showDownloadModal() {
			Log.l("Settings: now in showDownloadModal() ...");
			// vm.popover.remove();
			vm.createDownloadModal($scope);
			// vm.downloadModal.show();
		}

		function closeDownloadModal() {
			Log.l("Settings: now in closeDownload() ...");
			// vm.downloadModal.hide();
			vm.downloadModal.remove();
		}
		
		function showDownloadProgress ($event) {
			vm.downloadProgress = 0;
			$ionicPopover.fromTemplateUrl('Settings/templates/downloadProgress.html', {
		  	scope: $scope,
			}).then(function(popover) {
				vm.downloadProgressPopover = popover;
				vm.downloadProgressPopover.show($event);
			});
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
			var sepidb = Database.getDB();
			$cordovaSQLitePorter.exportJSON(sepidb).then(function(res) {
				Log.l("exportSettings(): Successfully exported DB to JSON, got %d SQL statements.", res[1]);
				var jsonExport = res[0];
				window.jsonExport = jsonExport;
				var wb1 = new Workbook();
				var tables_list = Object.keys(jsonExport.structure.tables);
				// tables_list.unshift("db_tables");
				var db_tables = new Worksheet("db_tables", 1);
				db_tables.data = [];
				// var sheets = {"db_tables": db_tables};
				var sheets = {};
				var rowNumber = 0;
				for(var i in tables_list) {
					var tablename = tables_list[i];
					var tableRow = [tablename, jsonExport.structure.tables[tablename]];
					db_tables.data.push(tableRow);
				}
				db_tables.length = db_tables.data.length;
				window.dbTables = db_tables;
				wb1.add(db_tables);
				for(var i in tables_list) {
					var tablename = tables_list[i];
					sheets[tablename] = new Worksheet(tablename, 1);
					// var tableRow = [tablename, jsonExport.structure.tables[tablename]];
					// db_tables.data.push(tableRow);
					// db_tables[i][0] = tablename;
					// db_tables[i][1] = jsonExport.structure.tables[tablename];
					var tableData = jsonExport.data.inserts[tablename];
					var sheet = sheets[tablename];
					sheet.data = [];
					for(var idx in tableData) {
						var allRows = [];
						if(idx == 0) {
							var headers = Object.keys(tableData[idx]);
							sheet.data.push(headers);
						}
						var row = [];
						for(var key in tableData[idx]) {
							row.push(tableData[idx][key]);
						}
						// allRows.push(row);
						sheet.data.push(row);
					}
					sheet.length = sheet.data.length;
					wb1.add(sheet);
				}
				Log.l("Done converting SQL database to XLSX worksheet. See exportSheet and exportSheetXLS.");
				window.exportSheet = wb1;
				var wb1xls = wb1.objectify();
				window.exportSheetXLS = wb1xls;
				vm.saveExportSpreadsheet(wb1xls);
			}).catch(function(err) {
				Log.l("exportSettings(): Error exporting DB to JSON!");
				Log.l(err);
			});
			// var dbparams = Database.getDB();
			// Log.l("exportSettings() got database results:");
			// Log.l(dbparams);
			// var exportSuccess = function(json, count) {
			// 	Log.l("exportSettings(): Successfully exported " + count + " SQL statements to JSON.");
			// 	Log.l(json);
			// 	var ns = "mysepi";
			// 	Log.l("Now trying to persist to 'database_json' ...");
			// 	$persist.set(ns, 'database_json', JSON.stringify(json)).then(function(res) {
			// 		Log.l("exportSettings(): Successfully persisted json database.");
			// 		Log.l(res);
			// 	}, function(err) {
			// 		Log.l("exportSettings(): Could not persist json database!");
			// 		Log.l(err);
			// 	});
			// };
			// var exportFailure = function(err) {
			// 	Log.l("exportSettings(): Failed to export DB to JSON.");
			// 	Log.l(err);
			// };
			// cordova.plugins.sqlitePorter.exportDbToJson(dbparams, {successFn: exportSuccess, errorFn: exportFailure});
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
			var filename = "importdata.xlsx";
			var targetPath = fileDirectory + filename;
			var trustHosts = true;
			var options = {};

			$cordovaFileTransfer.download(url, targetPath, options, trustHosts)
			.then(function(res) {
				Log.l("Successfully downloaded " + url + "! Result:");
				Log.l(res);
				var fileURL = res.nativeURL;
				vm.downloadProgress = 100;
				$scope.downloadProgress = 100;
				vm.downloadDone = true;
				$timeout(function() { $scope.$apply(); }, 100);
				vm.readImportSpreadsheet();
				// var workbook = XLSX.readFile(fileURL);
				// win.workbook = workbook;
			}, function(err) {
				Log.l("Error downloading " + url);
			}, function(progress) {
				var prog = progress;
				win.prog1 = progress;
				vm.downloadDone = false;
				progress.total = progress.total == 0 ? progress.loaded * 2 : progress.total;
				var progPercent = (progress.loaded / progress.total) * 100;
				Log.l("cordovaFileTransfer: progress event received! %d% done!", progPercent);
				$scope.downloadProgress = progPercent;
				vm.downloadProgress = progPercent;
				// $timeout(function() {
				// 	$scope.downloadProgress = (progress.loaded / progress.total) * 100;
				// 	vm.downloadProgress = $scope.downloadProgress;
				// });
			});
		}

		function saveExportSpreadsheet(workbook) {
			Log.l("Settings: now in saveExportSpreadsheet() ...");
			var filename = "exportdata.xlsx";
			var wbopts = { bookType: 'xlsx', bookSST: true, type: 'binary' };
			var wboutfile = XLSX.write(workbook, wbopts);
			var filetype = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
			function s2ab(s) {
				var buf = new ArrayBuffer(s.length);
				var view = new Uint8Array(buf);
				for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
				return buf;
			}
			var wbBlob = new Blob([s2ab(wboutfile)],{type: filetype});

			$cordovaFile.writeFile(fileDirectory, filename, wbBlob, true ).then(function(res) {
				Log.l("saveExportSpreadsheet(): Successfully saved file '%s'.", filename);
				Log.l(res);
			}).catch(function(err) {
				Log.l("saveExportSpreadsheet(): Error writing file!");
				Log.l(err);
			});
		}

		function readImportSpreadsheet() {
			Log.l("Settings: now in readImportSpreadsheet() ...");
			var filename = "importdata.xlsx";
			$cordovaFile.readAsBinaryString(fileDirectory, filename).then(function(res) {
				Log.l("Successfully read file %s.", filename);
				win.file1 = res;
				var workbook = XLSX.read(res, {type: 'binary'});
				vm.workbook = workbook;
				win.workbook1 = workbook;
				var jsonImport = {structure: { tables: {}, otherSQL: []}, data: {inserts: {}}};
				vm.jsonImport = jsonImport;
				win.jsonImport = jsonImport;
				var sheet_name_list = workbook.SheetNames;
				var sheetCount = 0;
				sheet_name_list.forEach(function(i) {
					var sheet = workbook.Sheets[i];
					if(i == 'db_tables') {
						for(var row = 0; row < 11; row++) {
							var tableCell = XLS.utils.encode_cell({c:0, r:row});
							var structureCell = XLS.utils.encode_cell({c:1, r:row});
							Log.l("Now checking db_tables!%s and %s ...", tableCell, structureCell);
							var tableName = workbook.Sheets.db_tables[tableCell].v;
							var tableStructure = workbook.Sheets.db_tables[structureCell].v;
							jsonImport.structure.tables[tableName] = tableStructure;
						}
					} else {
						sheetCount++;
						// var range = sheet['!ref'];
						// for(var cell in sheet) {
						// 	if(cell[0] == '!') continue;
						// Log.l(i + "!" + z + " = " + JSON.stringify(sheet[z].v));
						var jsonSheet = XLS.utils.make_json(sheet);
						for(var idx in jsonSheet) {
							for(var key in jsonSheet[idx]) {
								if(key.toLowerCase() == 'date') {
									jsonSheet[idx][key] = moment(new Date(jsonSheet[idx][key])).format("YYYY-MM-DD HH:mm:ss");
								}
							}
						}
						jsonImport.data.inserts[i] = jsonSheet;
					}
				});
				Log.l("Done processing worksheets. Total of %d sheets loaded.", sheetCount);
				// Log.l(jsonImport);
			});
		}

		function jsonImportIsGood(jsonImport) {
			if(jsonImport &&
				jsonImport.structure &&
				jsonImport.structure.tables &&
				jsonImport.data &&
				jsonImport.data.inserts &&
				Object.keys(jsonImport.data.inserts).length > 0) {
				return true;
			} else {
				return false;
			}
		}

		function importOldSettings() {
			Log.l("Settings: now in importOldSettings(). Checking for jsonImport status...");
			var title = $filter('translate')("str_import_settings").toUpperCase();
			var text = $filter('translate')("str_import_warning");
			rs.code.showPopupYesNo(title, text).then(function(yesOrNo) {
				if(yesOrNo) {
					/* User chose yes */
					Log.l("importOldSettings() show yes/no popup: User chose yes. Proceeding.");
					if(jsonImportIsGood(vm.jsonImport)) {
						// cordova.plugins.sqlitePorter.wipeDb(vm.DB, wipeFunctions);
						$cordovaSQLitePorter.wipeDB(vm.DB).then(function(res) {
							Log.l("$cordovaSQLitePorter.wipeDB(): Successfully wiped DB.");
							Log.l(res);
							$cordovaSQLitePorter.importJSON(vm.DB, vm.jsonImport).then(function(res) {
								Log.l("$cSQLP.importJSON(): Imported %d SQL statements successfully.", res);
								$timeout(function() { $scope.$apply(); }, 100);
							}).catch(function(err) {
								Log.l("$cSQLP.importJSON(): Error importing!");
								Log.l(err);
							});
						}, function(err) {
							Log.l("$cordovaSQLitePorter.wipeDB(): Error received!");
							Log.l(err);
						}, function(prog) {
							if(!(prog && prog.length)) {
								Log.l("$cordovaSQLitePorter.wipeDB(): Progress received with improper progress event!");
								Log.l(prog);
							} else {
								var count = prog[0];
								var total = prog[1];
								var percent = (count / total) * 100;
								Log.l("$cordovaSQLitePorter.wipeDB(): Wiped %d / %d tables (%d%).", count, total, percent);
							}
						});
					} else {
						/* JSON data to import is not good */
						Log.l("importOldSettings(): No proper JSON data exists!");
						// var title = "IMPORT ERROR";
						var title = $filter('translate')("str_import_settings").toUpperCase();
						var text = $filter('translate')("str_import_error_message");
						rs.code.showPopupAlertPromise(title, text).then(function(res) {
							Log.l("Done showing popup alert about invalid import data source.");
						});
					}
				} else {
					/* User chose no */
					Log.l("importOldSettings(): User chose no. Canceling wipe and import.");
					var title = $filter('translate')("str_import_settings").toUpperCase();
					var text = $filter('translate')("str_import_canceled");
					rs.code.showPopupAlert(title, text);
				}
			}).catch(function(err) {
				Log.l("Error: importOldSettings yes/no popup threw error!");
				Log.l(err);
			});
		}

		function wipeLocalDatabase() {
			Log.l("Wiping local database...");
			var DB1 = Database.getDB();
			// cordova.plugins.sqlitePorter.wipeDb(DB1, wipeFunctions);
		}

		function createPopupMenu($scope) {
			Log.l("Settings: creating Popup Menu ...");
			$ionicPopover.fromTemplateUrl('Settings/templates/SettingsPopupMenu.html', {
				scope: $scope
			}).then(function(popover) {
				Log.l("Settings: now in function after ionicPopover.fromTemplateUrl(SettingsPopupMenu) ...");
				$scope.popover = popover;
				vm.popover = popover;
				vm.popover.show('.settings-menu-icon');
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
			vm.createPopupMenu($scope);
			/*
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
			*/
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
