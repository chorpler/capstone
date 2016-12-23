(function() {
	angular.module('app.expenselog')
	.factory('ELpdfService', ['$q', '$filter', '$translate', ELpdfService]);

	function ELpdfService($q, $filter, $translate) {
		var cfilter = $filter;
		function createExpenseLogPdf(report, user, reportData) {
			Log.l("Now in createExpenseLogPdf() ...");
			return $q(function(resolve, reject) {
				Log.l("AL: Now in pdfService.createPdf() ... report and user are:");
				Log.l(JSON.stringify(report));
				Log.l(JSON.stringify(user));
				var dd = createDocumentDefinition(report, user, reportData, cfilter);
				Log.l("PDF Design Document looks like:\n%s\n", JSON.stringify(dd, false, 2));
				var pdf = pdfMake.createPdf(dd);

				pdf.getBase64(function(output) {
					resolve(base64ToUint8Array(output));
				});
			});
		}


		var service = {
			createExpenseLogPdf: createExpenseLogPdf
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

	function dateSort(a,b) {
		return a.date > b.date ? 1 : a.date < b.date ? -1 : 0;
	}

	function createDocumentDefinition(report, user, reportData, afilter) {
		Log.l("Now in createDocumentDefinition() ...");

		var dateFormat = win.dateFormat || "YYYY-MM-DD";
		// report consists of expenses
		// expenses: id, name, amount, expType, comments, date, type
		var elr = report;
		var rdata = reportData;
		Log.l(" report: %s\n user: %s\n reportData: %s", JSON.stringify(report), JSON.stringify(user), JSON.stringify(reportData));
		var rawTransactions = [], transactions = [];
		// if(!report || !report.length) {
		if(isEmpty(report)) {
			transactions = null;
		} else {
			for(var date in elr) {
				var tr = elr[date];
				for(var idx in tr) {
					rawTransactions.push(tr[idx]);
				}
			}
			rawTransactions = rawTransactions.sort(dateSort);
			Log.l("rawTransactions is:\n%s", JSON.stringify(rawTransactions, false, 2));
			for(var idx in rawTransactions) {
				var expense = rawTransactions[idx];
				var arrItem = [];
				var expCell = {"style": "rightAlign"};
				var expName = expense.name;
				var strDate = moment(expense.date).format(dateFormat);
				var amt = afilter('currency')(expense.amount, "$", 2);
				expCell.text = amt;
				arrItem.push(strDate);
				arrItem.push(expName);
				arrItem.push(expCell);
				transactions.push(arrItem);
			}
		}

		var time = rdata.timeFrame.value;
		var timespan = "";
		if(time == 'day') {
			timespan = "str_daily";
		} else if(time == 'week') {
			timespan = "str_weekly";
		} else if(time == 'month') {
			timespan = "str_monthly";
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
		var title = afilter('translate')("reports_expense_log") + ": " + afilter('translate')(timespan);
		// title = titleCase(title);
		var startDate = moment(rdata.startDate);
		var endDate = moment(rdata.endDate);
		var strStartDate = startDate.format(dateFormat);
		var strEndDate = endDate.format(dateFormat);
		var strDateRange = strStartDate + " - " + strEndDate;
		var totalSales = rdata.totalSales;
		var totalExpenses = rdata.totalExpenses;
		var strTotalExpenses = afilter('currency')(totalExpenses, "$", 2);
		var strTotalExpensesHeader = afilter('translate')("str_total_expenses");
		var strDateHeader = afilter('translate')("str_date");
		var strNameHeader = afilter('translate')("str_name");
		var strExpenseHeader = afilter('translate')("str_expenses");

		Log.l("Total expenses: %s.", strTotalExpenses);

		var address = "";
		if(street2) {
			address = street1 + "\n" + street2 + "\n" + city + " " + state + " " + postal;
		} else {
			address = street1 + "\n" + city + " " + state + " " + postal;
		}

		// Log.l("userid: %s, orgname: %s, rep: %s, address: %s, email: %s, phone: %s, title: %s, dateRange: %s, totalI: %s, totalE: %s, totalP: %s", userid, orgname, representative, address, email, phone, title, dateRange, strIncome, strExpenses, strProfit);
		var transTable = {};
		Log.l("Checking transactions before building table. transactions is:\n%s", JSON.stringify(transactions, false, 2));

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
					"text": strExpenseHeader,
					"style": "itemsTableHeader"
				}
			]
		];

		var transTable = {
			"style": "itemsTable",
			"table": {
				"headerRows": 1,
				"keepWithHeaderRows": 1,
				"widths": [ 75, "*", 75 ],
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
							"text": strExpenseHeader,
							"style": "itemsTableHeader"
						}
					],
				]
			}
		};

		var strNoExpenses = "(" + afilter('translate')("str_time_period_no_expenses") + ")";

		if(transactions == null) {
			Log.l("transactions is null, setting bodyItems to 'no transactions'");
			bodyItems = [ [ {"text": strNoExpenses, "colSpan": 3, "style": "emptyRow"} ] ];
		} else {
			Log.l("transactions is not null!");
			bodyItems = transactions;
		}

		var totalsRow = [
			[
				"",
				{"text": strTotalExpensesHeader, "style": "totalCell"},
				{"text": strTotalExpenses, "style": "expenseCell"}
			]
		];


		Log.l("BodyItems is:\n%s", JSON.stringify(bodyItems, false, 2));

		transTable.table.body = transTable.table.body.concat(bodyItems);

		Log.l("TransTable is now:\n%s", JSON.stringify(transTable, false, 2));
		Log.l(transTable);

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
						"widths": [ 75, "*", 75 ],
						"body": totalsRow
					},
					"layout": "noBorders"
				}
			]

		};
		return dd;
	}

})();

