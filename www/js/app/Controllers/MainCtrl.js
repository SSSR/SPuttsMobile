angular.module('socialputts.controllers', [])
.controller('MainCtrl', function($scope, $http){
	var url = "http://socialputts-test.azurewebsites.net/api/invitation/get?alt=json-in-script&callback=JSON_CALLBACK";
	
	$http.jsonp(url).success(function(data) {
        $scope.invitations = data;
      }).error(function(data){
		console.log("error");
	  });
	
	$scope.Hello = "Hello SP mobile app";
});
