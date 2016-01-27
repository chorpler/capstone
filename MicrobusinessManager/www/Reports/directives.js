(function () {
	angular.module('app.reports')
	.directive('reportHeader', reportHeader);

	function reportHeader ($window) {
		var directive = {
			restrict: 'E',
			scope: {
				startDate: '=',
				timeFrame: '=',
				change: '&'
			},
			templateUrl: 'Reports/templates/report-header.html',
			link: link
		};


		var timeFrames = ['Day', 'Week', 'Month'];

		return directive;

		function link (scope) {
			scope.changeTimeFrame = changeTimeFrame;
			scope.model = {};

			scope.changeTimeFrame = changeTimeFrame;
			scope.changeDateRange = changeDateRange;

			function init () {
				scope.model.timeFrames = timeFrames;
				scope.model.timeFrame = scope.timeFrame;

				scope.endDate = moment(scope.startDate).endOf(scope.model.timeFrame);
			}

			function changeTimeFrame (timeFrame) {
				scope.startDate = moment(scope.startDate).startOf(timeFrame);
				scope.endDate = moment(scope.startDate).endOf(timeFrame);

				$window.localStorage['MM_Reports_Start_Date'] = scope.startDate.toJSON();
				$window.localStorage['MM_Reports_Timeframe'] = timeFrame;

				scope.change();
			}

			function changeDateRange (direction, timeFrame) {
				scope.startDate = direction > 0 ? moment(scope.startDate).add(1, timeFrame) : 
												  moment(scope.startDate).subtract(1, timeFrame);
				scope.endDate = direction > 0 ? moment(scope.endDate).add(1, timeFrame) : 
												moment(scope.endDate).subtract(1, timeFrame);

				$window.localStorage['MM_Reports_Start_Date'] = scope.startDate;

				scope.change();
			}

			init();
		}
	}
})();