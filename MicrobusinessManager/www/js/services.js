(function () {
  angular.module('app')
  .factory('Database', Database);

  function Database ($ionicPlatform, $cordovaSQLite, $q) {
    var db;
    var deferred = $q.defer();
    $ionicPlatform.ready(function () {
      // $cordovaSQLite.deleteDB('my.db');
      db = $cordovaSQLite.openDB('my.db');
      $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS product (id integer primary key, name text UNIQUE, price text, ' +
                     'inventoryid integer, FOREIGN KEY(inventoryid) REFERENCES inventory(id))');
      $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS inventory (id integer primary key, name text UNIQUE, quantity integer, ' +
                     'cost text, productid integer, FOREIGN KEY(productid) REFERENCES product(id))');
      $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS expense (id integer primary key, name text, amount text, comments text, date text)');
      $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS sale (id integer primary key, total real, date text)');
      $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS saleproduct (id integer primary key, productid integer, saleid integer, ' +
                     'quantity integer, FOREIGN KEY(productid) REFERENCES product(id), FOREIGN KEY(saleid) REFERENCES sale(id))');
      $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS salary (id integer primary key, name text, amount text, comments text, date text)');
      deferred.resolve();
    });

    var service = {
      insert: insert,
      select: select,
      update: update,
      remove: remove,
      selectProductsForSale: selectProductsForSale
    };

    var INSERT_PRODUCT = 'INSERT INTO product (name, price, inventoryid) VALUES (?,?,?)';
    var SELECT_PRODUCT = 'SELECT id, name, price, inventoryid FROM product';
    var UPDATE_PRODUCT = 'UPDATE product set name = ?, price = ?, inventoryid = ?';
    var REMOVE_PRODUCT = 'DELETE FROM product';

    var INSERT_INVENTORY = 'INSERT INTO inventory (name, quantity, cost, productid) VALUES (?,?,?,?)';
    var SELECT_INVENTORY = 'SELECT id, name, quantity, cost, productid FROM inventory';
    var UPDATE_INVENTORY = 'UPDATE inventory set name = ?, quantity = ?, cost = ?, productid = ?';
    var REMOVE_INVENTORY = 'DELETE FROM inventory';

    var INSERT_EXPENSE = 'INSERT INTO expense (name, amount, comments, date) VALUES (?, ?, ?, ?)';
    var SELECT_EXPENSE = 'SELECT id, name, amount, comments, date FROM expense';
    var UPDATE_EXPENSE = 'UPDATE expense set name = ?, amount = ?, comments = ?, date = ?';
    var REMOVE_EXPENSE = 'DELETE FROM expense';

    var INSERT_SALE = 'INSERT INTO sale (total, date) VALUES (?,?)';
    var SELECT_SALE = 'SELECT id, total, date FROM sale';
    var UPDATE_SALE = 'UPDATE sale set total = ?, date = ?';
    var REMOVE_SALE = 'DELETE FROM sale';

    var INSERT_SALE_PRODUCT = 'INSERT INTO saleproduct (saleid, productid, quantity) VALUES (?,?,?)';
    var SELECT_SALE_PRODUCT = 'SELECT id, saleid, productid, quantity FROM saleproduct';
    var UPDATE_SALE_PRODUCT = 'UPDATE saleproduct set saleid = ?, productid = ?, quantity = ?';
    var REMOVE_SALE_PRODUCT = 'DELETE FROM saleproduct';

    var INSERT_SALARY = 'INSERT INTO salary (name, amount, comments, date) VALUES (?, ?, ?, ?)';
    var SELECT_SALARY = 'SELECT id, name, amount, comments, date FROM salary';
    var UPDATE_SALARY = 'UPDATE salary set name = ?, amount = ?, comments = ?, date = ?';
    var REMOVE_SALARY = 'DELETE FROM salary';

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
          query = SELECT_EXPENSE;
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
      var query  = 'SELECT DISTINCT product.id, name, price, quantity FROM product INNER JOIN saleproduct ON product.id = saleproduct.productid WHERE saleproduct.saleid = ?';
      return deferred.promise.then(function () {
        return $cordovaSQLite.execute(db, query, [saleId]).then(function (response) {
          return response;
        }, function (err) {
          console.log(err);
        });
      });
    }
  }
})();
