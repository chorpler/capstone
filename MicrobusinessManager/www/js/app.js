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

	var languageTable = 'languages';
	function run ($ionicPlatform, Database, $translate) {
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
			var selectedLanguage = {};
			if (response.rows.length === 0) {
				var language = {};
				language.type = 'es';
				Database.insert(languageTable, [language.type]).then(function (response) {
					language.id = response.insertId;
				});
			} else {
				for (var i = response.rows.length - 1; i >= 0; i--) {
					var item = response.rows.item(i);
					items.push(item);
				}
				for (var k = 0; k < items.length; k++) {
					selectedLanguage.type = items[0].type;
				}
				$translate.use(selectedLanguage.type);
			}
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
			menu_title: "Menu",
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
			expenses_new_expense: "Expense Record",
			expenses_total_expenses: "Total Expenses",
			expense_name: "Expense Name",
			expense_amount: "Amount",
			expense_type: "Expense Type",
			expense_variable: "Variable",
			expense_fixed: "Fixed",
			expense_history: "Recent Expenses",
			add_expense: "Add Expense",
			salary_expected: "Expected Salary",
			commission_expected: "Expected Commission",
			salary_register: "Register",
			salary_adjust: "Adjust",
			salary_no_comission: "Go to Settings and Set Self Payment to use this feature.",
			salary_name: "Name",
			salary_amount: "Amount",
			salary_comments: "Comments",
			salary_Date: "Date",
			salary_placeholder: "Salary ($)",
			salary_message_1: "Sorry! You only have $",
			salary_message_2: " available. Adjust the amount so that the difference is less than or equal to what you have on hand.",
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
			spanish_language: "Spanish",
			reports_income_statement: "Income Statement",
			reports_income_statement2: "Income Statement",
			reports_sales_reports: "Sales Report",
			reports_starting_cash: "Starting Cash",
			reports_ending_cash: "Ending Cash",
			reports_date: "Date",
			reports_price: "Price",
			reports_qty: "Qty",
			reports_grand_total: "Grand Total",
			reports_no_sales: "There are no sales in this time period.",
			reports_time_frame: "Time Frame",
			reports_header_day: 'Day',
			reports_header_week: 'Week',
			reports_header_month: 'Month',
			reports_sale: "Sale",
			edit_title: "Edit",
			new_title: "New",
			inventory_item: "Inventory Item"

		});

		$translateProvider.translations('es', {
			menu_title: "Menú",
			menu_sales: "Registradora",
			menu_products: "Productos",
			menu_inventory: "Inventario",
			menu_expenses: "Gastos",
			menu_salary: "Sueldo",
			menu_reports: "Reportes",
			menu_settings: "Configuraciones",
			cancel_button: "Cancelar",
			save_button: "Guardar",
			login_button: "Accesar Cuenta",
			logout_button: "Terminar Sesión",
			register_button: "Crear Cuenta",
			close_button: "Cerrar",
			placehoder_search: "Buscar",
			sales_reset: "Borrar",
			sales_checkout: "Registrar Venta",
			sales_name: "Producto",
			sales_price: "Precio",
			sales_limit: "Límite",
			sales_no_product: "No haz agregado ningún producto. Ve a Productos y agrega uno o más.",
			sales_error_part1: " solo tiene ",
			sales_error_part2: " en inventario. No puedes vender más de ",
			sales_edit_product_back: "Regresar",
			sales_edit_quantity: "Editar Cantidad",
			sales_total_sale: "Venta Total",
			sales_record: "Registrar",
			sale_products_total: "Productos en esta Transacción",
			product_sales_price: "Precio de Venta",
			product_name: "Nombre del Producto",
			product_edit: "Editar",
			product_new: "Nuevo",
			product_title: " Producto",
			product_add_inventory: "Agregar al Inventario",
			inventory_add_product: "Es Producto",
			inventory_name: "Artículo",
			inventory_add_name: "Nombre del artículo de Inventario",
			inventory_quantity: "Cantidad",
			inventory_total_cost: "Costo Total",
			inventory_total_comments: "Comentarios",
			inv_exp_sal_date: "Fecha",
			expenses_expenses_log: "Registro de Gastos",
			expenses_new_expense: "Registro de Gastos",
			expenses_total_expenses: "Total de Gastos",
			expense_name: "Nombre del Gasto",
			expense_amount: "Cantidad Gastada",
			expense_type: "Tipo de Gasto",
			expense_variable: "Variable",
			expense_fixed: "Fijo",
			expense_history: "Gastos Recientes",
			add_expense: "Agregar Gasto",
			salary_expected: "Sueldo Esperado",
			commission_expected: "Comisión Esperada",
			salary_register: "Registrar",
			salary_adjust: "Ajustar",
			salary_no_comission: "Ve a Configuraciones y establece el método de sueldo para usar esta función.",
			salary_name: "Nombre",
			salary_amount: "Cantidad",
			salary_comments: "Comentarios",
			salary_Date: "Fecha",
			salary_placeholder: "Salario ($)",
			salary_message_1: "Lo sentimos! Solamente tienes $",
			salary_message_2: " disponible. Ajusta la cantidad para que la diferencia sea menor o igual a lo que tienes disponible.",
			self_payment_settings: "Configuración de Mi Salario",
			payment_method: "Método de Pago",
			payment_amount: "Cantidad",
			salary_option: "Salario",
			commission_option: "Comisión",
			settings_username: "Nombre de Usuario",
			settings_password: "Contraseña",
			settings_confirm_password: "Confirmar contraseña",
			settings_email: "Correo Electrónico",
			settings_phone: "Teléfono",
			settings_language_preference: "Preferencia de Idioma",
			settings_language_options: "Idiomas",
			english_language: "Inglés",
			spanish_language: "Español",
			reports_income_statement: "Estado de Ganancias y Pérdidas",
			reports_income_statement2: "Ganancias y Pérdidas",
			reports_sales_reports: "Reporte de Ventas",
			reports_starting_cash: "Utilidad del Período Previo",
			reports_ending_cash: "Utilidad del Período",
			reports_date: "Fecha",
			reports_price: "Precio",
			reports_qty: "Cant",
			reports_grand_total: "Gran Total",
			reports_no_sales: "No hay ventas en este periodo.",
			reports_time_frame: "Período de Tiempo",
			reports_header_day: 'Dia',
			reports_header_week: 'Semana',
			reports_header_month: 'Mes',
			reports_sale: "Venta",
			edit_title: "Editar",
			new_title: "Nuevo",
			inventory_item: "Artículo de Inventario"

		});

		$translateProvider.preferredLanguage("es");
		$translateProvider.fallbackLanguage("es");


		// if none of the above states are matched, use this as the fallback
		$urlRouterProvider.otherwise('app/sales');
	}
})();
