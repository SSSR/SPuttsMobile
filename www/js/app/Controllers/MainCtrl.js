angular.module('socialputts.controllers', [])
.controller('MainCtrl', function($scope, $http){
	
	$scope.Hello = "Hello SP mobile app";
	
	$scope.$on('$locationChangeStart', function(event, next, current){
		if(next.search("#/signin") !== -1){
			event.preventDefault();
		}
	});
	
	$http.jsonp(socialputtsLink + "/api/email/getTinyUrl?email=" + app.user.Email + "&alt=json-in-script&callback=JSON_CALLBACK")
	.success(function(tinyUrl){
		$scope.tinyUrl = tinyUrl;
	});
	
})
.controller('AccountCtrl', function($scope, $http, $location){
	
	$scope.logIn = function(){
		$scope.invalidForm = false;
			var data = $("#sign-in-form").serializeObject();
			var url = socialputtsLink + "/api/account/PostSignIn";
			
			$http.post(url, data).success(function(data){
				if(data.loginStatus){
					app.user = data.user;
					$location.path('/index');
				}else{
					$scope.invalidForm = true;
				}
			});
		
	};
	
})
.controller('FillYourFoursomeCtrl', function($scope, $http, $location){
	
})
.controller('ManageInvitationsCtrl', function($scope, $http, $location){
	
})
.controller('OneClickDiscountCtrl', function($scope, $http, $location){
	
})
.controller('CourseFinderCtrl', function($scope, $http, $location){
	
});