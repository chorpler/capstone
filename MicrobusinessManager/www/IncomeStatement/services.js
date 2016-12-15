(function() {
	angular.module('app.income-statement')
		.factory('pdfService', ['$q', '$filter', pdfService]);
	// .factory('IncomeStatementService', IncomeStatementService);

	function pdfService($q, $filter) {
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
			var itemName = item.name;
			var numAmt = item.amount;
			var amt = afilter('currency')(numAmt, "$", 2);
			rtStyle.text = amt;
			arrItem.push(item.name);
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
		var title = timespan + " Income Statement";
		// title = titleCase(title);
		var startDate = moment(rdata.startDate);
		var endDate = moment(rdata.endDate);
		var dateRange = startDate.format("YYYY-MM-DD") + " - " + endDate.format("YYYY-MM-DD");
		var totalIncome = rdata.totalIncome;
		var totalExpenses = rdata.totalExpenses;
		var totalProfit = rdata.totalProfit;
		var strIncome = afilter('currency')(totalIncome, "$", 2);
		var strExpenses = afilter('currency')(totalExpenses, "$", 2);
		var strProfit = afilter('currency')(totalProfit, "$", 2);

		var address = "";
		if(street2) {
			address = street1 + "\n" + street2 + "\n" + city + " " + state + " " + postal;
		} else {
			address = street1 + "\n" + city + " " + state + " " + postal;
		}

		Log.l("userid: %s, orgname: %s, rep: %s, address: %s, email: %s, phone: %s, title: %s, dateRange: %s, totalI: %s, totalE: %s, totalP: %s", userid, orgname, representative, address, email, phone, title, dateRange, strIncome, strExpenses, strProfit);

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
					address,
					]
				},
				{
					"text": "Income",
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
									"text": "Name",
									"style": "itemsTableHeader"
								},
								{
									"text": "Amount",
									"style": "itemsTableHeader"
								}
							]
						].concat(items)
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
								"Total Income",
								strIncome
							]
						]
					},
					"layout": "noBorders"
				},
				{
					"text": "Expenses",
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
									"text": "Name",
									"style": "itemsTableHeader"
								},
								{
									"text": "Amount",
									"style": "itemsTableHeader"
								}
							]
						].concat(expitems)
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
								"Total Expenses",
								strExpenses
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
								"Total Profit",
								strProfit
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
				"totalsTable": {
					"alignment": "right",
					"bold": true,
					"margin": [
						0,
						5,
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

