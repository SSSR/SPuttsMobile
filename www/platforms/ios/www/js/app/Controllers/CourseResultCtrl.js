angular
  .module('socialputts')
    .controller('CourseResultCtrl', function ($scope, $http, $location, courseFinderService) {
    checkUserLogedOff($location, $scope);

    $scope.coursesOnMap = [];
    $scope.allMarkers = [];
    $scope.coursesToSort = [];
    $scope.coordsArray = [];
    $scope.favsCoordArray = [];
    $scope.markers = [];
    $scope.infoWindows = [];
    $scope.popupInfo = {};
    $scope.popupInfo.url = "";

    var formObject = courseFinderService.getObject();

    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': courseFinderService.getAddress() }, function (results, status) {
        initializeMap();
        var zoom = 17;
        if (status == google.maps.GeocoderStatus.OK) {
            switch (results[0].address_components[0].types[0]) {

                case "route":
                    break;
                case "administrative_area_level_2":
                    zoom = 6;
                    break;
                case "administrative_area_level_1":
                    zoom = 7;
                    break;
                case "locality":
                    zoom = 10;
                    break;
                case "country":
                    zoom = 4;
                    break;
            }

            var mileage = formObject.form.Mileage;
            if (mileage != "0") {
                switch (mileage) {
                    case "15":
                        zoom = 11; break;
                    case "30":
                        zoom = 10; break;
                    case "50":
                        zoom = 8; break;
                    case "75":
                        zoom = 7; break;
                }
            } else if ((formObject.form.City != "") || (formObject.form.Zip != "")) {
                zoom = 10;
                formObject.form.Mileage = "30"
            }
            map.setZoom(zoom);
            map.setCenter(results[0].geometry.location);
        }



        var center = map.getCenter();
        var packet = {
            CourseModel: formObject.form,
            LatLng: {
                Latitude: center.lat(),
                Longitude: center.lng()
            }
        };

        $http.post(socialputtsLink + "/api/Course/GetSearchedCourses?email=" + $.jStorage.get('user').userName, packet)
			.success(function (courses) {
			    var myOptions = {
			        zoom: map.getZoom(),
			        center: map.getCenter(),
			        mapTypeId: google.maps.MapTypeId.ROADMAP
			    };

			    $.each(formObject.favCourses, function (index, course) {
			        $scope.coursesToSort.push(course);
			    });
			    $.each($scope.favsCoordArray, function (index, coord) {
			        $scope.coordsArray.push(coord);
			    });

			    $.each(courses, function (index, value) {
			        var courseToAdd = new Course(value);

			        $scope.coursesToSort.push(courseToAdd);

			        var coord = new Coords(value);
			        $scope.coordsArray.push(coord);

			    });

			    markMap(myOptions, $scope, $http);

			    $scope.coursesToSort.sort(function (first, seccond) {
			        if (first.discount > seccond.discount) {
			            return -1;
			        } else if (first.discount < seccond.discount) {
			            return 1;
			        } else if (first.mileage < seccond.mileage) {
			            return -1;
			        } else if (first.mileage > seccond.mileage) {
			            return 1;
			        } else {
			            return 0;
			        }
			    });

			    $scope.coursesToSort = $scope.coursesToSort.removeDuplicates();

			    $.each($scope.coursesToSort, function (index, course) {
			        $scope.coursesOnMap.push(course);
			    });
			});
    });

    $scope.addToFavorite = function ($event) {
        $event.preventDefault();
        var id = $($event.target).attr("courseId");
        $http.post(socialputtsLink + "/api/Course/AddCourseToFavorite?userId=" + $.jStorage.get('user').userId + "&id=" + id)
		.success(function (result) {
		    if (result) {
		        var courseToFav = _.find($scope.coursesOnMap, function (course) {
		            return course.id == id;
		        });
		        courseToFav.isNotFavorite = false;
		        courseToFav.isFavourite = false;
		        alert("Course has been added!");
		    } else {
		        alert("Error!");
		    }
		});
    };
    $scope.removeFromFavorite = function ($event) {
        $event.preventDefault();
        var id = $($event.target).attr("courseId");
        $http.post(socialputtsLink + "/api/Course/RemoveFromFavorite?userId=" + $.jStorage.get('user').userId + "&id=" + id)
		.success(function (courseId) {
		    var courseToRemove = _.find($scope.coursesOnMap, function (course) {
		        return course.id == id;
		    });
		    courseToRemove.isNotFavorite = true;

		    $(".not-fav[courseid=" + courseId + "]").hide();
		    $(".list-as-fav[courseid=" + courseId + "]").show();
		});
    };
    $scope.mapRoute = function (data) {
        map.setZoom(14);
        var latlng = new google.maps.LatLng(data.latitude, data.longitude);
        map.setCenter(latlng);
    };
})