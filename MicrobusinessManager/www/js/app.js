(function () {
	angular.module('app', [
		'ionic',
		'ngCordova',
		'app.expenses',
		'app.inventory',
		'app.products',
		'app.reports',
		'app.sales',
		'app.settings',
		'app.salary',
		'pascalprecht.translate'

	])
	.run(run)
	.config(config);

	var language;
	function run ($ionicPlatform, Database) {
		$ionicPlatform.ready(function () {
			if (window.cordova && window.cordova.plugins.Keyboard) {
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
				cordova.plugins.Keyboard.disableScroll(true);
			}

			if (window.StatusBar) {
				StatusBar.styleDefault();
			}
		});
		Database.select('languages').then(function (response) {
			var items = [];
			if (response.rows.length === 0) {
				return items;
			}
			for (var i = response.rows.length - 1; i >= 0; i--) {
				var item = response.rows.item(i);
				items.push(item);
			}
			console.log(items);
			for (var j = 0; j < items.length; j++) {
				language = items[0].type;
			}
			console.log(language);
			return items;
		});
	}

	function config ($stateProvider, $urlRouterProvider, $translateProvider) {
		$stateProvider
		.state('app', {
			url: '/app',
			abstract: true,
			templateUrl: 'templates/menu.html',
			controller: 'AppController',
			controllerAs: 'app'
		});


		$translateProvider.translations('en', {
			menu_sales: "Sales",
			menu_products: "Products",
			menu_inventory: "Inventory",
			menu_expenses: "Expenses",
			menu_salary: "Salary",
			menu_reports: "Reports",
			menu_settings: "Settings",
			cancel_button: "Cancel",
			save_button: "Save",
			login_button: "Log In",
			logout_button: "Log Out",
			close_button: "Close",
			register_button: "Register",
			placehoder_search: "Search",
			sales_reset: "Clear",
			sales_checkout: "Checkout",
			sales_name: "Product",
			sales_price: "Price",
			sales_limit: "Limit",
			sales_no_product: "You have not added any products. Go to the Products page and add some.",
			sales_error_part1: " has only ",
			sales_error_part2: " in inventory. You cannot sell more than ",
			sales_edit_product_back: "Back",
			sales_edit_quantity: "Edit Quantity",
			sales_total_sale: "Total Sales Price",
			sales_record: "Record",
			sale_products_total: "Sale Products",
			product_sales_price: "Sales Price",
			product_name: "Product Name",
			product_edit: "Edit",
			product_new: "New",
			product_title: " Product",
			product_add_inventory: "Add Inventory",
			inventory_add_product: "Make Product",
			inventory_name: "Name",
			inventory_add_name: "Inventory Item Name",
			inventory_quantity: "Quantity",
			inventory_total_cost: "Total Cost",
			inventory_total_comments: "Comments",
			inv_exp_sal_date: "Date",
			expenses_expenses_log: "Expenses Log",
			expenses_total_expenses: "Total Expenses",
			expense_name: "Expense Nanme",
			expense_amount: "Amount",
			salary_expected: "Expected Salary",
			salary_register: "Register",
			salary_adjust: "Adjust",
			salary_no_comission: "Go to Settings and Set Self Payment to use this feature.",
			self_payment_settings: "Self Payment Settings",
			payment_method: "Self Payment Method",
			payment_amount: "Payment Amount",
			salary_option: "Salary",
			commission_option: "Commission",
			settings_username: "Username",
			settings_password: "Password",
			settings_confirm_password: "Confirm Password",
			settings_email: "Email",
			settings_phone: "Phone",
			settings_language_preference: "Language Preference",
			settings_language_options: "Languages",
			english_language: "English",
			spanish_language: "Spanish"
		});

		$translateProvider.translations('es', {
			menu_sales: "Registradora",
			menu_products: "Productos",
			menu_inventory: "Inventario",
			menu_expenses: "Gastos",
			menu_salary: "Salario",
			menu_reports: "Reportes",
			menu_settings: "Configuraciones",
			cancel_button: "Cancelar",
			save_button: "Guardar",
			login_button: "Accesar Cuenta",
			logout_button: "Terminar Sesion",
			register_button: "Crear Cuenta",
			close_button: "Cerrar",
			placehoder_search: "Buscar",
			sales_reset: "Borrar",
			sales_checkout: "Registrar Venta",
			sales_name: "Producto",
			sales_price: "Precio",
			sales_limit: "Limite",
			sales_no_product: "No haz agregado ningun producto. Ve a Productos y agrega uno o mas.",
			sales_error_part1: " solo tiene ",
			sales_error_part2: " en inventario. No puedes vender mas de ",
			sales_edit_product_back: "Regresar",
			sales_edit_quantity: "Editar Cantidad",
			sales_total_sale: "Venta Total",
			sales_record: "Registrar",
			sale_products_total: "Productos en esta Transaccion",
			product_sales_price: "Precio de Venta",
			product_name: "Nombre del Producto",
			product_edit: "Editar",
			product_new: "Nuevo",
			product_title: " Producto",
			product_add_inventory: "Agregar al Inventario",
			inventory_add_product: "Es Producto",
			inventory_name: "Articulo",
			inventory_add_name: "Nombre del articulo de Inventario",
			inventory_quantity: "Cantidad",
			inventory_total_cost: "Costo Total",
			inventory_total_comments: "Comentarios",
			inv_exp_sal_date: "Fecha",
			expenses_expenses_log: "Registro de Gastos",
			expenses_total_expenses: "Total de Gastos",
			expense_name: "Nombre del Gasto",
			expense_amount: "Cantidad",
			salary_expected: "Sueldo Esperado",
			salary_register: "Registrar",
			salary_adjust: "Ajustar",
			salary_no_comission: "Ve a Configuraciones y establece el metodo de sueldo para usar esta funcion.",
			self_payment_settings: "Configuracion de Mi Salario",
			payment_method: "Metodo de Pago",
			payment_amount: "Cantidad",
			salary_option: "Salario",
			commission_option: "Comision",
			settings_username: "Nombre de Usuario",
			settings_password: "Contraseña",
			settings_confirm_password: "Confirmar contraseña",
			settings_email: "Correo Electronico",
			settings_phone: "Telefono",
			settings_language_preference: "Preferencia de Idioma",
			settings_language_options: "Idiomas",
			english_language: "Ingles",
			spanish_language: "Español"


		});

		$translateProvider.preferredLanguage("es");
		$translateProvider.fallbackLanguage("es");


		// if none of the above states are matched, use this as the fallback
		$urlRouterProvider.otherwise('app/sales');
	}
})();
