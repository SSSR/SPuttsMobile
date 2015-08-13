angular
  .module('socialputts')
  .controller('AccountCtrl', function ($scope, $http, $location) {
      $.jStorage.deleteKey('user');

      $scope.TeeItUp = function () {
          $scope.invalidJoinForm = false;
          var data = $("#join-in-form").serializeObject();
          var url = socialputtsLink + "/api/account/SignUp";

          $http.post(url, data).success(function (data) {
              if (data.loginStatus) {
                  $.jStorage.set('user', data);
                  $location.path('/allowlocation');
              } else {
                  $scope.invalidJoinForm = true;
              }
          });
      };

     /* $scope.loginWithData = function () {

          bindFbAccountToSp({
              Id: "105324989818094",
              Email: "socialputts.mobile@gmail.com",
              FirstName: "Art",
              LastName: "Falcone",
              City: "",
              State: ""
          }, "");
      };*/

      $scope.logIn = function () {
          $scope.invalidForm = false;
          var data = $("#sign-in-form").serializeObject();
          var url = socialputtsLink + "/api/account/PostSignIn";

          $http.post(url, data).success(function (data) {

              if (data.loginStatus) {
                  $.jStorage.set('user', data);
                  $location.path('/index');
              } else {
                  $scope.invalidForm = true;
              }
          });
      };


      function fbAPIResponse(myInfo) {

        alert("myInfo " + JSON.stringify(myInfo));

          bindFbAccountToSp({
              Id: myInfo.id,
              Email: myInfo.email,
              FirstName: myInfo.name,
              LastName: myInfo.last_name,
              City: "",
              State: ""
          }, myInfo.picture.data.url);
      };


      function fbLoginSuccess(response) {
          //  alert("fbLoginSuccess2: " + JSON.stringify(response));
          facebookConnectPlugin.api("me/?fields=id,name,last_name,picture,email,location", ["public_profile"], fbAPIResponse);
      };

      $scope.login = function () {
          //    alert("facebookConnectPlugin.login"); //,email,user_friends //public_profile,
          facebookConnectPlugin.login(["email", "user_location", "user_hometown"],
            fbLoginSuccess,
            function (error) {
               // alert("error" + JSON.stringify(error));
            }
        );
      };

      function bindFbAccountToSp(accountInfo, photoUrl) {

          var url = socialputtsLink + "/api/account/BindFbAccountToSp";
          alert("bindFbAccountToSp " + JSON.stringify(accountInfo));
          $.blockUI();

          try {
              $http.post(url, accountInfo)
                 .success(function (data) {
                     $.unblockUI();
                     data.photo = photoUrl;
                     $.jStorage.set('user', data);
                     alert("jStorage user" + JSON.stringify($.jStorage.get('user')));
                     $location.path('/aproveaccess');
                 }).error(function (data) {
                     $.unblockUI();
                     alert("Error responce" + JSON.stringify(data));
                 });
          } catch (e) {
              $.unblockUI();
              alert("catch error" + JSON.stringify(e));
          }
      };
  })