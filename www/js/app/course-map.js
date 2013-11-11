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
		markMap([]);
	}	
};

function markMap(coordinatesArray, options, $scope) {

        var myOptions;

        if (options == null) {
            var latlng;
            var zooom;

            if ((coordinatesArray.length == 0) || ((coordinatesArray[0].pfLat == 0) & (coordinatesArray[0].pfLong == 0))) {

                latlng = new google.maps.LatLng(30, -97);
                zooom = 3;
            } else {
                latlng = new google.maps.LatLng(coordinatesArray[0].pfLat, coordinatesArray[0].pfLong);
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
        for (var i = 0; i < coordinatesArray.length; i++) {
            var marker = new google.maps.Marker(
                {
                    map: map,
                    position: new google.maps.LatLng(coordinatesArray[i].lat, coordinatesArray[i].long)
                });

            var infowindow = new google.maps.InfoWindow();
            $scope.allMarkers.push(marker);
            $scope.markers.push(marker); // parallel arrays of markers and infoWindows
            $scope.infoWindows.push(infowindow);

            var iconsFolder = ((options == null) | !coordinatesArray[i].HasActualEvents) ? "pins" : "pins-searched";


            /*(switch (coordinatesArray[i].type) {
                case 0:
                    //public
                    marker.setIcon("/Content/images/" + iconsFolder + "/red.png");
                    break;
                case 1:
                    //private
                    marker.setIcon("/Content/images/" + iconsFolder + "/blue.png");
                    break;
                case 2:
                    //semiprivate
                    marker.setIcon("/Content/images/" + iconsFolder + "/violet.png");
                    break;
                case 3:
                    //military
                    marker.setIcon("/Content/images/" + iconsFolder + "/yellow.png");
                    break;
                case 4:
                    //resort
                    marker.setIcon("/Content/images/" + iconsFolder + "/green.png");
                    break;
                case 5:
                    //resort
                    marker.setIcon("/Content/images/" + iconsFolder + "/pink.png");
                    break;
            }*/
        }
        
};