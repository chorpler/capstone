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
		"add_button": ["Add", "Agregar", "Adicionar", "Ajouter"],
		"add_expense": ["Add Expense", "Agregar Gasto", "Adicionar Despesas", "Ajouter une Dépense"],
		"cancel_button": ["Cancel", "Cancelar", "Cancelar", "Annuler"],
		"cancel_sale_button": ["Cancel Sale", "Cancelar Venta", "Cancelar a Venda", "Annuler la Vente"],
		"cash_amount": ["Amount", "Cantidad", "Quantidade", "Montant"],
		"cash_balance": ["Cash Balance", "Saldo", "Saldo de Caixa", "Balance de Trésorerie"],
		"cash_date": ["Date", "Fecha", "Encontro", "Date"],
		"cash_title": ["Cash Infusion", "Infusión de Efectivo", "Infusão de Dinheiro", "Infusion de Trésorerie"],
		"checkout_options": ["Tax Options", "Opciones de Impuestos", "Opções de Imposto", "Options Iiscales"],
		"close_button": ["Close", "Cerrar", "Fechar", "Fermer"],
		"commission_expected": ["Expected Commission", "Comisión Esperada", "Comissão Prevista", "Commission attendue"],
		"commission_option": ["Commission", "Comisión", "Comissão", "Commission"],
		"commission_too_high_error": ["Commission cannot be higher than 100%", "La Comisión no puede ser superior al 100%", "Comissão não pode ser superior a 100%", "Commission ne peut être supérieure à 100%"],
		"edit_tax": ["Edit Tax", "Editar I.V.A", "Editar Imposto", "Modifier la taxe"],
		"edit_title": ["Edit", "Editar", "Editar", "Éditer"],
		"english_language": ["English", "Inglés", "Inglês", "Anglais"],
		"expense_amount": ["Amount", "Cantidad Gastada", "Quantidade", "Montant"],
		"expense_fixed": ["Fixed", "Fijo", "Fixo", "Fixé"],
		"expense_history": ["Recent Expenses", "Gastos Recientes", "Despesas Recentes", "Dépenses récentes"],
		"expense_name": ["Expense Name", "Nombre del Gasto", "Nome da Despesa", "Nom de la dépense"],
		"expense_type": ["Expense Type", "Tipo de Gasto", "Tipo de Despesa", "Type de dépense"],
		"expense_variable": ["Variable", "Variable", "Variável", "Variable"],
		"expenses_expenses_log": ["Expenses Log", "Registro de Gastos", "Registro de Despesas", "Journal des dépenses"],
		"expenses_new_expense": ["Expense Record", "Registro de Gastos", "Registro de Despesas", "Frais de dossier"],
		"expenses_total_expenses": ["Total Expenses", "Total de Gastos", "Despesas Totais", "Dépenses totales"],
		"including_tax": ["Including Tax", "I.V.A incluido", "Incluindo Taxas", "Taxes comprises"],
		"income_statement_expenses_header": ["Expenses", "Gastos", "Despesas", "Dépenses"],
		"income_statement_fixed": ["Fixed", "Fijo", "Fixo", "Fixé"],
		"income_statement_income_header": ["Income", "Ingresos", "Renda", "Le Revenu"],
		"income_statement_name": ["Name", "Nombre", "Nome", "Prénom"],
		"income_statement_profit": ["Profit (or Loss)", "Ganancia (Pérdida) Neta", "Lucro (ou Perda)", "Bénéfice (ou perte)"],
		"income_statement_total_expenses": ["Total Expenses", "Total Gastos", "Despesas totais", "Dépenses totales"],
		"income_statement_total_income": ["Total Income", "Total Ingresos", "Renda total", "Revenu total"],
		"income_statement_type": ["Type", "Tipo", "Digitar", "Type"],
		"income_statement_variable": ["Variable", "Variable", "Variável", "Variable"],
		"inv_exp_sal_date": ["Date", "Fecha", "Encontro", "Date"],
		"invalid_number_error": ["Invalid Number", "Número no válido", "Número inválido", "Numéro invalide"],
		"inventory_add_name": ["Inventory Item Name", "Nombre del artículo de Inventario", "Nome do item do inventário", "Nom de l'inventaire"],
		"inventory_add_product": ["Make Product", "Es Producto", "Criar produto", "Faire un produit"],
		"inventory_item": ["Inventory Item", "Artículo de Inventario", "Item de inventário", "Inventaire"],
		"inventory_name": ["Name", "Artículo", "Nome", "Prénom"],
		"inventory_quantity": ["Quantity", "Cantidad", "Quantidade", "Quantité"],
		"inventory_total_comments": ["Comments", "Comentarios", "Comentários", "Commentaires"],
		"inventory_total_cost": ["Total Cost", "Costo Total", "Custo total", "Coût total"],
		"login_button": ["Log In", "Accesar Cuenta", "Entrar", "S'identifier"],
		"logout_button": ["Log Out", "Terminar Sesión", "Sair", "Se déconnecter"],
		"menu_expenses": ["Expenses", "Gastos", "Despesas", "Dépenses"],
		"menu_inventory": ["Inventory", "Inventario", "Inventário", "Inventaire"],
		"menu_products": ["Products", "Productos", "Produtos", "Produits"],
		"menu_reports": ["Reports", "Reportes", "Relatórios", "Rapports"],
		"menu_salary": ["Salary", "Sueldo", "Salário", "Un salaire"],
		"menu_sales": ["Sales", "Ventas", "Vendas", "Ventes"],
		"menu_settings": ["Settings", "Configuraciones", "Configurações", "Paramètres"],
		"menu_title": ["Menu", "Menú", "Cardápio", "Le Menu"],
		"negative_error": ["Negative number not allowed", "Número negativo no permitida", "Número negativo não permitido", "Négatif non autorisé"],
		"new_title": ["New", "Nuevo", "Novo", "Nouveau"],
		"out_of_range_error": ["Out of range", "Fuera de rango", "Fora de alcance", "Hors de portée"],
		"payment_amount": ["Payment Amount", "Cantidad", "Montante do Pagamento", "Montant du paiement"],
		"payment_method": ["Self-Payment Method", "Método de Pago", "Método de Pagamento Automático", "Méthode de Paiement Automatique"],
		"placehoder_search": ["Search", "Buscar", "Pesquisa", "Chercher"],
		"product_Category_add": ["Add", "Crear", "Adicionar", "Ajouter"],
		"product_Category_choose": ["Choose", "Elegir", "Escolher", "Choisir"],
		"product_Category_choose_category": ["Choose Category", "Elige una Categoría", "Escolher categoria", "Choisir la Catégorie"],
		"product_Category_existent_category": ["Current Category", "Categoría Actual", "Categoria Atual", "Catégorie Actuelle"],
		"product_add_inventory": ["Add Inventory", "Agregar al Inventario", "Adicionar Inventário", "Ajouter un Inventaire"],
		"product_category": ["Category", "Categoría", "Categoria", "Catégorie"],
		"product_category_name": ["Category Name", "Nombre de Categoría", "Nome da Categoria", "Nom de Catégorie"],
		"product_edit": ["Edit", "Editar", "Editar", "Éditer"],
		"product_input_category": ["Enter name of new Category", "Ingresa Nombre de Nueva Categoría", "Digite o nome da nova categoria", "Entrez le nom de la nouvelle catégorie"],
		"product_name": ["Product Name", "Nombre del Producto", "Nome do Produto", "Nom du Produit"],
		"product_new": ["New", "Nuevo", "Novo", "Nouveau"],
		"product_new_Category": ["New Category", "Nueva Categoría", "Nova categoria", "Nouvelle Catégorie"],
		"product_sales_price": ["Sales Price", "Precio de Venta", "Preços de venda", "Prix ​​de Vente"],
		"product_title": ["Product", "Producto", "Produto", "Produit"],
		"register_button": ["Register", "Crear Cuenta", "Registrar", "Registre"],
		"reports_activity_log": ["Activity Log", "Registro de Actividades", "Registro de Atividade", "Journal d'activité"],
		"reports_cash": ["Cash", "Efectivo", "Dinheiro", "Argent liquide"],
		"reports_date": ["Date", "Fecha", "Encontro", "Date"],
		"reports_ending_cash": ["Ending Cash", "Utilidad del Período", "Ending Cash", "Fin de Trésorerie"],
		"reports_expense_log": ["Expense Log", "Registro de Gastos", "Registro de despesas", "Journal des Dépenses"],
		"reports_grand_total": ["Grand Total", "Total en Ventas", "Total Geral", "Somme Finale"],
		"reports_header_day": ["Day", "Dia", "Dia", "Journée"],
		"reports_header_month": ["Month", "Mes", "Mês", "Mois"],
		"reports_header_week": ["Week", "Semana", "Semana", "Semaine"],
		"reports_income_statement": ["Income Statement", "Estado de Ganancias y Pérdidas", "Declaração de renda", "Compte de résultat"],
		"reports_no_sales": ["There are no sales in this time period.", "No hay ventas en este periódo.", "Não há vendas neste período de tempo.", "Il n'y a pas de ventes dans cette période."],
		"reports_price": ["Price", "Precio", "Preço", "Prix"],
		"reports_qty": ["Qty", "Cant", "Qtd", "Quantité"],
		"reports_sale": ["Sale", "Venta", "Venda", "Vente"],
		"reports_sales_reports": ["Sales Log", "Registro de Ventas", "Registro de vendas", "Journal des ventes"],
		"reports_starting_cash": ["Starting Cash", "Utilidad del Período Previo", "Dinheiro Inicial", "Commencer l'argent comptant"],
		"reports_time_frame": ["Time Frame", "Período de Tiempo", "Prazo", "Délai"],
		"required_error": ["Required Field", "Campo Requerido", "Campo requerido", "Champs requis"],
		"salary_Date": ["Date", "Fecha", "Encontro", "Date"],
		"salary_adjust": ["Adjust", "Ajustar", "Ajustar", "Régler"],
		"salary_amount": ["Amount", "Cantidad", "Quantidade", "Montant"],
		"salary_comments": ["Comments", "Comentarios", "Comentários", "Commentaires"],
		"salary_expected": ["Expected Salary", "Sueldo Esperado", "Salário Esperado", "Prétentions"],
		"salary_message_1": ["Sorry! You only have $", "Lo sentimos! Solamente tienes $", "Desculpa! Você só tem", "Pardon! Vous avez seulement $"],
		"salary_message_2": [" available. Adjust the amount so that the difference is less than or equal to what you have on hand.", " disponible. Ajusta la cantidad para que la diferencia sea menor o igual a lo que tienes disponible.", " disponível. Ajuste o valor para que a diferença seja menor ou igual ao que você tem na mão.", " disponible. Ajustez le montant afin que la différence soit inférieure ou égale à ce que vous avez sous la main."],
		"salary_name": ["Name", "Nombre", "Nome", "Prénom"],
		"salary_no_comission": ["Go to Settings and Set Self Payment to use this feature.", "Ve a Configuraciones y establece el método de sueldo para usar esta función.", "Vá para Definições e Definir pagamento próprio para utilizar esta funcionalidade.", "Accédez à Paramètres et Définissez l'auto-paiement pour utiliser cette fonction."],
		"salary_not_configured": ["Not configured yet", "No ha sido configurado", "Ainda não configurado", "Pas encore configuré"],
		"salary_option": ["Salary", "Salario", "Salário", "Un salaire"],
		"salary_percentage": ["Percentage", "Porcentaje", "Percentagem", "Pourcentage"],
		"salary_placeholder": ["Salary ($)", "Salario ($)", "Salário ($)", "Salaire ($)"],
		"salary_record": ["Salary Record", "Registro de Sueldo", "Registro de salário", "Salaire"],
		"salary_register": ["Register", "Registrar", "Registrar", "Registre"],
		"sale_products_total": ["Sale Products", "Productos en esta Transacción", "Venda Produtos", "Vente de produits"],
		"sales_all": ["All", "Mostrar Todas", "Todos", "Tout"],
		"sales_category": ["Categories", "Categorías", "Categorias", "Catégories"],
		"sales_checkout": ["Checkout", "Registrar Venta", "Confira", "Check-out"],
		"sales_edit_product_back": ["Back", "Regresar", "Costas", "Arrière"],
		"sales_edit_quantity": ["Edit Quantity", "Editar Cantidad", "Editar Quantidade", "Modifier la quantité"],
		"sales_error_part1": [" has only ", " solo tiene ", " tem apenas ", " a seulement "],
		"sales_error_part2": [" in inventory. You cannot sell more than ", " en inventario. No puedes vender más de ", " no inventário. Você não pode vender mais do que ", " en inventaire. Vous ne pouvez pas vendre plus de "],
		"sales_limit": ["Limit", "Límite", "Limite", "Limite"],
		"sales_name": ["Product", "Producto", "Produto", "Produit"],
		"sales_no_product": ["You have not added any products. Go to the Products page and add some.", "No haz agregado ningún producto. Ve a Productos y agrega uno o más.", "Você não adicionou nenhum produto. Vá para a página Produtos e adicione alguns.", "Vous n'avez ajouté aucun produit. Accédez à la page Produits et ajoutez-en quelques-uns."],
		"sales_price": ["Price", "Precio", "Preço", "Prix"],
		"sales_record": ["Record", "Registrar", "Registro", "Record"],
		"sales_reset": ["Clear", "Borrar", "Claro", "Clair"],
		"sales_total_sale": ["Total Sales Price", "Venta Total", "Preço de Vendas Total", "Prix ​​de vente total"],
		"save_button": ["Save", "Guardar", "Salvar", "Sauvegarder"],
		"self_payment_settings": ["Self-Payment Settings", "Configuración de Mi Sueldo", "Paramètres d'auto-paiement", "Paramètres d'auto-paiement"],
		"settings_acknowledgment": ["Acknowledgments", "Reconocimiento", "Agradecimentos", "Remerciements"],
		"settings_confirm_password": ["Confirm Password", "Confirmar Contraseña", "Confirme a Senha", "Confirmez le Mot de Passe"],
		"settings_email": ["Email", "Correo Electrónico", "O Email", "Email"],
		"settings_language_options": ["Languages", "Idiomas", "Idiomas", "Langues"],
		"settings_language_preference": ["Language Preference", "Preferencia de Idioma", "Preferência de idioma", "Préférence de Langue"],
		"settings_password": ["Password", "Contraseña", "Senha", "Mot de Passe"],
		"settings_phone": ["Phone", "Teléfono", "Telefone", "Téléphone"],
		"settings_username": ["Username", "Nombre de Usuario", "Nome de Usuário", "Nom d'utilisateur"],
		"spanish_language": ["Spanish", "Español", "Espanhol", "Espanol"],
		"tax_active": ["Active", "Activo", "Ativo", "Actif"],
		"tax_enabled": ["Enabled", "Habilitado", "Ativado", "Activée"],
		"tax_inactive": ["Inactive", "Inactivo", "Inativo", "Inactif"],
		"tax_name": ["Sales Tax", "I.V.A", "Imposto sobre vendas", "Taxe de vente"],
		"user_options": ["Organization Info", "Información de la Organización", "Informações da Organização", "Informations sur l'organisation"],
		"org_title": ["Organization", "Organización", "Organização", "Organisation"],
		"org_name": ["Organization Name", "Negocio", "Organização", "L'organisation"],
		"org_rep": ["Representative", "Representante", "Representante", "Représentant"],
		"org_address": ["Address", "Dirección", "Endereço", "Adresse"],
		"org_street1": ["Street Address 1", "Dirección 1", "Endereço 1", "Adresse 1"],
		"org_street2": ["Street Address 2", "Dirección 2", "Endereço 2", "Adresse 2"],
		"org_city": ["City", "Ciudad", "Cidade", "Ville"],
		"org_state": ["State", "Estado", "Estado", "Etat"],
		"org_postal": ["ZIP Code", "Codigo postal", "CEP", "Code postal"],
		"user_email": ["Email Address", "Correo Electrónico", "Endereço de e-mail", "Adresse e-mail"],
		"user_phone": ["Phone", "Teléfono", "Telefone", "Téléphone"],
		"user_filled": ["Entered", "Entró", "Entrou", "Entré"],
		"user_empty": ["Not Entered", "No Entró", "Não inserido", "Non entré"],
		"str_generate_pdf": ["Generate PDF", "Generar PDF", "Gerar PDF", "Générer PDF"],
		"str_import": ["Import", "Importar", "Importar", "Importer"],
		"str_export": ["Export", "Exportar", "Exportar", "Exportation"],
		"str_sendto": ["Send to …", "Enviar a …", "Enviar para …", "Envoyer à …"],
		"str_emailpdf": ["Email PDF", "Envíe PDF por Correo Electrónico", "Email PDF", "Courriel PDF"],
		"str_download": ["Download", "Descargar", "Transferir", "Télécharger"],
		"str_downloading": ["Downloading", "Descargando", "Fazendo download", "Téléchargement en cours"],
		"str_download_csv": ["Download CSV", "Descargar CSV", "Fazer o download do CSV", "Télécharger CSV"],
		"str_url": ["URL", "URL", "URL", "URL"],
		"str_error": ["Error", "Error", "Erro", "Erreur"],
		"str_settings": ["Settings", "Configuración", "Configurações", "Paramètres"],
		"str_download_settings": ["Download Settings", "Descargar Configuración", "Configurações de download", "Télécharger les paramètres"],
		"str_import_settings": ["Import Settings", "Importar Configuración", "Importar configurações", "Paramètres d'importation"],
		"str_export_settings": ["Export Settings", "Exportar Configuración", "Configurações de exportação", "Paramètres d'exportation"],
		"str_date": ["Date", "Fecha", "Encontro", "Date"],
		"str_name": ["Name", "Nombre", "Nome", "Prénom"],
		"str_income": ["Income", "Ingresos", "Renda", "Le Revenu"],
		"str_expense": ["Expense", "Gastos", "Despesa", "Frais"],
		"str_expenses": ["Expenses", "Gastos", "Despesas", "Dépenses"],
		"str_amount": ["Amount", "Cantidad", "Quantidade", "Montant"],
		"str_cash": ["Cash", "Efectivo", "Dinheiro", "Argent liquide"],
		"str_daily": ["Daily", "Diario", "Diariamente", "Tous les jours"],
		"str_weekly": ["Weekly", "Semanal", "Semanal", "Hebdomadaire"],
		"str_monthly": ["Monthly", "Mensual", "Por mês", "Mensuel"],
		"str_format_preferences": ["Format Preferences", "Preferencias de Formato", "Preferências de Formatação", "Préférences de Format"],
		"str_date_format": ["Date Format", "Formato de Fecha", "Formato de data", "Format de date"],
		"str_total_income": ["Total Income", "Ingresos Totales", "Renda total", "Revenu total"],
		"str_total_expenses": ["Total Expenses", "Gastos Totales", "Despesas totais", "Dépenses totales"],
		"str_total_profit": ["Total Profit", "Ganancias Totales", "Lucro total", "Bénéfice total"],
		"str_delete_sale": ["Delete Sale", "Borrar Venta", "Excluir venda", "Supprimer la vente"],
		"str_are_you_sure": ["Are you sure?", "¿Estás seguro?", "Você tem certeza?", "Êtes-vous sûr?"],
		"str_cancel": ["Cancel", "Cancelar", "Cancelar", "Annuler"],
		"str_item": ["Item", "Ítem", "Item", "Article"],
		"str_quantity": ["Quantity", "Cantidad", "Quantidade", "Quantité"],
		"str_product": ["Product", "Producto", "Produto", "Produit"],
		"str_price": ["Price", "Precio", "Preço", "Prix"],
		"str_unit_price": ["Unit Price", "Precio Unitario", "Preço unitário", "Prix ​​unitaire"],
		"str_total_price": ["Total Price", "Precio Total", "Preço total", "Prix ​​total"],
		"str_sale_total": ["Sale Total", "Venta Total", "Venda Total", "Vente"],
		"str_grand_total": ["Grand Total", "Total en Ventas", "Total Geral", "Somme Finale"],
		"str_total_sales": ["Total Sales", "Ventas Totales", "Vendas Totais", "Ventes Totales"],
		"str_sale": ["Sale", "Venta", "Venda", "Vente"],
		"str_time_period_no_sales": ["No sales in this time period", "No hay ventas en este período de tiempo", "Nenhuma venda neste período", "Aucune vente dans cette période"],
		"str_time_period_no_expenses": ["No expenses in this time period", "No hay gastos en este período de tiempo", "Sem despesas neste período", "Aucune dépense durant cette période"],
		"str_time_period_no_income": ["No income in this time period", "Ningún ingreso en este período de tiempo", "Nenhum rendimento neste período", "Aucun revenu pendant cette période"],
		"str_time_period_no_transactions": ["No transactions in this time period", "Ninguna transacción en este período de tiempo", "Nenhuma transação nesse período", "Aucune transaction effectuée pendant cette période"],
		"str_ok": ["OK", "De Acuerdo", "Está bem", "D'accord"],
		"str_import_settings": ["Import Settings", "Importar Ajustes", "Importar configurações", "Paramètres d'importation"],
		"str_import_error": ["Import Error", "Error de Importación", "Erro de importação", "Erreur d'importation"],
		"str_import_error_message": ["No valid import data found", "No se han encontrado datos de importación válidos", "Não foram encontrados dados de importação válidos", "Aucune donnée d'importation valide trouvée"],
		"str_import_canceled": ["Import canceled", "Importación cancelada", "Importação cancelada", "Importation annulée"],
		"str_import_warning": ["Are you sure? This will erase all existing data!", "¿Estás seguro? ¡Esto borrará todos los datos existentes!", "Você tem certeza? Isso irá apagar todos os dados existentes!", "Êtes-vous sûr? Cela effacera toutes les données existantes!"],
		"str_email_not_available": ["E-mail not available. You may need to set up your e-mail account.", "Correo electrónico no disponible. Es posible que deba configurar su cuenta de correo electrónico.", "E-mail não disponível. Talvez seja necessário configurar sua conta de e-mail.", "E-mail non disponible. Vous devrez peut-être configurer votre compte de messagerie électronique."],
		"str_this_is_new_expense": ["This is a new expense. You are not editing a past expense. We have pre-filled this form with the information of the most recent expense that matches this expense's name.", "Este es un nuevo gasto. No estas editando un registro de un gasto pasado. Hemos llenado este formulario con los datos de tu más reciente gasto que coincide con este nombre.", "Esta é uma nova despesa. Você não está editando uma despesa passada. Preenchemos este formulário com as informações da despesa mais recente que corresponde ao nome dessa despesa.", "Il s'agit d'une nouvelle dépense. Vous ne modifiez pas une dépense passée. Nous avons rempli préalablement ce formulaire avec l'information de la dépense la plus récente qui correspond au nom de cette dépense."],
		"str_important": ["Important!", "¡Importante!", "Importante!", "Important!"],
		"str_continue": ["Continue", "Continuar", "Continuar", "Continuer"],
		"str_success": ["Success!", "¡Buenas Noticias!", "Sucesso!", "Le succès!"],
		"str_message_expense_recorded": ["Expense has been recorded. If you want to see or edit it, go to the Expenses Log under Reports.", "Gasto se ha guardado exitosamente. Si deseas verlo o editarlo, ve al Registro de Gastos en Reportes.", "A despesa foi registrada. Se você quiser vê-lo ou editá-lo, vá para o Registro de despesas em Relatórios.", "Les dépenses ont été enregistrées. Si vous souhaitez le voir ou le modifier, accédez au journal des dépenses sous Rapports."],
		"str_delete_expense_title": ["Delete Expense", "Eliminar Gastos", "Excluir despesas", "Supprimer les dépenses"],
		"str_delete_expense_text": ["Are you sure you want to delete this expense?", "¿Seguro que quieres borrar este gasto?", "Tem certeza de que deseja excluir essa despesa?", "Voulez-vous vraiment supprimer cette dépense?"],
		"str_delete": ["Delete", "Borrar", "Excluir", "Effacer"],
		"str_yes": ["Yes", "Si", "Sim", "Oui"],
		"str_no": ["No", "No", "Não", "Non"],
		"str_not_implemented": ["Feature not implemented in this version.", "Característica no implementada en esta versión.", "Recurso não implementado nesta versão.", "Fonction non implémentée dans cette version."],
		"str_no_products_in_sale": ["This sale had no products", "Esta venta no tiene productos", "Esta venda não tem produtos", "Cette vente n'a pas de produits"],
		"str_currency_icon": ["ion-social-usd", "ion-social-usd", "ion-social-usd", "ion-social-usd"]
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
						if (trimLanguage === 'en' || trimLanguage === 'es' || trimLanguage === 'pt' || trimLanguage == 'fr') {
							$translate.use(trimLanguage).then(function(data) {
								if (data === 'es') {
									tmhDynamicLocale.set('es-mx');
								} else if (data === 'pt') {
									tmhDynamicLocale.set('pt-br');
								} else if (data === 'fr') {
									tmhDynamicLocale.set('fr-ca');
								} else if (data === 'en') {
									tmhDynamicLocale.set('en-us');
								} else {
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
					} else if (selectedLanguage.type === 'pt') {
						tmhDynamicLocale.set('pt-br');
					} else if (selectedLanguage.type === 'fr') {
						tmhDynamicLocale.set('fr-ca');
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
		var frStrings = getStringSet(languageStrings, 3);

		win.enStrings = enStrings;
		win.esStrings = esStrings;
		win.ptStrings = ptStrings;
		win.frStrings = frStrings;
		// Log.l("English strings:\n%s", JSON.stringify(enStrings));

		$translateProvider.translations('en', enStrings);
		$translateProvider.translations('es', esStrings);
		$translateProvider.translations('pt', ptStrings);
		$translateProvider.translations('fr', frStrings);

		$translateProvider.preferredLanguage("en");
		$translateProvider.fallbackLanguage("en");

		// Enable sanitization via escaping of HTML
		$translateProvider.useSanitizeValueStrategy('escape');


		// if none of the above states are matched, use this as the fallback
		$urlRouterProvider.otherwise('app/sales');
	}
})();

