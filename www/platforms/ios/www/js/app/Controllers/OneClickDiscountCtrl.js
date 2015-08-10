angular
  .module('socialputts')
    .controller('OneClickDiscountCtrl', function ($scope, $http, $location, courseFinderService) {
      checkUserLogedOff($location, $scope);

      var courseFormModel = { City: "", CountryId: "1", CourseName: "", Mileage: "30", NumberOfHoles: "0", Zip: $.jStorage.get('user').zip };

      courseFinderService.setObject(courseFormModel);
      courseFinderService.setCountry("United States");

      $location.path("/courseResult");
  })
