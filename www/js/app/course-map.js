Array.prototype.removeDuplicates = function () {
    return _.uniq(this, false, function(item) {
        return item.id;
    });
};

function Course(data) {
    this.id = data.id;
    this.courseName = data.courseName;

    this.combinedNameAndMileage = data.courseName + " (" + data.mileage + " miles)";
    this.address = data.address;
    this.city = data.city;

    this.addressAndCity = data.address + ',' + " " + data.city;

    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.addButtonVisible = !data.isFavourite;
    this.removeButtonVisible = data.isFavourite;
    this.courseDescription = data.courseDescription;
    this.mileage = data.mileage;
    this.eventsVisible = false;
    this.events = [];
    this.url = "ShowCourse?courseId=" + data.id;
    this.selectUrl = "/Profile/FillYourFoursome?courseId=" + data.id;
    this.discount = data.discount;
	if (data.discount == 0) {
            this.combinedDiscountAndText = "None";
	}else{
		this.combinedDiscountAndText = data.discount + "%";
	}
	if (data.courseSiteBookingUrl != null) {
            if (data.courseSiteBookingUrl.indexOf("http://") == -1) {
                this.courseSiteBookingUrl = "http://" + data.courseSiteBookingUrl;
            }
            this.courseSiteBookingUrl = data.courseSiteBookingUrl;
	}else{
		this.courseSiteBookingUrl = "http://www.golfnow.com";
	}
    
    this.isNotFavorite = !data.isFavourite;
};

function Coords(data) {
    this.lat = data.latitude;
    this.long = data.longitude;
    this.type = data.courseTypeId;
    this.courseId = data.id;
    
    if (data.events != undefined) {
        this.eventsCount = data.events.length;
    }
    this.HasActualEvents = data.hasActualEvents;

};

function initializeMap() {
	if(document.getElementById("map") != null){
		map = new google.maps.Map(document.getElementById("map"));
		//markMap([]);
	}	
};

function markMap(options, $scope, $http) {

        var myOptions;

        if (options == null) {
            var latlng;
            var zooom;

            if (($scope.coordsArray.length == 0) || (($scope.coordsArray[0].pfLat == 0) & ($scope.coordsArray[0].pfLong == 0))) {

                latlng = new google.maps.LatLng(30, -97);
                zooom = 3;
            } else {
                latlng = new google.maps.LatLng($scope.coordsArray[0].pfLat, $scope.coordsArray[0].pfLong);
                zooom = 7;
            }


            myOptions = {
                zoom: zooom,
                center: latlng,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };


        } else {
            myOptions = options;
        }

        map.setOptions(myOptions);
		
		
        //markers
        for (var i = 0; i < $scope.coordsArray.length; i++) {
            var marker = new google.maps.Marker(
                {
                    map: map,
                    position: new google.maps.LatLng($scope.coordsArray[i].lat, $scope.coordsArray[i].long)
                });

            var infowindow = new google.maps.InfoWindow();
            $scope.allMarkers.push(marker);
            //$scope.markers.push(marker); // parallel arrays of markers and infoWindows
            $scope.infoWindows.push(infowindow);

            switch ($scope.coordsArray[i].type) {
                case 0:
                    //public
                    marker.setIcon("imgs/pins/red.png");
                    break;
                case 1:
                    //private
                    marker.setIcon("imgs/pins/blue.png");
                    break;
                case 2:
                    //semiprivate
                    marker.setIcon("imgs/pins/violet.png");
                    break;
                case 3:
                    //military
                    marker.setIcon("imgs/pins/yellow.png");
                    break;
                case 4:
                    //resort
                    marker.setIcon("imgs/pins/green.png");
                    break;
                case 5:
                    //resort
                    marker.setIcon("imgs/pins/pink.png");
                    break;
            }
        }
		_.each($scope.allMarkers, function(marker, index){
			var infoWindow = $scope.infoWindows[index];
			infoWindow.setOptions({ maxWidth: 10000, maxHeight: 800 });
			var courseIdBindedToMarker = $scope.coordsArray[index].courseId;
			
			
			google.maps.event.addListener(marker, 'click', function(){
				$http.get(socialputtsLink + "/api/Course/GetCourseInfo?email=" + $.jStorage.get('user').userName + "&courseId=" + courseIdBindedToMarker)
				.success(function(result){
					
					$scope.popupInfo = result;
					
					_.each($scope.infoWindows, function(iwindow){
						iwindow.close();
					});
					
					setTimeout(function(){
						infoWindow.setContent($(".popup").html());
					}, 100);

                    setTimeout(function(){
                        infoWindow.open(map, marker);
                    }, 100);
					
					setTimeout(function(){
						$(".list-as-fav").click(function(event){
							$scope.addToFavorite(event);
						});
						$(".not-fav").click(function(event){
							$scope.removeFromFavorite(event);
						});
					}, 100);
					
				});
			});
		});
        
};