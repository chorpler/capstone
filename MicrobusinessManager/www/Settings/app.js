(function () {
	angular.module('app.settings', [
		'app',
		'tmh.dynamicLocale'
	]).config(function (tmhDynamicLocaleProvider) {
		tmhDynamicLocaleProvider.defaultLocale('es-ec');
		tmhDynamicLocaleProvider.localeLocationPattern('lib/angular/i18n/angular-locale_{{locale}}.js');
	});
})();
