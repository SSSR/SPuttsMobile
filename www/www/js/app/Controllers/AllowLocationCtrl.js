angular
  .module('socialputts')
    .controller('AllowLocationCtrl', function ($scope, $http, $location) {
        $scope.Allow = function () {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var positionUser = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    $.jStorage.set('positionUser', positionUser);
                    $location.path('/pushnotification');
                    $scope.$apply();
                });
            } else {
                setCoordinatesByDefault();
            }
        };

        $scope.DontAllow = function () {
            $location.path('/pushnotification');
            setCoordinates();
            $location.path('/pushnotification');
        };

        function setCoordinates() {

            var user = $.jStorage.get('user');
            var address = user.city + '+' + "United States" + '+' + user.state;
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({ 'address': address }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {

                    var locationPositionUser = {
                        latitude: results[0].geometry.location.lat().toString(), // geografic center Usa - state Kansas
                        longitude: results[0].geometry.location.lng().toString()
            };

                    if (user.state) {
                        $.jStorage.set('UsaStateByDefault', user.state);
                    }
                    
                    $.jStorage.set('positionUser', locationPositionUser);
                } else {

                    setCoordinatesByDefault();
                }
            });


        }

        function setCoordinatesByDefault() {
            var positionUser = {
                latitude: '39.805733', // geografic center Usa - state Kansas
                longitude: '-98.555510'
            };

            $.jStorage.set('UsaStateByDefault', "Kansas");
            $.jStorage.set('positionUser', positionUser);
        }
    })