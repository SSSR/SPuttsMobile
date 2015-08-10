angular
  .module('socialputts')
  .controller('FavoriteCoursesCtrl', function ($scope, $http, $location) {
      checkUserLogedOff($location, $scope);
      $http.jsonp(socialputtsLink + "/api/Course/GetFavoriteCoursesForUser?userId=" + $.jStorage.get('user').userId + "&alt=json-in-script&callback=JSON_CALLBACK")
        .success(function (result) {
            $scope.favCourses = result;
        });

      $scope.removeFromFav = function (index, course) {
          $http.post(socialputtsLink + "/api/Course/RemoveFromFavorite?userId=" + $.jStorage.get("user").userId + "&id=" + course.id)
            .success(function () {
                $scope.favCourses.splice(index, 1);
            });
      };
  })