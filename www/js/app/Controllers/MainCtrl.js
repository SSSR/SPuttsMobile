angular.module('socialputts.controllers', [])
.controller('MainCtrl', function($scope, $http,  $location){
	if($.jStorage.get('user') != null){
		$scope.Hello = $.jStorage.get('user').name;
	}else{
		$scope.Hello = "";
	}
})


.controller('HomeCtrl', function($scope, $http,  $location){
	checkUserLogedOff($location);
	
	$scope.$on('$locationChangeStart', function(event, next, current){
		if(next.search("#/signin") !== -1){
			event.preventDefault();
		}
	});
	
	$http.jsonp(socialputtsLink + "/api/email/getTinyUrl?email=" + $.jStorage.get('user').userName + "&alt=json-in-script&callback=JSON_CALLBACK")
	.success(function(tinyUrl){
		$scope.tinyUrl = tinyUrl;
	});
	
	$scope.inviteFbFriends = function($event){
		$event.preventDefault();
		var windowSize = "width=" + window.innerWidth + ",height=" + window.innerHeight + ",scrollbars=no";
		url = "https://facebook.com/dialog/feed?client_id=1382806861962418&link=http://socialputts.com&redirect_uri=http://facebook.com&display=touch";
		window.open(url, 'popup', windowSize);
		
		return false;
	};
	
	$scope.inviteTwitterFriends = function($event){
		$event.preventDefault();
		var width = 575,
		height = 400,
		url = "http://twitter.com/share?text=%23Join%20me%20for%20%23FREE%20on%20%23SocialPutts%2C%20the%20World's%20First%20%23Golf%20Social%20Network!%20%23Connect%2C%20play%20golf%20%26%20have%20more%20%23fun!%20 " + $scope.tinyUrl + "&url=",
		opts = 'status=1' +
				 ',width=' + width +
				 ',height=' + height;
		 var windowSize = "width=" + window.innerWidth + ",height=" + window.innerHeight + ",scrollbars=no";

		window.open(url, 'twitter', windowSize);

		return false;
	};
})


.controller('AccountCtrl', function($scope, $http, $location){
	$.jStorage.deleteKey('user');
		
	$scope.logIn = function(){
		$scope.invalidForm = false;
			var data = $("#sign-in-form").serializeObject();
			var url = socialputtsLink + "/api/account/PostSignIn";
			
			$http.post(url, data).success(function(data){
				if(data.loginStatus){
					$.jStorage.set('user', data);
					$location.path('/index');
				}else{
					$scope.invalidForm = true;
				}
			});
		
	};
	
})


.controller('BuddiesCtrl', function($scope, $http, $location){
	checkUserLogedOff($location);
})
.controller('InviteYourBuddiesCtrl', function($scope, $http, $location){
	checkUserLogedOff($location);
})


.controller('CourseFinderCtrl', function($scope, $http, $location, courseFinderService){
	checkUserLogedOff($location);
		
	$scope.searchCourse = function($event){
		$event.preventDefault();
				
		var courseForm = $('#course-finder-form'); //form course
		var courseFormModel = $(courseForm).serializeObject();
		
		courseFinderService.setObject(courseFormModel);
		courseFinderService.setCountry($('#country option:selected').text());
		
		$location.path("/courseResult");
	};
})
.controller('CourseResultCtrl', function($scope, $http, $location, courseFinderService){
	checkUserLogedOff($location);
	
	$scope.coursesOnMap = [];
	$scope.allMarkers = [];
	$scope.coursesToSort = [];
	$scope.coordsArray = [];
	$scope.favCourses = [];
	$scope.favsCoordArray = [];
	$scope.markers = [];
	$scope.infoWindows = [];
	
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

                var mileage = formObject.Mileage;
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
                } else if ((formObject.City != "") || (formObject.Zip != "")) {
                    zoom = 10;
					formObject.Mileage = "30"
                }
                map.setZoom(zoom);
                map.setCenter(results[0].geometry.location);
            }

           
            
            var center = map.getCenter();
            var packet = {
                CourseModel: formObject,
                LatLng: {
                    Latitude: center.lat(),
                    Longitude: center.lng()
                }
            };

			$http.post(socialputtsLink + "/api/Course/GetSearchedCourses?email=" + $.jStorage.get('user').userName, packet)
			.success(function(courses){
				var myOptions = {
                            zoom: map.getZoom(),
                            center: map.getCenter(),
                            mapTypeId: google.maps.MapTypeId.ROADMAP
                        };

				$.each($scope.favCourses, function (index, course) {
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

				markMap($scope.coordsArray, myOptions, $scope);
				
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
})

.controller('FillYourFoursomeCtrl', function($scope, $http, $location){
	checkUserLogedOff($location);
})
.controller('ManageInvitationsCtrl', function($scope, $http, $location){
	checkUserLogedOff($location);
})
.controller('FavoriteCoursesCtrl', function($scope, $http, $location){
	checkUserLogedOff($location);
})
.controller('SettingsCtrl', function($scope, $http, $location){
	checkUserLogedOff($location);
})
.controller('OneClickDiscountCtrl', function($scope, $http, $location){
	checkUserLogedOff($location);
});

function checkUserLogedOff($location){
	if($.jStorage.get('user') == null){
		$location.path('#/signin');
	}
}