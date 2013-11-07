$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

var socialputtsLink = "http://socialputts-test.azurewebsites.net";

var app = {
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, true);
    },

    onDeviceReady: function() {
        angular.element(document).ready(function() {
            angular.bootstrap(document, ['ngView']);
        });
		FB.init({
                  appId: '1382806861962418',
                  nativeInterface: CDV.FB,
                  status     : true, // check login status
                  //cookie     : true, // enable cookies to allow the server to access the session
                 // xfbml: true,
                  useCachedDialogs: false
              });
		
		loadMapScript();
    }
};

function User(){};

function loadMapScript(){
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.id = "googleMaps"
	script.src = "https://maps.googleapis.com/maps/api/js?sensor=false&callback=initializeMap";
	document.body.appendChild(script);
};

function initializeMap() {
	map = new google.maps.Map(document.getElementById("map"));
	markMap([]);
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