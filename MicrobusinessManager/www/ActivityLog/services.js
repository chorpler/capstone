(function() {
	angular.module('app.activitylog')
	.factory('ALpdfService', ['$q', '$filter', ALpdfService]);

	function ALpdfService($q, $filter) {
		var cfilter = $filter;
		function createPdf(report, user, reportData) {
			return $q(function(resolve, reject) {
				Log.l("AL: Now in pdfService.createPdf() ... report and user are:");
				// Log.l(JSON.stringify(report));
				// Log.l(JSON.stringify(user));
				var dd = createDocumentDefinition(report, user, reportData, cfilter);
				// Log.l("PDF Design Document looks like:\n%s\n", JSON.stringify(dd, false, 2));
				var pdf = pdfMake.createPdf(dd);

				pdf.getBase64(function(output) {
					resolve(base64ToUint8Array(output));
				});
			});
		}

		var service = {
			createActivityLogPdf: createPdf
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

		var dateFormat = win.dateFormat || "YYYY-MM-DD";
		// report consists of sales, expenses, and cashInfusions, concatenated into one array
		// sales: id, amount, date
		// expenses: id, name, amount, expType, comments, date, type
		// cashInfusions: id, amount, date
		var alr = report;
		var rdata = reportData;
		// Log.l(" report: %s\n user: %s\n reportData: %s", JSON.stringify(report), JSON.stringify(user), JSON.stringify(reportData));
		var transactions = null;
		if(!report || !report.length) {
			transactions = null;
		} else {
			transactions = alr.map(function(transaction) {
				var tr = transaction;
				var arrItem = [];
				var incCell = {"style": "incomeCell"};
				var expCell = {"style": "expenseCell"};
				if(tr.isCash) {
					// Transaction is a cash infusion
					var amt = afilter('currency')(tr.amount, "$", 2);
					var dt = moment(tr.date).format(dateFormat);
					incCell.text = amt;
					arrItem.push(dt);
					arrItem.push("Cash");
					arrItem.push(incCell);
					arrItem.push("");
				} else if(tr.isExpense) {
					// Transaction is an expense
					var amt = afilter('currency')(tr.amount, "$", 2);
					var dt = moment(tr.date).format(dateFormat);
					expCell.text = amt;
					arrItem.push(dt);
					arrItem.push(tr.name);
					arrItem.push("");
					arrItem.push(expCell);
				} else {
					// Transaction is a sale
					var amt = afilter('currency')(tr.amount, "$", 2);
					var dt = moment(tr.date).format(dateFormat);
					incCell.text = amt;
					arrItem.push(dt);
					arrItem.push("Sale");
					arrItem.push(incCell);
					arrItem.push("");
				}
				return arrItem;
				// return [item.name, item.amount];
			});
		}

		var time = rdata.timeFrame.value;
		var timespan = "";
		if(time == 'day') {
			timespan = afilter('translate')("str_daily");
		} else if(time == 'week') {
			timespan = afilter('translate')("str_weekly");
		} else if(time == 'month') {
			timespan = afilter('translate')("str_monthly");
		}

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
		var reportTitle = afilter('translate')("reports_activity_log");
		var title = reportTitle + ": " + timespan;
		// var title = timespan + " Activity Log";
		// title = titleCase(title);
		var startDate = moment(rdata.startDate);
		var endDate = moment(rdata.endDate);
		var strStartDate = startDate.format(dateFormat);
		var strEndDate = endDate.format(dateFormat);
		var strDateRange = strStartDate + " - " + strEndDate;
		var startingCash = rdata.startingCash;
		var endingCash = rdata.endingCash;
		var cashInfusions = rdata.cashInfusions;
		var strStartingCash = afilter('currency')(startingCash, "$", 2);
		var strEndingCash = afilter('currency')(endingCash, "$", 2);
		var strcashInfusions = afilter('currency')(cashInfusions, "$", 2);
		var totalSales = rdata.totalSales;
		var totalExpenses = rdata.totalExpenses;
		var totalCashInfusions = rdata.totalCashInfusions;
		var totalIncome = totalCashInfusions + totalSales;
		var strTotalExpenses = afilter('currency')(totalExpenses, "$", 2);
		var strTotalIncome = afilter('currency')(totalIncome, "$", 2);
		var strStartingCashHeader = afilter('translate')("reports_starting_cash");
		var strEndingCashHeader = afilter('translate')("reports_ending_cash");
		var strDateHeader = afilter('translate')("str_date");
		var strNameHeader = afilter('translate')("str_name");
		var strIncomeHeader = afilter('translate')("str_income");
		var strExpensesHeader = afilter('translate')("str_expense");
		var strTotalIncomeHeader = afilter('translate')("str_total_income");
		var strTotalExpensesHeader = afilter('translate')("str_total_expenses");

		Log.l("Total income: %s. Total expenses: %s.", strTotalIncome, strTotalExpenses);

		var address = "";
		if(street2) {
			address = street1 + "\n" + street2 + "\n" + city + " " + state + " " + postal;
		} else {
			address = street1 + "\n" + city + " " + state + " " + postal;
		}

		// Log.l("userid: %s, orgname: %s, rep: %s, address: %s, email: %s, phone: %s, title: %s, dateRange: %s, totalI: %s, totalE: %s, totalP: %s", userid, orgname, representative, address, email, phone, title, dateRange, strIncome, strExpenses, strProfit);
		var transTable = {};
		// Log.l("Checking transactions before building table. transactions is:\n%s", JSON.stringify(transactions, false, 2));

		var bodyItems = [];

		var tableBody = [
			[
				{
					"text": strDateHeader,
					"style": "itemsTableHeader"
				},
				{
					"text": strNameHeader,
					"style": "itemsTableHeader"
				},
				{
					"text": strIncomeHeader,
					"style": "itemsTableHeader"
				},
				{
					"text": strExpensesHeader,
					"style": "itemsTableHeader"
				}
			]
		];

		var transTable = {
			"style": "itemsTable",
			"table": {
				"headerRows": 1,
				"keepWithHeaderRows": 1,
				"widths": [ 75, "*", 75, 75 ],
				"body": [
					[
						{
							"text": strDateHeader,
							"style": "itemsTableHeader"
						},
						{
							"text": strNameHeader,
							"style": "itemsTableHeader"
						},
						{
							"text": strIncomeHeader,
							"style": "itemsTableHeader"
						},
						{
							"text": strExpensesHeader,
							"style": "itemsTableHeader"
						}
					],
					[
						{"text": strStartDate, "fillColor": "gainsboro"},
						{"text": strStartingCashHeader, "fillColor": "gainsboro"},
						{"text": strStartingCash, "style": "cashCell", "colSpan": 2, "fillColor": "gainsboro"}
					]
				]
			}
		};

		var strNoTransactions = "(" + afilter('translate')("str_time_period_no_transactions");

		if(transactions == null) {
			Log.l("transactions is null, setting bodyItems to 'no transactions'");
			bodyItems = [ [ {"text": strNoTransactions, "colSpan": 4, "style": "emptyRow"} ] ];
		} else {
			Log.l("transactions is not null!");
			bodyItems = transactions;
		}

		var endingCashRow = [
			[
				{"text": strEndDate, "fillColor": "gainsboro"},
				{"text": strEndingCashHeader, "fillColor": "gainsboro"},
				{"text": strEndingCash, "style": "cashCell", "colSpan": 2, "fillColor": "gainsboro"}
			]
		];

		var totalsRow = [
			[
				"",
				{"text": strTotalIncomeHeader, "style": "totalCell"},
				"",
				{"text": strTotalIncome, "style": "incomeCell"}
			],
			[
				"",
				{"text": strTotalExpensesHeader, "style": "totalCell"},
				"",
				{"text": strTotalExpenses, "style": "expenseCell"}
			]
		];


		// Log.l("BodyItems is:\n%s", JSON.stringify(bodyItems, false, 2));

		transTable.table.body = transTable.table.body.concat(bodyItems).concat(endingCashRow);

		// Log.l("TransTable is now:\n%s", JSON.stringify(transTable, false, 2));
		// Log.l(transTable);

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
					"text": strDateRange,
					"style": "header"
				},
				{ "style": "organizationheader",
					"stack": [
						orgname,
						representative,
						address
					]
				},
				transTable,
				{
					"style": "totalsTable",
					"table": {
						"widths": [ 75, "*", 75, 75 ],
						"body": totalsRow
					},
					"layout": "noBorders"
				}
			]
		};
		return dd;
	}

})();

