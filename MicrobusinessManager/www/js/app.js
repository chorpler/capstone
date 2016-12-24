(function () {
	angular.module('app', [
		'ionic',
		'ionic.native',
		'ngCordova',
		'ngCsvImport',
		'ngStorage',
		'ng-persist',
		'pdf',
		'app.expenses',
		'app.inventory',
		'app.products',
		'app.reports',
		'app.sales',
		'app.settings',
		'app.salary',
		'pascalprecht.translate',
		'tmh.dynamicLocale',
		'ui.router'
	])
	.run(run)
	.config(config);

	var languageTable = 'languages';
	var selectedLanguage = {};
	var items = [];
	var win = window;

	var languageStrings = {
		menu_title: ["Menu", "Menú"],
		menu_sales: ["Sales", "Ventas"],
		menu_products: ["Products", "Productos"],
		menu_inventory: ["Inventory", "Inventario"],
		menu_expenses: ["Expenses", "Gastos"],
		menu_salary: ["Salary", "Sueldo"],
		menu_reports: ["Reports", "Reportes"],
		menu_settings: ["Settings", "Configuraciones"],
		add_button: ["Add", "Añadir"],
		cancel_button: ["Cancel", "Cancelar Venta"],
		cancel_sale_button: ["Cancel Sale", "Agregar"],
		save_button: ["Save", "Guardar"],
		login_button: ["Log In", "Accesar Cuenta"],
		logout_button: ["Log Out", "Terminar Sesión"],
		close_button: ["Close", "Crear Cuenta"],
		register_button: ["Register", "Cerrar"],
		placehoder_search: ["Search", "Buscar"],
		sales_reset: ["Clear", "Borrar"],
		sales_checkout: ["Checkout", "Registrar Venta"],
		sales_name: ["Product", "Producto"],
		sales_price: ["Price", "Precio"],
		sales_limit: ["Limit", "Límite"],
		sales_category: ["Categories", "Categorías"],
		sales_all: ["All", "Mostrar Todas"],
		sales_no_product: ["You have not added any products. Go to the Products page and add some.", "No haz agregado ningún producto. Ve a Productos y agrega uno o más."],
		sales_error_part1: [" has only ", " solo tiene "],
		sales_error_part2: [" in inventory. You cannot sell more than ", " en inventario. No puedes vender más de "],
		sales_edit_product_back: ["Back", "Regresar"],
		sales_edit_quantity: ["Edit Quantity", "Editar Cantidad"],
		sales_total_sale: ["Total Sales Price", "Venta Total"],
		sales_record: ["Record", "Registrar"],
		sale_products_total: ["Sale Products", "Productos en esta Transacción"],
		product_sales_price: ["Sales Price", "Precio de Venta"],
		product_name: ["Product Name", "Nombre del Producto"],
		product_edit: ["Edit", "Editar"],
		product_new: ["New", "Nuevo"],
		product_title: [" Product", " Producto"],
		product_category: ["Category", "Categoría"],
		product_new_Category: ["New Category", "Nueva Categoría"],
		product_add_inventory: ["Add Inventory", "Ingresa Nombre de Nueva Categoría"],
		product_Category_add: ["Add", "Agregar al Inventario"],
		product_Category_choose: ["Choose", "Crear"],
		product_input_category: ["Enter name of new Category", "Elegir"],
		product_Category_choose_category: ["Choose Category", "Nombre de Categoría"],
		product_Category_existent_category: ["Current Category", "Elige una Categoría"],
		product_category_name: ["Category Name", "Categoría Actual"],
		inventory_add_product: ["Make Product", "Es Producto"],
		inventory_name: ["Name", "Artículo"],
		inventory_add_name: ["Inventory Item Name", "Nombre del artículo de Inventario"],
		inventory_quantity: ["Quantity", "Cantidad"],
		inventory_total_cost: ["Total Cost", "Costo Total"],
		inventory_total_comments: ["Comments", "Comentarios"],
		inv_exp_sal_date: ["Date", "Fecha"],
		expenses_expenses_log: ["Expenses Log", "Registro de Gastos"],
		expenses_new_expense: ["Expense Record", "Registro de Gastos"],
		expenses_total_expenses: ["Total Expenses", "Total de Gastos"],
		expense_name: ["Expense Name", "Nombre del Gasto"],
		expense_amount: ["Amount", "Cantidad Gastada"],
		expense_type: ["Expense Type", "Tipo de Gasto"],
		expense_variable: ["Variable", "Variable"],
		expense_fixed: ["Fixed", "Fijo"],
		expense_history: ["Recent Expenses", "Gastos Recientes"],
		add_expense: ["Add Expense", "Agregar Gasto"],
		salary_record: ["Salary Record", "Registro de Sueldo"],
		salary_expected: ["Expected Salary", "Sueldo Esperado"],
		commission_expected: ["Expected Commission", "Comisión Esperada"],
		salary_percentage: ["Percentage", "Porcentaje"],
		salary_register: ["Register", "Registrar"],
		salary_adjust: ["Adjust", "Ajustar"],
		salary_no_comission: ["Go to Settings and Set Self Payment to use this feature.", "Ve a Configuraciones y establece el método de sueldo para usar esta función."],
		salary_name: ["Name", "Nombre"],
		salary_amount: ["Amount", "Cantidad"],
		salary_not_configured: ["Not configured yet", "Comentarios"],
		salary_comments: ["Comments", "Fecha"],
		salary_Date: ["Date", "Salario ($)"],
		salary_placeholder: ["Salary ($)", "Lo sentimos! Solamente tienes $"],
		salary_message_1: ["Sorry! You only have $", " disponible. Ajusta la cantidad para que la diferencia sea menor o igual a lo que tienes disponible."],
		salary_message_2: [" available. Adjust the amount so that the difference is less than or equal to what you have on hand.", "Configuración de Mi Sueldo"],
		self_payment_settings: ["Self Payment Settings", "Método de Pago"],
		payment_method: ["Self Payment Method", "Cantidad"],
		payment_amount: ["Payment Amount", "Salario"],
		salary_option: ["Salary", "No ha sido configurado"],
		commission_option: ["Commission", "Comisión"],
		settings_username: ["Username", "Nombre de Usuario"],
		settings_password: ["Password", "Contraseña"],
		settings_confirm_password: ["Confirm Password", "Confirmar contraseña"],
		settings_email: ["Email", "Correo Electrónico"],
		settings_phone: ["Phone", "Teléfono"],
		settings_language_preference: ["Language Preference", "Preferencia de Idioma"],
		settings_language_options: ["Languages", "Idiomas"],
		english_language: ["English", "Inglés"],
		spanish_language: ["Spanish", "Español"],
		reports_income_statement: ["Income Statement", "Estado de Ganancias y Pérdidas"],
		reports_activity_log: ["Activity Log", "Registro de Actividades"],
		reports_sales_reports: ["Sales Log", "Registro de Ventas"],
		reports_starting_cash: ["Starting Cash", "Utilidad del Período Previo"],
		reports_ending_cash: ["Ending Cash", "Utilidad del Período"],
		reports_date: ["Date", "Fecha"],
		reports_price: ["Price", "Precio"],
		reports_qty: ["Qty", "Cant"],
		reports_grand_total: ["Grand Total", "Total en Ventas"],
		reports_no_sales: ["There are no sales in this time period.", "No hay ventas en este periódo."],
		reports_expense_log: ["Expense Log", "Período de Tiempo"],
		reports_time_frame: ["Time Frame", 'Dia'],
		reports_header_day: ["Day", "Semana"],
		reports_header_week: ["Week", "Mes"],
		reports_header_month: ['Month', "Venta"],
		reports_sale: ["Sale", "Registro de Gastos"],
		reports_cash: ["Cash", "Efectivo"],
		edit_title: ["Edit", "Editar"],
		new_title: ["New", "Nuevo"],
		inventory_item: ["Inventory Item", "Artículo de Inventario"],
		cash_balance: ["Cash Balance", "Saldo"],
		income_statement_profit: ["Profit (or Loss)", "Ganancia (Pérdida) Neta "],
		income_statement_income_header: ["Income", "Ingresos"],
		income_statement_total_income: ["Total Income", "Ingresos Totales"],
		income_statement_expenses_header: ["Expenses", "Gastos"],
		income_statement_fixed: ["Fixed", "Fijo"],
		income_statement_variable: ["Variable", "Variable"],
		income_statement_total_expenses: ["Total Expenses", "Gastos Totales"],
		income_statement_type: ["Type", "Tipo"],
		income_statement_name: ["Name", "Nombre"],
		cash_title: ["Cash Infusion", "Infusión de Efectivo"],
		cash_amount: ["Amount", "Cantidad"],
		cash_date: ["Date", "Fecha"],
		including_tax: ["Including Tax", "I.V.A incluido"],
		checkout_options: ["Tax Options", "Opciones de Impuestos"],
		edit_tax: ["Edit Tax", "Editar I.V.A"],
		tax_name: ["Sales Tax", "I.V.A"],
		tax_inactive: ["Inactive", "Inactivo"],
		tax_active: ["Active", "Activo"],
		tax_enabled: ["Enabled", "Habilitado"],
		settings_acknowledgment: ["Acknowledgments", "Reconocimiento"],
		required_error: ["Required Field", "Campo Requerido"],
		invalid_number_error: ["Invalid Number", "Número no válido"],
		negative_error: ["Negative number not allowed", "Número negativo no permitida"],
		out_of_range_error: ["Out of range", "Fuera de rango"],
		commission_too_high_error: ["Commission cannot be higher than 100%", "La Comisión no puede ser superior al 100%"],
		user_options: ["Organization Info", "Información de la Organización"],
		org_title: ["Organization", "Organización"],
		org_name: ["Organization Name", "Nombre de la Organización"],
		org_rep: ["Representative", "Representante"],
		org_address: ["Address", "Dirección"],
		org_street1: ["Street Address 1", "Dirección 1"],
		org_street2: ["Street Address 2", "Dirección 2"],
		org_city: ["City", "Ciudad"],
		org_state: ["State", "Estado"],
		org_postal: ["ZIP Code", "Codigo postal"],
		user_email: ["Email Address", "Correo Electrónico"],
		user_phone: ["Phone", "Teléfono"],
		user_filled: ["Entered", "Entró"],
		user_empty: ["Not Entered", "No Entró"],
		str_generate_pdf: ["Generate PDF", "Generar PDF"],
		str_import: ["Import", "Importar"],
		str_export: ["Export", "Exportar"],
		str_sendto: ["Send to …", "Enviar a …"],
		str_emailpdf: ["Email PDF", "Envíe PDF por Correo Electrónico"],
		str_download: ["Download", "Descargar"],
		str_downloading: ["Downloading", "Descargando"],
		str_download_csv: ["Download CSV", "Descargar CSV"],
		str_url: ["URL", "URL"],
		str_error: ["Error", "Error"],
		str_settings: ["Settings", "Configuración"],
		str_download_settings: ["Download Settings", "Descargar Configuración"],
		str_import_settings: ["Import Settings", "Importar Configuración"],
		str_export_settings: ["Export Settings", "Exportar Configuración"],
		str_date: ["Date", "Fecha"],
		str_name: ["Name", "Nombre"],
		str_income: ["Income", "Ingresos"],
		str_expense: ["Expense", "Gastos"],
		str_expenses: ["Expenses", "Gastos"],
		str_amount: ["Amount", "Cantidad"],
		str_cash: ["Cash", "Efectivo"],
		str_daily: ["Daily", "Diario"],
		str_weekly: ["Weekly", "Semanal"],
		str_monthly: ["Monthly", "Mensual"],
		str_format_preferences: ["Format Preferences", "Preferencias de Formato"],
		str_date_format: ["Date Format", "Formato de Fecha"],
		str_total_income: ["Total Income", "Ingresos Totales"],
		str_total_expenses: ["Total Expenses", "Gastos Totales"],
		str_total_profit: ["Total Profit", "Ganancias Totales"],
		str_delete_sale: ["Delete Sale", "Borrar Venta"],
		str_are_you_sure: ["Are you sure?", "¿Estás seguro?"],
		str_cancel: ["Cancel", "Cancelar"],
		str_item: ["Item", "Ítem"],
		str_quantity: ["Quantity", "Cantidad"],
		str_product: ["Product", "Producto"],
		str_price: ["Price", "Precio"],
		str_unit_price: ["Unit Price", "Precio Unitario"],
		str_total_price: ["Total Price", "Precio Total"],
		str_sale_total: ["Sale Total", "Venta Total"],
		str_grand_total: ["Grand Total", "Total en Ventas"],
		str_total_sales: ["Total Sales", "Ventas Totales"],
		str_sale: ["Sale", "Venta"],
		str_time_period_no_sales: ["No sales in this time period", "No hay ventas en este período de tiempo"],
		str_time_period_no_expenses: ["No expenses in this time period", "No hay gastos en este período de tiempo"],
		str_time_period_no_income: ["No income in this time period", "Ningún ingreso en este período de tiempo"],
		str_time_period_no_transactions: ["No transactions in this time period", "Ninguna transacción en este período de tiempo"],
		str_ok: ["OK", "De Acuerdo"],
		str_import_settings: ["Import Settings", "Importar Ajustes"],
		str_import_error: ["Import Error", "Error de Importación"],
		str_import_error_message: ["No valid import data found", "No se han encontrado datos de importación válidos"],
		str_import_canceled: ["Import canceled", "Importación cancelada"],
		str_import_warning: ["Are you sure? This will erase all existing data!", "¿Estás seguro? ¡Esto borrará todos los datos existentes!"]
	};

	function getStringSet(strings, index) {
		var langStrings = {};
		for(var key in strings) {
			var oneSet = strings[key];
			langStrings[key] = oneSet[index];
		}
		return langStrings;
	}

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
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
				cordova.plugins.Keyboard.disableScroll(true);
			}

			if (window.StatusBar) {
				StatusBar.styleDefault();
			}
			$rootScope.numberPattern = '[0-9]+([,\.][0-9]+)?';
		});

	}

	function config ($stateProvider, $urlRouterProvider, $translateProvider, $ionicConfigProvider) {
		$stateProvider
		.state('app', {
			url: '/app',
			abstract: true,
			templateUrl: 'templates/menu.html',
			controller: 'AppController',
			controllerAs: 'app'
		});
		$ionicConfigProvider.views.swipeBackEnabled(false);

		var enStrings = getStringSet(languageStrings, 0);
		var esStrings = getStringSet(languageStrings, 1);
		win.enStrings = enStrings;
		win.esStrings = esStrings;
		// Log.l("English strings:\n%s", JSON.stringify(enStrings));

		$translateProvider.translations('en', enStrings);
		$translateProvider.translations('es', esStrings);
/*
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
			commission_too_high_error: 'Commission cannot be higher than 100%',
			user_options: 'Organization Info',
			org_title: 'Organization',
			org_name: 'Organization Name',
			org_rep: 'Representative',
			org_address: 'Address',
			org_street1: 'Street Address 1',
			org_street2: 'Street Address 2',
			org_city: 'City',
			org_state: 'State',
			org_postal: 'ZIP Code',
			user_email: 'Email Address',
			user_phone: 'Phone',
			user_filled: 'Entered',
			user_empty: 'Not Entered',
			str_generate_pdf: 'Generate PDF',
			str_import: 'Import',
			str_export: 'Export',
			str_sendto: 'Send to …',
			str_emailpdf: 'Email PDF',
			str_download: 'Download',
			str_downloading: 'Downloading',
			str_download_csv: 'Download CSV',
			str_url: 'URL',
			str_error: 'Error',
			str_settings: 'Settings',
			str_download_settings: 'Download Settings',
			str_import_settings: 'Import Settings',
			str_export_settings: 'Export Settings',
			str_date: "Date",
			str_name: "Name",
			str_income: "Income",
			str_expense: "Expense",
			str_cash: "Cash",
			str_daily: 'Daily',
			str_weekly: 'Weekly',
			str_monthly: 'Monthly'
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
			commission_too_high_error: 'La Comisión no puede ser superior al 100%',
			user_options: 'Información de la Organización',
			org_title: 'Organización',
			org_name: 'Nombre de la Organización',
			org_rep: 'Representante',
			org_address: 'Dirección',
			org_street1: 'Dirección 1',
			org_street2: 'Dirección 2',
			org_city: 'Ciudad',
			org_state: 'Estado',
			org_postal: 'Codigo postal',
			user_email: 'Correo Electrónico',
			user_phone: 'Teléfono',
			user_filled: 'Entró',
			user_empty: 'No Entró',
			str_generate_pdf: 'Generar PDF',
			str_import: 'Importar',
			str_export: 'Exportar',
			str_sendto: 'Enviar a …',
			str_emailpdf: 'Envíe PDF por Correo Electrónico',
			str_download: 'Descargar',
			str_downloading: 'Descargando',
			str_download_csv: 'Descargar CSV',
			str_url: 'URL',
			str_error: 'Error',
			str_settings: 'Configuración',
			str_download_settings: 'Descargar Configuración',
			str_import_settings: 'Importar Configuración',
			str_export_settings: 'Exportar Configuración',
			str_date: "Fecha",
			str_name: "Nombre",
			str_income: "Ingresos",
			str_expense: "Gastos",
			str_cash: "Efectivo",
			str_daily: 'Diario',
			str_weekly: 'Semanal',
			str_monthly: 'Mensual'
		});
*/

		$translateProvider.preferredLanguage("en");
		$translateProvider.fallbackLanguage("en");

		// Enable sanitization via escaping of HTML
		$translateProvider.useSanitizeValueStrategy('sanitize');


		// if none of the above states are matched, use this as the fallback
		$urlRouterProvider.otherwise('app/sales');
	}
})();
