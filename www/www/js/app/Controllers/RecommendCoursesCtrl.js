
angular
  .module('socialputts')
.controller('RecommendCoursesCtrl', function ($scope, $http, $location) {
        var positionUser = $.jStorage.get('positionUser');
        var user = $.jStorage.get('user');
        if (user.state == null) {
            getStateByGoogelSearch(positionUser, function (state) {
                user.state = state;
                $.jStorage.set('user', user);
                getCoursesFromServer(user);
            });
        } else {
            getCoursesFromServer(user);
        }

        function getStateByGoogelSearch(positionUser, response) {
            var currentPositionUser = new google.maps.LatLng(positionUser.latitude, positionUser.longitude);
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({ 'latLng': currentPositionUser }, function (results, status) {
                if (status == "OK") {
                    var stateByGoogeleSearch = null;
                    $.each(results, function (i, addressObject) {
                        var types = addressObject.types;
                        $.each(types, function (j, typeAddressObject) {
                            if (typeAddressObject == "administrative_area_level_1") {
                                stateByGoogeleSearch = addressObject.address_components[0].long_name;
                                return response(stateByGoogeleSearch);
                            }
                        });
                    });
                } else {
                    return response($.jStorage.get("UsaStateByDefault"));
                }
            });
        }

        function getCoursesFromServer(userInfo) {
            var packet = {
                LatLng: positionUser,
                CourseModel: {
                    CourseName: "",
                    Address: userInfo.address,
                    CountryId: 1,
                    StateName: userInfo.state,
                    City: userInfo.city,
                    Zip: userInfo.zip,
                    Mileage: 100,
                    NumberOfHoles: 9
                }
            };

            var url = socialputtsLink + "/api/Course/GetSearchedCourses?email=" + $.jStorage.get('user').userName;

            $.blockUI();
            $http.post(url, packet)
			.success(function (courses) {
			    $.unblockUI();
			    $scope.Courses = courses;
			    getDistanceBeetweenCourseAndUserPosition($scope.Courses);
			});
        };

        function getDistanceBeetweenCourseAndUserPosition(courses) {
            var positionUser = $.jStorage.get('positionUser');
            var currentPositionUser = new google.maps.LatLng(positionUser.latitude, positionUser.longitude);
            $.each(courses, function (i, course) {
                var coursePosition = new google.maps.LatLng(course.latitude, course.longitude);
                var metersInMile = 1609.344;
                var distanceInMeters = google.maps.geometry.spherical.computeDistanceBetween(currentPositionUser, coursePosition);
                course.distance = Math.round(distanceInMeters / metersInMile);
            });
        }

        function getIdFavoriteCourses(favoriteCourse) {
            var ids = [];
            $.each(favoriteCourse, function (i, course) {
                if (course.isFavourite) {
                    ids.push(course.id);
                }
            });

            return ids;
        }

        $scope.SelectCourseIsFavorite = function (course) {
            course.isFavourite = true;
            // alert("Course " + course.id + " selected like favorite ");
        };

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

        $scope.GoToStep2 = function () {
            var ids = getIdFavoriteCourses($scope.Courses);
            if (ids.length > 0) {
                $.blockUI();
                $http.post(socialputtsLink + "/api/Course/AddManyCoursesToFavorite?userId=" + $.jStorage.get('user').userId, ids)
		            .success(function(result) {
		                $.unblockUI();
		            });
            }
            $location.path('/recommendgroup');
        };
    })