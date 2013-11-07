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

function loadMapScript(){
    if(document.getElementById("googleMaps") == null){
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.id = "googleMaps"
		script.src = "https://maps.googleapis.com/maps/api/js?sensor=true&callback=initializeMap";
		document.body.appendChild(script);
	}	
};

function initializeMap() {
	if(document.getElementById("map") != null){
		map = new google.maps.Map(document.getElementById("map"));
		markMap([]);
	}	
};

function markMap(coordinatesArray, options) {

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
};