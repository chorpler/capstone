(function () {
	angular.module('app')
	.factory('Database', Database);

	function Database ($ionicPlatform, $cordovaSQLite, $q) {
		var db;
		var deferred = $q.defer();
		$ionicPlatform.ready(function() {
			db = $cordovaSQLite.openDB('my.db');
			$cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS product (id integer primary key, name text UNIQUE, price text, ' +
									   'inventoryid integer, FOREIGN KEY(inventoryid) REFERENCES inventory(id))');
			$cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS inventory (id integer primary key, name text UNIQUE, quantity integer, ' + 
									   'cost text, productid integer, FOREIGN KEY(productid) REFERENCES product(id))');
			$cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS expense (id integer primary key, name text, amount text)');
			deferred.resolve();
		});

		var service = {
			insert: insert,
			select: select,
			update: update,
			remove: remove
		};

		var INSERT_PRODUCT = 'INSERT INTO product (name, price, inventoryid) VALUES (?,?,?)';
		var SELECT_PRODUCT = 'SELECT id, name, price, inventoryid FROM product';
		var UPDATE_PRODUCT = 'UPDATE product set name = ?, price = ?, inventoryid = ?';
		var REMOVE_PRODUCT = 'DELETE FROM product';

		var INSERT_INVENTORY = 'INSERT INTO inventory (name, quantity, cost, productid) VALUES (?,?,?,?)';
		var SELECT_INVENTORY = 'SELECT id, name, cost, productid FROM inventory';
		var UPDATE_INVENTORY = 'UPDATE inventory set name = ?, quantity = ?, cost = ?, productid = ?';
		var REMOVE_INVENTORY = 'DELETE FROM inventory';

		var INSERT_EXPENSE = 'INSERT INTO expense (name, amount) VALUES (?,?)';
		var SELECT_EXPENSE = 'SELECT id, name, amount FROM expense';
		var UPDATE_EXPENSE = 'UPDATE expense set name = ?, amount = ?';
		var REMOVE_EXPENSE = 'DELETE FROM expense';

		var WHERE = ' WHERE ';
		var AND = ' AND ';
		var WHERE_ID = 'id = ? ';
		var WHERE_NAME = 'name = ? ';

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
					query = INSERT_PRODUCT;
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

		function select (table, id, name) {
			var query;
			switch (table) {
				case 'product':
					query = SELECT_PRODUCT;
					break;
				case 'inventory':
					query = SELECT_INVENTORY;
					break;
				case 'expense':
					query = SELECT_PRODUCT;
					break;
			}

			var params = [];

			if (id) {
				query += WHERE + WHERE_ID;
				params.push(id);
			}

			if (name) {
				query += id ? AND + WHERE_NAME : WHERE + WHERE_NAME;
				params.push(name);
			}

			return deferred.promise.then(function () {
				return $cordovaSQLite.execute(db, query, params).then(function (response) {
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
					query = UPDATE_PRODUCT;
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
					query = REMOVE_PRODUCT;
					break;
			}

			query += id ? WHERE_ID : '';

			var params = id ? [id] : [];

			return deferred.promise.then(function () {
				return $cordovaSQLite.execute(db, query, params).then(function (response) {
					return response;
				}, function (err) {
					console.log(err);
				});
			});
		} 
	}
})();