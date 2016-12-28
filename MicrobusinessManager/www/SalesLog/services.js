(function() {
	angular.module('app.expenselog')
	.factory('SLpdfService', ['$q', '$filter', '$translate', SLpdfService]);

	function SLpdfService($q, $filter, $translate) {
		var cfilter = $filter;
		function createSalesLogPdf(report, user, reportData) {
			Log.l("Now in createSalesLogPdf() ...");
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
			createSalesLogPdf: createSalesLogPdf
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
		Log.l("SL: Now in createDocumentDefinition() ...");

		var dateFormat = win.dateFormat || "YYYY-MM-DD";
		// report consists of expenses
		// expenses: id, name, amount, expType, comments, date, type
		var slr = report;
		var rdata = reportData;
		// Log.l(" report: %s\n user: %s\n reportData: %s", JSON.stringify(report), JSON.stringify(user), JSON.stringify(reportData));
		var rawTransactions = [], transactions = [], allSalesTables = [];

		var time = rdata.timeFrame.value;
		var timespan = "";
		if(time == 'day') {
			timespan = "str_daily";
		} else if(time == 'week') {
			timespan = "str_weekly";
		} else if(time == 'month') {
			timespan = "str_monthly";
		}

		// var userid = user.id;
		// var orgname = user.name;
		// var representative = user.representative;
		// var address = user.address;
		// var street1 = user.street1;
		// var street2 = user.street2;
		// var city = user.city;
		// var state = user.state;
		// var postal = user.postal;
		// var email = user.email;
		// var phone = user.phone;
		var organizationHeader = { "style": "organizationheader", "stack": [] };
		if(user) {
			var address = "";
			if(street2) {
				address = street1 + "\n" + street2 + "\n" + city + " " + state + " " + postal;
			} else {
				address = street1 + "\n" + city + " " + state + " " + postal;
			}
			organizationHeader.stack.push(user.orgname);
			organizationHeader.stack.push(user.representative);
			organizationHeader.stack.push(user.address);
		}

		var title = afilter('translate')("reports_sales_reports") + ": " + afilter('translate')(timespan);
		// title = titleCase(title);
		var startDate = moment(rdata.startDate);
		var endDate = moment(rdata.endDate);
		var strStartDate = startDate.format(dateFormat);
		var strEndDate = endDate.format(dateFormat);
		var strDateRange = strStartDate + " — " + strEndDate;
		var totalSales = rdata.salesTotal;
		var strTotalSales = afilter('currency')(totalSales, "$", 2);
		var strDateHeader = afilter('translate')("str_date");
		var strNameHeader = afilter('translate')("str_name");
		var strExpenseHeader = afilter('translate')("str_expenses");
		var strItemHeader = afilter('translate')("str_item");
		var strQuantityHeader = afilter('translate')("str_quantity");
		var strUnitPriceHeader = afilter('translate')("str_unit_price");
		var strTotalPriceHeader = afilter('translate')("str_total_price");
		var strGrandTotalHeader = afilter('translate')("str_grand_total");
		var strNoSales = "(" + afilter('translate')("str_time_period_no_sales") + ")";

		var outsideBorderOnly = {
			"hLineWidth": function(i, node) {
				return (i === 0 || i === node.table.body.length) ? 2 : 0;
			},
			"vLineWidth": function(i, node) {
				return (i === 0 || i === node.table.widths.length) ? 2 : 0;
			},
			"hLineColor": function(i, node) {
				return (i === 0 || i === node.table.body.length) ? 'black' : 'gray';
			},
			"vLineColor": function(i, node) {
				return (i === 0 || i === node.table.widths.length) ? 'black' : 'gray';
			},
		};

		// Log.l("userid: %s, orgname: %s, rep: %s, address: %s, email: %s, phone: %s, title: %s, dateRange: %s, totalI: %s, totalE: %s, totalP: %s", userid, orgname, representative, address, email, phone, title, dateRange, strIncome, strExpenses, strProfit);
		var transTable = {};
		// Log.l("Checking transactions before building table. transactions is:\n%s", JSON.stringify(transactions, false, 2));

		var grandTotalAllSales = 0;
		var outerSalesTable = {}, singleSaleTable = {};
		if(isEmpty(report)) {
			Log.l("allSalesTables is null, setting allSalesTable to 'no transactions'");
			var noSaleTable = {
				"style": "saleHeader",
				"table": {
					"headerRows": 1,
					"widths": ['*'],
					"body": [
						[
							{"text": strNoSales, "style": "noSales"}
						]
					]
				},
				"layout": "noBorders"
			};
			allSalesTables = [noSaleTable];
			win.outerSalesTable = allSalesTables;
		} else {
			slr = report.sort(dateSort);
			for(var idx in slr) {
				var sale = slr[idx];
				var grandtotal = Number(sale.amount);
				grandTotalAllSales += grandtotal;
				var saleDate = moment(sale.date);
				var saleNumber = sale.id;
				var strSaleTotalAmount = afilter('currency')(grandtotal);
				var strSaleTotal = afilter('translate')("str_sale_total") + ": " + strSaleTotalAmount;
				var strSaleDate = saleDate.format(dateFormat);
				var strSaleID = afilter('translate')("str_sale") + " #" + saleNumber;
				var products = sale.products;
				var saleTable = {
					"style": "saleHeader",
					"table": {
						"headerRows": 1,
						"widths": ['*', '*', '*'],
						"body": [
							[
								{ "text": strSaleDate, "style": "outerHeader", "alignment": "left" },
								{ "text": strSaleID, "style": "outerHeader", "alignment": "center" },
								{ "text": strSaleTotal, "style": "outerHeader", "alignment": "right" }
							],
							[
								{
									"style": "internalTable",
									"table": {
										"headerRows": 1,
										"widths": ['*', 75, 75, 75],
										"body": [
											[
												{"text": strItemHeader, "alignment": "left", "style": "internalHeader"},
												{"text": strQuantityHeader, "alignment": "center", "style": "internalHeader"},
												{"text": strUnitPriceHeader, "alignment": "right", "style": "internalHeader"},
												{"text": strTotalPriceHeader, "alignment": "right", "style": "internalHeader"}
											]
										]
									}, layout: "headerLineOnly", colSpan: 3
								}, "", ""
							]
						]
					}, "layout": outsideBorderOnly
				};
				win.outerSalesTable = saleTable;
				Log.l("SL: created outerSalesTable for the first time.");
				Log.l(saleTable);
				var internalTable = saleTable.table.body;
				var currentTableIndex = internalTable.length - 1;
				var singleSaleTable = saleTable.table.body[currentTableIndex][0].table;
				win.singleSaleTable = singleSaleTable;
				for(var idx2 in products) {
					var oneProductRow = [];
					var product = products[idx2];
					var item = product.name;
					var qty = Number(product.quantity);
					var unitprice = Number(product.saleprice);
					var totalitemprice = qty * unitprice;
					var col1 = {"text": item, "style": "internalCell", "alignment": "left"};
					var col2 = {"text": qty, "style": "internalCell", "alignment": "center"};
					var col3 = {"text": afilter('currency')(unitprice), "style": "internalCell", "alignment": "right"};
					var col4 = {"text": afilter('currency')(totalitemprice), "style": "internalCell", "alignment": "right"};
					oneProductRow.push(col1);
					oneProductRow.push(col2);
					oneProductRow.push(col3);
					oneProductRow.push(col4);
					singleSaleTable.body.push(oneProductRow);
				}
				allSalesTables.push(saleTable);
			}
		var strGrandTotalAllSalesHeader = afilter('translate')("str_total_sales");
		var strGrandTotalAllSales = afilter('currency')(grandTotalAllSales);
		var strGrandTotalString = strGrandTotalAllSalesHeader + ": " + strGrandTotalAllSales;

		var grandTotalRow = {"text": strGrandTotalString, "style": "finalResult"};
			allSalesTables.push(grandTotalRow);
		}

		// Log.l("allSalesTables is now:\n%s", JSON.stringify(allSalesTables, false, 2));
		// Log.l(allSalesTables);

		var fileHeader = [
				{
					"text": title,
					"style": "header"
				},
				{
					"text": strDateRange,
					"style": "header"
				},
				organizationHeader
			];

		var styleDefault = { "margin": [ 0, 5, 0, 0 ] };
		var allStyles = {
			"header": {
				"fontSize": 20,
				"bold": true,
				"alignment": "right",
				"margin": [ 0, 0, 0, 10 ]
			},
			"outerHeader": {
				"fontSize": 16,
				"bold": true,
				"fillColor": "lightgrey",
				"margin": [ 2, 2, 2, 2 ]
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
			},
			"noSales": {
				"bold": true,
				"alignment": "center",
				"fontSize": 18
			},
			"saleDateCell": {
				"fontSize": 20,
				"bold": true,
				"alignment": "left",
				"fillColor": "lightgrey",
				"margin": [ 0, 0, 0, 10 ]
			},
			"saleIDCell": {
				"fontSize": 20,
				"bold": true,
				"alignment": "center",
				"fillColor": "lightgrey",
				"margin": [ 0, 0, 0, 10 ]
			},
			"saleTotalCell": {
				"fontSize": 20,
				"bold": true,
				"alignment": "right",
				"fillColor": "lightgrey",
				"margin": [ 0, 0, 0, 10 ]
			},
			"saleHeader": {
				"bold": true,
				"color": "black",
				"margin": [0, 10, 0, 10]
			},
			"internalTable": {
				"bold": false,
				"margin": 0
			},
			"internalHeader": {
				"bold": true,
				"color": "black",
				"margin": [0, 5, 0, 5],
				"fillColor": "white"
			},
			"internalCell": {
				"bold": false,
				"color": "black",
				"margin": [0, 5, 0, 5],
				"fillColor": "white"
			},
			"finalResult": {
				"fontSize": 18,
				"bold": true,
				"alignment": "right",
				"margin": [0, 0, 0, 0]
			}
		};

		var dd = {
			"defaultStyle": styleDefault,
			"styles": allStyles,
			"content": fileHeader.concat(allSalesTables)
		};
		return dd;
	}

})();

