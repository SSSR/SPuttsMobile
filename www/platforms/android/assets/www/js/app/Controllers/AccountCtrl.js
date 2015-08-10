angular
  .module('socialputts')
  .controller('AccountCtrl', function ($scope, $http, $location, $route) {
      $.jStorage.deleteKey('user');

      $scope.TeeItUp = function () {
          $scope.invalidJoinForm = false;
          var data = $("#join-in-form").serializeObject();
          var url = socialputtsLink + "/api/account/SignUp";

          /*   if ($scope.joinInForm.LastName == null || $scope.LastName == "") {
          $scope.joinInForm.isEmptyLastName == true;
          }*/

          $http.post(url, data).success(function (data) {
              if (data.loginStatus) {
                  $.jStorage.set('user', data);
                  $location.path('/allowlocation');
              } else {
                  $scope.invalidJoinForm = true;
              }
          });
      };

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

      $scope.loginWithData = function () {
          bindFbAccountToSp({
              Id: "479546534446",
              Email: "socialputts.mobile@gmail.com",
              FirstName: "Art",
              LastName: "falcone",
              City: "",
              State: "",
              photo: "http://socialputts.com/Content/images/logo.png"
          });
      };

      $scope.login = function () {
          alert("login");

          var fbLoginSuccess = function (response) {
              alert("fbLoginSuccess2: " + JSON.stringify(response));

              var fbAPIResponse = function (myInfo) {
                  alert("myInfo " + JSON.stringify(myInfo));
                  var city = "";
                  var state = "";
                  bindFbAccountToSp({
                      Id: myInfo.id,
                      Email: myInfo.email,
                      FirstName: myInfo.first_name,
                      LastName: myInfo.last_name,
                      City: city,
                      State: state,
                      photo: myInfo.picture.data.url
                  });
              };

              facebookConnectPlugin.api("me/?fields=id,name,last_name,picture,email", ["public_profile"], fbAPIResponse);
          };

          alert("facebookConnectPlugin.login"); //,email,user_friends
          facebookConnectPlugin.login(["public_profile,email"],
            fbLoginSuccess,
            function (error) {
                alert(JSON.stringify(error));
            }
        );
      };

        var bindFbAccountToSp = function (accountInfo) {
             
          var url = socialputtsLink + "/api/account/BindFbAccountToSp";
          alert("bindFbAccountToSp " + JSON.stringify(accountInfo));
          $http.post(url, accountInfo)
            .success(function (data) {

                data.photo = accountInfo.photo;
                $.jStorage.set('user', data);
                alert("jStorage user" + JSON.stringify($.jStorage.get('user')));
                $location.path('/aproveaccess');
            });
      };

      var getLoginStatus = function () {
          alert("getLoginStatus");
          alert("getLoginStatus");
          facebookConnectPlugin.getLoginStatus(function (response) {
              alert(JSON.stringify(response));

              if (response.status == 'connected') {
                  alert('logged in');
              } else {
                  alert('not logged in');
              }
          }, function (error) {
              alert(JSON.stringify(error));
          });
      };

  })