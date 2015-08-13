
angular
  .module('socialputts')
    .controller('BuddyCoursesCtrl', function ($scope, $http, $location) {
        $scope.SP = window.socialputtsLink;

        $http.get(socialputtsLink + "/api/Buddies/GetRecommendBuddies?userId=" + $.jStorage.get('user').userId)
		            .success(function (recommendBuddies) {
		                $scope.RecommendBuddies = recommendBuddies;
		            });

        $scope.AddBuddy = function (buddy) {
            buddy.toJoin = true;
        };

        function getIdBuddies(recommendBuddies) {
            var packageBudiesInfo = { BuddyInfos: [] };
            $.each(recommendBuddies.recBuddiesFromGrops, function (i, buddy) {
                if (buddy.toJoin) {
                    packageBudiesInfo.BuddyInfos.push({ id: buddy.userId, email: buddy.email });
                }
            });

            $.each(recommendBuddies.recBuddiesFromCourses, function (i, buddy) {
                if (buddy.toJoin) {
                    packageBudiesInfo.BuddyInfos.push({ id: buddy.userId, email: buddy.email });
                }
            });

            return packageBudiesInfo;
        }

        $scope.Done = function () {
            var buddiesInfo = getIdBuddies($scope.RecommendBuddies);

            if (buddiesInfo.BuddyInfos.length > 0) {
                $http.post(socialputtsLink + "/api/Buddies/AddBuddies?userId=" + $.jStorage.get('user').userId, buddiesInfo)
		            .success(function (result) {
		            });
            }
            $location.path('/index');
        };
    })