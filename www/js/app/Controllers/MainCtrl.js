angular.module('socialputts.controllers', [])
.controller('MainCtrl', function($scope, $http){
	var url = "http://socialputts-test.azurewebsites.net/api/invitation/get?alt=json-in-script&callback=JSON_CALLBACK";
	
	$http.jsonp(url).success(function(data) {
        $scope.invitations = data;
    });
	
	$scope.Hello = "Hello SP mobile app";
})
.controller('AccountCtrl', function($scope, $http){
	$scope.logIn = function(){
		var data = $("#sign-in-form").serializeObject();
		var url = "http://localhost:59034/api/account/PostSignIn";
		
		$http.post(url, data).success(function(data){
			console.log(data);
		});
	};
	
});