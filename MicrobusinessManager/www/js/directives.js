(function () {
	angular.module('app')
	.directive('selectClick', selectClick)
	.directive('smartFloat', smartFloat);

	function selectClick () {
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
	};

	function smartFloat () {
		return {
			require: 'ngModel',
			link: function(scope, element, attrs, modelCtrl) {

				modelCtrl.$parsers.push(function (inputValue) {

					var transformedInput = inputValue ? inputValue.replace(/[^\d.,-]/g,'') : null;

					if (transformedInput!=inputValue) {
						modelCtrl.$setViewValue(transformedInput);
						modelCtrl.$render();
					}

					return transformedInput;
				});
			}
		};
	}
})();
