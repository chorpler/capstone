(function () {
    angular.module('app')
    .filter('customDateFilter', customDateFilter);

    function customDateFilter () {
      return function (items, reverse) {

        items.sort(function (a, b) {
          a = new Date(a);
          b = new Date(b);
          return a !== b ? (a > b ? 1 : -1) : 0;
        });

        if(reverse) items.reverse();

        return items;
      };
    }
})();
