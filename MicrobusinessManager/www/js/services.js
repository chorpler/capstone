(function () {
	angular.module('app')
	.factory('Database', Database)
	.factory('CashBalance', CashBalance)
	.factory('ReportService', ['$q', ReportService]);

	function ReportService($q) {
		function createPdf(invoice) {
			return $q(function(resolve, reject) {
				var dd = createDocumentDefinition(invoice);
				var pdf = pdfMake.createPdf(dd);

				pdf.getBase64(function(output) {
					resolve(base64ToUint8Array(output));
				});
			});
		}

		var service = {
			createPdf: createPdf
		};
		return service;
	}

	function base64ToUint8Array(base64) {
		var raw = atob(base64);
		var uint8Array = new Uint8Array(raw.length);
		for (var i = 0; i < raw.length; i++) {
			uint8Array[i] = raw.charCodeAt(i);
		}
		return uint8Array;
	}

	function createDocumentDefinition(invoice) {
		var items = invoice.Items.map(function(item) {
			return [item.Description, item.Quantity, item.Price];
		});

		var dd = {
			content: [
				{ text: 'INVOICE', style: 'header'},
				{ text: invoice.Date, alignment: 'right'},

				{ text: 'From', style: 'subheader'},
				invoice.AddressFrom.Name,
				invoice.AddressFrom.Address,
				invoice.AddressFrom.Country,		

				{ text: 'To', style: 'subheader'},
				invoice.AddressTo.Name,
				invoice.AddressTo.Address,
				invoice.AddressTo.Country,  

				{ text: 'Items', style: 'subheader'},
				{
					style: 'itemsTable',
					table: {
						widths: ['*', 75, 75],
						body: [
							[ 
								{ text: 'Description', style: 'itemsTableHeader' },
								{ text: 'Quantity', style: 'itemsTableHeader' },
								{ text: 'Price', style: 'itemsTableHeader' },
							]
						].concat(items)
					}
				},
				{
					style: 'totalsTable',
					table: {
						widths: ['*', 75, 75],
						body: [
							[
								'',
								'Subtotal',
								invoice.Subtotal,
							],
							[
								'',
								'Shipping',
								invoice.Shipping,
							],
							[
								'',
								'Total',
								invoice.Total,
							]
						]
					},
					layout: 'noBorders'
				},
			],
			styles: {
				header: {
					fontSize: 20,
					bold: true,
					margin: [0, 0, 0, 10],
					alignment: 'right'
				},
				subheader: {
					fontSize: 16,
					bold: true,
					margin: [0, 20, 0, 5]
				},
				itemsTable: {
					margin: [0, 5, 0, 15]
				},
				itemsTableHeader: {
					bold: true,
					fontSize: 13,
					color: 'black'
				},
				totalsTable: {
					bold: true,
					margin: [0, 30, 0, 0]
				}
			},
			defaultStyle: {
			}
		}
		return dd;
	}

	function Database ($ionicPlatform, $cordovaSQLite, $q) {
		var db;
		var deferred = $q.defer();
		$ionicPlatform.ready(function () {
			// $cordovaSQLite.deleteDB({ name: 'my.db', location: 'default' });
			db = $cordovaSQLite.openDB({ name: 'my.db', iosDatabaseLocation: 'default' });
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
			$cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS user (id integer primary key, name text, representative text, address text, email text, phone text)');
			deferred.resolve();
		});

		var service = {
			insert: insert,
			select: select,
			update: update,
			remove: remove,
			selectProductsForSale: selectProductsForSale,
			calculateCashOnHand: calculateCashOnHand,
			generateIncomeStatement: generateIncomeStatement,
			getCommission: getCommission
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
		var SELECT_EXP = 'SELECT name, amount, expType, type FROM expense  WHERE type = \'other\' GROUP BY name';
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

		var INSERT_USER = 'INSERT INTO user (name, representative, address, email, phone) VALUES (?,?,?,?,?)';
		var SELECT_USER = 'SELECT id, name, representative, address, email, phone FROM user';
		var UPDATE_USER = 'UPDATE user set name = ?, representative = ?, address = ?, email = ?, phone = ? ';
		var REMOVE_USER = 'DELETE FROM user';

		var WHERE = ' WHERE ';
		var AND = ' AND ';
		var WHERE_ID = 'id = ? ';
		var WHERE_NAME = 'name = ? ';
		var WHERE_START_DATE = 'date >= ? ';
		var WHERE_END_DATE = 'date <= ? ';
		var WHERE_TYPE = 'type = ? ';

		return service;

		function insert (table, params) {
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
					break;
			}

			return deferred.promise.then(function () {
				return $cordovaSQLite.execute(db, query, params).then(function (response) {
					return response;
				}, function (err) {
					console.log(err);
				});
			});
		}

		function select (table, id, name, type, startDate, endDate) {
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

			return deferred.promise.then(function () {
				return $cordovaSQLite.execute(db, query, params)
					.then(function (response) {
						return response;
					}, function (err) {
						console.log(err);
					});
			});
		}

		function update (table, id, params) {
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
			}

			query += id ? WHERE + WHERE_ID : '';
			if (id) {
				params.push(id);
			}

			return deferred.promise.then(function () {
				return $cordovaSQLite.execute(db, query, params).then(function (response) {
					return response;
				}, function (err) {
					console.log(err);
				});
			});
		}

		function remove (table, id) {
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
			}

			query += id ? WHERE + WHERE_ID : '';

			var params = id ? [id] : [];

			return deferred.promise.then(function () {
				return $cordovaSQLite.execute(db, query, params).then(function (response) {
					return response;
				}, function (err) {
					console.log(err);
				});
			});
		}

		function selectProductsForSale (saleId) {
			var query	= 'SELECT DISTINCT saleproduct.id, saleproduct.saleid, saleproduct.productid, name, saleprice, quantity FROM product INNER JOIN saleproduct ON product.id = saleproduct.productid WHERE saleproduct.saleid = ?';
			return deferred.promise.then(function () {
				return $cordovaSQLite.execute(db, query, [saleId]).then(function (response) {
					return response;
				}, function (err) {
					console.log(err);
				});
			});
		}

		function calculateCashOnHand (startDate, endDate) {
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

			return deferred.promise.then(function () {
				return $cordovaSQLite.execute(db, query, params).then(function (response) {
					return response;
				}, function (err) {
					console.log(err);
				});
			});
		}

		function generateIncomeStatement (startDate, endDate, groupBy) {
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

			return deferred.promise.then(function () {
				promises.push($cordovaSQLite.execute(db, queryIncomeItems, paramsIncome).then(function (response) {
					for (var i = response.rows.length - 1; i >= 0; i--) {
						incomeStatement.incomeItems.push(response.rows.item(i));
					}
				}, function (err) {
					console.log(err);
				}));

				promises.push($cordovaSQLite.execute(db, queryExpenseItems, paramsExpense).then(function (response) {
					for (var i = response.rows.length - 1; i >= 0; i--) {
						incomeStatement.expenseItems.push(response.rows.item(i));
					}
				}, function (err) {
					console.log(err);
				}));

				return $q.all(promises).then(function () {
					return incomeStatement;
				});
			});
		}

		function getCommission () {
			var querySalary = 'SELECT amount FROM salary WHERE type = \'commission\' LIMIT 1';
			var queryLastCommission = 'SELECT date FROM expense WHERE type = \'salary\' ORDER BY date DESC LIMIT 1';
			var queryCommission = 'select total(sale.amount * salary.amount / 100) as commission from sale ' +
								'LEFT JOIN (' + querySalary + ') salary ' +
								'WHERE sale.date > (' + queryLastCommission + ') OR (' + queryLastCommission + ') IS NULL';

			return deferred.promise.then(function () {
				return $cordovaSQLite.execute(db, queryCommission).then(function (response) {
					return response.rows.item(0);
				}, function (err) {
					console.log(err);
				})
			})
		}
	}

	function CashBalance (Database) {
		var currentCashBalance;

		var service = {
			get CashBalance () {
				return currentCashBalance;
			},
			set CashBalance (val) {
				return currentCashBalance = val;
			},
			updateCashBalance: function () {
				return Database.calculateCashOnHand().then(function (response) {
					return currentCashBalance = response.rows.item(0).total;
				});
			}
		};

		init();

		function init () {
			Database.calculateCashOnHand().then(function (response) {
				currentCashBalance = response.rows.item(0).total;
			});
		}

		return service;
	}
})();
