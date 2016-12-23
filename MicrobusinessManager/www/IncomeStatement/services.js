(function() {
	angular.module('app.income-statement')
		.factory('ISpdfService', ['$q', '$filter', ISpdfService]);
	// .factory('IncomeStatementService', IncomeStatementService);

	function ISpdfService($q, $filter) {
		var cfilter = $filter;
		function createPdf(report, user, reportData) {
			return $q(function(resolve, reject) {
				Log.l("Now in pdfService.createPdf() ... report and user are:");
				Log.l(JSON.stringify(report));
				Log.l(JSON.stringify(user));
				var dd = createDocumentDefinition(report, user, reportData, cfilter);
				Log.l("PDF Design Document looks like:\n%s\n", JSON.stringify(dd));
				var pdf = pdfMake.createPdf(dd);

				pdf.getBase64(function(output) {
					resolve(base64ToUint8Array(output));
				});
			});
		}


		var service = {
			createPdf: createPdf
		};
		return service;
	}

	function base64ToUint8Array(base64) {
		Log.l("Now in base64ToUint8Array() ...");
		var raw = atob(base64);
		var uint8Array = new Uint8Array(raw.length);
		for (var i = 0; i < raw.length; i++) {
			uint8Array[i] = raw.charCodeAt(i);
		}
		return uint8Array;
	}

	function createDocumentDefinition(report, user, reportData, afilter) {
		Log.l("Now in createDocumentDefinition() ...");
		var isr = report;
		var rdata = reportData;
		Log.l(" report: %s\n user: %s\n reportData: %s", JSON.stringify(report), JSON.stringify(user), JSON.stringify(reportData));
		var items = isr.incomeItems.map(function(item) {
			var arrItem = [];
			var rtStyle = {"style": "rightAlign"};
			var itemName = "";
			var itemName = item.name == 'reports_cash' ? afilter('translate')(item.name) : item.name;
			var numAmt = item.amount;
			var amt = afilter('currency')(numAmt, "$", 2);
			rtStyle.text = amt;
			arrItem.push(itemName);
			arrItem.push(rtStyle);
			return arrItem;
			// return [item.name, item.amount];
		});
		var expitems = isr.expenseItems.map(function(item) {
			var arrItem = [];
			var itemName = item.name;
			var numAmt = item.amount;
			var rtStyle = {"style": "rightAlign"};
			var amt = afilter('currency')(numAmt, "$", 2);
			rtStyle.text = amt;
			arrItem.push(item.name);
			arrItem.push(rtStyle);
			return arrItem;
			// return [item.name, item.amount];
		});

		Log.l("items and expitems:");
		Log.l(JSON.stringify(items));
		Log.l(JSON.stringify(expitems));

		var time = rdata.timeFrame.value;
		var timespan = "";
		if(time == 'day') {
			timespan = afilter('translate')("str_daily");
		} else if(time == 'week') {
			timespan = afilter('translate')("str_weekly");
		} else if(time == 'month') {
			timespan = afilter('translate')("str_monthly");
		}

		var dateFormat = win.formats.dateformat;

		var userid = user.id;
		var orgname = user.name;
		var representative = user.representative;
		var address = user.address;
		var street1 = user.street1;
		var street2 = user.street2;
		var city = user.city;
		var state = user.state;
		var postal = user.postal;
		var email = user.email;
		var phone = user.phone;
		var reportTitle = afilter('translate')("reports_income_statement");
		var title = reportTitle + ": " + timespan;
		// title = titleCase(title);
		var startDate = moment(rdata.startDate);
		var endDate = moment(rdata.endDate);
		var dateRange = startDate.format(dateFormat) + " — " + endDate.format(dateFormat);
		var totalIncome = rdata.totalIncome;
		var totalExpenses = rdata.totalExpenses;
		var totalProfit = rdata.totalProfit;
		var strTotalIncome = afilter('currency')(totalIncome, "$", 2);
		var strTotalExpenses = afilter('currency')(totalExpenses, "$", 2);
		var strTotalProfit = afilter('currency')(totalProfit, "$", 2);
		var strIncomeHeader = afilter('translate')("str_income");
		var strExpensesHeader = afilter('translate')("str_expenses");
		var strTotalIncomeHeader = afilter('translate')("str_total_income");
		var strTotalExpensesHeader = afilter('translate')("str_total_expenses");
		var strTotalProfitHeader = afilter('translate')("str_total_profit");
		var strNameHeader = afilter('translate')("str_name");
		var strAmountHeader = afilter('translate')("str_amount");
		var strCashHeader = afilter('translate')("str_cash");

		var address = "";
		if(street2) {
			address = street1 + "\n" + street2 + "\n" + city + " " + state + " " + postal;
		} else {
			address = street1 + "\n" + city + " " + state + " " + postal;
		}

		Log.l("userid: %s, orgname: %s, rep: %s, address: %s, email: %s, phone: %s, title: %s, dateRange: %s, totalI: %s, totalE: %s, totalP: %s", userid, orgname, representative, address, email, phone, title, dateRange, strTotalIncome, strTotalExpenses, strTotalProfit);

		var strNoIncome = "(" + afilter('translate')("str_time_period_no_income") + ")";
		var strNoExpenses = "(" + afilter('translate')("str_time_period_no_expenses") + ")";

		var incomeTable = [];
		var expensesTable = [];
		if(isEmpty(items)) {
			incomeTable = [ [ {"text": strNoIncome, "colSpan": 2, "style": "emptyRow"} ] ];
		} else {
			incomeTable = items;
		}

		if(isEmpty(expitems)) {
			expensesTable = [ [ {"text": strNoExpenses, "colSpan": 2, "style": "emptyRow"} ] ];
		} else {
			expensesTable = items;
		}

		var dd = {
			"defaultStyle": {
				"margin": [ 0, 5, 0, 0 ]
			},
			"styles": {
				"header": {
					"fontSize": 20,
					"bold": true,
					"alignment": "right",
					"margin": [ 0, 0, 0, 10 ]
				},
				"subheader": {
					"fontSize": 16,
					"bold": true,
					"margin": [ 0, 15, 0, 5 ]
				},
				"organizationheader": {
					"fontSize": 14,
					"bold": false,
					"margin": [ 0, 5, 0, 5 ]
				},
				"emptyRow": {
					"alignment": "center",
					"bold": true,
					"margin": [ 0, 5, 0, 5 ]
				},
				"itemsTable": {
					"margin": [ 0, 5, 0, 0 ]
				},
				"itemsTableHeader": {
					"bold": true,
					"fontSize": 13,
					"color": "black",
					"margin": [ 0, 5, 0, 0 ]
				},
				"rightAlign": {
					"alignment": "right",
					"margin": [ 0, 5, 0, 0 ]
				},
				"totalsRow": {
					"alignment": "right",
					"bold": "true",
					"margin": [ 0, 5, 0, 0 ]
				},
				"headerLabel" : {
					"alignment": "right",
					"color": "black",
					"bold": true,
					"margin": [ 0, 5, 0, 0 ]
				},
				"incomeCell": {
					"alignment": "right",
					"color": "black",
					"margin": [ 0, 5, 0, 0 ]
				},
				"expenseCell": {
					"alignment": "right",
					"color": "red",
					"margin": [ 0, 5, 0, 0 ]
				},
				"cashCell": {
					"alignment": "right",
					"color": "black",
					"bold": true,
					"margin": [ 0, 0, 20, 0 ]
				},
				"totalCell": {
					"alignment": "right",
					"bold": true,
					"margin": [ 0, 5, 0, 0 ]
				},
				"totalsTable": {
					"alignment": "right",
					"bold": true,
					"margin": [ 0, 5, 5, 0]
				},
				"finalTotalsTable": {
					"alignment": "right",
					"bold": true,
					"margin": [ 0, 40, 0, 0 ]
				}
			},
			"content": [
				{
					"text": title,
					"style": "header"
				},
				{
					"text": dateRange,
					"style": "header"
				},
				{ "style": "organizationheader",
					"stack": [
					orgname,
					representative,
					address,
					]
				},
				{
					"text": strIncomeHeader,
					"style": "subheader"
				},
				{
					"style": "itemsTable",
					"table": {
						"widths": [
							"*",
							75
						],
						"body": [
							[
								{
									"text": strNameHeader,
									"style": "itemsTableHeader"
								},
								{
									"text": strAmountHeader,
									"style": "itemsTableHeader"
								}
							]
						].concat(incomeTable)
					}
				},
				{
					"style": "totalsTable",
					"table": {
						"widths": [
							"*",
							75
						],
						"body": [
							[
								strTotalIncomeHeader,
								strTotalIncome
							]
						]
					},
					"layout": "noBorders"
				},
				{
					"text": strExpensesHeader,
					"style": "subheader"
				},
				{
					"style": "itemsTable",
					"table": {
						"widths": [
							"*",
							75
						],
						"body": [
							[
								{
									"text": strNameHeader,
									"style": "itemsTableHeader"
								},
								{
									"text": strAmountHeader,
									"style": "itemsTableHeader"
								}
							]
						].concat(expensesTable)
					}
				},
				{
					"style": "totalsTable",
					"table": {
						"widths": [
							"*",
							75
						],
						"body": [
							[
								strTotalExpensesHeader,
								strTotalExpenses
							]
						]
					},
					"layout": "noBorders"
				},
				{
					"style": "totalsTable",
					"table": {
						"widths": [
							"*",
							75
						],
						"body": [
							[
								strTotalProfitHeader,
								strTotalProfit
							]
						]
					},
					"layout": "noBorders"
				}
			]
		};
		return dd;
	}

})();

