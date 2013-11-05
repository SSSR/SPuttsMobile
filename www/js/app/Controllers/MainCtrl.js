angular.module('socialputts.controllers', [])
.controller('MainCtrl', function($scope, $http,  $location){
	checkUserLogedOff($location);
	
	$scope.Hello = "Hello SP mobile app";
	
	$scope.$on('$locationChangeStart', function(event, next, current){
		if(next.search("#/signin") !== -1){
			event.preventDefault();
		}
	});
	
	if(app.user != null || app.user != undefined){
		$http.jsonp(socialputtsLink + "/api/email/getTinyUrl?email=" + app.user.userName + "&alt=json-in-script&callback=JSON_CALLBACK")
		.success(function(tinyUrl){
			$scope.tinyUrl = tinyUrl;
		});
	}
})
.controller('AccountCtrl', function($scope, $http, $location){
	app.user = null;
		
	$scope.logIn = function(){
		$scope.invalidForm = false;
			var data = $("#sign-in-form").serializeObject();
			var url = socialputtsLink + "/api/account/PostSignIn";
			
			$http.post(url, data).success(function(data){
				if(data.loginStatus){
					app.user = new User();
					app.user.userName = data.userName;
					app.user.userId = data.userId;
					app.user.name = data.name;
					$location.path('/index');
				}else{
					$scope.invalidForm = true;
				}
			});
		
	};
	
})
.controller('BuddiesCtrl', function($scope, $http, $location){
	checkUserLogedOff($location);
})
.controller('InviteYourBuddiesCtrl', function($scope, $http, $location){
	checkUserLogedOff($location);
})
.controller('CourseFinderCtrl', function($scope, $http, $location){
	checkUserLogedOff($location);
})
.controller('FillYourFoursomeCtrl', function($scope, $http, $location){
	checkUserLogedOff($location);
})
.controller('ManageInvitationsCtrl', function($scope, $http, $location){
	checkUserLogedOff($location);
})
.controller('FavoriteCoursesCtrl', function($scope, $http, $location){
	checkUserLogedOff($location);
})
.controller('SettingsCtrl', function($scope, $http, $location){
	checkUserLogedOff($location);
})
.controller('OneClickDiscountCtrl', function($scope, $http, $location){
	checkUserLogedOff($location);
});

function checkUserLogedOff($location){
	if(app.user == null || app.user == undefined){
		$location.path('#/signin');
	}
}