(function() {
	angular.module('app', [
			'ionic',
			'ionic.native',
			'ngCordova',
			// 'ngCsvImport',
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
		"add_button": ["Add", "Agregar"],
		"add_expense": ["Add Expense", "Agregar Gasto"],
		"cancel_button": ["Cancel", "Cancelar"],
		"cancel_sale_button": ["Cancel Sale", "Cancelar Venta"],
		"cash_amount": ["Amount", "Cantidad"],
		"cash_balance": ["Cash Balance", "Saldo"],
		"cash_date": ["Date", "Fecha"],
		"cash_title": ["Cash Infusion", "Infusión de Efectivo"],
		"checkout_options": ["Tax Options", "Opciones de Impuestos"],
		"close_button": ["Close", "Cerrar"],
		"commission_expected": ["Expected Commission", "Comisión Esperada"],
		"commission_option": ["Commission", "Comisión"],
		"commission_too_high_error": ["Commission cannot be higher than 100%", "La Comisión no puede ser superior al 100%"],
		"edit_tax": ["Edit Tax", "Editar I.V.A"],
		"edit_title": ["Edit", "Editar"],
		"english_language": ["English", "Inglés"],
		"expense_amount": ["Amount", "Cantidad Gastada"],
		"expense_fixed": ["Fixed", "Fijo"],
		"expense_history": ["Recent Expenses", "Gastos Recientes"],
		"expense_name": ["Expense Name", "Nombre del Gasto"],
		"expense_type": ["Expense Type", "Tipo de Gasto"],
		"expense_variable": ["Variable", "Variable"],
		"expenses_expenses_log": ["Expenses Log", "Registro de Gastos"],
		"expenses_new_expense": ["Expense Record", "Registro de Gastos"],
		"expenses_total_expenses": ["Total Expenses", "Total de Gastos"],
		"including_tax": ["Including Tax", "I.V.A incluido"],
		"income_statement_expenses_header": ["Expenses", "Gastos"],
		"income_statement_fixed": ["Fixed", "Fijo"],
		"income_statement_income_header": ["Income", "Ingresos"],
		"income_statement_name": ["Name", "Nombre"],
		"income_statement_profit": ["Profit (or Loss)", "Ganancia (Pérdida) Neta"],
		"income_statement_total_expenses": ["Total Expenses", "Total Gastos"],
		"income_statement_total_income": ["Total Income", "Total Ingresos"],
		"income_statement_type": ["Type", "Tipo"],
		"income_statement_variable": ["Variable", "Variable"],
		"inv_exp_sal_date": ["Date", "Fecha"],
		"invalid_number_error": ["Invalid Number", "Número no válido"],
		"inventory_add_name": ["Inventory Item Name", "Nombre del artículo de Inventario"],
		"inventory_add_product": ["Make Product", "Es Producto"],
		"inventory_item": ["Inventory Item", "Artículo de Inventario"],
		"inventory_name": ["Name", "Artículo"],
		"inventory_quantity": ["Quantity", "Cantidad"],
		"inventory_total_comments": ["Comments", "Comentarios"],
		"inventory_total_cost": ["Total Cost", "Costo Total"],
		"login_button": ["Log In", "Accesar Cuenta"],
		"logout_button": ["Log Out", "Terminar Sesión"],
		"menu_expenses": ["Expenses", "Gastos"],
		"menu_inventory": ["Inventory", "Inventario"],
		"menu_products": ["Products", "Productos"],
		"menu_reports": ["Reports", "Reportes"],
		"menu_salary": ["Salary", "Sueldo"],
		"menu_sales": ["Sales", "Ventas"],
		"menu_settings": ["Settings", "Configuraciones"],
		"menu_title": ["Menu", "Menú"],
		"negative_error": ["Negative number not allowed", "Número negativo no permitida"],
		"new_title": ["New", "Nuevo"],
		"out_of_range_error": ["Out of range", "Fuera de rango"],
		"payment_amount": ["Payment Amount", "Cantidad"],
		"payment_method": ["Self Payment Method", "Método de Pago"],
		"placehoder_search": ["Search", "Buscar"],
		"product_Category_add": ["Add", "Crear"],
		"product_Category_choose": ["Choose", "Elegir"],
		"product_Category_choose_category": ["Choose Category", "Elige una Categoría"],
		"product_Category_existent_category": ["Current Category", "Categoría Actual"],
		"product_add_inventory": ["Add Inventory", "Agregar al Inventario"],
		"product_category": ["Category", "Categoría"],
		"product_category_name": ["Category Name", "Nombre de Categoría"],
		"product_edit": ["Edit", "Editar"],
		"product_input_category": ["Enter name of new Category", "Ingresa Nombre de Nueva Categoría"],
		"product_name": ["Product Name", "Nombre del Producto"],
		"product_new": ["New", "Nuevo"],
		"product_new_Category": ["New Category", "Nueva Categoría"],
		"product_sales_price": ["Sales Price", "Precio de Venta"],
		"product_title": ["Product", "Producto"],
		"register_button": ["Register", "Crear Cuenta"],
		"reports_activity_log": ["Activity Log", "Registro de Actividades"],
		"reports_cash": ["Cash", "Efectivo"],
		"reports_date": ["Date", "Fecha"],
		"reports_ending_cash": ["Ending Cash", "Utilidad del Período"],
		"reports_expense_log": ["Expense Log", "Registro de Gastos"],
		"reports_grand_total": ["Grand Total", "Total en Ventas"],
		"reports_header_day": ["Day", "Dia"],
		"reports_header_month": ["Month", "Mes"],
		"reports_header_week": ["Week", "Semana"],
		"reports_income_statement": ["Income Statement", "Estado de Ganancias y Pérdidas"],
		"reports_no_sales": ["There are no sales in this time period.", "No hay ventas en este periódo."],
		"reports_price": ["Price", "Precio"],
		"reports_qty": ["Qty", "Cant"],
		"reports_sale": ["Sale", "Venta"],
		"reports_sales_reports": ["Sales Log", "Registro de Ventas"],
		"reports_starting_cash": ["Starting Cash", "Utilidad del Período Previo"],
		"reports_time_frame": ["Time Frame", "Período de Tiempo"],
		"required_error": ["Required Field", "Campo Requerido"],
		"salary_Date": ["Date", "Fecha"],
		"salary_adjust": ["Adjust", "Ajustar"],
		"salary_amount": ["Amount", "Cantidad"],
		"salary_comments": ["Comments", "Comentarios"],
		"salary_expected": ["Expected Salary", "Sueldo Esperado"],
		"salary_message_1": ["Sorry! You only have $", "Lo sentimos! Solamente tienes $"],
		"salary_message_2": [" available. Adjust the amount so that the difference is less than or equal to what you have on hand.", " disponible. Ajusta la cantidad para que la diferencia sea menor o igual a lo que tienes disponible."],
		"salary_name": ["Name", "Nombre"],
		"salary_no_comission": ["Go to Settings and Set Self Payment to use this feature.", "Ve a Configuraciones y establece el método de sueldo para usar esta función."],
		"salary_not_configured": ["Not configured yet", "No ha sido configurado"],
		"salary_option": ["Salary", "Salario"],
		"salary_percentage": ["Percentage", "Porcentaje"],
		"salary_placeholder": ["Salary ($)", "Salario ($)"],
		"salary_record": ["Salary Record", "Registro de Sueldo"],
		"salary_register": ["Register", "Registrar"],
		"sale_products_total": ["Sale Products", "Productos en esta Transacción"],
		"sales_all": ["All", "Mostrar Todas"],
		"sales_category": ["Categories", "Categorías"],
		"sales_checkout": ["Checkout", "Registrar Venta"],
		"sales_edit_product_back": ["Back", "Regresar"],
		"sales_edit_quantity": ["Edit Quantity", "Editar Cantidad"],
		"sales_error_part1": [" has only ", " solo tiene "],
		"sales_error_part2": [" in inventory. You cannot sell more than ", " en inventario. No puedes vender más de "],
		"sales_limit": ["Limit", "Límite"],
		"sales_name": ["Product", "Producto"],
		"sales_no_product": ["You have not added any products. Go to the Products page and add some.", "No haz agregado ningún producto. Ve a Productos y agrega uno o más."],
		"sales_price": ["Price", "Precio"],
		"sales_record": ["Record", "Registrar"],
		"sales_reset": ["Clear", "Borrar"],
		"sales_total_sale": ["Total Sales Price", "Venta Total"],
		"save_button": ["Save", "Guardar"],
		"self_payment_settings": ["Self Payment Settings", "Configuración de Mi Sueldo"],
		"settings_acknowledgment": ["Acknowledgments", "Reconocimiento"],
		"settings_confirm_password": ["Confirm Password", "Confirmar contraseña"],
		"settings_email": ["Email", "Correo Electrónico"],
		"settings_language_options": ["Languages", "Idiomas"],
		"settings_language_preference": ["Language Preference", "Preferencia de Idioma"],
		"settings_password": ["Password", "Contraseña"],
		"settings_phone": ["Phone", "Teléfono"],
		"settings_username": ["Username", "Nombre de Usuario"],
		"spanish_language": ["Spanish", "Español"],
		"tax_active": ["Active", "Activo"],
		"tax_enabled": ["Enabled", "Habilitado"],
		"tax_inactive": ["Inactive", "Inactivo"],
		"tax_name": ["Sales Tax", "I.V.A"],
		"user_options": ["Organization Info", "Información de la Organización"],
		"org_title": ["Organization", "Organización"],
		"org_name": ["Organization Name", "Negocio"],
		"org_rep": ["Representative", "Representante"],
		"org_address": ["Address", "Dirección"],
		"org_street1": ["Street Address 1", "Dirección 1"],
		"org_street2": ["Street Address 2", "Dirección 2"],
		"org_city": ["City", "Ciudad"],
		"org_state": ["State", "Estado"],
		"org_postal": ["ZIP Code", "Codigo postal"],
		"user_email": ["Email Address", "Correo Electrónico"],
		"user_phone": ["Phone", "Teléfono"],
		"user_filled": ["Entered", "Entró"],
		"user_empty": ["Not Entered", "No Entró"],
		"str_generate_pdf": ["Generate PDF", "Generar PDF"],
		"str_import": ["Import", "Importar"],
		"str_export": ["Export", "Exportar"],
		"str_sendto": ["Send to …", "Enviar a …"],
		"str_emailpdf": ["Email PDF", "Envíe PDF por Correo Electrónico"],
		"str_download": ["Download", "Descargar"],
		"str_downloading": ["Downloading", "Descargando"],
		"str_download_csv": ["Download CSV", "Descargar CSV"],
		"str_url": ["URL", "URL"],
		"str_error": ["Error", "Error"],
		"str_settings": ["Settings", "Configuración"],
		"str_download_settings": ["Download Settings", "Descargar Configuración"],
		"str_import_settings": ["Import Settings", "Importar Configuración"],
		"str_export_settings": ["Export Settings", "Exportar Configuración"],
		"str_date": ["Date", "Fecha"],
		"str_name": ["Name", "Nombre"],
		"str_income": ["Income", "Ingresos"],
		"str_expense": ["Expense", "Gastos"],
		"str_expenses": ["Expenses", "Gastos"],
		"str_amount": ["Amount", "Cantidad"],
		"str_cash": ["Cash", "Efectivo"],
		"str_daily": ["Daily", "Diario"],
		"str_weekly": ["Weekly", "Semanal"],
		"str_monthly": ["Monthly", "Mensual"],
		"str_format_preferences": ["Format Preferences", "Preferencias de Formato"],
		"str_date_format": ["Date Format", "Formato de Fecha"],
		"str_total_income": ["Total Income", "Ingresos Totales"],
		"str_total_expenses": ["Total Expenses", "Gastos Totales"],
		"str_total_profit": ["Total Profit", "Ganancias Totales"],
		"str_delete_sale": ["Delete Sale", "Borrar Venta"],
		"str_are_you_sure": ["Are you sure?", "¿Estás seguro?"],
		"str_cancel": ["Cancel", "Cancelar"],
		"str_item": ["Item", "Ítem"],
		"str_quantity": ["Quantity", "Cantidad"],
		"str_product": ["Product", "Producto"],
		"str_price": ["Price", "Precio"],
		"str_unit_price": ["Unit Price", "Precio Unitario"],
		"str_total_price": ["Total Price", "Precio Total"],
		"str_sale_total": ["Sale Total", "Venta Total"],
		"str_grand_total": ["Grand Total", "Total en Ventas"],
		"str_total_sales": ["Total Sales", "Ventas Totales"],
		"str_sale": ["Sale", "Venta"],
		"str_time_period_no_sales": ["No sales in this time period", "No hay ventas en este período de tiempo"],
		"str_time_period_no_expenses": ["No expenses in this time period", "No hay gastos en este período de tiempo"],
		"str_time_period_no_income": ["No income in this time period", "Ningún ingreso en este período de tiempo"],
		"str_time_period_no_transactions": ["No transactions in this time period", "Ninguna transacción en este período de tiempo"],
		"str_ok": ["OK", "De Acuerdo"],
		"str_import_settings": ["Import Settings", "Importar Ajustes"],
		"str_import_error": ["Import Error", "Error de Importación"],
		"str_import_error_message": ["No valid import data found", "No se han encontrado datos de importación válidos"],
		"str_import_canceled": ["Import canceled", "Importación cancelada"],
		"str_import_warning": ["Are you sure? This will erase all existing data!", "¿Estás seguro? ¡Esto borrará todos los datos existentes!"],
		"str_email_not_available": ["E-mail not available. You may need to set up your e-mail account.", "Correo electrónico no disponible. Es posible que deba configurar su cuenta de correo electrónico."],
		"str_this_is_new_expense": ["This is a new expense. You are not editing a past expense. We have pre-filled this form with the information of the most recent expense that matches this expense's name.", "Este es un nuevo gasto. No estas editando un registro de un gasto pasado. Hemos llenado este formulario con los datos de tu más reciente gasto que coincide con este nombre."],
		"str_important": ["Important!", "¡Importante!"],
		"str_continue": ["Continue", "Continuar"],
		"str_success": ["Success!", "¡Buenas Noticias!"],
		"str_message_expense_recorded": ["Expense has been recorded. If you want to see or edit it, go to the Expenses Log under Reports.", "Gasto se ha guardado exitosamente. Si deseas verlo o editarlo, ve al Registro de Gastos en Reportes."],
		"str_delete_expense_title": ["Delete Expense", "Eliminar Gastos"],
		"str_delete_expense_text": ["Are you sure you want to delete this expense?", "¿Seguro que quieres borrar este gasto?"],
		"str_delete": ["Delete", "Borrar"],
		"str_yes": ["Yes", "Si"],
		"str_no": ["No", "No"],
		"str_not_implemented": ["Feature not implemented in this version.", "Característica no implementada en esta versión."],
		"str_currency_icon": ["ion-social-usd", "ion-social-usd"]
	};

	function getStringSet(strings, index) {
		var langStrings = {};
		for (var key in strings) {
			var oneSet = strings[key];
			langStrings[key] = oneSet[index];
		}
		return langStrings;
	}

	function run($rootScope, $ionicPlatform, Database, $translate, tmhDynamicLocale) {
		$ionicPlatform.ready(function() {

			Database.select(languageTable).then(function(response) {
				if (response.rows.length === 0) {
					navigator.globalization.getPreferredLanguage(function(language) {
						var trimLanguage = (language.value).split('-')[0];
						if (trimLanguage === 'en' || trimLanguage === 'es' || trimLanguage === 'pt') {
							$translate.use(trimLanguage).then(function(data) {
								if (data === 'es') {
									tmhDynamicLocale.set('es-mx');
								// } else if (data === 'pt') {
								// 	tmhDynamicLocale.set('pt-br');
								} else if (data === 'en') {
									tmhDynamicLocale.set('en-us');
								}
								Database.insert(languageTable, [data]).then(function(response) {
									language.id = response.insertId;
								});
							}, function(error) {
								console.log("ERROR -> " + error);
							});
						} else {
							Database.insert(languageTable, ['en']).then(function(response) {
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
						tmhDynamicLocale.set('es-mx');
					} else if (selectedLanguage.type === 'en') {
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

	function config($stateProvider, $urlRouterProvider, $translateProvider, $ionicConfigProvider) {
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
		// var ptStrings = getStringSet(languageStrings, 2);
		win.enStrings = enStrings;
		win.esStrings = esStrings;
		// win.ptStrings = ptStrings;
		// Log.l("English strings:\n%s", JSON.stringify(enStrings));

		$translateProvider.translations('en', enStrings);
		$translateProvider.translations('es', esStrings);
		// $translateProvider.translations('pt', ptStrings);

		$translateProvider.preferredLanguage("en");
		$translateProvider.fallbackLanguage("en");

		// Enable sanitization via escaping of HTML
		$translateProvider.useSanitizeValueStrategy('escape');


		// if none of the above states are matched, use this as the fallback
		$urlRouterProvider.otherwise('app/sales');
	}
})();

