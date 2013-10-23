angular.module('socialputts.controllers', [])
.controller('MainCtrl', function($scope, $http){
	var url = socialputtsLink + "/api/invitation/get?alt=json-in-script&callback=JSON_CALLBACK";
	
	$http.jsonp(url).success(function(data) {
        $scope.invitations = data;
    });
	
	$scope.Hello = "Hello SP mobile app";
})
.controller('AccountCtrl', function($scope, $http, $location){
	
	$scope.logIn = function(){
		$scope.invalidForm = false;
			var data = $("#sign-in-form").serializeObject();
			var url = socialputtsLink + "/api/account/PostSignIn";
			
			$http.post(url, data).success(function(data){
				if(data.loginStatus){
					$location.path('/index');
				}else{
					$scope.invalidForm = true;
				}
			});
		
	};
	
});