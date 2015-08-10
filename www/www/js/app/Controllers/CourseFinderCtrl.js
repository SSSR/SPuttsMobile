angular
  .module('socialputts')
  .controller('CourseFinderCtrl', function ($scope, $http, $location, courseFinderService) {
      checkUserLogedOff($location, $scope);

      $scope.favCourses = [];
      $scope.searchCourseModel = [];
      $scope.autocompleteItem = {};

      $scope.selected = undefined;

      $scope.startsWith = function (state, viewValue) {
          return state.substr(0, viewValue.length).toLowerCase() == viewValue.toLowerCase();
      };


      courseFinderService.clearFavoriteCoursesArray();

      $http.jsonp(socialputtsLink + "/api/Course/GetFavoriteCoursesForUser?userId=" + $.jStorage.get('user').userId + "&alt=json-in-script&callback=JSON_CALLBACK")
        .success(function (result) {
            _.each(result, function (course) {
                $scope.favCourses.push(course);
            });
        });

      $http.jsonp(socialputtsLink + "/api/Course/GetCountriesAndStatesForAutoCompleat?email=" + $.jStorage.get('user').userName + "&alt=json-in-script&callback=JSON_CALLBACK")
        .success(function (result) {

            $scope.searchCourseModel = result;

            var namesStates = [];

            _.each($scope.searchCourseModel.states, function (state) {
                namesStates.push(state.name);
            });

            $("#statesId").autocomplete({
                source: namesStates
            });

        });

      $scope.searchCourse = function ($event) {

          $event.preventDefault();

          $("#country").removeAttr("disabled");

          var courseForm = $('#course-finder-form'); //form course
          var courseFormModel = $(courseForm).serializeObject();

          courseFinderService.setObject(courseFormModel);
          courseFinderService.setCountry($('#country option:selected').text());



          $location.path("/courseResult");
      };

      $scope.addToSearch = function ($event, id) {
          $event.preventDefault();

          _.each($scope.favCourses, function (course) {
              if (course.id == id) {
                  course.isAdded = true;
              }
          });

          $scope.getFavoriteCourseForUser(id);
      };

      $scope.removeFromSearch = function ($event, id) {
          $event.preventDefault();

          _.each($scope.favCourses, function (course) {
              if (course.id == id) {
                  course.isAdded = false;
              }
          });

          courseFinderService.removeFavoriteCourse(id);
      };

      $scope.getFavoriteCourseForUser = function (id) {
          $http.jsonp(socialputtsLink + "/api/Course/GetFavoriteCourseForUser?email=" + $.jStorage.get('user').userName + "&courseId=" + id + "&alt=json-in-script&callback=JSON_CALLBACK")
		.success(function (course) {
		    var courseToAdd = new Course(course);
		    courseToAdd.isAdded
		    courseFinderService.setFavoriteCourses(courseToAdd);
		})
      };
  })