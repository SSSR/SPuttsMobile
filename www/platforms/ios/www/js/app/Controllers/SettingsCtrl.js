angular
  .module('socialputts')
  .controller('SettingsCtrl', function ($scope, $http, $location) {
      checkUserLogedOff($location, $scope);

      $scope.menu = "basic-info";
      //$scope.favoriteGolfDestinationsArray = [];

      $http.get(socialputtsLink + "/api/settings/getsettings?userId=" + $.jStorage.get('user').userId)
    .success(function (data) {
        $scope.settings = data;
        if (data.playingPreferences.genderMale) {
            $scope.gender = 'male';
        } else {
            $scope.gender = 'female';
        }

        if (data.playingPreferences.smokeYes) {
            $scope.smoke = 'yes';
        } else {
            $scope.smoke = 'no';
        }
        if (data.playingPreferences.drinkYes) {
            $scope.drink = 'yes';
        } else {
            $scope.drink = 'no';
        }
    });

      $http.get(socialputtsLink + "/api/settings/GetFavoriteDestinationsForUser?userId=" + $.jStorage.get('user').userId)
    .success(function (result) {
            $scope.favoriteGolfDestinationsArray = result;
        });

      $scope.changePassword = function () {
          $(".change-password-popup").dialog({
              modal: true,
              title: "Change Password",
              buttons: {
                  "Change password": function () {

                      var currentPassword = $("#current-pass").val();
                      var newPassword = $("#new-pass").val();
                      var confirmPassword = $("#confirm-new-pass").val();
                      if (newPassword.length < 6) {
                          alert("Password should be at least 6 characters!");
                          return;
                      } else if (newPassword != confirmPassword) {
                          alert("Password and Confirm Password not matched!");
                          return;
                      } else {
                          $http.get(socialputtsLink + "/api/account/ChangePassword?userId=" + $.jStorage.get('user').userId + "&oldPassword=" + currentPassword + "&newPassword=" + newPassword)
                        .success(function (result) {
                            if (result === "true") {
                                alert("Password changed successfully!");
                                $(".change-password-popup").dialog("close");
                            } else {
                                alert("Current Password is invalid!");
                            }
                        });
                      }
                  },
                  Cancel: function () {
                      $(this).dialog("close");
                  }
              }
          })
      };

      $scope.saveBasicInfo = function () {
          var model = $scope.settings.basicInfo;
          var regZip = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
          var reEmail = new RegExp("^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$");

          if (model.firstName != null && model.firstName.length > 0 &&
            model.lastName != null && model.lastName.length > 0 &&
            model.email != null && model.email.length > 0 &&
            model.city != null && model.city.length > 0 &&
            model.zipCode != null && model.zipCode.length > 0) {
              if (!reEmail.test(model.email)) {
                  alert("Wrong email format!");
                  return;
              };
              if (!regZip.test(model.zipCode)) {
                  alert("Wrong zip format!");
                  return;
              };
              $http.post(socialputtsLink + "/api/settings/SaveBasicInfo?userId=" + $.jStorage.get('user').userId, model)
            .success(function () {
                alert("Basic info is saved");
            });
          } else {
              alert("Please, fill out reaquired fields");
          }
      };

      $scope.changeMenu = function (value, $event) {
          $scope.menu = value;
          $(".active-menu-link").removeClass('active-menu-link');
          $($event.target).addClass('active-menu-link');
      };

      $scope.genderChange = function (value) {
          if (value == 'female') {
              $scope.settings.playingPreferences.genderMale = false;
              $scope.settings.playingPreferences.genderFemale = true;
          } else {
              $scope.settings.playingPreferences.genderFemale = false;
              $scope.settings.playingPreferences.genderMale = true;
          }
      };

      $scope.updateSmoke = function (value) {
          if (value == 'yes') {
              $scope.settings.playingPreferences.smokeYes = true;
              $scope.settings.playingPreferences.smokeNo = false;
          } else {
              $scope.settings.playingPreferences.smokeYes = false;
              $scope.settings.playingPreferences.smokeNo = true;
          }
      };

      $scope.updateDrink = function (value) {
          if (value == 'yes') {
              $scope.settings.playingPreferences.drinkYes = true;
              $scope.settings.playingPreferences.drinkNo = false;
          } else {
              $scope.settings.playingPreferences.drinkYes = false;
              $scope.settings.playingPreferences.drinkNo = true;
          }
      };

      $scope.savePlayingPreferences = function () {
          var model = $scope.settings.playingPreferences;
          $http.post(socialputtsLink + "/api/settings/SavePlayingPreferences?userId=" + $.jStorage.get('user').userId, model)
        .success(function () {
            alert("Playing Preferences successfully saved!");
        });
      }


      $scope.addFavoriteDestination = function () {

          var zip = $(".fav-destinations #zip").val();
          var city = $(".fav-destinations #city").val();

          if (city.length <= 0 && zip.length <= 0) {
              alert("Fill out City Or Zip");
              return;
          }

          var geocoder = new google.maps.Geocoder();
          if (city.length > 0) {
              var stateId = $(".fav-destinations option:selected").val();
              var shortStateName = $(".fav-destinations option:selected").attr("short-name");

              geocoder.geocode({ 'address': city + ' ' + shortStateName + ' US', 'region': 'US' }, function (results, status) {

                  if (status != 'OK' || results[0].partial_match == true || results[0].address_components.length < 3) {
                      alert("City not found!");
                      return;
                  }

                  city = results[0].address_components[0].long_name;

                  $scope.saveDestination(stateId, city, '');
              });
          } else if (zip.length > 0) {
              geocoder.geocode({ 'address': zip }, function (results, status) {

                  if (status != 'OK' || results[0].address_components.length < 3) {
                      alert("Zip not found!");
                      return;
                  }


                  var stateName = results[0].address_components[results[0].address_components.length - 2].short_name;
                  var cityName = results[0].address_components[results[0].address_components.length - 3].long_name;

                  $http.get(socialputtsLink + "/api/settings/GetStateIdByShortName?name=" + stateName)
                .success(function (stateId) {
                    if (stateId == -1) {
                        alert("Zip not found!");
                        return;
                    }

                    $scope.saveDestination(stateId, cityName, zip);
                });
              });
          }
      };

      $scope.saveDestination = function (stateId, cityName, zip) {
          var model = { StateId: stateId, City: cityName, ZipCode: zip };
          $http.post(socialputtsLink + "/api/settings/SaveDestination?userId=" + $.jStorage.get('user').userId, model)
       .success(function (model) {
           if (model != 'null') {
               $scope.favoriteGolfDestinationsArray.push(model);
               $(".fav-destinations #city, .fav-destinations #zip").val("");
               $(".fav-destinations #city, .fav-destinations #zip").removeAttr("disabled");
           } else {
               alert("Favorite Golf Destination already exists!");
           }
       });
      };

      $scope.removeFavoriteDestination = function (destination, index) {
          $http.post(socialputtsLink + "/api/settings/RemoveDestination?id=" + destination.id)
        .success(function () {
            $scope.favoriteGolfDestinationsArray.splice(index, 1);
        });
      };
  });
