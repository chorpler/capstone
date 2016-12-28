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
		menu_title: ["Menu", "Menú", "Cardápio"],
		menu_sales: ["Sales", "Ventas", "Vendas"],
		menu_products: ["Products", "Productos", "Produtos"],
		menu_inventory: ["Inventory", "Inventario", "Inventário"],
		menu_expenses: ["Expenses", "Gastos", "Despesas"],
		menu_salary: ["Salary", "Sueldo", "Salário"],
		menu_reports: ["Reports", "Reportes", "Relatórios"],
		menu_settings: ["Settings", "Configuraciones", "Configurações"],
		add_button: ["Add", "Añadir", "Adicionar"],
		cancel_button: ["Cancel", "Cancelar Venta", "Cancelar"],
		cancel_sale_button: ["Cancel Sale", "Agregar", "Cancelar a venda"],
		save_button: ["Save", "Guardar", "Salvar"],
		login_button: ["Log In", "Accesar Cuenta", "Entrar"],
		logout_button: ["Log Out", "Terminar Sesión", "Sair"],
		close_button: ["Close", "Crear Cuenta", "Fechar"],
		register_button: ["Register", "Cerrar", "Registrar"],
		placehoder_search: ["Search", "Buscar", "Pesquisa"],
		sales_reset: ["Clear", "Borrar", "Claro"],
		sales_checkout: ["Checkout", "Registrar Venta", "Confira"],
		sales_name: ["Product", "Producto", "Produto"],
		sales_price: ["Price", "Precio", "Preço"],
		sales_limit: ["Limit", "Límite", "Limite"],
		sales_category: ["Categories", "Categorías", "Categorias"],
		sales_all: ["All", "Mostrar Todas", "Todos"],
		sales_no_product: ["You have not added any products. Go to the Products page and add some.", "No haz agregado ningún producto. Ve a Productos y agrega uno o más.", "Você não adicionou nenhum produto. Vá para a página Produtos e adicione alguns."],
		sales_error_part1: ["has only", "solo tiene", "Tem apenas"],
		sales_error_part2: ["in inventory. You cannot sell more than", "en inventario. No puedes vender más de", "No inventário. Você não pode vender mais do que"],
		sales_edit_product_back: ["Back", "Regresar", "Costas"],
		sales_edit_quantity: ["Edit Quantity", "Editar Cantidad", "Editar Quantidade"],
		sales_total_sale: ["Total Sales Price", "Venta Total", "Preço Total de Vendas"],
		sales_record: ["Record", "Registrar", "Registro"],
		sale_products_total: ["Sale Products", "Productos en esta Transacción", "Venda Produtos"],
		product_sales_price: ["Sales Price", "Precio de Venta", "Preços de venda"],
		product_name: ["Product Name", "Nombre del Producto", "Nome do Produto"],
		product_edit: ["Edit", "Editar", "Editar"],
		product_new: ["New", "Nuevo", "Novo"],
		product_title: ["Product", "Producto", "Produto"],
		product_category: ["Category", "Categoría", "Categoria"],
		product_new_Category: ["New Category", "Nueva Categoría", "Nova categoria"],
		product_add_inventory: ["Add Inventory", "Ingresa Nombre de Nueva Categoría", "Adicionar inventário"],
		product_Category_add: ["Add", "Agregar al Inventario", "Adicionar"],
		product_Category_choose: ["Choose", "Crear", "Escolher"],
		product_input_category: ["Enter name of new Category", "Elegir", "Digite o nome da nova categoria"],
		product_Category_choose_category: ["Choose Category", "Nombre de Categoría", "Escolher categoria"],
		product_Category_existent_category: ["Current Category", "Elige una Categoría", "Categoria atual"],
		product_category_name: ["Category Name", "Categoría Actual", "Nome da Categoria"],
		inventory_add_product: ["Make Product", "Es Producto", "Criar produto"],
		inventory_name: ["Name", "Artículo", "Nome"],
		inventory_add_name: ["Inventory Item Name", "Nombre del artículo de Inventario", "Nome do item do inventário"],
		inventory_quantity: ["Quantity", "Cantidad", "Quantidade"],
		inventory_total_cost: ["Total Cost", "Costo Total", "Custo total"],
		inventory_total_comments: ["Comments", "Comentarios", "Comentários"],
		inv_exp_sal_date: ["Date", "Fecha", "Encontro"],
		expenses_expenses_log: ["Expenses Log", "Registro de Gastos", "Registro de despesas"],
		expenses_new_expense: ["Expense Record", "Registro de Gastos", "Registro de despesas"],
		expenses_total_expenses: ["Total Expenses", "Total de Gastos", "Despesas totais"],
		expense_name: ["Expense Name", "Nombre del Gasto", "Nome da despesa"],
		expense_amount: ["Amount", "Cantidad Gastada", "Quantidade"],
		expense_type: ["Expense Type", "Tipo de Gasto", "Tipo de Despesa"],
		expense_variable: ["Variable", "Variable", "Variável"],
		expense_fixed: ["Fixed", "Fijo", "Fixo"],
		expense_history: ["Recent Expenses", "Gastos Recientes", "Despesas Recentes"],
		add_expense: ["Add Expense", "Agregar Gasto", "Adicionar Despesas"],
		salary_record: ["Salary Record", "Registro de Sueldo", "Registro de salário"],
		salary_expected: ["Expected Salary", "Sueldo Esperado", "salário esperado"],
		commission_expected: ["Expected Commission", "Comisión Esperada", "Comissão prevista"],
		salary_percentage: ["Percentage", "Porcentaje", "Percentagem"],
		salary_register: ["Register", "Registrar", "Registrar"],
		salary_adjust: ["Adjust", "Ajustar", "Ajustar"],
		salary_no_comission: ["Go to Settings and Set Self Payment to use this feature.", "Ve a Configuraciones y establece el método de sueldo para usar esta función.", "Vá para Definições e Definir pagamento próprio para utilizar esta funcionalidade."],
		salary_name: ["Name", "Nombre", "Nome"],
		salary_amount: ["Amount", "Cantidad", "Quantidade"],
		salary_not_configured: ["Not configured yet", "Comentarios", "Ainda não configurado"],
		salary_comments: ["Comments", "Fecha", "Comentários"],
		salary_Date: ["Date", "Salario ($)", "Encontro"],
		salary_placeholder: ["Salary ($)", "Lo sentimos! Solamente tienes $", "Salário ($)"],
		salary_message_1: ["Sorry! You only have $", "disponible. Ajusta la cantidad para que la diferencia sea menor o igual a lo que tienes disponible.", "Desculpa! Você só tem"],
		salary_message_2: ["available. Adjust the amount so that the difference is less than or equal to what you have on hand.", "Configuración de Mi Sueldo", "disponível. Ajuste o valor para que a diferença seja menor ou igual ao que você tem na mão."],
		self_payment_settings: ["Self Payment Settings", "Método de Pago", "Configurações de pagamento automático"],
		payment_method: ["Self Payment Method", "Cantidad", "Método de pagamento automático"],
		payment_amount: ["Payment Amount", "Salario", "Montante do Pagamento"],
		salary_option: ["Salary", "No ha sido configurado", "Salário"],
		commission_option: ["Commission", "Comisión", "Comissão"],
		settings_username: ["Username", "Nombre de Usuario", "Nome de usuário"],
		settings_password: ["Password", "Contraseña", "Senha"],
		settings_confirm_password: ["Confirm Password", "Confirmar contraseña", "Confirme a Senha"],
		settings_email: ["Email", "Correo Electrónico", "O email"],
		settings_phone: ["Phone", "Teléfono", "Telefone"],
		settings_language_preference: ["Language Preference", "Preferencia de Idioma", "Preferência de idioma"],
		settings_language_options: ["Languages", "Idiomas", "Idiomas"],
		english_language: ["English", "Inglés", "Inglês"],
		spanish_language: ["Spanish", "Español", "espanhol"],
		reports_income_statement: ["Income Statement", "Estado de Ganancias y Pérdidas", "Declaração de renda"],
		reports_activity_log: ["Activity Log", "Registro de Actividades", "Registro de atividade"],
		reports_sales_reports: ["Sales Log", "Registro de Ventas", "Registro de vendas"],
		reports_starting_cash: ["Starting Cash", "Utilidad del Período Previo", "Dinheiro Inicial"],
		reports_ending_cash: ["Ending Cash", "Utilidad del Período", "Ending Cash"],
		reports_date: ["Date", "Fecha", "Encontro"],
		reports_price: ["Price", "Precio", "Preço"],
		reports_qty: ["Qty", "Cant", "Qtd"],
		reports_grand_total: ["Grand Total", "Total en Ventas", "Total geral"],
		reports_no_sales: ["There are no sales in this time period.", "No hay ventas en este periódo.", "Não há vendas neste período de tempo."],
		reports_expense_log: ["Expense Log", "Período de Tiempo", "Registro de despesas"],
		reports_time_frame: ["Time Frame", "Periodo de Tiempo", "Prazo"],
		reports_header_day: ["Day", "Dia", "Dia"],
		reports_header_week: ["Week", "Semana", "Semana"],
		reports_header_month: ["Month", "Mes", "Mês"],
		reports_sale: ["Sale", "Venta", "Venda"],
		reports_cash: ["Cash", "Efectivo", "Dinheiro"],
		edit_title: ["Edit", "Editar", "Editar"],
		new_title: ["New", "Nuevo", "Novo"],
		inventory_item: ["Inventory Item", "Artículo de Inventario", "Item de Inventário"],
		cash_balance: ["Cash Balance", "Saldo", "Saldo de caixa"],
		income_statement_profit: ["Profit (or Loss)", "Ganancia (Pérdida) Neta", "Lucro (ou Perda)"],
		income_statement_income_header: ["Income", "Ingresos", "Renda"],
		income_statement_total_income: ["Total Income", "Ingresos Totales", "Renda Total"],
		income_statement_expenses_header: ["Expenses", "Gastos", "Despesas"],
		income_statement_fixed: ["Fixed", "Fijo", "Fixo"],
		income_statement_variable: ["Variable", "Variable", "Variável"],
		income_statement_total_expenses: ["Total Expenses", "Gastos Totales", "Despesas Totais"],
		income_statement_type: ["Type", "Tipo", "Digitar"],
		income_statement_name: ["Name", "Nombre", "Nome"],
		cash_title: ["Cash Infusion", "Infusión de Efectivo", "Infusão de Dinheiro"],
		cash_amount: ["Amount", "Cantidad", "Quantidade"],
		cash_date: ["Date", "Fecha", "Encontro"],
		including_tax: ["Including Tax", "I.V.A Incluido", "Incluindo taxas"],
		checkout_options: ["Tax Options", "Opciones de Impuestos", "Opções de imposto"],
		edit_tax: ["Edit Tax", "Editar I.V.A", "Editar Imposto"],
		tax_name: ["Sales Tax", "I.V.A", "I.P.I"],
		tax_inactive: ["Inactive", "Inactivo", "Inativo"],
		tax_active: ["Active", "Activo", "Ativo"],
		tax_enabled: ["Enabled", "Habilitado", "Ativado"],
		settings_acknowledgment: ["Acknowledgments", "Reconocimiento", "Agradecimentos"],
		required_error: ["Required Field", "Campo Requerido", "Campo requerido"],
		invalid_number_error: ["Invalid Number", "Número no válido", "Número inválido"],
		negative_error: ["Negative number not allowed", "Número negativo no permitida", "Número negativo não permitido"],
		out_of_range_error: ["Out of range", "Fuera de rango", "Fora de alcance"],
		commission_too_high_error: ["Commission cannot be higher than 100%", "La Comisión no puede ser superior al 100%", "Comissão não pode ser superior a 100%"],
		user_options: ["Organization Info", "Información de la Organización", "Informações da Organização"],
		org_title: ["Organization", "Organización", "Organização"],
		org_name: ["Organization Name", "Negocio", "Nome da organização"],
		org_rep: ["Representative", "Representante", "Representante"],
		org_address: ["Address", "Dirección", "Endereço"],
		org_street1: ["Street Address 1", "Dirección 1", "Endereço 1"],
		org_street2: ["Street Address 2", "Dirección 2", "Endereço 2"],
		org_city: ["City", "Ciudad", "Cidade"],
		org_state: ["State", "Estado", "Estado"],
		org_postal: ["ZIP Code", "Codigo postal", "CEP"],
		user_email: ["Email Address", "Correo Electrónico", "Endereço de e-mail"],
		user_phone: ["Phone", "Teléfono", "Telefone"],
		user_filled: ["Entered", "Entró", "Entrou"],
		user_empty: ["Not Entered", "No Entró", "Não inserido"],
		str_generate_pdf: ["Generate PDF", "Generar PDF", "Gerar PDF"],
		str_import: ["Import", "Importar", "Importar"],
		str_export: ["Export", "Exportar", "Exportar"],
		str_sendto: ["Send to …", "Enviar a …", "Enviar para …"],
		str_emailpdf: ["Email PDF", "Envíe PDF por Correo Electrónico", "Email PDF"],
		str_download: ["Download", "Descargar", "Transferir"],
		str_downloading: ["Downloading", "Descargando", "Fazendo download"],
		str_download_csv: ["Download CSV", "Descargar CSV", "Fazer o download do CSV"],
		str_url: ["URL", "URL", "URL"],
		str_error: ["Error", "Error", "Erro"],
		str_settings: ["Settings", "Configuración", "Configurações"],
		str_download_settings: ["Download Settings", "Descargar Configuración", "Configurações de download"],
		str_import_settings: ["Import Settings", "Importar Configuración", "Importar configurações"],
		str_export_settings: ["Export Settings", "Exportar Configuración", "Configurações de exportação"],
		str_date: ["Date", "Fecha", "Encontro"],
		str_name: ["Name", "Nombre", "Nome"],
		str_income: ["Income", "Ingresos", "Renda"],
		str_expense: ["Expense", "Gastos", "Despesa"],
		str_expenses: ["Expenses", "Gastos", "Despesas"],
		str_amount: ["Amount", "Cantidad", "Quantidade"],
		str_cash: ["Cash", "Efectivo", "Dinheiro"],
		str_daily: ["Daily", "Diario", "Diariamente"],
		str_weekly: ["Weekly", "Semanal", "Semanal"],
		str_monthly: ["Monthly", "Mensual", "Por mês"],
		str_format_preferences: ["Format Preferences", "Preferencias de Formato", "Preferências de Formatação"],
		str_date_format: ["Date Format", "Formato de Fecha", "Formato de data"],
		str_total_income: ["Total Income", "Ingresos Totales", "Renda total"],
		str_total_expenses: ["Total Expenses", "Gastos Totales", "Despesas totais"],
		str_total_profit: ["Total Profit", "Ganancias Totales", "Lucro total"],
		str_delete_sale: ["Delete Sale", "Borrar Venta", "Excluir venda"],
		str_are_you_sure: ["Are you sure?", "¿Estás seguro?", "Você tem certeza?"],
		str_cancel: ["Cancel", "Cancelar", "Cancelar"],
		str_item: ["Item", "Ítem", "Item"],
		str_quantity: ["Quantity", "Cantidad", "Quantidade"],
		str_product: ["Product", "Producto", "Produto"],
		str_price: ["Price", "Precio", "Preço"],
		str_unit_price: ["Unit Price", "Precio Unitario", "Preço unitário"],
		str_total_price: ["Total Price", "Precio Total", "Preço total"],
		str_sale_total: ["Sale Total", "Venta Total", "Venda Total"],
		str_grand_total: ["Grand Total", "Total en Ventas", "Total geral"],
		str_total_sales: ["Total Sales", "Ventas Totales", "Vendas totais"],
		str_sale: ["Sale", "Venta", "Venda"],
		str_time_period_no_sales: ["No sales in this time period", "No hay ventas en este período de tiempo", "Nenhuma venda neste período"],
		str_time_period_no_expenses: ["No expenses in this time period", "No hay gastos en este período de tiempo", "Sem despesas neste período"],
		str_time_period_no_income: ["No income in this time period", "Ningún ingreso en este período de tiempo", "Nenhum rendimento neste período"],
		str_time_period_no_transactions: ["No transactions in this time period", "Ninguna transacción en este período de tiempo", "Nenhuma transação nesse período"],
		str_ok: ["OK", "De Acuerdo", "Está bem"],
		str_import_settings: ["Import Settings", "Importar Ajustes", "Importar configurações"],
		str_import_error: ["Import Error", "Error de Importación", "Erro de importação"],
		str_import_error_message: ["No valid import data found", "No se han encontrado datos de importación válidos", "Não foram encontrados dados de importação válidos"],
		str_import_canceled: ["Import canceled", "Importación cancelada", "Importação cancelada"],
		str_import_warning: ["Are you sure? This will erase all existing data!", "¿Estás seguro? ¡Esto borrará todos los datos existentes!", "Você tem certeza? Isso irá apagar todos os dados existentes!"],
		str_email_not_available: ["E-mail not available. You may need to set up your e-mail account.", "Correo electrónico no disponible. Es posible que deba configurar su cuenta de correo electrónico.", "E-mail não disponível. Talvez seja necessário configurar sua conta de e-mail."],
		str_this_is_new_expense: ["This is a new expense. You are not editing a past expense. We have pre-filled this form with the information of the most recent expense that matches this expense's name.", "Este es un nuevo gasto. No estas editando un registro de un gasto pasado. Hemos llenado este formulario con los datos de tu más reciente gasto que coincide con este nombre.", "Esta é uma nova despesa. Você não está editando uma despesa passada. Preenchemos este formulário com as informações da despesa mais recente que corresponde ao nome dessa despesa."],
		str_important: ["Important!", "¡Importante!", "Importante!"],
		str_continue: ["Continue", "Continuar", "Continuar"],
		str_success: ["Success!", "¡Buenas Noticias!", "Sucesso!"],
		str_message_expense_recorded: ["Expense has been recorded. If you want to see or edit it, go to the Expenses Log under Reports.", "Gasto se ha guardado exitosamente. Si deseas verlo o editarlo, ve al Registro de Gastos en Reportes.", "A despesa foi registrada. Se você quiser vê-lo ou editá-lo, vá para o Registro de despesas em Relatórios."],
		str_delete_expense_title: ["Delete Expense", "Eliminar Gastos", "Excluir despesas"],
		str_delete_expense_text: ["Are you sure you want to delete this expense?", "¿Seguro que quieres borrar este gasto?", "Tem certeza de que deseja excluir essa despesa?"],
		str_delete: ["Delete", "Borrar", "Excluir"],
		str_yes: ["Yes", "Si", "Sim"],
		str_no: ["No", "No", "Não"]
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
								} else if (data === 'pt') {
									tmhDynamicLocale.set('pt-br');
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
						tmhDynamicLocale.set('es-ec');
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
		var ptStrings = getStringSet(languageStrings, 2);
		win.enStrings = enStrings;
		win.esStrings = esStrings;
		win.ptStrings = ptStrings;
		// Log.l("English strings:\n%s", JSON.stringify(enStrings));

		$translateProvider.translations('en', enStrings);
		$translateProvider.translations('es', esStrings);
		$translateProvider.translations('pt', ptStrings);

		$translateProvider.preferredLanguage("en");
		$translateProvider.fallbackLanguage("en");

		// Enable sanitization via escaping of HTML
		$translateProvider.useSanitizeValueStrategy('escape');


		// if none of the above states are matched, use this as the fallback
		$urlRouterProvider.otherwise('app/sales');
	}
})();

