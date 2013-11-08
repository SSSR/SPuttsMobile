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


.controller('CourseFinderCtrl', function($rootScope, $scope, $http, $location){
	checkUserLogedOff($location);
	$rootScope.ready = false;
	
	$scope.searchCourse = function($event){
		$event.preventDefault();
		
		$rootScope.coursesOnMap = [];
		$rootScope.allMarkers = [];
		$rootScope.coursesToSort = [];
		$rootScope.coordsArray = [];
		$rootScope.favCourses = [];
		$rootScope.favsCoordArray = [];
		
		
		var country = $('#country option:selected').text();
        var city = $('#city').val();
        var state = $('#state').val();
        var zip = $("#zip").val();
        var adress = zip + ' ' + city + '+' + country + '+' + state;
		var courseForm = $('#course-finder-form'); //form course
		var courseFormModel = $(courseForm).serializeObject();
		
		
		var geocoder = new google.maps.Geocoder();
        geocoder.geocode({ 'address': adress }, function (results, status) {
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

                var mileage = courseFormModel["Mileage"];
                if (mileage != "0") {
                    switch (mileage) {
                        case "15":
                            zoom = 12; break;
                        case "30":
                            zoom = 11; break;
                        case "50":
                            zoom = 9; break;
                        case "75":
                            zoom = 8; break;
                    }
                } else if ((city != "") || (zip != "")) {
                    zoom = 11;
                }
                map.setZoom(zoom);
                map.setCenter(results[0].geometry.location);
            }

           
            
            var center = map.getCenter();
            var packet = {
                CourseModel: courseFormModel,
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

				$rootScope.coursesToSort = [];
				$rootScope.coordsArray = [];

				$.each($scope.favCourses, function (index, course) {
					$rootScope.coursesToSort.push(course);
				});
				$.each($scope.favsCoordArray, function (index, coord) {
					$rootScope.coordsArray.push(coord);
				});
				
				$.each(courses, function (index, value) {
					var courseToAdd = new Course(value);

					$rootScope.coursesToSort.push(courseToAdd);

					var coord = new Coords(value);
					$rootScope.coordsArray.push(coord);

				});

				markMap($scope.coordsArray, myOptions);
				
				$rootScope.coursesToSort.sort(function (first, seccond) {
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

				$rootScope.coursesToSort = $rootScope.coursesToSort.removeDuplicates();

				$.each($rootScope.coursesToSort, function (index, course) {
					$rootScope.coursesOnMap.push(course);
				});
				
				$rootScope.ready = $rootScope.coursesOnMap.length > 0;
			});
        });
		
	};
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