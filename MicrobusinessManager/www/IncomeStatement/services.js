(function () {
	angular.module('app.income-statement')
	.factory('IncomeStatementService', ['$q', 'app.settings', IncomeStatementService]);

	function ReportService($q) {
		function createPdf(invoice, user) {
			return $q(function(resolve, reject) {
				var dd = createDocumentDefinition(invoice, user);
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
		var raw = atob(base64);
		var uint8Array = new Uint8Array(raw.length);
		for (var i = 0; i < raw.length; i++) {
			uint8Array[i] = raw.charCodeAt(i);
		}
		return uint8Array;
	}

	function createDocumentDefinition(report, user) {
		var isr = report;
		var items = isr.incomeItems.map(function(item) {
			return [item.name, item.amount];
		});
		var expitems = isr.expenseItems.map(function(item) {
			return [item.name, item.amount];
		});

		var userid = user.id;
		var orgname = user.name;
		var representative = user.representative;
		var address = user.address;
		var email = user.email;
		var phone = user.phone;
		var title = report.timeFrame + " Income Statement";
		var dateRange = isr.startDate + " - " + isr.endDate;
		var totalIncome = isr.totalIncome;
		var totalExpenses = isr.totalExpenses;
		var totalProfit = isr.totalProfit;

		var dd = {
			content: [
				{ text: title, style: 'header'},
				{ text: dateRange, alignment: 'right'},

				// { text: '', style: 'subheader'},
				{text: 'ORGANIZATION', style: 'subheader'},
				orgname,
				representative,
				address,


				{ text: 'Income/Expenses', style: 'subheader'},
				{
					style: 'itemsTable',
					table: {
						widths: ['*', 75],
						body: [
							[ 
								{ text: 'Name', style: 'itemsTableHeader' },
								{ text: 'Amount', style: 'itemsTableHeader' }
							]
						].concat(items).concat(expitems)
					}
				},
				{
					style: 'totalsTable',
					table: {
						widths: ['*', 75],
						body: [
							[
								'Total Income',
								totalIncome,
							],
							[
								'Total Expenses',
								totalExpenses,
							],
							[
								'Total Profit',
								totalProfit,
							]
						]
					},
					layout: 'noBorders'
				},
			],
			styles: {
				header: {
					fontSize: 20,
					bold: true,
					margin: [0, 0, 0, 10],
					alignment: 'right'
				},
				subheader: {
					fontSize: 16,
					bold: true,
					margin: [0, 20, 0, 5]
				},
				itemsTable: {
					margin: [0, 5, 0, 15]
				},
				itemsTableHeader: {
					bold: true,
					fontSize: 13,
					color: 'black'
				},
				totalsTable: {
					bold: true,
					margin: [0, 30, 0, 0]
				}
			},
			defaultStyle: {
			}
		}
		return dd;
	}
})();
