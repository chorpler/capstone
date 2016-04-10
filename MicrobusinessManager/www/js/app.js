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
		'pascalprecht.translate',
		'tmh.dynamicLocale'

	])
	.run(run)
	.config(config);

	var languageTable = 'languages';
	var selectedLanguage = {};
	var items = [];
	function run ($rootScope, $ionicPlatform, Database, $translate, tmhDynamicLocale) {
		$ionicPlatform.ready(function () {
			Database.select(languageTable).then(function (response) {
				if (response.rows.length === 0) {
					navigator.globalization.getPreferredLanguage(function (language) {
						var trimLanguage = (language.value).split('-')[0];
						if (trimLanguage === 'en' || trimLanguage === 'es')	{
							$translate.use(trimLanguage).then(function (data) {
								if (data === 'es') {
									tmhDynamicLocale.set('es-ec');
								}
								else if (data === 'en') {
									tmhDynamicLocale.set('en-us');
								}
								Database.insert(languageTable, [data]).then(function (response) {
									language.id = response.insertId;
								});
							}, function (error) {
								console.log("ERROR -> " + error);
							});
						} else {
							Database.insert(languageTable, ['en']).then(function (response) {
								language.id = response.insertId;
								$translate.use('en');
								tmhDynamicLocale.set('en-us');
							});
						}
					}, null);
				} else {
					for (var i = response.rows.length - 1; i >= 0; i--) {
						var item = response.rows.item(i);
						items.push(item);
					}
					for (var j = 0; j < items.length; j++) {
						selectedLanguage.id = items[0].id;
						selectedLanguage.type = items[0].type;
					}
					if (selectedLanguage.type === 'es') {
						tmhDynamicLocale.set('es-ec');
					}
					else if (selectedLanguage.type === 'en') {
						tmhDynamicLocale.set('en-us');
					}
					$translate.use(selectedLanguage.type);
					Database.update(languageTable, selectedLanguage.id, [selectedLanguage.type]);
				}
			});

			if (window.cordova && window.cordova.plugins.Keyboard) {
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
				cordova.plugins.Keyboard.disableScroll(true);
			}

			if (window.StatusBar) {
				StatusBar.styleDefault();
			}
			$rootScope.numberPattern = '[0-9]+([,\.][0-9]+)?';
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
			add_button: "Add",
			cancel_button: "Cancel",
			cancel_sale_button: "Cancel Sale",
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
			sales_category: "Categories",
			sales_all: "All",
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
			product_category: "Category",
			product_new_Category: "New Category",
			product_add_inventory: "Add Inventory",
			product_Category_add: "Add",
			product_Category_choose: "Choose",
			product_input_category: "Enter name of new Category",
			product_Category_choose_category: "Choose Category",
			product_Category_existent_category: "Current Category",
			product_category_name: "Category Name",
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
			salary_record: "Salary Record",
			salary_expected: "Expected Salary",
			commission_expected: "Expected Commission",
			salary_percentage: "Percentage",
			salary_register: "Register",
			salary_adjust: "Adjust",
			salary_no_comission: "Go to Settings and Set Self Payment to use this feature.",
			salary_name: "Name",
			salary_amount: "Amount",
			salary_not_configured: "Not configured yet",
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
			reports_activity_log: "Activity Log",
			reports_sales_reports: "Sales Log",
			reports_starting_cash: "Starting Cash",
			reports_ending_cash: "Ending Cash",
			reports_date: "Date",
			reports_price: "Price",
			reports_qty: "Qty",
			reports_grand_total: "Grand Total",
			reports_no_sales: "There are no sales in this time period.",
			reports_expense_log: "Expense Log",
			reports_time_frame: "Time Frame",
			reports_header_day: 'Day',
			reports_header_week: 'Week',
			reports_header_month: 'Month',
			reports_sale: "Sale",
			reports_cash: 'Cash',
			edit_title: "Edit",
			new_title: "New",
			inventory_item: "Inventory Item",
			cash_balance: 'Cash Balance',
			income_statement_profit: 'Profit (or Loss)',
			income_statement_income_header: 'Income',
			income_statement_total_income: 'Total Income',
			income_statement_expenses_header: 'Expenses',
			income_statement_fixed: 'Fixed',
			income_statement_variable: 'Variable',
			income_statement_total_expenses: 'Total Expenses',
			income_statement_type: 'Type',
			income_statement_name: 'Name',
			cash_title: "Cash Infusion",
			cash_amount: "Amount",
			cash_date: "Date",
			including_tax: "Including Tax",
			checkout_options: "Tax Options",
			edit_tax: "Edit Tax",
			tax_name: "Sales Tax",
			tax_inactive: "Inactive",
			tax_active: "Active",
			tax_enabled: "Enabled",
			settings_acknowledgment: "Acknowledgments",
			required_error: 'Required Field',
			invalid_number_error: 'Invalid Number',
			negative_error: 'Negative number not allowed',
			out_of_range_error: 'Out of range',
			commission_too_high_error: 'Commission cannot be higher than 100%'
		});

		$translateProvider.translations('es', {
			menu_title: "Menú",
			menu_sales: "Ventas",
			menu_products: "Productos",
			menu_inventory: "Inventario",
			menu_expenses: "Gastos",
			menu_salary: "Sueldo",
			menu_reports: "Reportes",
			menu_settings: "Configuraciones",
			cancel_button: "Cancelar",
			cancel_sale_button: "Cancelar Venta",
			add_button: "Agregar",
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
			sales_category: "Categorías",
			sales_all: "Mostrar Todas",
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
			product_category: "Categoría",
			product_new_Category: "Nueva Categoría",
			product_input_category: "Ingresa Nombre de Nueva Categoría",
			product_add_inventory: "Agregar al Inventario",
			product_Category_add: "Crear",
			product_Category_choose: "Elegir",
			product_category_name: "Nombre de Categoría",
			product_Category_choose_category: "Elige una Categoría",
			product_Category_existent_category: "Categoría Actual",
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
			salary_record: "Registro de Sueldo",
			salary_expected: "Sueldo Esperado",
			commission_expected: "Comisión Esperada",
			salary_percentage: "Porcentaje",
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
			self_payment_settings: "Configuración de Mi Sueldo",
			payment_method: "Método de Pago",
			payment_amount: "Cantidad",
			salary_option: "Salario",
			salary_not_configured: "No ha sido configurado",
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
			reports_activity_log: "Registro de Actividades",
			reports_sales_reports: "Registro de Ventas",
			reports_starting_cash: "Utilidad del Período Previo",
			reports_ending_cash: "Utilidad del Período",
			reports_date: "Fecha",
			reports_price: "Precio",
			reports_qty: "Cant",
			reports_grand_total: "Total en Ventas",
			reports_no_sales: "No hay ventas en este periódo.",
			reports_time_frame: "Período de Tiempo",
			reports_header_day: 'Dia',
			reports_header_week: 'Semana',
			reports_header_month: 'Mes',
			reports_sale: "Venta",
			reports_expense_log: "Registro de Gastos",
			reports_cash: 'Efectivo',
			edit_title: "Editar",
			new_title: "Nuevo",
			inventory_item: "Artículo de Inventario",
			cash_balance: 'Saldo',
			income_statement_profit: 'Ganancia (Pérdida) Neta ',
			income_statement_income_header: 'Ingresos',
			income_statement_total_income: 'Total Ingresos',
			income_statement_expenses_header: 'Gastos',
			income_statement_fixed: 'Fijo',
			income_statement_variable: 'Variable',
			income_statement_total_expenses: 'Total Gastos',
			income_statement_type: 'Tipo',
			income_statement_name: 'Nombre',
			cash_title: "Infusión de Efectivo",
			cash_amount: "Cantidad",
			cash_date: "Fecha",
			including_tax: "I.V.A incluido",
			checkout_options: "Opciones de Impuestos",
			edit_tax: "Editar I.V.A",
			tax_name: "I.V.A",
			tax_inactive: "Inactivo",
			tax_active: "Activo",
			tax_enabled: "Habilitado",
			settings_acknowledgment: "Reconocimiento",
			required_error: 'Campo Requerido',
			invalid_number_error: 'Número no válido',
			negative_error: 'Número negativo no permitida',
			out_of_range_error: 'Fuera de rango',
			commission_too_high_error: 'La Comisión no puede ser superior al 100%'

		});

		$translateProvider.preferredLanguage("en");
		$translateProvider.fallbackLanguage("en");


		// if none of the above states are matched, use this as the fallback
		$urlRouterProvider.otherwise('app/sales');
	}
})();
