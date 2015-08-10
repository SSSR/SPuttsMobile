angular
  .module('socialputts')
    .controller('BuddiesCtrl', function ($scope, $http, $location) {
        // checkUserLogedOff($location, $scope);
        $scope.SP = socialputtsLink;
        //$scope.buddiesArray = [];
        $http.get(socialputtsLink + "/api/Buddies/Get?userId=" + $.jStorage.get("user").userId)
	    .success(function (buddies) {
	        $scope.buddies = buddies;

	        //buddies.forEach(function (buddy) {

	        //    $scope.countIncomingMessage = $scope.countIncomingMessage + buddy.incomingMessages;
	        //    if (buddy.incomingMessages > 0) {
	        //        $scope.buddiesArray.push(buddy);
	        //    }
	        //})
	    });


        $scope.countIncomingMessage = 0;
        $http.get(socialputtsLink + "/api/Buddies/GetIncomingMessage?id=" + $.jStorage.get("user").userId)
	.success(function (countmessageAndBuddies) {
	    $scope.countmessageAndBuddies = countmessageAndBuddies;
	    countmessageAndBuddies.forEach(function (countmessage) {
	        $scope.countIncomingMessage = $scope.countIncomingMessage + countmessage.count;
	    });
	});


        $.connection.messageHub.client.userLoggedIn = function (userId) {
            var buddy = _.find($scope.buddies, function (buddyItem) {
                return buddyItem.id == userId;
            });
            buddy.isOnline = true;

            $scope.buddies = _.sortBy($scope.buddies, function (buddy) {
                return !buddy.isOnline == true;
            });

            $scope.$apply();
        };

        $.connection.messageHub.client.userLoggedOut = function (userId) {
            var buddy = _.find($scope.buddies, function (buddyItem) {
                return buddyItem.id == userId;
            });
            buddy.isOnline = false;

            $scope.buddies = _.sortBy($scope.buddies, function (buddy) {
                return !buddy.isOnline == false;
            });

            $scope.$apply();
        };
      
    })