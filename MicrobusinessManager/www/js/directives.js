(function () {
  angular.module('app')
  .directive('selectClick', function() {
    return {
      restrict: 'A',
      scope: true,

      controller: function($scope, $element) {

        $element.bind('click', function() {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
        });
        var select = $element.find('select');
        select.bind('blur', function() {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

        });
      }
    };
  });
})();
