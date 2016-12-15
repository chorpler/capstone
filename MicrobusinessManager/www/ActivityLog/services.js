(function() {
	angular.module('app.activitylog')
	.factory('pdfService', ['$q', '$filter', pdfService]);

	function pdfService($q, $filter) {
		var cfilter = $filter;
		function createPdf(report, user, reportData) {
			return $q(function(resolve, reject) {
				Log.l("AL: Now in pdfService.createPdf() ... report and user are:");
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

		// report consists of sales, expenses, and cashInfusions, concatenated into one array
		// sales: id, amount, date
		// expenses: id, name, amount, expType, comments, date, type
		// cashInfusions: id, amount, date
		var alr = report;
		var rdata = reportData;
		Log.l(" report: %s\n user: %s\n reportData: %s", JSON.stringify(report), JSON.stringify(user), JSON.stringify(reportData));
		var transactions = alr.map(function(transaction) {
			var tr = transaction;
			var arrItem = [];
			var incCell = {"style": "incomeCell"};
			var expCell = {"style": "expenseCell"};
			if(tr.isCash) {
				// Transaction is a cash infusion
				var amt = afilter('currency')(tr.amount, "$", 2);
				var dt = moment(tr.date).format("YYYY-MM-DD");
				incCell.text = amt;
				arrItem.push(dt);
				arrItem.push("Cash");
				arrItem.push(incCell);
				arrItem.push("");
			} else if(tr.isExpense) {
				// Transaction is an expense
				var amt = afilter('currency')(tr.amount, "$", 2);
				var dt = moment(tr.date).format("YYYY-MM-DD");
				expCell.text = amt;
				arrItem.push(dt);
				arrItem.push(tr.name);
				arrItem.push("");
				arrItem.push(expCell);
			} else {
				// Transaction is a sale
				var amt = afilter('currency')(tr.amount, "$", 2);
				var dt = moment(tr.date).format("YYYY-MM-DD");
				incCell.text = amt;
				arrItem.push(dt);
				arrItem.push("Sale");
				arrItem.push(incCell);
				arrItem.push("");
			}
			return arrItem;
			// return [item.name, item.amount];
		});

		var time = rdata.timeFrame.value;
		var timespan = "";
		if(time == 'day') {
			timespan = "Daily";
		} else if(time == 'week') {
			timespan = "Weekly";
		} else if(time == 'month') {
			timespan = "Monthly";
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
		var title = timespan + " Activity Log";
		// title = titleCase(title);
		var startDate = moment(rdata.startDate);
		var endDate = moment(rdata.endDate);
		var dateRange = startDate.format("YYYY-MM-DD") + " - " + endDate.format("YYYY-MM-DD");
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

		var address = "";
		if(street2) {
			address = street1 + "\n" + street2 + "\n" + city + " " + state + " " + postal;
		} else {
			address = street1 + "\n" + city + " " + state + " " + postal;
		}

		// Log.l("userid: %s, orgname: %s, rep: %s, address: %s, email: %s, phone: %s, title: %s, dateRange: %s, totalI: %s, totalE: %s, totalP: %s", userid, orgname, representative, address, email, phone, title, dateRange, strIncome, strExpenses, strProfit);

		var dd = {
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
					address
					]
				},
				{
					"style": "totalsTable",
					"table": {
						"widths": [
							75,
							"*",
							75,
							75
						],
						"body": [
							[
								"",
								{"text": "Starting Cash", "style": "rightAlign" },
								"",
								{"text": strStartingCash, "style": "incomeCell" }
							]
						]
					},
					"layout": "noBorders"
				},
				{
					"text": "Activity",
					"style": "subheader"
				},
				{
					"style": "itemsTable",
					"table": {
						"widths": [
							75,
							"*",
							75,
							75
						],
						"body": [
							[
								{
									"text": "Date",
									"style": "itemsTableHeader"
								},
								{
									"text": "Name",
									"style": "itemsTableHeader"
								},
								{
									"text": "Income",
									"style": "itemsTableHeader"
								},
								{
									"text": "Expense",
									"style": "itemsTableHeader"
								}
							]
						].concat(transactions)
					}
				},
				{
					"style": "totalsTable",
					"table": {
						"widths": [
							75,
							"*",
							75,
							75
						],
						"body": [
							[
								"",
								"Totals",
								{"text": strTotalIncome, "style": "incomeCell"},
								{"text": strTotalExpenses, "style": "expenseCell"}
							]
						]
					},
					"layout": "noBorders"
				},
				{
					"style": "finalTotalsTable",
					"table": {
						"widths": [
							75,
							"*",
							75,
							75
						],
						"body": [
							[
								"",
								"Ending Cash",
								"",
								strEndingCash
							]
						]
					},
					"layout": "noBorders"
				}
			],
			"styles": {
				"header": {
					"fontSize": 20,
					"bold": true,
					"margin": [
						0,
						0,
						0,
						10
					],
					"alignment": "right"
				},
				"subheader": {
					"fontSize": 16,
					"bold": true,
					"margin": [
						0,
						15,
						0,
						5
					]
				},
				"organizationheader": {
					"fontSize": 14,
					"bold": false,
					"margin": [
						0,
						5,
						0,
						5
					]
				},
				"itemsTable": {
					"margin": [
						0,
						5,
						0,
						0
					]
				},
				"itemsTableHeader": {
					"bold": true,
					"fontSize": 13,
					"color": "black"
				},
				"rightAlign": {
					"alignment": "right"
				},
				"incomeCell": {
					"alignment": "right",
					"color": "black"
				},
				"expenseCell": {
					"alignment": "right",
					"color": "red"
				},
				"totalsTable": {
					"alignment": "right",
					"bold": true,
					"margin": [
						0,
						5,
						0,
						0
					]
				},
				"finalTotalsTable": {
					"alignment": "right",
					"bold": true,
					"margin": [
						0,
						25,
						0,
						0
					]
				}
			},
			"defaultStyle": {}
		};
		return dd;
	}

})();

