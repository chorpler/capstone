(function () {
	angular.module('app.reports')
	.directive('reportHeader', reportHeader);

	function reportHeader ($filter) {
		var directive = {
			restrict: 'E',
			scope: {
				startDate: '=',
				endDate: '=',
				timeFrame: '=',
				change: '&'
			},
			templateUrl: 'Reports/templates/report-header.html',
			link: link
		};

		var timeFrames = [];

		return directive;

		function link (scope) {
			scope.changeTimeFrame = changeTimeFrame;
			scope.model = {};

			scope.changeTimeFrame = changeTimeFrame;
			scope.changeDateRange = changeDateRange;

			function init () {
				timeFrames = [{
					id: 'reports_header_day',
					value: 'day'
				}, {
					id: 'reports_header_week',
					value: 'week'
				}, {
					id: 'reports_header_month',
					value: 'month'
				}];

				scope.model.timeFrames = timeFrames;
				scope.model.timeFrame = scope.timeFrame;
			}

			function changeTimeFrame (timeFrame) {
				scope.startDate = moment(scope.startDate).startOf(timeFrame.value);
				scope.endDate = moment(scope.startDate).endOf(timeFrame.value);

				scope.change()(scope.startDate, timeFrame);
			}

			function changeDateRange (direction, timeFrame) {
				scope.startDate = direction > 0 ? moment(scope.startDate).add(1, timeFrame.value) :
												  moment(scope.startDate).subtract(1, timeFrame.value);
				scope.endDate = moment(scope.startDate).endOf(timeFrame.value);

				scope.change()(scope.startDate, timeFrame);
			}

			init();
		}
	}
})();
