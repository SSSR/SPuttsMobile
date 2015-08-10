angular
  .module('socialputts')
    .controller('GroupCoursesCtrl', function ($scope, $http, $location) {

        var positionUser = $.jStorage.get('positionUser');
        var user = $.jStorage.get('user');
        getGroupsFromServer(user);

        function getDistanceBeetweenGroupAndUserPosition(groups) {
            var positionUser = $.jStorage.get('positionUser');
            var currentPositionUser = new google.maps.LatLng(positionUser.latitude, positionUser.longitude);
            $.each(groups, function (i, group) {
                var groupPosition = new google.maps.LatLng(group.latitude, group.longitude);
                var metersInMile = 1609.344;
                var distanceInMeters = google.maps.geometry.spherical.computeDistanceBetween(currentPositionUser, groupPosition);
                group.distance = Math.round(distanceInMeters / metersInMile);
            });
        }

        function getGroupsFromServer(userInfo) {
            var packet = {
                LatLng: positionUser,
                GroupModel: {
                    CourseName: "",
                    Address: userInfo.address,
                    CountryId: 1,
                    StateName: userInfo.state,
                    City: userInfo.city,
                    Zip: userInfo.zip,
                    Mileage: 300,
                    NumberOfHoles: 9
                }
            };

            var url = socialputtsLink + "/api/Group/GetSearchedGroup?email=" + $.jStorage.get('user').userName;
            $http.post(url, packet)
			.success(function (groups) {
			    $scope.Groups = groups;
			    getDistanceBeetweenGroupAndUserPosition($scope.Groups);
			});
        };

        function getIdGroupsToJoin(groups) {
            var ids = [];
            $.each(groups, function (i, group) {
                if (group.toJoin) {
                    ids.push(group.id);
                }
            });

            return ids;
        }

        $scope.GetMiles = function (miles) {
            if (miles == 0) {
                return "mile";
            }
            var mileStr = miles.toString();
            var valueStr = mileStr[mileStr.length - 1];
            if (valueStr == "4" ||
              valueStr == "7" ||
              valueStr == "8") {
                return "mile";
            } else {
                return "miles";
            }
        };

        $scope.SelectGroupToJoin = function (group) {
            group.toJoin = true;
            //   alert("Course " + group.id + " selected Group   ");
        };

        $scope.GoToStep3 = function () {
            var ids = getIdGroupsToJoin($scope.Groups);
            if (ids.length > 0) {
                $http.post(socialputtsLink + "/api/Group/AddManyGroupsToJoin?userId=" + $.jStorage.get('user').userId, ids)
		            .success(function (result) { });
            }

            $location.path('/recommendbuddy');
        };

    })