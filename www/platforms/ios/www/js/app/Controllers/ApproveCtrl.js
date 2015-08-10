angular
  .module('socialputts')
  .controller('ApproveCtrl', function ($scope, $http, $location) {
      $scope.Cancel = function () {
          $location.path('/postfacebook');
      };

      $scope.Approve = function () {
          getFriends();

      };

      var friendIDs = [];
      var fdata;

      var getFriends = function () {
          alert("getFriends");
          facebookConnectPlugin.api("/me/taggable_friends?fields=id,name,picture", ["user_friends"], function (response) {
              alert('me' + JSON.stringify(response));
              if (response.error) {
                  alert(JSON.stringify(response.error));
              } else {
                  var data = document.getElementById('data');
                  fdata = response.data;
              }
              alert(JSON.stringify(response.data));

              
//            var friends = response.data;
//              for (var k = 0; k < friends.length && k < 200; k++) {
//                  var friend = friends[k];
//                  var index = 1;
//                  friendIDs[k] = friend.id;
//                 
//              }
           //   alert("friendId's: " + friendIDs);
          });
      };

      $scope.getImageData = function () {
          var urlPhoto = $.jStorage.get("user").photo;
          return urlPhoto;
      };
  })