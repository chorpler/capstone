(function() {
	angular.module('app')
		.factory('Database', Database)
		.factory('CashBalance', CashBalance)
		.factory('IonicFiles', ['$q', '$window', '$cordovaFile', IonicFiles])
		.factory('$cordovaSQLitePorter', ['$q', '$window', cordovaSQLitePorter]);
	// .factory('ReportService', ['$q', ReportService]);

	// function Database($ionicPlatform, $cordovaSQLite, $q) {
	function Database($ionicPlatform, $cordovaSQLite, $q) {
		var db = null;
		var dbname = 'my.db';
		var dbparams = { name: dbname, iosDatabaseLocation: 'default' };
		var deferred = $q.defer();
		$ionicPlatform.ready(function() {
			initializeDB();
		});

		var service = {
			insert: insert,
			select: select,
			update: update,
			remove: remove,
			selectProductsForSale: selectProductsForSale,
			calculateCashOnHand: calculateCashOnHand,
			generateIncomeStatement: generateIncomeStatement,
			getCommission: getCommission,
			getDB: getDB,
			getDBNew: getDBNew,
			getFormats: getFormats,
			getUserInfo: getUserInfo,
			initializeDB: initializeDB
		};

		var INSERT_PRODUCT = 'INSERT INTO product (name, price, category, inventoryid) VALUES (?,?,?,?)';
		var SELECT_PRODUCT = 'SELECT id, name, price, category, inventoryid FROM product';
		var SELECT_CATEGORY = 'SELECT DISTINCT category FROM product';
		var UPDATE_PRODUCT = 'UPDATE product set name = ?, price = ?, category = ?, inventoryid = ?';
		var REMOVE_PRODUCT = 'DELETE FROM product';

		var INSERT_INVENTORY = 'INSERT INTO inventory (name, quantity, productid) VALUES (?,?,?)';
		var SELECT_INVENTORY = 'SELECT id, name, quantity, productid FROM inventory';
		var UPDATE_INVENTORY = 'UPDATE inventory set name = ?, quantity = ?, productid = ?';
		var REMOVE_INVENTORY = 'DELETE FROM inventory';

		var INSERT_EXPENSE = 'INSERT INTO expense (name, amount, expType, comments, date, type) VALUES (?, ?, ?, ?, ?, ?)';
		var SELECT_EXPENSE = 'SELECT id, name, amount, expType, comments, date, type FROM expense';
		var SELECT_EXP = 'SELECT id, name, amount, expType, type FROM expense WHERE type = \'other\' GROUP BY name';
		var UPDATE_EXPENSE = 'UPDATE expense set name = ?, amount = ?, expType = ?, comments = ?, date = ?, type = ? ';
		var REMOVE_EXPENSE = 'DELETE FROM expense';

		var INSERT_SALE = 'INSERT INTO sale (amount, date) VALUES (?,?)';
		var SELECT_SALE = 'SELECT id, amount, date FROM sale';
		var UPDATE_SALE = 'UPDATE sale set amount = ?, date = ?';
		var REMOVE_SALE = 'DELETE FROM sale';

		var INSERT_SALE_PRODUCT = 'INSERT INTO saleproduct (saleid, productid, quantity, saleprice) VALUES (?,?,?,?)';
		var SELECT_SALE_PRODUCT = 'SELECT id, saleid, productid, quantity, saleprice FROM saleproduct';
		var UPDATE_SALE_PRODUCT = 'UPDATE saleproduct set saleid = ?, productid = ?, quantity = ?, saleprice = ?';
		var REMOVE_SALE_PRODUCT = 'DELETE FROM saleproduct';

		var INSERT_SALARY = 'INSERT INTO salary (amount, type) VALUES (?, ?)';
		var SELECT_SALARY = 'SELECT id, amount, type FROM salary';
		var UPDATE_SALARY = 'UPDATE salary set amount = ?, type = ? ';
		var REMOVE_SALARY = 'DELETE FROM salary';

		var INSERT_SALARY_DATED = 'INSERT INTO salary (amount, type, date) VALUES (?, ?, ?)';
		var SELECT_SALARY_DATED = 'SELECT id, amount, type, date FROM salary';
		var UPDATE_SALARY_DATED = 'UPDATE salary set amount = ?, type = ?, date= ? ';
		var REMOVE_SALARY_DATED = 'DELETE FROM salary';

		var INSERT_LANGUAGES = 'INSERT INTO languages (type) VALUES (?)';
		var SELECT_LANGUAGES = 'SELECT id, type FROM languages';
		var UPDATE_LANGUAGES = 'UPDATE languages set type = ? ';
		var REMOVE_LANGUAGES = 'DELETE FROM languages';

		var INSERT_CASH_INFUSION = 'INSERT INTO cashInfusion (amount, date) VALUES (?,?)';
		var SELECT_CASH_INFUSION = 'SELECT id, amount, date FROM cashInfusion';
		var UPDATE_CASH_INFUSION = 'UPDATE cashInfusion set amount = ?, date = ? ';
		var REMOVE_CASH_INFUSION = 'DELETE FROM cashInfusion';

		var INSERT_TAX = 'INSERT INTO tax (active, percentage) VALUES (?,?)';
		var SELECT_TAX = 'SELECT id, active, percentage FROM tax';
		var UPDATE_TAX = 'UPDATE tax set active = ?, percentage = ? ';
		var REMOVE_TAX = 'DELETE FROM tax';

		var INSERT_USER = 'INSERT INTO user (name, representative, street1, street2, city, state, postal, email, phone) VALUES (?,?,?,?,?,?,?,?,?)';
		var SELECT_USER = 'SELECT id, name, representative, street1, street2, city, state, postal, email, phone FROM user';
		var UPDATE_USER = 'UPDATE user set name = ?, representative = ?, street1 = ?, street2 = ?, city = ?, state = ?, postal = ?, email = ?, phone = ? ';
		var REMOVE_USER = 'DELETE FROM user';

		var INSERT_FORMATS = 'INSERT INTO formats (dateformat) VALUES (?)';
		var SELECT_FORMATS = 'SELECT id, dateformat FROM formats';
		var UPDATE_FORMATS = 'UPDATE formats set dateformat = ? ';
		var REMOVE_FORMATS = 'DELETE FROM formats';

		var WHERE = ' WHERE ';
		var AND = ' AND ';
		var WHERE_ID = 'id = ? ';
		var WHERE_NAME = 'name = ? ';
		var WHERE_START_DATE = 'date >= ? ';
		var WHERE_END_DATE = 'date <= ? ';
		var WHERE_TYPE = 'type = ? ';

		return service;

		function initializeDB() {
			db = $cordovaSQLite.openDB(dbparams);
			window.sepidb = db;
			$cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS product (id integer primary key, name text UNIQUE, price text, ' +
				'category text, inventoryid integer, FOREIGN KEY(inventoryid) REFERENCES inventory(id))');
			$cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS inventory (id integer primary key, name text UNIQUE, quantity integer, ' +
				'productid integer, FOREIGN KEY(productid) REFERENCES product(id))');
			$cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS expense (id integer primary key, name text, amount real, expType text, comments text, date text, type text)');
			$cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS sale (id integer primary key, amount real, date text)');
			$cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS saleproduct (id integer primary key, productid integer, saleid integer, ' +
				'quantity integer, saleprice real, FOREIGN KEY(productid) REFERENCES product(id), FOREIGN KEY(saleid) REFERENCES sale(id))');
			$cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS salary (id integer primary key, amount real, type text)');
			$cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS languages (id integer primary key, type text)');
			$cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS cashInfusion (id integer primary key, amount real, date text)');
			$cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS tax (id integer primary key, active integer, percentage text)');
			$cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS user (id integer primary key, name text, representative text, street1 text, street2 text, city text, state text, postal text, email text, phone text)');
			$cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS formats (id integer primary key, dateformat text)');
			deferred.resolve();
		}

		function insert(table, params) {
			var query;
			switch (table) {
				case 'product':
					query = INSERT_PRODUCT;
					break;
				case 'inventory':
					query = INSERT_INVENTORY;
					break;
				case 'expense':
					query = INSERT_EXPENSE;
					break;
				case 'sale':
					query = INSERT_SALE;
					break;
				case 'saleproduct':
					query = INSERT_SALE_PRODUCT;
					break;
				case 'salary':
					query = INSERT_SALARY;
					break;
				case 'salary_dated':
					query = INSERT_SALARY_DATED;
					break;
				case 'languages':
					query = INSERT_LANGUAGES;
					break;
				case 'cashInfusion':
					query = INSERT_CASH_INFUSION;
					break;
				case 'tax':
					query = INSERT_TAX;
					break;
				case 'user':
					query = INSERT_USER;
				case 'formats':
					query = INSERT_FORMATS;
					break;
			}

			return deferred.promise.then(function() {
				return $cordovaSQLite.execute(db, query, params).then(function(response) {
					return response;
				}, function(err) {
					console.log(err);
				});
			});
		}

		function select(table, id, name, type, startDate, endDate) {
			var query;
			switch (table) {
				case 'product':
					query = SELECT_PRODUCT;
					break;
				case 'category':
					query = SELECT_CATEGORY;
					break;
				case 'inventory':
					query = SELECT_INVENTORY;
					break;
				case 'expense':
					query = SELECT_EXPENSE;
					break;
				case 'exp':
					query = SELECT_EXP;
					break;
				case 'sale':
					query = SELECT_SALE;
					break;
				case 'saleproduct':
					query = SELECT_SALE_PRODUCT;
					break;
				case 'salary':
					query = SELECT_SALARY;
					break;
				case 'salary_dated':
					query = INSERT_SALARY_DATED;
					break;
				case 'languages':
					query = SELECT_LANGUAGES;
					break;
				case 'cashInfusion':
					query = SELECT_CASH_INFUSION;
					break;
				case 'tax':
					query = SELECT_TAX;
					break;
				case 'user':
					query = SELECT_USER;
					break;
				case 'formats':
					query = SELECT_FORMATS;
					break;
			}

			var params = [];
			var whereClause = false;

			if (id) {
				query += WHERE + WHERE_ID;
				params.push(id);
				whereClause = true;
			}

			if (name) {
				query += whereClause ? AND + WHERE_NAME : WHERE + WHERE_NAME;
				params.push(name);
				whereClause = true;
			}

			if (startDate) {
				query += whereClause ? AND + WHERE_START_DATE : WHERE + WHERE_START_DATE;
				params.push(moment(startDate).format('YYYY-MM-DD HH:mm:ss'));
				whereClause = true;
			}

			if (endDate) {
				query += whereClause ? AND + WHERE_END_DATE : WHERE + WHERE_END_DATE;
				params.push(moment(endDate).format('YYYY-MM-DD HH:mm:ss'));
				whereClause = true;
			}

			if (type) {
				query += whereClause ? AND + WHERE_TYPE : WHERE + WHERE_TYPE;
				params.push(type);
				whereClause = true;
			}

			return deferred.promise.then(function() {
				return $cordovaSQLite.execute(db, query, params)
					.then(function(response) {
						return response;
					}, function(err) {
						console.log(err);
					});
			});
		}

		function update(table, id, params) {
			if (!id) {
				return;
			}

			var query;
			switch (table) {
				case 'product':
					query = UPDATE_PRODUCT;
					break;
				case 'inventory':
					query = UPDATE_INVENTORY;
					break;
				case 'expense':
					query = UPDATE_EXPENSE;
					break;
				case 'sale':
					query = UPDATE_SALE;
					break;
				case 'saleproduct':
					query = UPDATE_SALE_PRODUCT;
					break;
				case 'salary':
					query = UPDATE_SALARY;
					break;
				case 'salary_dated':
					query = INSERT_SALARY_DATED;
					break;
				case 'languages':
					query = UPDATE_LANGUAGES;
					break;
				case 'cashInfusion':
					query = UPDATE_CASH_INFUSION;
					break;
				case 'tax':
					query = UPDATE_TAX;
					break;
				case 'user':
					query = UPDATE_USER;
					break;
				case 'formats':
					query = UPDATE_FORMATS;
					break;
			}

			query += id ? WHERE + WHERE_ID : '';
			if (id) {
				params.push(id);
			}

			return deferred.promise.then(function() {
				return $cordovaSQLite.execute(db, query, params).then(function(response) {
					return response;
				}, function(err) {
					console.log(err);
				});
			});
		}

		function remove(table, id) {
			if (!id) {
				return;
			}

			var query;
			switch (table) {
				case 'product':
					query = REMOVE_PRODUCT;
					break;
				case 'inventory':
					query = REMOVE_INVENTORY;
					break;
				case 'expense':
					query = REMOVE_EXPENSE;
					break;
				case 'sale':
					query = REMOVE_SALE;
					break;
				case 'saleproduct':
					query = REMOVE_SALE_PRODUCT;
					break;
				case 'salary':
					query = REMOVE_SALARY;
					break;
				case 'salary_dated':
					query = INSERT_SALARY_DATED;
					break;
				case 'languages':
					query = REMOVE_LANGUAGES;
					break;
				case 'cashInfusion':
					query = REMOVE_CASH_INFUSION;
					break;
				case 'tax':
					query = REMOVE_TAX;
					break;
				case 'user':
					query = REMOVE_USER;
					break;
				case 'formats':
					query = REMOVE_FORMATS;
					break;
			}

			query += id ? WHERE + WHERE_ID : '';

			var params = id ? [id] : [];

			return deferred.promise.then(function() {
				return $cordovaSQLite.execute(db, query, params).then(function(response) {
					return response;
				}, function(err) {
					console.log(err);
				});
			});
		}

		function selectProductsForSale(saleId) {
			var query = 'SELECT DISTINCT saleproduct.id, saleproduct.saleid, saleproduct.productid, name, saleprice, quantity FROM product INNER JOIN saleproduct ON product.id = saleproduct.productid WHERE saleproduct.saleid = ?';
			return deferred.promise.then(function() {
				return $cordovaSQLite.execute(db, query, [saleId]).then(function(response) {
					return response;
				}, function(err) {
					console.log(err);
				});
			});
		}

		function calculateCashOnHand(startDate, endDate) {
			var d = $q.defer();
			var queryStart = 'SELECT total(amount) as total FROM ';
			var queryExpense = '(SELECT total(amount) * -1 as amount FROM expense ';
			var queryUnion = ' UNION ';
			var querySales = 'SELECT total(amount) as amount FROM sale ';
			var queryCash = 'SELECT total(amount) as amount FROM cashInfusion ';
			var queryEnd = ')';

			queryExpense = queryExpense + ((startDate || endDate) ?
				WHERE +
				(startDate != null ? 'date > ? ' +
					(endDate != null ? AND + 'date < ? ' : '') :
					(endDate != null ? 'date < ?' : '')
				) : '');

			querySales = querySales + ((startDate || endDate) ?
				WHERE +
				(startDate != null ? 'date > ? ' +
					(endDate != null ? AND + 'date < ? ' : '') :
					(endDate != null ? 'date < ?' : '')
				) : '');

			queryCash = queryCash + ((startDate || endDate) ?
				WHERE +
				(startDate != null ? 'date > ? ' +
					(endDate != null ? AND + 'date < ? ' : '') :
					(endDate != null ? 'date < ?' : '')
				) : '');

			var query = queryStart + queryExpense + queryUnion + querySales + queryUnion + queryCash + queryEnd;

			var params = [];

			if (startDate) {
				params.push(moment(startDate).format('YYYY-MM-DD HH:mm:ss'));
			}

			if (endDate) {
				params.push(moment(endDate).format('YYYY-MM-DD HH:mm:ss'));
			}

			params = params.concat(params).concat(params);

			return deferred.promise.then(function() {
				return $cordovaSQLite.execute(db, query, params);
			}).then(function(res) {
					// d.resolve(res);
					return res;
			}).catch(function(err) {
				Log.l("Error in calculateCashOnHand()!");
				Log.l(err);
				d.reject(err);
			});
			// return deferred.promise.then(function() {
			// 	return $cordovaSQLite.execute(db, query, params).then(function(response) {
			// 		return response;
			// 	}, function(err) {
			// 		console.log(err);
			// 	});
			// });
		}

		function generateIncomeStatement(startDate, endDate, groupBy) {
			var incomeStatement = {
				incomeItems: [],
				expenseItems: []
			};
			var promises = [];

			var querySales = 'SELECT p.name as name, SUM(sp.saleprice * sp.quantity) as amount FROM product p ' +
				'INNER JOIN saleproduct sp ON p.id = sp.productid ' +
				'INNER JOIN sale s ON sp.saleid = s.id ';
			var queryCash = 'SELECT \'reports_cash\' as name, SUM(amount) FROM cashInfusion';
			var queryExpenses = 'SELECT SUM(amount) as amount, ' + groupBy + ' as name FROM expense';
			var queryUnion = ' UNION ';
			var queryGroupBy = ' GROUP BY ';
			var groupByName = ' name ';

			querySales = querySales + ((startDate || endDate) ?
				WHERE +
				(startDate != null ? 'date >= ? ' +
					(endDate != null ? AND + 'date <= ? ' : '') :
					(endDate != null ? 'date <= ?' : '')
				) : '');

			queryCash = queryCash + ((startDate || endDate) ?
				WHERE +
				(startDate != null ? 'date >= ? ' +
					(endDate != null ? AND + 'date <= ? ' : '') :
					(endDate != null ? 'date <= ?' : '')
				) : '');

			queryExpenses = queryExpenses + ((startDate || endDate) ?
				WHERE +
				(startDate != null ? 'date >= ? ' +
					(endDate != null ? AND + 'date <= ? ' : '') :
					(endDate != null ? 'date <= ?' : '')
				) : '');

			var queryIncomeItems = querySales + queryGroupBy + groupByName + queryUnion + queryCash + queryGroupBy + groupByName;
			var queryExpenseItems = queryExpenses + queryGroupBy + groupBy;

			var paramsIncome = [];
			var paramsExpense = [];

			if (startDate) {
				paramsIncome.push(moment(startDate).format('YYYY-MM-DD HH:mm:ss'));
				paramsExpense.push(moment(startDate).format('YYYY-MM-DD HH:mm:ss'));
			}

			if (endDate) {
				paramsIncome.push(moment(endDate).format('YYYY-MM-DD HH:mm:ss'));
				paramsExpense.push(moment(endDate).format('YYYY-MM-DD HH:mm:ss'));
			}

			paramsIncome = paramsIncome.concat(paramsIncome);

			return deferred.promise.then(function() {
				promises.push($cordovaSQLite.execute(db, queryIncomeItems, paramsIncome).then(function(response) {
					for (var i = response.rows.length - 1; i >= 0; i--) {
						incomeStatement.incomeItems.push(response.rows.item(i));
					}
				}, function(err) {
					console.log(err);
				}));

				promises.push($cordovaSQLite.execute(db, queryExpenseItems, paramsExpense).then(function(response) {
					for (var i = response.rows.length - 1; i >= 0; i--) {
						incomeStatement.expenseItems.push(response.rows.item(i));
					}
				}, function(err) {
					console.log(err);
				}));

				return $q.all(promises).then(function() {
					return incomeStatement;
				});
			});
		}

		function getCommission() {
			var querySalary = 'SELECT amount FROM salary WHERE type = \'commission\' LIMIT 1';
			var queryLastCommission = 'SELECT date FROM expense WHERE type = \'salary\' ORDER BY date DESC LIMIT 1';
			var queryCommission = 'select total(sale.amount * salary.amount / 100) as commission from sale ' +
				'LEFT JOIN (' + querySalary + ') salary ' +
				'WHERE sale.date > (' + queryLastCommission + ') OR (' + queryLastCommission + ') IS NULL';

			return deferred.promise.then(function() {
				return $cordovaSQLite.execute(db, queryCommission).then(function(response) {
					return response.rows.item(0);
				}, function(err) {
					console.log(err);
				})
			})
		}

		function getDB() {
			return db;
		}

		function getDBNew() {
			return dbparams;
		}

		function getFormats() {
			var d = $q.defer();
			var db = 'formats';
			var query = 'SELECT id, dateformat FROM formats';
			return d.promise.then(function() {
				return $cordovaSQLite.execute(db, query, params)
					.then(function(res) {
							var items = [];
							if (!res || !res.rows || !res.rows.length || res.rows.length === 0) {
								return items;
							}
							for (var i = res.rows.length - 1; i >= 0; i--) {
								var item = res.rows.item(i);
								/* id, dateformat */
								items.push(item);
							}
							return items[0];
					}, function(err) {
						Log.l(err);
					});
			});
		}

		function getUserInfo() {
			var d = $q.defer();
			var db = 'user';
			var query = SELECT_USER;
			return d.promise.then(function() {
				return $cordovaSQLite.execute(db, query, params)
					.then(function(res) {
							var items = [];
							if (!res || !res.rows || !res.rows.length || res.rows.length === 0) {
								return items;
							}
							for (var i = res.rows.length - 1; i >= 0; i--) {
								var item = res.rows.item(i);
								/* id, dateformat */
								items.push(item);
							}
							return items[0];
					}, function(err) {
						Log.l(err);
					});
			});
		}
	}

	function CashBalance(Database, $q) {
		var my = this;
		var currentCashBalance;

		var service = {
			get CashBalance() {
				return currentCashBalance;
			},
			set CashBalance(val) {
				return currentCashBalance = val;
			},
			updateCashBalance: function() {
				var d = $q.defer();
				Database.calculateCashOnHand().then(function(response) {
					var curBal = response.rows.item(0).total;
					currentCashBalance = curBal;
					d.resolve(curBal);
				}).catch(function(err) {
					Log.l("Error with CashBalance.updateCashBalance()");
					Log.l(err);
					d.reject(err);
				});
				return d.promise;
			}
		};

		init();

		function init() {
			Database.calculateCashOnHand().then(function(response) {
				currentCashBalance = response.rows.item(0).total;
			});
		}

		return service;
	}

	function IonicFiles($q, $window, $cordovaFile) {
		function convertToDataURL(cordovaURL, filename, fileDirectory) {
			Log.l("Now in convertToDataURL()...");
			// var dir = fileDirectory || cordova.file.externalDataDirectory || cordova.file.dataDirectory;
			var dir = fileDirectory || cordova.file.syncedDataDirectory || cordova.file.dataDirectory;
			var filename = filename || cordovaURL.split('/').pop().split('#')[0].split('?')[0];
			var d = $q.defer();
			convertToFileEntry(cordovaURL).then(function(res) {
				var pdfFileEntry = res;
				var fileName = pdfFileEntry.fullPath;
				var fileDir = pdfFileEntry.filesystem.root.toURL();
				while(fileDir.slice(-1) == '/') {
					fileDir = fileDir.slice(0,-1);
				}
				while(fileName.slice(0,1) == '/') {
					fileName = fileName.slice(1);
				}
				window.pdfFile1 = {};
				window.pdfFile1.filename = fileName;
				window.pdfFile1.filedir = fileDir;
				window.pdfFile1.file = pdfFileEntry;
				var localURL = pdfFileEntry.toURL();
				Log.l("convertToDataURL(): Resolved cordova URL:\n%s\n%s", cordovaURL);
				return $cordovaFile.readAsDataURL(fileDir, fileName);
			}).then(function(res) {
				Log.l("convertToDataURL(): Success converting %s, data url is length %d.", filename, res.length);
				window.pdfFile1.dataURL = res;
				d.resolve(res);
			}).catch(function(err) {
				Log.l("convertToDataURL(): Error reading %s/%s.", dir, filename);
				Log.l(err);
				d.reject(err);
			});
			return d.promise;
		}

		function convertToFileEntry(cordovaURL) {
			Log.l("Now in convertToLocalURL() ...");
			var d = $q.defer();
			resolveLocalFileSystemURL(cordovaURL, function(res) {
				var fileEntry = res;
				Log.l("Converted cordova URL to FileEntry:\n%s", cordovaURL);
				// Log.l(fileEntry);
				// win.localFileEntry = res;
				d.resolve(fileEntry);
			}, function(err) {
				Log.l("Error during convertToLocalURL()!");
				d.reject(err);
			});
			return d.promise;
		}

		function convertToLocalURL(cordovaURL) {
			Log.l("Now in convertToLocalURL() ...");
			var d = $q.defer();
			resolveLocalFileSystemURL(cordovaURL, function(res) {
				var localURL = res.toURL();
				Log.l("Converted cordova URL to local URL:\n%s\n%s", cordovaURL, localURL);
				// win.localFileEntry = res;
				d.resolve(localURL);
			}, function(err) {
				Log.l("Error during convertToLocalURL()!");
				d.reject(err);
			});
			return d.promise;
		}

		// window.IonicFiles = window.IonicFiles || {};
		// window.IonicFiles.convertToDataURL = convertToDataURL;
		// window.IonicFiles.convertToFileEntry = convertToFileEntry;
		// window.IonicFiles.convertToLocalURL = convertToLocalURL;

		var service = {
			convertToDataURL: convertToDataURL,
			convertToFileEntry: convertToFileEntry,
			convertToLocalURL: convertToLocalURL,
			cordovaFile: $cordovaFile
		};

		window.IonicFiles = window.IonicFiles || service;

		return service;
	}

	function cordovaSQLitePorter($q, $window) {

		var cdv = $window.cordova;
		var plugins = cdv.plugins;
		var sqlitePorter = plugins.sqlitePorter;

		function checkDB(db) {
			if(isObj(db) && db.transaction) {
				return true;
			} else {
				return false;
			}
		}

		function isBad(db) {
			return !checkDB(db);
		}

		function importSQL(db, sql) {
			var d = $q.defer();
			if(isBad(db)) {
				d.reject("db is not correct database type, it must be be a WebSQL-style object and have .transaction() method!");
			} else {
				sqlitePorter.importSqlToDb(db, sql, 
					{ successFn:
						function(count) {
							d.resolve(count);
						}, errorFn:
						function(err) {
							d.reject(err);
						}, progressFn:
						function(count, totalCount) {
							d.notify([count, totalCount]);
						}
					}
				);
			}
			return d.promise;
		}

		function exportSQL(db, dataOnly) {
			var d = $q.defer();
			if(isBad(db)) {
				d.reject("db is not correct database type, it must be be a WebSQL-style object and have .transaction() method!");
			} else {
				var exportDataOnly = dataOnly ? true : false;
				sqlitePorter.exportDbToSql(db, { successFn: function(sql, count) {
					d.resolve([sql, count]);
				}, dataOnly: exportDataOnly});
			}
			return d.promise;
		}

		function importJSON(db, json, batchInsertSize) {
			var d = $q.defer();
			if(isBad(db)) {
				d.reject("db is not correct database type, it must be be a WebSQL-style object and have .transaction() method!");
			} else {
				var batchSize = batchInsertSize || 250;
				sqlitePorter.importJsonToDb(db, json, { successFn: function(count) {
					d.resolve(count);
				}, errorFn: function(err) {
					d.reject(err);
				}, progressFn: function(count, totalCount) {
					d.notify([count, totalCount]);
				}, batchInsertSize: batchSize});
			}
			return d.promise;
		}

		function exportJSON(db, dataOnly) {
			var d = $q.defer();
			if(isBad(db)) {
				d.reject("db is not correct database type, it must be be a WebSQL-style object and have .transaction() method!");
			} else {
				var exportDataOnly = dataOnly ? true : false;
				sqlitePorter.exportDbToJson(db,
					{ successFn:
						function(json, count) {
							d.resolve([json, count]);
						}, dataOnly: exportDataOnly
					}
				);
			}
			return d.promise;
		}

		function wipeDB(db) {
			var d = $q.defer();
			if(isBad(db)) {
				d.reject("db is not correct database type, it must be be a WebSQL-style object and have .transaction() method!");
			} else {
				sqlitePorter.wipeDb(db,
					{ successFn:
						function(count) {
							d.resolve(count);
						}, errorFn:
						function(err) {
							d.reject(err);
						}, progressFn:
						function(count, totalCount) {
							d.notify([count, totalCount]);
						}
					}
				);
			}
			return d.promise;
		}

		var service = {
			checkDB: checkDB,
			isBad: isBad,
			importSQL: importSQL,
			exportSQL: exportSQL,
			importJSON: importJSON,
			exportJSON: exportJSON,
			wipeDB: wipeDB
		};

		return service;
		// function init() {

		// }
		// init();


	}
})();

