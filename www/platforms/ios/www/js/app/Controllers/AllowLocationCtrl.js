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
              // geografic center Usa - state Kansas
              var positionUser = {
                  latitude: '39.805733',
                  longitude: '-98.555510'
              };
              $.jStorage.set('UsaStateByDefault', "Kansas");
              $.jStorage.set('positionUser', positionUser);
              $location.path('/pushnotification');
          }

      };

      $scope.DontAllow = function () {
          $location.path('/pushnotification');

          // geografic center Usa - state Kansas
          var positionUser = {
              latitude: '39.805733',
              longitude: '-98.555510'
          };
          $.jStorage.set('UsaStateByDefault', "Kansas");

          $.jStorage.set('positionUser', positionUser);
          $location.path('/pushnotification');
      };
  })