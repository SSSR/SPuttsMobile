angular
  .module('socialputts')
    .controller('ChatCtrl', function ($scope, $http, $location, $route) {
        checkUserLogedOff($location, $scope);
        var userId = $route.current.params.userId;
        $scope.firstName = $route.current.params.firstName;
        $scope.lastName = $route.current.params.lastName;

        $http.post(socialputtsLink + "/api/Chat/MarkAllMessagesAsRead?userId=" + userId + "&toUserId=" + $.jStorage.get("user").userId)
			.success(function () {
			});

        $.connection.messageHub.client.sendMessage = function (message) {
            $scope.messageText = "";
            $scope.history.unshift({
                dateTime: moment.utc(message.DateTime).local().format('MM/DD/YYYY hh:mm A'),
                fromUserEmail: message.FromUserEmail,
                fromUserId: message.FromUserId,
                fromUserName: message.FromUserName,
                message: message.Message,
                toUserId: message.ToUserId
            });
            $scope.$apply();

            if (message.FromUserId != $.jStorage.get("user").userId) {
                $http.post(socialputtsLink + "/api/Chat/MarkAllMessagesAsRead?userId=" + message.FromUserId + "&toUserId=" + message.ToUserId)
			.success(function () {
			});
            }

        };

        $http.get(socialputtsLink + "/api/Chat/get?userId=" + $.jStorage.get("user").userId + "&buddyId=" + userId)
	.success(function (history) {
	    _.each(history, function (message) {
	        message.dateTime = moment.utc(message.dateTime).local().format('MM/DD/YYYY hh:mm A');
	    });

	    $scope.history = history;
	});

        $scope.sendMessage = function () {

            $.connection.messageHub.server.sendPrivateMessage($.jStorage.get("user").userId, userId, $scope.messageText);
        };
    })