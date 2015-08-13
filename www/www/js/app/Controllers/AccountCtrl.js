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

      /*For testing
      $scope.loginWithData = function () {

      bindFbAccountToSp({
      Id: "105324989818094",
      Email: "socialputts.mobile@gmail.com",
      FirstName: "Art",
      LastName: "Falcone",
      City: "Richmond",
      State: "Virginia"
      });

      getAddress({
      hometown:{id:"10376564665161",name:"Virginia"},
      location:{id:"10371326548468",name:"Redmond,Watington"},
      });
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


      function getAddress(userInfo) {
          var address = { city: "", state: "" };

          if (userInfo.hometown) {
              var hometownName = userInfo.hometown.name;
              if (hometownName) {
                  var cityAndState = hometownName.split(',');
                  for (var i = 0; i < cityAndState.length; i++) {
                      if (i == 0) {
                          address.city = cityAndState[i];
                      }
                      if (i == 1) {
                          address.state = cityAndState[i];
                      }
                  }
              }
          }

          if (address.city == "" || address.state == "") {
              if (userInfo.location) {
                  var locationName = userInfo.location.name;
                  if (locationName) {
                      var cityAndStateLocation = locationName.split(',');
                      for (var i = 0; i < cityAndStateLocation.length; i++) {
                          if (i == 0 && address.city == "") {
                              address.city = cityAndStateLocation[i];
                          }
                          if (i == 1 && address.state == "") {
                              address.state = cityAndStateLocation[i];
                          }
                      }
                  }
              }
          }
          return address;
      }

      function fbAPIResponse(myInfo) {

          //          alert("myInfo " + JSON.stringify(myInfo));

          var address = getAddress(myInfo);

          bindFbAccountToSp({
              Id: myInfo.id,
              Email: myInfo.email,
              FirstName: myInfo.name,
              LastName: myInfo.last_name,
              City: address.city,
              State: address.state
          }, myInfo.picture.data.url);
      };


      function fbLoginSuccess(response) {
          //  alert("fbLoginSuccess2: " + JSON.stringify(response));
          facebookConnectPlugin.api("me/?fields=id,name,last_name,picture,email,hometown,location", ["public_profile"], fbAPIResponse);
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
          // alert("bindFbAccountToSp " + JSON.stringify(accountInfo));
          $.blockUI();

              $http.post(url, accountInfo)
                  .success(function(data) {
                      $.unblockUI();
                      data.photo = photoUrl;
                      $.jStorage.set('user', data);
                      // alert("jStorage user" + JSON.stringify($.jStorage.get('user')));
                      $location.path('/aproveaccess');
                  });
         
      };
  })