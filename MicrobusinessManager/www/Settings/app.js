(function () {
	angular.module('app.settings', [
		'app',
		'tmh.dynamicLocale'
	]).config(function (tmhDynamicLocaleProvider) {
		tmhDynamicLocaleProvider.defaultLocale('en-us');
		tmhDynamicLocaleProvider.localeLocationPattern('lib/angular/i18n/angular-locale_{{locale}}.js');
	});
})();
