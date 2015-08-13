angular
  .module('socialputts')
  .controller('ApproveCtrl', function ($scope, $http, $location) {
      $scope.Cancel = function () {
          $location.path('/postfacebook');
      };

      $scope.Approve = function () {
          getFriends();
          $location.path('/postfacebook');
      };
      var getFriends = function () {
         // alert("getFriends");

          $.blockUI();
          facebookConnectPlugin.api("/me/taggable_friends?fields=id,name,picture", ["user_friends"], function (response) {
              $.unblockUI();
             // alert('Friends info ' + JSON.stringify(response));
             
          });
      };

      $scope.getImageData = function () {
          var urlPhoto = $.jStorage.get("user").photo;
          return urlPhoto;
      };
  })