angular
  .module('socialputts')
  .controller('PushNotificationCtrl', function ($scope, $http, $location) {
      $scope.Allow = function () {

          $location.path('/recommendcourses');
      };

      $scope.DontAllow = function () {
          $location.path('/recommendcourses');
      };
  })